// src/components/ReviewModal.tsx

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, X } from "lucide-react"; // Added X icon
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload"; // Import this

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  studioId: string;
  customerId: string;
  onSuccess: () => void;
}

export function ReviewModal({ open, onOpenChange, bookingId, studioId, customerId, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]); // State for images
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        studio_id: studioId,
        customer_id: customerId,
        rating: rating,
        comment: comment,
        images: images, // Save the array
      });

      if (error) throw error;

      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit review.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>How was your appointment?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating Stars (Same as before) */}
          <div className="flex flex-col items-center gap-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? "fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" : "text-muted-foreground"}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Box */}
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea 
              placeholder="Tell us about your experience..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Add Photos</Label>
            <div className="flex flex-wrap gap-4">
               {/* Display uploaded images */}
               {images.map((img, idx) => (
                 <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border">
                    <img src={img} className="w-full h-full object-cover" alt="review" />
                    <button 
                      onClick={() => setImages(prev => prev.filter(i => i !== img))}
                      className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
                    >
                      <X className="w-3 h-3" />
                    </button>
                 </div>
               ))}
               
               {/* Uploader */}
               <div className="w-20">
                 <ImageUpload 
                   bucket="review-images" 
                   onUpload={(url) => { if(url) setImages(prev => [...prev, url]) }}
                   label="Add"
                   className="h-20"
                 />
               </div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}