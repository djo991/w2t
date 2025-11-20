
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import type { Review } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={review.userAvatar || ""} />
            <AvatarFallback>{review.userName?.substring(0,2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-sm">{review.userName || "Anonymous"}</div>
            <div className="text-xs text-muted-foreground">
              {review.date ? formatDistanceToNow(new Date(review.date)) + " ago" : ""}
            </div>
          </div>
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < review.rating ? "fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {review.comment}
      </p>

      {/* NEW: Display Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {review.images.map((img, idx) => (
            <a href={img} target="_blank" rel="noreferrer" key={idx} className="shrink-0">
              <img 
                src={img} 
                alt="Review" 
                className="w-20 h-20 object-cover rounded-md border hover:opacity-80 transition-opacity" 
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}