// src/pages/studios/index.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { Studio } from "@/types";
import { StudioCard } from "@/components/StudioCard";
import { Header } from "@/components/Header";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";

// 1. Define the props type we expect from getServerSideProps
interface StudiosPageProps {
  studios: Studio[];
}

// 2. The component now receives 'studios' as a prop
export default function StudiosPage({ studios }: StudiosPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  // 3. All the hardcoded 'studios' array data is DELETED!
  //    It's now provided as a prop.

  const styles = ["All Styles", "Traditional", "Japanese", "Realism", "Geometric", "Blackwork", "Watercolor", "Fine Line", "Neo-Traditional"];
  const locations = ["All Locations", "New York", "California", "Texas", "Florida", "Oregon", "Washington"];

  // TODO: We'll wire these up to re-fetch data later.
  // For now, they just update state.
  const filteredStudios = studios.filter(studio => {
    // This is simple client-side filtering for now.
    // A more advanced solution would re-fetch from Supabase.
    const matchesQuery = studio.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle = selectedStyle === 'all' || studio.styles.map(s => s.toLowerCase().replace(" ", "-")).includes(selectedStyle);
    
    // Note: The 'location' filter logic needs to be defined.
    // This is just a placeholder.
    const matchesLocation = selectedLocation === 'all' || studio.city.toLowerCase().replace(" ", "-") === selectedLocation;

    const matchesPrice = studio.priceRange.min >= priceRange[0] && studio.priceRange.min <= priceRange[1];

    return matchesQuery && matchesStyle && matchesLocation && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Tattoo Studios</h1>
          <p className="text-muted-foreground">Discover the perfect studio for your next tattoo</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowFilters(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Style</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((style) => (
                        <SelectItem key={style} value={style.toLowerCase().replace(" ", "-")}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location.toLowerCase().replace(" ", "-")}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Price Range (per hour)</label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={500}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search studios..." 
                  className="pl-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filteredStudios.length} studios found</p>
              <Select defaultValue="rating">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 4. We map over the filteredStudios prop */ }
              {filteredStudios.map((studio) => (
                // The StudioCard component works perfectly because our
                // data now matches the Studio type it expects.
                <StudioCard key={studio.id} studio={studio} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. This function runs on the server for every request
export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch only verified studios
  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .eq("verified", true);

  if (error) {
    console.error("Error fetching studios:", error);
    return { props: { studios: [] } }; // Return empty array on error
  }

  // Map the data to create the 'priceRange' object
  const studios: Studio[] = data.map((studio) => ({
    ...studio,
    priceRange: {
      min: studio.priceMin || 0, // Fallback to 0 if null
      max: studio.priceMax || 0, // Fallback to 0 if null
    },
    // Ensure arrays are not null (Supabase may return null for empty arrays)
    styles: studio.styles || [],
    images: studio.images || [],
    availability: studio.availability || [],
  }));

  // Pass data to the page component as props
  return {
    props: {
      studios,
    },
  };
};