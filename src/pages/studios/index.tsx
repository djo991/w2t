// src/pages/studios/index.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Map as MapIcon, List as ListIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { Studio } from "@/types";
import { StudioCard } from "@/components/StudioCard";
import { Header } from "@/components/Header";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";
import useDebounce from "@/hooks/use-debounce";
import dynamic from "next/dynamic";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface StudiosPageProps {
  studios: Studio[];
  locations: string[];
  initialLocation: string; // <--- Added this prop
}

const StudioMap = dynamic(() => import("@/components/StudioMap"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

export default function StudiosPage({ studios, locations = [], initialLocation }: StudiosPageProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Initialize local state from URL query params OR the auto-detected location
  const [searchQuery, setSearchQuery] = useState((router.query.search as string) || "");
  const [selectedStyle, setSelectedStyle] = useState((router.query.style as string) || "all");
  
  // Use the prop 'initialLocation' which handles the logic of "URL param vs IP detection"
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  const updateFilters = (newFilters: Record<string, string | null>) => {
    const query = { ...router.query, ...newFilters };
    
    if (query.search === "") delete query.search;
    if (query.style === "all") delete query.style;
    if (query.location === "all") delete query.location;
    
    Object.keys(newFilters).forEach(key => {
       if (newFilters[key] === null) delete query[key];
    });

    router.push({ pathname: "/studios", query }, undefined, { shallow: false });
  };

  // Sync state with URL changes (e.g. back button)
  useEffect(() => {
    if (router.isReady) {
       if (router.query.location) {
         setSelectedLocation(router.query.location as string);
       } else if (initialLocation && initialLocation !== 'all') {
         // If URL has no location but we auto-detected one server-side, keep UI in sync
         setSelectedLocation(initialLocation);
       }
    }
  }, [router.isReady, router.query.location, initialLocation]);

  useEffect(() => {
    if (debouncedSearch !== router.query.search && (debouncedSearch || router.query.search)) {
      updateFilters({ search: debouncedSearch || null });
    }
  }, [debouncedSearch]);

  const styles = ["Traditional", "Japanese", "Realism", "Geometric", "Blackwork", "Watercolor", "Fine Line", "Neo-Traditional"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Tattoo Studios</h1>
          <p className="text-muted-foreground">Discover the perfect studio for your next tattoo</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* FILTERS SIDEBAR */}
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

          {/* MAIN CONTENT AREA */}
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

            {/* CONTROLS ROW */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {studios.length} studios found {selectedLocation !== 'all' && `in ${selectedLocation}`}
              </p>

              <div className="flex items-center gap-4">
                  <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as "list" | "map")}>
                    <ToggleGroupItem value="list" aria-label="List view">
                        <ListIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="map" aria-label="Map view">
                        <MapIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>

                  {viewMode === 'list' && (
                      <Select defaultValue="rating">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="reviews">Most Reviews</SelectItem>
                        </SelectContent>
                      </Select>
                  )}
              </div>
            </div>

            {/* CONTENT */}
            {studios.length === 0 ? (
               <div className="text-center py-20 border rounded-lg bg-muted/10">
                 <h3 className="text-lg font-semibold">No studios found</h3>
                 <p className="text-muted-foreground">
                    {selectedLocation !== 'all' 
                        ? `We couldn't find any studios in ${selectedLocation}. Try resetting filters.` 
                        : "Try adjusting your filters or search terms."}
                 </p>
                 {selectedLocation !== 'all' && (
                    <Button variant="link" onClick={() => {
                        setSelectedLocation("all");
                        updateFilters({ location: "all" });
                    }}>
                        View all locations
                    </Button>
                 )}
               </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {studios.map((studio) => (
                        <StudioCard key={studio.id} studio={studio} />
                        ))}
                    </div>
                ) : (
                    <StudioMap studios={studios} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, query: params }) => {
  const { search, style } = params;
  let { location } = params;

  // --- 1. AUTO-DETECT LOCATION (Vercel Headers) ---
  // If the user hasn't explicitly picked a location (URL is empty), try to use their IP
  let detectedCity: string | null = null;
  
  if (!location || location === 'all') {
    // Vercel provides this header automatically
    const cityHeader = req.headers['x-vercel-ip-city'];
    
    if (cityHeader) {
        detectedCity = Array.isArray(cityHeader) ? cityHeader[0] : cityHeader;
        // Use decodeURIComponent to handle special characters in city names
        try {
            detectedCity = decodeURIComponent(detectedCity);
        } catch (e) {
            // Fallback if decoding fails
        }
        
        // Apply filter automatically
        // Only apply if we didn't explicitly ask for 'all' (user cleared filter)
        if (!location) {
            location = detectedCity;
        }
    }
  }

  // 2. Fetch locations safely
  const { data: locationData } = await supabase
    .from("studios")
    .select("city, state")
    .eq("verified", true);

  const uniqueLocations = locationData 
    ? Array.from(new Set(locationData.map(s => `${s.city}, ${s.state}`))).sort()
    : [];

  // 3. Main Query
  let query = supabase
    .from("studios")
    .select("*,latitude,longitude")
    .eq("verified", true);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (style && style !== 'all') {
    query = query.contains('styles', [style]);
  }

  if (location && location !== 'all') {
    const locString = location as string;
    
    if (locString.includes(',')) {
      // Matches dropdown format "City, State"
      const [city, state] = locString.split(',').map(s => s.trim());
      if (city) query = query.eq('city', city);
      if (state) query = query.eq('state', state);
    } else {
      // Matches City-only search (like auto-detected "Niš")
      // Using fuzzy search to be safe
      query = query.or(`city.ilike."%${locString}%",state.ilike."%${locString}%"`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching studios:", error);
    return { props: { studios: [], locations: uniqueLocations, initialLocation: location || 'all' } };
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
    longitude: studio.longitude,
    latitude: studio.latitude,
    availability: studio.availability || [],
  }));

  return {
    props: {
      studios,
      locations: uniqueLocations,
      initialLocation: location || 'all', // Pass the resolved location to the client
    },
  };
};