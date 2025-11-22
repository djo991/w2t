// src/pages/admin/styles.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminRoute from "@/components/AdminRoute";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils";

export default function StyleManager() {
  const [styles, setStyles] = useState<any[]>([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [newStyleDesc, setNewStyleDesc] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    const { data } = await supabase.from("tattoo_styles").select("*").order("name");
    if (data) setStyles(data);
  };

  const handleAddStyle = async () => {
    if (!newStyleName) return;
    
    // Generate simple slug
    const slug = newStyleName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

    const { data, error } = await supabase.from("tattoo_styles").insert({
        name: newStyleName,
        slug: slug,
        description: newStyleDesc,
        image_url: "" // Can upload later
    }).select().single();

    if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
        setStyles(prev => [...prev, data]);
        setNewStyleName("");
        setNewStyleDesc("");
        toast({ title: "Style Added" });
    }
  };

  const handleDeleteStyle = async (id: string) => {
    if(!confirm("Delete this style? It might affect existing quiz results.")) return;

    const { error } = await supabase.from("tattoo_styles").delete().eq("id", id);
    if (!error) {
        setStyles(prev => prev.filter(s => s.id !== id));
        toast({ title: "Style Deleted" });
    }
  };

  const updateImage = async (id: string, url: string) => {
    const { error } = await supabase
      .from("tattoo_styles")
      .update({ image_url: url })
      .eq("id", id);

    if (!error) {
        setStyles(prev => prev.map(s => s.id === id ? { ...s, image_url: url } : s));
        toast({ title: "Image Updated" });
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-[hsl(var(--ink-red))]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8">Manage Styles</h1>

          {/* ADD NEW STYLE */}
          <Card className="mb-8 bg-muted/20">
            <CardHeader>
                <CardTitle className="text-lg">Add New Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Style Name</Label>
                        <Input 
                            placeholder="e.g. Cyberpunk" 
                            value={newStyleName}
                            onChange={e => setNewStyleName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input 
                            placeholder="Short description for results page..." 
                            value={newStyleDesc}
                            onChange={e => setNewStyleDesc(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handleAddStyle} disabled={!newStyleName}>
                    <Plus className="w-4 h-4 mr-2" /> Create Style
                </Button>
            </CardContent>
          </Card>

          {/* EXISTING STYLES */}
          <div className="grid md:grid-cols-2 gap-6">
            {styles.map((style) => (
              <Card key={style.id} className="group relative">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                    onClick={() => handleDeleteStyle(style.id)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>

                <CardContent className="p-6 flex gap-6">
                   <div className="w-24 shrink-0">
                      <ImageUpload 
                        bucket="review-images" // Reusing bucket
                        currentImage={style.image_url}
                        onUpload={(url) => updateImage(style.id, url)}
                        label="Image"
                      />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold">{style.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {style.description || "No description."}
                      </p>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}