// src/pages/dashboard/studio.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Image as ImageIcon, Save, ArrowLeft } from "lucide-react"; // <--- Added ArrowLeft
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import StudioRoute from "@/components/StudioRoute";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import Link from "next/link"; // <--- Added Link
import type { Studio } from "@/types";
import { ImageUpload } from "@/components/ImageUpload";

export default function MyStudioPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [studio, setStudio] = useState<Partial<Studio>>({});
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [newStyle, setNewStyle] = useState("");

  // Fetch Studio Data
  useEffect(() => {
    const fetchStudio = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("studios")
          .select("*")
          .eq("owner_id", user.id)
          .single();

        if (error) throw error;
        
        setStudio({
            ...data,
            coverImage: data.cover_image, // Map snake_case to camelCase
            pricingInfo: data.pricing_info,
            styles: data.styles || [],
            images: data.images || [],
        });
      } catch (error) {
        console.error("Error fetching studio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudio();
  }, [user]);

  // Handlers
  const handleSave = async () => {
    if (!user || !studio.id) return;
    setIsSaving(true);

    try {
      const updates = {
        name: studio.name,
        description: studio.description,
        location: studio.location,
        cover_image: studio.coverImage,
        pricing_info: studio.pricingInfo, 
        styles: studio.styles || [],
        images: studio.images || [],
        phone: studio.phone,
        email: studio.email,
      };

      const { error } = await supabase
        .from("studios")
        .update(updates)
        .eq("id", studio.id);

      if (error) throw error;

      toast({
        title: "Changes Saved",
        description: "Your studio profile has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addStyle = () => {
    if (newStyle && !studio.styles?.includes(newStyle)) {
      setStudio(prev => ({ ...prev, styles: [...(prev.styles || []), newStyle] }));
      setNewStyle("");
    }
  };

  const removeStyle = (styleToRemove: string) => {
    setStudio(prev => ({ ...prev, styles: prev.styles?.filter(s => s !== styleToRemove) }));
  };

  const addImage = () => {
    if (newPortfolioUrl) {
      setStudio(prev => ({ ...prev, images: [...(prev.images || []), newPortfolioUrl] }));
      setNewPortfolioUrl("");
    }
  };

  const removeImage = (imgToRemove: string) => {
    setStudio(prev => ({ ...prev, images: prev.images?.filter(i => i !== imgToRemove) }));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <StudioRoute>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          
          {/* Back Navigation - Added Here */}
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-[hsl(var(--ink-red))] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Studio</h1>
              <p className="text-muted-foreground">Manage your public profile, assets, and content.</p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push(`/studios/${studio.id}`)}>
                    View Public Page
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                    "Saving..."
                ) : (
                    <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                    </>
                )}
                </Button>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Studio Details</CardTitle>
                <CardDescription>The core information about your business.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Studio Name</Label>
                        <Input 
                            value={studio.name || ""} 
                            onChange={e => setStudio(prev => ({ ...prev, name: e.target.value }))} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Location (City, State)</Label>
                        <Input 
                            value={studio.location || ""} 
                            onChange={e => setStudio(prev => ({ ...prev, location: e.target.value }))} 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                        rows={4}
                        value={studio.description || ""} 
                        onChange={e => setStudio(prev => ({ ...prev, description: e.target.value }))} 
                    />
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input 
                            value={studio.phone || ""} 
                            onChange={e => setStudio(prev => ({ ...prev, phone: e.target.value }))} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Public Email</Label>
                        <Input 
                            value={studio.email || ""} 
                            onChange={e => setStudio(prev => ({ ...prev, email: e.target.value }))} 
                        />
                    </div>
                </div>
              </CardContent>
            </Card>
            {/* Pricing Info */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
            <CardDescription>Explain your rates, deposits, and minimums.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                <Label>Detailed Pricing</Label>
                <Textarea 
                    rows={6}
                    placeholder="e.g. Our hourly rate is $150. Minimum shop charge is $100. We require a non-refundable deposit of $50 for all appointments..."
                    value={studio.pricingInfo || "No additional pricing info available."} 
                    onChange={e => setStudio(prev => ({ ...prev, pricingInfo: e.target.value }))} 
                />
                <p className="text-xs text-muted-foreground">This text will be displayed on your public profile exactly as written here.</p>
            </div>
          </CardContent>
        </Card>      
            {/* Branding & Styles */}
            <Card>
              <CardHeader>
                <CardTitle>Branding & Styles</CardTitle>
                <CardDescription>Define your look and specializations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
{/* Cover Image */}
<div className="space-y-3">
    <Label>Cover Image</Label>
    <ImageUpload 
        bucket="studio-images"
        currentImage={studio.coverImage}
        onUpload={(url) => setStudio(prev => ({ ...prev, coverImage: url }))}
        label="Upload Cover"
    />
</div>

                {/* Styles */}
                <div className="space-y-3">
                    <Label>Specialties & Styles</Label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Add a style (e.g. Traditional)" 
                            value={newStyle}
                            onChange={e => setNewStyle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addStyle()}
                        />
                        <Button type="button" variant="secondary" onClick={addStyle}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {studio.styles?.map(style => (
                            <Badge key={style} variant="secondary" className="pl-3 pr-2 py-1">
                                {style}
                                <X 
                                    className="w-3 h-3 ml-2 cursor-pointer hover:text-red-500" 
                                    onClick={() => removeStyle(style)}
                                />
                            </Badge>
                        ))}
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Showcase your studio's best work.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-end">
    <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Upload New</Label>
        <ImageUpload 
            bucket="studio-images"
            onUpload={(url) => {
               // Automatically add to array when upload finishes
               if (url) {
                  setStudio(prev => ({ ...prev, images: [...(prev.images || []), url] }));
               }
            }}
            label="Add to Portfolio"
        />
    </div>
</div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {studio.images?.map((img, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-md overflow-hidden border bg-muted">
                            <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => removeImage(img)}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {(!studio.images || studio.images.length === 0) && (
                        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No images added yet.</p>
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudioRoute>
  );
}