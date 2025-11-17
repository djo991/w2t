
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, DollarSign, Phone, Mail, Globe, Calendar as CalendarIcon, Award } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { Studio, Artist, Review } from "@/types";
import { BookingModal } from "@/components/BookingModal";
import { Header } from "@/components/Header";
import { ReviewCard } from "@/components/ReviewCard";

export default function StudioDetailPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const studio: Studio = {
    id: "1",
    name: "Ink Masters Studio",
    location: "Brooklyn, NY",
    address: "123 Bedford Ave, Brooklyn, NY 11211",
    city: "Brooklyn",
    state: "NY",
    rating: 4.9,
    reviewCount: 342,
    styles: ["Traditional", "Japanese", "Realism", "Neo-Traditional"],
    images: [
      "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=1200&q=80",
      "https://images.unsplash.com/photo-1565058370281-2b4e9575ad24?w=1200&q=80",
      "https://images.unsplash.com/photo-1611162458324-aae1eb4129a2?w=1200&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=1200&q=80",
    featured: true,
    verified: true,
    description: "Ink Masters Studio is Brooklyn's premier tattoo destination, bringing together world-class artists specializing in traditional, Japanese, and realism styles. With over 15 years of experience, our team has created thousands of custom pieces for clients worldwide. We pride ourselves on maintaining the highest standards of hygiene, artistry, and customer care.",
    priceRange: { min: 150, max: 300 },
    responseTime: "24-48 hrs",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    artists: []
  };

  const artists: Artist[] = [
    {
      id: "1",
      name: "Marcus Chen",
      studioId: "1",
      bio: "Specializing in traditional Japanese and neo-traditional work with 12+ years of experience",
      specialty: "Japanese & Neo-Traditional",
      specialties: ["Japanese", "Neo-Traditional"],
      portfolio: [],
      rating: 4.9,
      yearsExperience: 12,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    },
    {
      id: "2",
      name: "Sarah Mitchell",
      studioId: "1",
      bio: "Master of realism and portrait work, bringing photographs to life on skin",
      specialty: "Realism & Portraits",
      specialties: ["Realism", "Portraits"],
      portfolio: [],
      rating: 4.8,
      yearsExperience: 10,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
    },
    {
      id: "3",
      name: "Jake Thompson",
      studioId: "1",
      bio: "Traditional American tattoo specialist with a bold, classic approach",
      specialty: "American Traditional",
      specialties: ["Traditional", "American"],
      portfolio: [],
      rating: 4.9,
      yearsExperience: 15,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
    }
  ];

  const reviews: Review[] = [
    {
      id: "1",
      studioId: "1",
      userId: "u1",
      userName: "Alex Rivera",
      userAvatar: "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&q=80",
      rating: 5,
      comment: "Absolutely amazing experience! Marcus did an incredible job on my Japanese sleeve. The attention to detail is outstanding, and the studio atmosphere is professional yet welcoming.",
      date: "2025-10-15",
      images: [
        "https://images.unsplash.com/photo-1555951215-0d2495c5c163?w=400&q=80",
        "https://images.unsplash.com/photo-1616441398822-44c4c2a5c5a8?w=400&q=80",
      ]
    },
    {
      id: "2",
      studioId: "1",
      userId: "u2",
      userName: "Emma Davis",
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      rating: 5,
      comment: "Sarah is a true artist. My portrait tattoo looks exactly like the photo I brought in. The whole process was smooth, and the staff made me feel comfortable throughout.",
      date: "2025-09-22"
    },
    {
      id: "3",
      studioId: "1",
      userId: "u3",
      userName: "Michael Torres",
      userAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      rating: 4,
      comment: "Great studio with talented artists. Jake did my traditional eagle piece and it came out fantastic. Only minor issue was booking availability, but worth the wait!",
      date: "2025-08-30"
    }
  ];

  const portfolioItems = [
    { id: "1", image: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a2?w=600&q=80", style: "Japanese" },
    { id: "2", image: "https://images.unsplash.com/photo-1565058370281-2b4e9575ad24?w=600&q=80", style: "Blackwork" },
    { id: "3", image: "https://images.unsplash.com/photo-1590246814883-57c511a6f1f5?w=600&q=80", style: "Color" },
    { id: "4", image: "https://images.unsplash.com/photo-1609157514011-d1f3c4e5798d?w=600&q=80", style: "Traditional" },
    { id: "5", image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80", style: "Geometric" },
    { id: "6", image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&q=80", style: "Realism" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BookingModal 
        open={isBookingOpen} 
        onOpenChange={setIsBookingOpen} 
        artists={artists} 
        studioName={studio.name} 
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
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>info@inkmasters.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href="#" className="text-[hsl(var(--ink-red))] hover:underline">www.inkmasters.com</a>
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
