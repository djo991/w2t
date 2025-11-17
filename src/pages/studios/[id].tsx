// src/pages/studios/[id].tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, DollarSign, Phone, Mail, Globe, Calendar as CalendarIcon, Award } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { Studio, Artist, Review, PortfolioItem } from "@/types";
import { BookingModal } from "@/components/BookingModal";
import { Header } from "@/components/Header";
import { ReviewCard } from "@/components/ReviewCard";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";

// 1. Define the props we'll get from getServerSideProps
interface StudioDetailPageProps {
  studio: Studio;
  artists: Artist[];
  reviews: Review[];
  portfolioItems: PortfolioItem[];
}

// 2. The component now receives props, not hardcoded data
export default function StudioDetailPage({ studio, artists, reviews, portfolioItems }: StudioDetailPageProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // 3. All the hardcoded 'studio', 'artists', 'reviews',
  //    and 'portfolioItems' constants are DELETED.
  //    They are now supplied as props.

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BookingModal 
        open={isBookingOpen} 
        onOpenChange={setIsBookingOpen} 
        artists={artists} // Pass the artists prop
        studioName={studio.name} // Pass the studio prop
      />

      <div className="relative h-96 overflow-hidden">
        <img 
          src={studio.coverImage} // Use prop
          alt={studio.name}      // Use prop
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{studio.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5" />
                      <span>{studio.address}</span>
                    </div>
                  </div>
                  {studio.featured && (
                    <Badge className="bg-[hsl(var(--accent-gold))] text-black text-sm px-4 py-2">
                      <Award className="w-4 h-4 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" />
                    <span className="font-bold text-lg">{studio.rating}</span>
                    <span className="text-muted-foreground">({studio.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">${studio.priceRange.min} - ${studio.priceRange.max}/hr</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {studio.styles.map((style) => (
                    <Badge key={style} variant="secondary" className="text-sm">
                      {style}
                    </Badge>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {studio.description}
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="artists">Artists</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* 4. Use the portfolioItems prop */ }
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                      <img 
                        src={item.image} 
                        alt={item.style}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Badge variant="secondary">{item.style}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="artists" className="mt-6 space-y-4">
                {/* 5. Use the artists prop */ }
                {artists.map((artist) => (
                  <Card key={artist.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={artist.avatar} />
                          <AvatarFallback>{artist.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold">{artist.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" />
                              <span className="font-semibold">{artist.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{artist.bio}</p>
                          <div className="flex items-center gap-4 mb-3">
                            <Badge variant="outline">{artist.yearsExperience} years</Badge>
                            {artist.specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="outline" size="sm">
                            View Portfolio
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 space-y-4">
                {/* 6. Use the reviews prop */ }
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {/* Use studio prop, with a fallback */ }
                      <span>{studio.phone || "Not available"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {/* Use studio prop, with a fallback */ }
                      <span>{studio.email || "Not available"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      {/* TODO: Add a 'website' column to your DB and type */ }
                      <a href="#" className="text-[hsl(var(--ink-red))] hover:underline">www.studiowebsite.com</a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Hours</h3>
                  {/* You would parse studio.opening_hours (jsonb) here */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium">11:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium">12:00 PM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium">Closed</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={() => setIsBookingOpen(true)}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>

                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Studio
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


// 7. This is the new data-fetching function
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  if (!id || Array.isArray(id)) {
    return { notFound: true };
  }

  // This one query fetches the studio, all its artists, 
  // all its reviews, and all portfolio items for each artist.
  const { data: studioData, error } = await supabase
    .from("studios")
    .select(`
      *,
      artists (
        *,
        portfolio_items (*)
      ),
      reviews (
        *
      )
    `)
    .eq("id", id)
    .single();

  if (error || !studioData) {
    console.error("Error fetching studio:", error);
    return { notFound: true };
  }
  
  // 8. Process the data to match our types
  const artists: Artist[] = studioData.artists.map((artist: any) => ({
    ...artist,
    specialties: artist.specialties || [],
    portfolio: artist.portfolio_items || []
  }));
  
  const reviews: Review[] = studioData.reviews || [];

  // Create a combined portfolio from all artists
  const portfolioItems: PortfolioItem[] = artists.flatMap((artist: Artist) => artist.portfolio);

  // Create the final studio object, processing nulls and creating priceRange
  const studio: Studio = {
    ...studioData,
    artists: artists, // We pass this separately but also good to have on the main object
    priceRange: {
      min: studioData.priceMin || 0,
      max: studioData.priceMax || 0,
    },
    styles: studioData.styles || [],
    images: studioData.images || [],
    availability: studioData.availability || [],
  };

  return {
    props: {
      studio,
      artists,
      reviews,
      portfolioItems,
    },
  };
};