// src/pages/index.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Calendar, TrendingUp, Award, Users } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header"; 
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";
import type { Studio } from "@/types";

interface HomePageProps {
  userCity: string | null;
  featuredStudios: Studio[];
}

// Add default value = [] to prevent crash
export default function HomePage({ userCity, featuredStudios = [] }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Explicit search
      router.push(`/studios?search=${encodeURIComponent(searchQuery)}`);
    } else if (userCity) {
      // Smart empty search -> Go to local city
      router.push(`/studios?location=${encodeURIComponent(userCity)}`);
    } else {
      // Fallback
      router.push('/studios');
    }
  };

  const popularStyles = [
    { name: "Traditional", count: 1234 },
    { name: "Japanese", count: 987 },
    { name: "Realism", count: 856 },
    { name: "Geometric", count: 743 },
    { name: "Blackwork", count: 621 },
    { name: "Watercolor", count: 534 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      
      <Header />

      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--ink-red))]/10 border border-[hsl(var(--ink-red))]/20">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--ink-red))]" />
              <span className="text-sm font-medium">
                 {userCity ? `Explore Studios in ${userCity}` : "500+ Studios Nationwide"}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
              Find Your Perfect
              <span className="block text-[hsl(var(--ink-red))] mt-2">
                 {userCity ? `Artist in ${userCity}` : "Tattoo Artist"}
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg">
              Connect with top-rated tattoo studios{userCity ? ` near you in ${userCity}` : ""}, browse artist portfolios, and book your next masterpiece with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder={userCity ? `Search in ${userCity}...` : "Search studios, artists, or styles..."}
                  className="pl-12 h-14 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                size="lg" 
                className="h-14 px-8 bg-[hsl(var(--ink-red))] hover:bg-[hsl(var(--ink-red))]/90"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[hsl(var(--accent-gold))]" />
                <div>
                  <div className="font-bold text-lg">1,200+</div>
                  <div className="text-sm text-muted-foreground">Artists</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[hsl(var(--ink-blue))]" />
                <div>
                  <div className="font-bold text-lg">50K+</div>
                  <div className="text-sm text-muted-foreground">Happy Clients</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[hsl(var(--ink-red))]" />
                <div>
                  <div className="font-bold text-lg">4.8/5</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--ink-red))]/20 to-[hsl(var(--ink-blue))]/20 rounded-3xl blur-3xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=800&q=80" 
              alt="Tattoo artist at work"
              className="relative rounded-3xl shadow-2xl w-full object-cover aspect-square"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16" id="studios">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
                {userCity && featuredStudios.some(s => s.city === userCity) 
                    ? `Featured in ${userCity}` 
                    : "Featured Studios"}
            </h2>
            <p className="text-muted-foreground">Top-rated studios handpicked for excellence</p>
          </div>
          <Link href={userCity ? `/studios?location=${encodeURIComponent(userCity)}` : "/studios"}>
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStudios.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    No featured studios found yet.
                </div>
            ) : (
                featuredStudios.map((studio) => (
                    <Link href={`/studios/${studio.id}`} key={studio.id}>
                    <Card className="overflow-hidden card-hover cursor-pointer group h-full">
                        <div className="relative h-64 overflow-hidden">
                        <img 
                            src={studio.coverImage} 
                            alt={studio.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {studio.featured && (
                            <Badge className="absolute top-4 right-4 bg-[hsl(var(--accent-gold))] text-black">
                            Featured
                            </Badge>
                        )}
                        </div>
                        
                        <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-[hsl(var(--ink-red))] transition-colors">
                            {studio.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <MapPin className="w-4 h-4" />
                            <span>{studio.location}</span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]" />
                            <span className="font-semibold">{studio.rating || "New"}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">({studio.reviewCount} reviews)</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {studio.styles?.slice(0, 3).map((style) => (
                            <Badge key={style} variant="secondary" className="text-xs">
                                {style}
                            </Badge>
                            ))}
                        </div>

                        <Button className="w-full" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Appointment
                        </Button>
                        </CardContent>
                    </Card>
                    </Link>
                ))
            )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular Tattoo Styles</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularStyles.map((style) => (
            <Link href={`/studios?style=${style.name}`} key={style.name}>
              <Card className="card-hover cursor-pointer group h-full">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold mb-1 group-hover:text-[hsl(var(--ink-red))] transition-colors">
                    {style.count}
                  </div>
                  <div className="text-sm text-muted-foreground">{style.name}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--ink-red))] to-[hsl(var(--ink-blue))] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">W2</span>
                </div>
                <span className="text-lg font-bold">Where2Tattoo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting artists and clients since 2025
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/studios" className="hover:text-foreground transition-colors">Find Studios</Link></li>
                <li><Link href="/studios" className="hover:text-foreground transition-colors">Browse Artists</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Studios</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/signup" className="hover:text-foreground transition-colors">List Your Studio</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 Where2Tattoo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  let userCity = null;
  
  // 1. Get City from Headers
  const cityHeader = req.headers['x-vercel-ip-city'];
  if (cityHeader) {
    try {
       userCity = decodeURIComponent(Array.isArray(cityHeader) ? cityHeader[0] : cityHeader);
    } catch(e) {}
  }

  // 2. Fetch Featured Studios
  // Logic: Try to find featured studios in the user's city first.
  // If fewer than 3, fill the rest with global featured studios.
  
  let featuredStudios = [];

  if (userCity) {
    const { data: localData } = await supabase
        .from("studios")
        .select("*")
        .eq("verified", true)
        .eq("featured", true)
        .ilike("city", `%${userCity}%`) // Loose match for city name
        .limit(3);
    
    if (localData) featuredStudios = [...localData];
  }

  // If we don't have enough local ones, fetch global ones
  if (featuredStudios.length < 3) {
     const { data: globalData } = await supabase
        .from("studios")
        .select("*")
        .eq("verified", true)
        .eq("featured", true)
        .limit(3);
        
     if (globalData) {
        // Merge and deduplicate by ID
        const existingIds = new Set(featuredStudios.map(s => s.id));
        const newOnes = globalData.filter(s => !existingIds.has(s.id));
        featuredStudios = [...featuredStudios, ...newOnes].slice(0, 3);
     }
  }

  // Map for Props
  const mappedStudios: Studio[] = featuredStudios.map((s: any) => ({
     ...s,
     coverImage: s.cover_image,
     priceRange: { min: s.priceMin || 0, max: s.priceMax || 0 },
     styles: s.styles || [],
     images: s.images || [],
     availability: s.availability || []
  }));

  return {
    props: {
      userCity,
      featuredStudios: mappedStudios
    }
  };
};