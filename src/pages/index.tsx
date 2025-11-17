
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Calendar, TrendingUp, Award, Users } from "lucide-react";
import { useState } from "react";

interface Studio {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  specialties: string[];
  image: string;
  featured: boolean;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredStudios: Studio[] = [
    {
      id: "1",
      name: "Ink Masters Studio",
      location: "Brooklyn, NY",
      rating: 4.9,
      reviews: 342,
      specialties: ["Traditional", "Japanese", "Realism"],
      image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&q=80",
      featured: true
    },
    {
      id: "2",
      name: "Sacred Art Tattoo",
      location: "Austin, TX",
      rating: 4.8,
      reviews: 267,
      specialties: ["Geometric", "Blackwork", "Fine Line"],
      image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80",
      featured: true
    },
    {
      id: "3",
      name: "Rebel Rose Ink",
      location: "Portland, OR",
      rating: 4.9,
      reviews: 421,
      specialties: ["Color", "Watercolor", "Illustrative"],
      image: "https://images.unsplash.com/photo-1590246814883-57c511a6f1f5?w=800&q=80",
      featured: true
    }
  ];

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
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--ink-red))] to-[hsl(var(--ink-blue))] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">W2</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Where<span className="text-[hsl(var(--ink-red))]">2</span>Tattoo</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#studios" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">Studios</a>
            <a href="#artists" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">Artists</a>
            <a href="#styles" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">Styles</a>
            <a href="#about" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button size="sm" className="bg-[hsl(var(--ink-red))] hover:bg-[hsl(var(--ink-red))]/90">
              List Your Studio
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--ink-red))]/10 border border-[hsl(var(--ink-red))]/20">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--ink-red))]" />
              <span className="text-sm font-medium">500+ Studios Nationwide</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
              Find Your Perfect
              <span className="block text-[hsl(var(--ink-red))] mt-2">Tattoo Artist</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg">
              Connect with top-rated tattoo studios, browse artist portfolios, and book your next masterpiece with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search studios, artists, or styles..." 
                  className="pl-12 h-14 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-14 px-8 bg-[hsl(var(--ink-red))] hover:bg-[hsl(var(--ink-red))]/90">
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

      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Studios</h2>
            <p className="text-muted-foreground">Top-rated studios handpicked for excellence</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStudios.map((studio) => (
            <Card key={studio.id} className="overflow-hidden card-hover cursor-pointer group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={studio.image} 
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
                    <span className="font-semibold">{studio.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({studio.reviews} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {studio.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular Tattoo Styles</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularStyles.map((style) => (
            <Card key={style.name} className="card-hover cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold mb-1 group-hover:text-[hsl(var(--ink-red))] transition-colors">
                  {style.count}
                </div>
                <div className="text-sm text-muted-foreground">{style.name}</div>
              </CardContent>
            </Card>
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
                <li><a href="#" className="hover:text-foreground transition-colors">Find Studios</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Browse Artists</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Book Appointment</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Studios</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">List Your Studio</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Resources</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
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
