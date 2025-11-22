// src/pages/studios/new.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";

export default function CreateStudioPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "", // Simple string for now (City, State)
    description: "",
  });

  // Protect Route
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/signin");
      } else if (profile?.role !== "studio_owner") {
        toast({ title: "Access Denied", description: "Only studio owners can list a studio.", variant: "destructive" });
        router.push("/");
      } else {
        // Check if they ALREADY have a studio
        const checkExisting = async () => {
            const { data } = await supabase.from("studios").select("id").eq("owner_id", user.id).single();
            if (data) {
                toast({ title: "Studio Exists", description: "You already have a studio listing." });
                router.push("/dashboard");
            }
        };
        checkExisting();
      }
    }
  // Fixed: Added toast to dependencies
  }, [user, profile, isLoading, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("studios").insert({
        owner_id: user.id,
        name: formData.name,
        location: formData.location,
        address: formData.location,
        city: formData.location.split(",")[0] || formData.location,
        description: formData.description,
        verified: false,
        "priceMin": 0, 
        "priceMax": 100, 
      });

      if (error) throw error;

      toast({
        title: "Studio Created!",
        description: "Your studio is now pending approval. You can manage it in your dashboard.",
      });
      
      router.push("/dashboard");
    } catch (error: unknown) { // Fixed: Changed 'any' to 'unknown'
      // Type narrow or cast error
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">List Your Studio</CardTitle>
            <CardDescription>
              Create your profile to start accepting bookings. Your listing will be visible after admin verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Studio Name</Label>
                <Input 
                  id="name" 
                  required
                  placeholder="e.g. Iron & Ink"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (City, State)</Label>
                <Input 
                  id="location" 
                  required
                  placeholder="e.g. Brooklyn, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Tell us about your studio..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Studio Listing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 