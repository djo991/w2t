// src/pages/admin/styles.tsx

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminRoute from "@/components/AdminRoute";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function StyleManager() {
  const [styles, setStyles] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStyles = async () => {
      const { data } = await supabase.from("tattoo_styles").select("*").order("name");
      if (data) setStyles(data);
    };
    fetchStyles();
  }, []);

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
            <Link href="/admin/quiz" className="inline-flex items-center text-sm text-muted-foreground hover:text-[hsl(var(--ink-red))]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quiz
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8">Manage Result Images</h1>

          <div className="grid md:grid-cols-2 gap-6">
            {styles.map((style) => (
              <Card key={style.id}>
                <CardContent className="p-6 flex gap-6">
                   <div className="w-24 shrink-0">
                      <ImageUpload 
                        bucket="review-images" // Reusing this bucket for simplicity, or make a new one
                        currentImage={style.image_url}
                        onUpload={(url) => updateImage(style.id, url)}
                        label="Change"
                      />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold">{style.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{style.description}</p>
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