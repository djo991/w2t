// src/pages/studios/index.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { Studio } from "@/types";
import { StudioCard } from "@/components/StudioCard";
import { Header } from "@/components/Header";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";
import useDebounce from "@/hooks/use-debounce"; // We'll create this hook below

interface StudiosPageProps {
  studios: Studio[];
}

export default function StudiosPage({ studios }: StudiosPageProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  // Initialize local state from URL query params
  const [searchQuery, setSearchQuery] = useState((router.query.search as string) || "");
  const [selectedStyle, setSelectedStyle] = useState((router.query.style as string) || "all");
  const [selectedLocation, setSelectedLocation] = useState((router.query.location as string) || "all");
  // UseDebounce prevents reloading on every keystroke
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Update URL when filters change
  const updateFilters = (newFilters: Record<string, string | null>) => {
    const query = { ...router.query, ...newFilters };
    
    // Remove empty/default keys to keep URL clean
    if (query.search === "") delete query.search;
    if (query.style === "all") delete query.style;
    if (query.location === "all") delete query.location;
    
    // Remove null values (for clearing)
    Object.keys(newFilters).forEach(key => {
       if (newFilters[key] === null) delete query[key];
    });

    router.push({ pathname: "/studios", query }, undefined, { shallow: false });
  };

  // Trigger search update when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== router.query.search && (debouncedSearch || router.query.search)) {
      updateFilters({ search: debouncedSearch || null });
    }
  }, [debouncedSearch]);

  const styles = ["Traditional", "Japanese", "Realism", "Geometric", "Blackwork", "Watercolor", "Fine Line", "Neo-Traditional"];
  const locations = ["New York", "California", "Texas", "Florida", "Oregon", "Washington"];

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
                  <Select 
                    value={selectedStyle} 
                    onValueChange={(val) => {
                      setSelectedStyle(val);
                      updateFilters({ style: val });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Styles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {styles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select 
                    value={selectedLocation} 
                    onValueChange={(val) => {
                      setSelectedLocation(val);
                      updateFilters({ location: val });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStyle("all");
                    setSelectedLocation("all");
                    router.push("/studios");
                  }}
                >
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
              <p className="text-sm text-muted-foreground">
                {studios.length} studios found
              </p>
            </div>

            {studios.length === 0 ? (
               <div className="text-center py-20 border rounded-lg bg-muted/10">
                 <h3 className="text-lg font-semibold">No studios found</h3>
                 <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
               </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {studios.map((studio) => (
                  <StudioCard key={studio.id} studio={studio} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { search, style, location } = context.query;

  // Start building the query
  let query = supabase
    .from("studios")
    .select("*")
    .eq("verified", true);

  // Apply Search Filter (matches name or description)
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Apply Style Filter (checks if array contains value)
  if (style && style !== 'all') {
    query = query.contains('styles', [style]);
  }

  // Apply Location Filter (exact match on city or state for now)
  if (location && location !== 'all') {
    // Simple city match for this example. 
    // In production, you might want a separate 'city' column or smarter search.
    query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching studios:", error);
    return { props: { studios: [] } };
  }

  const studios: Studio[] = data.map((studio) => ({
    ...studio,
    coverImage: studio.cover_image,
    priceRange: {
      min: studio.priceMin || 0,
      max: studio.priceMax || 0,
    },
    styles: studio.styles || [],
    images: studio.images || [],
    availability: studio.availability || [],
  }));

  return {
    props: {
      studios,
    },
  };
};