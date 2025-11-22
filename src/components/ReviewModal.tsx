// src/components/ReviewModal.tsx

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";

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
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  
  const { toast } = useToast();

  // 1. Fetch Existing Review on Open
  useEffect(() => {
    if (!open) return;
    
    const fetchReview = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (data) {
        // Populate form with existing data
        setRating(data.rating);
        setComment(data.comment || "");
        setImages(data.images || []);
        setExistingReviewId(data.id);
      } else {
        // Reset form for new review
        setRating(5);
        setComment("");
        setImages([]);
        setExistingReviewId(null);
      }
      setIsLoading(false);
    };

    fetchReview();
  }, [open, bookingId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (existingReviewId) {
        // UPDATE Existing
        const { error } = await supabase
          .from("reviews")
          .update({
            rating,
            comment,
            images,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReviewId);

        if (error) throw error;
        toast({ title: "Review Updated", description: "Your review has been updated." });

      } else {
        // INSERT New
        const { error } = await supabase
          .from("reviews")
          .insert({
            booking_id: bookingId,
            studio_id: studioId,
            customer_id: customerId,
            rating,
            comment,
            images,
          });

        if (error) throw error;
        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      }

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
          <DialogTitle>{existingReviewId ? "Edit Your Review" : "Leave a Review"}</DialogTitle>
          <DialogDescription>
            {existingReviewId ? "Update your feedback for this appointment." : "How was your appointment?"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Rating Stars */}
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
              {isSubmitting ? "Saving..." : (existingReviewId ? "Update Review" : "Submit Review")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}