
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock } from "lucide-react";
import Link from "next/link";
import type { Studio } from "@/types";

interface StudioCardProps {
  studio: Studio;
}

export function StudioCard({ studio }: StudioCardProps) {
  return (
    <Link href={`/studios/${studio.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={studio.coverImage}
            alt={studio.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            {studio.featured && (
              <Badge className="bg-[hsl(var(--accent-gold))] text-white border-0">
                Featured
              </Badge>
            )}
            {studio.verified && (
              <Badge variant="secondary">Verified</Badge>
            )}
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 group-hover:text-[hsl(var(--ink-red))] transition-colors">
            {studio.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{studio.location}</span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" />
              <span className="font-semibold">{studio.rating}</span>
              <span className="text-muted-foreground">({studio.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{studio.responseTime}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {studio.styles.slice(0, 3).map((style) => (
              <Badge key={style} variant="outline" className="text-xs">
                {style}
              </Badge>
            ))}
            {studio.styles.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{studio.styles.length - 3}
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Starting from <span className="font-semibold text-foreground">${studio.priceRange.min}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
