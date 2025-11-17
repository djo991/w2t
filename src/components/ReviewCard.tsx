
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={review.userAvatar} />
            <AvatarFallback>{review.userName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold">{review.userName}</h4>
                <p className="text-sm text-muted-foreground">{review.date}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <p className="text-sm leading-relaxed mb-3">{review.comment}</p>
            
            {review.images && review.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {review.images.map((image, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Review image ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
