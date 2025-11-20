// src/components/ImageUpload.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  // Add the new buckets to the union type
  bucket: "avatars" | "studio-images" | "review-images" | "chat-attachments";
  currentImage?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({ onUpload, bucket, currentImage, label = "Upload Image", className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple validation
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }
    
    // 2MB Limit check
    if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max image size is 2MB.", variant: "destructive" });
        return;
    }

    setIsUploading(true);
    
    // Create a preview immediately for better UX
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      // 1. Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // 4. Pass URL back to parent
      onUpload(publicUrl);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      setPreview(currentImage || null); // Revert on failure
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(null);
    onUpload(""); // Clear the URL in the form
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="relative aspect-square w-full max-w-[200px] rounded-lg overflow-hidden border bg-muted">
          <img 
            src={preview} 
            alt="Upload preview" 
            className={`h-full w-full object-cover transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
          />
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}

          {!isUploading && (
            <button
                onClick={handleRemove}
                className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full max-w-[200px]">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
        </div>
      )}
    </div>
  );
}