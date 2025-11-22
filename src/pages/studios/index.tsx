// src/pages/studios/index.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X, Map as MapIcon, List as ListIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import type { Studio } from "@/types";
import { StudioCard } from "@/components/StudioCard";
import { Header } from "@/components/Header";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";
import useDebounce from "@/hooks/use-debounce";
import dynamic from "next/dynamic";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ParsedUrlQueryInput } from "querystring"; // Import this for typing

interface StudiosPageProps {
  studios: Studio[];
  locations: string[];
  initialLocation: string;
  initialPriceRange: number[];
}

const StudioMap = dynamic(() => import("@/components/StudioMap"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

export default function StudiosPage({ studios, locations = [], initialLocation, initialPriceRange }: StudiosPageProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState((router.query.search as string) || "");
  const [selectedStyle, setSelectedStyle] = useState((router.query.style as string) || "all");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  
  const [priceRange, setPriceRange] = useState(initialPriceRange || [0, 500]);
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    }
  }, [router]);

  const updateFilters = useCallback((newFilters: Record<string, string | number | null>) => {
    const query = { ...router.query, ...newFilters };
    
    if (query.search === "") delete query.search;
    if (query.style === "all") delete query.style;
    if (query.location === null) delete query.location;

    Object.keys(newFilters).forEach(key => {
       if (newFilters[key] === null) delete query[key];
    });

    // Cast query to unknown first to avoid ESLint 'any' error, or use proper type
    router.push({ pathname: "/studios", query: query as unknown as ParsedUrlQueryInput }, undefined, { shallow: false });
  }, [router]);

  useEffect(() => {
    if (router.isReady) {
       if (router.query.location) setSelectedLocation(router.query.location as string);
       else if (initialLocation) setSelectedLocation(initialLocation);

       if (router.query.min_price && router.query.max_price) {
          setPriceRange([Number(router.query.min_price), Number(router.query.max_price)]);
       }
    }
  // Fixed: Added missing dependencies
  }, [router.isReady, router.query.location, initialLocation, router.query.min_price, router.query.max_price]);

  useEffect(() => {
    if (debouncedSearch !== router.query.search && (debouncedSearch || router.query.search)) {
      updateFilters({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, updateFilters, router.query.search]);

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

                <div className="space-y-4">
                  <label className="text-sm font-medium">Hourly Rate: ${priceRange[0]} - ${priceRange[1]}</label>
                  <Slider
                    defaultValue={[0, 500]}
                    value={priceRange}
                    min={0}
                    max={500}
                    step={10}
                    onValueChange={(val) => setPriceRange(val)}
                    onValueCommit={(val) => {
                        updateFilters({ min_price: val[0], max_price: val[1] });
                    }}
                  />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStyle("all");
                    setSelectedLocation("all");
                    setPriceRange([0, 500]);
                    router.push("/studios?location=all"); 
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 relative min-h-[500px]">
            
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[1px] flex items-start justify-center pt-32 rounded-lg">
                    <div className="flex items-center gap-2 bg-background border shadow-lg px-6 py-3 rounded-full">
                        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--ink-red))]" />
                        <span className="text-sm font-medium">Updating results...</span>
                    </div>
                </div>
            )}

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

            {studios.length === 0 ? (
               <div className="text-center py-20 border rounded-lg bg-muted/10">
                 <h3 className="text-lg font-semibold">No studios found</h3>
                 <p className="text-muted-foreground">
                    {selectedLocation !== 'all' 
                        ? `We couldn't find any studios in ${selectedLocation} matching your filters.` 
                        : "Try adjusting your price range or search terms."}
                 </p>
                 <Button variant="link" onClick={() => {
                        setSelectedLocation("all");
                        setPriceRange([0, 500]);
                        router.push("/studios?location=all");
                 }}>
                        Clear all filters
                 </Button>
               </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
  const { search, style, min_price, max_price } = params;
  // Fixed: Destructure location separately because it gets reassigned
  let { location } = params;

  let detectedCity: string | null = null;
  
  if (!location) {
    const cityHeader = req.headers['x-vercel-ip-city'];
    if (cityHeader) {
        detectedCity = Array.isArray(cityHeader) ? cityHeader[0] : cityHeader;
        // Fixed: unused variable 'e' -> '_'
        try { detectedCity = decodeURIComponent(detectedCity); } catch(_) {}
        if (detectedCity) location = detectedCity;
    }
  }

  const { data: locationData } = await supabase
    .from("studios")
    .select("city, state")
    .eq("verified", true);

  const uniqueLocations = locationData 
    ? Array.from(new Set(locationData.map(s => `${s.city}, ${s.state}`))).sort()
    : [];

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
      const [city, state] = locString.split(',').map(s => s.trim());
      if (city) query = query.eq('city', city);
      if (state) query = query.eq('state', state);
    } else {
      query = query.or(`city.ilike."%${locString}%",state.ilike."%${locString}%"`);
    }
  }

  if (min_price) {
    query = query.gte('priceMin', min_price);
  }
  if (max_price) {
    query = query.lte('priceMin', max_price); 
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching studios:", error);
    return { props: { studios: [], locations: uniqueLocations, initialLocation: location || 'all', initialPriceRange: [0, 500] } };
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
    pricingType: studio.pricing_type || 'hourly',
    availability: studio.availability || [],
  }));

  return {
    props: {
      studios,
      locations: uniqueLocations,
      initialLocation: location || 'all',
      initialPriceRange: [Number(min_price) || 0, Number(max_price) || 500]
    },
  };
};