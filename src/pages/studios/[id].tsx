// src/pages/studios/[id].tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, DollarSign, Phone, Mail, Globe, Calendar as CalendarIcon, Award } from "lucide-react";
import { useState } from "react";
import type { Studio, Artist, Review, PortfolioItem } from "@/types";
import { BookingModal } from "@/components/BookingModal";
import { Header } from "@/components/Header";
import { ReviewCard } from "@/components/ReviewCard";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

interface StudioDetailPageProps {
  studio: Studio;
  artists: Artist[];
  reviews: Review[];
  portfolioItems: PortfolioItem[];
}

export default function StudioDetailPage({ studio, artists, reviews, portfolioItems }: StudioDetailPageProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const router = useRouter();
const { user } = useAuth();

const handleMessage = async () => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    try {
      // 1. Check if conversation exists (using maybeSingle to avoid errors)
      const { data: existing, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", user.id)
        .eq("studio_id", studio.id)
        .maybeSingle();

      if (existing) {
        // FOUND: Redirect with the existing ID
        router.push(`/messages?chat=${existing.id}`);
      } else {
        // NOT FOUND: Create new conversation AND select the ID back
        const { data: newChat, error: insertError } = await supabase
          .from("conversations")
          .insert({ customer_id: user.id, studio_id: studio.id })
          .select("id") // <--- Crucial: Return the ID of the new row
          .single();

        if (insertError) throw insertError;
        
        // Redirect with the NEW ID
        if (newChat) {
           router.push(`/messages?chat=${newChat.id}`);
        }
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // 1. Convert studio images (strings) into PortfolioItem objects
  const studioPortfolioItems: PortfolioItem[] = (studio.images || []).map((img, idx) => ({
    id: `studio-${idx}`,
    image: img,
    title: "Studio Portfolio",
    style: "Studio Work",
    artistId: "studio"
  }));

  // 2. Combine them with the artist portfolio items passed from props
  // We put studio items first
  const allPortfolioItems = [...studioPortfolioItems, ...portfolioItems];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BookingModal 
        open={isBookingOpen} 
        onOpenChange={setIsBookingOpen} 
        artists={artists} 
        studioName={studio.name}
        studioId={studio.id}
        openingHours={studio.openingHours}
      />

      <div className="relative h-96 overflow-hidden">
        <img 
          src={studio.coverImage} 
          alt={studio.name}
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
                      <span>{studio.address || studio.location}</span>
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
                {allPortfolioItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No portfolio images available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allPortfolioItems.map((item) => (
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
                )}
              </TabsContent>

              <TabsContent value="artists" className="mt-6 space-y-4">
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
                      <span>{studio.phone || "Not available"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{studio.email || "Not available"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href="#" className="text-[hsl(var(--ink-red))] hover:underline">www.studiowebsite.com</a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Hours</h3>
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

                <Button variant="outline" className="w-full" onClick={handleMessage}>
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

// Update getServerSideProps to map cover_image correctly
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  if (!id || Array.isArray(id)) {
    return { notFound: true };
  }

  // 1. FETCH DATA WITH JOINS
  const { data: studioData, error } = await supabase
    .from("studios")
    .select(`
      *,
      artists (
        *,
        portfolio_items (*)
      ),
      reviews (
        *,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !studioData) {
    console.error("Error fetching studio:", error);
    return { notFound: true };
  }
  
  // 2. MAP ARTISTS
  const artists: Artist[] = studioData.artists.map((artist: any) => ({
    ...artist,
    specialties: artist.specialties || [],
    portfolio: artist.portfolio_items || [],
    yearsExperience: artist.years_experience
  }));
  
  // 3. MAP REVIEWS (FIXED)
  // We extract the name from the joined 'profiles' table
  const reviews: Review[] = (studioData.reviews || []).map((review: any) => ({
    ...review,
    // Ensure we have a string for the name, even if profile is missing
    userName: review.profiles?.full_name || "Anonymous User",
    userAvatar: review.profiles?.avatar_url || null,
    // Map other fields just in case your type expects them
    author: review.profiles?.full_name || "Anonymous User",
    date: review.created_at,
  }));
  
  const artistPortfolioItems: PortfolioItem[] = artists.flatMap((artist: Artist) => artist.portfolio);

  const studio: Studio = {
    ...studioData,
    coverImage: studioData.cover_image, 
    openingHours: studioData.opening_hours || {},
    artists: artists,
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
      portfolioItems: artistPortfolioItems, 
    },
  };
};
