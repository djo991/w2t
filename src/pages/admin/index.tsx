// src/pages/admin/index.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminRoute from "@/components/AdminRoute";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink, MapPin, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { Studio } from "@/types";

export default function AdminDashboard() {
  const [pendingStudios, setPendingStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("studios")
      .select("*")
      .eq("verified", false) // Only fetch unverified
      .order("name", { ascending: true });

    if (error) console.error("Error:", error);
    else {
        // Map snake_case to camelCase if needed, though for Admin panel simple viewing is key
        // We'll do a quick map to match our types
        const mapped = (data || []).map((s: any) => ({
            ...s,
            coverImage: s.cover_image,
            styles: s.styles || [],
            priceRange: { min: s.min_price || 0, max: s.max_price || 0 }
        }));
        setPendingStudios(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("studios")
        .update({ verified: true })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Studio Approved", description: "The studio is now live on the platform." });
      setPendingStudios(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the studio listing.")) return;

    try {
      const { error } = await supabase
        .from("studios")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Studio Rejected", description: "Listing removed." });
      setPendingStudios(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Review and vet incoming studio applications.</p>
            </div>
            <Badge variant="outline" className="px-4 py-1">
              {pendingStudios.length} Pending
            </Badge>
          </div>

          {loading ? (
            <div>Loading applications...</div>
          ) : pendingStudios.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
               <div className="text-muted-foreground">No pending applications. Good job!</div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingStudios.map((studio) => (
                <Card key={studio.slug} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Preview Image */}
                    <div className="w-full md:w-64 h-48 bg-muted relative">
                      {studio.coverImage ? (
                        <img src={studio.coverImage} className="w-full h-full object-cover" alt="Studio" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            {studio.name}
                            <Link href={`/studios/${studio.slug}`} target="_blank">
                                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                            </Link>
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                             <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {studio.location}</div>
                             {studio.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {studio.email}</div>}
                          </div>
                        </div>
                        <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded border border-yellow-200">
                            Pending Verification
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {studio.description || "No description provided."}
                      </p>

                      <div className="flex gap-2 mb-4">
                         {studio.styles?.slice(0, 5).map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                         ))}
                      </div>

                      <div className="flex gap-3 border-t pt-4">
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white" 
                            onClick={() => handleApprove(studio.slug)}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Approve Studio
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => handleReject(studio.slug)}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Reject & Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}