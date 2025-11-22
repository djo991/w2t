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
import { ParsedUrlQueryInput } from "querystring";

// Type for the nested location structure
interface LocationHierarchy {
  [country: string]: {
    [state: string]: string[]; // Array of cities
  };
}

interface StudiosPageProps {
  studios: Studio[];
  locationTree: LocationHierarchy;
  initialFilters: {
      country: string;
      state: string;
      city: string;
      priceMin: number;
      priceMax: number;
  };
}

const StudioMap = dynamic(() => import("@/components/StudioMap"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

export default function StudiosPage({ studios, locationTree = {}, initialFilters }: StudiosPageProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isLoading, setIsLoading] = useState(false);

  // Search & Style
  const [searchQuery, setSearchQuery] = useState((router.query.search as string) || "");
  const [selectedStyle, setSelectedStyle] = useState((router.query.style as string) || "all");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Location Hierarchy State
  const [selectedCountry, setSelectedCountry] = useState(initialFilters.country);
  const [selectedState, setSelectedState] = useState(initialFilters.state);
  const [selectedCity, setSelectedCity] = useState(initialFilters.city);

  // Price State
  const [priceRange, setPriceRange] = useState([initialFilters.priceMin, initialFilters.priceMax]);

  // Derived Lists for Dropdowns
  const availableStates = selectedCountry !== 'all' ? Object.keys(locationTree[selectedCountry] || {}).sort() : [];
  const availableCities = (selectedCountry !== 'all' && selectedState !== 'all') 
    ? (locationTree[selectedCountry]?.[selectedState] || []).sort() 
    : [];

  // Monitor Router events for loading overlay
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

  // Central Filter Updater
  const updateFilters = useCallback((newFilters: Record<string, string | number | null>) => {
    const query = { ...router.query, ...newFilters };
    
    // Clean up empty/default values to keep URL nice
    if (query.search === "") delete query.search;
    if (query.style === "all") delete query.style;
    
    // If resetting to 'all', we want to keep it in URL to override any server-side auto-detection
    // But if it's null (explicit removal), delete it.
    Object.keys(newFilters).forEach(key => {
       if (newFilters[key] === null) delete query[key];
    });

    router.push({ pathname: "/studios", query: query as unknown as ParsedUrlQueryInput }, undefined, { shallow: false });
  }, [router]);

  // Handle Location Changes
  const updateLocationParams = (c: string, s: string, ci: string) => {
      updateFilters({ country: c, state: s, city: ci });
  };

  // Sync State with URL (e.g. back button)
  useEffect(() => {
    if (router.isReady) {
        setSelectedCountry((router.query.country as string) || 'all');
        setSelectedState((router.query.state as string) || 'all');
        setSelectedCity((router.query.city as string) || 'all');
        if (router.query.min_price && router.query.max_price) {
            setPriceRange([Number(router.query.min_price), Number(router.query.max_price)]);
        }
    }
  }, [router.isReady, router.query]);

  // Sync Search
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

                {/* STYLE FILTER */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Style</label>
                  <Select 
                    value={selectedStyle} 
                    onValueChange={(val) => {
                      setSelectedStyle(val);
                      updateFilters({ style: val });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="All Styles" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {styles.map((style) => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* HIERARCHICAL LOCATION FILTER */}
                <div className="space-y-4 border-t pt-4">
                    <label className="text-sm font-medium block">Location</label>
                    
                    {/* Country */}
                    <Select 
                        value={selectedCountry} 
                        onValueChange={(val) => {
                            setSelectedCountry(val);
                            setSelectedState('all');
                            setSelectedCity('all');
                            updateLocationParams(val, 'all', 'all');
                        }}
                    >
                        <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {Object.keys(locationTree).sort().map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* State */}
                    <Select 
                        value={selectedState} 
                        disabled={selectedCountry === 'all'}
                        onValueChange={(val) => {
                            setSelectedState(val);
                            setSelectedCity('all');
                            updateLocationParams(selectedCountry, val, 'all');
                        }}
                    >
                        <SelectTrigger><SelectValue placeholder="State / Region" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All States</SelectItem>
                            {availableStates.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* City */}
                    <Select 
                        value={selectedCity} 
                        disabled={selectedState === 'all'}
                        onValueChange={(val) => {
                            setSelectedCity(val);
                            updateLocationParams(selectedCountry, selectedState, val);
                        }}
                    >
                        <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {availableCities.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* PRICE FILTER */}
                <div className="space-y-4 border-t pt-4">
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

                {/* RESET BUTTON */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStyle("all");
                    setSelectedCountry("all");
                    setSelectedState("all");
                    setSelectedCity("all");
                    setPriceRange([0, 500]);
                    // Force URL reset
                    router.push("/studios?country=all"); 
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 relative min-h-[500px]">
            
            {/* Local Loading Overlay */}
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
                {studios.length} studios found 
                {selectedCountry !== 'all' && ` in ${selectedCity !== 'all' ? selectedCity : selectedState !== 'all' ? selectedState : selectedCountry}`}
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
                    Try adjusting your filters or search terms.
                 </p>
                 <Button variant="link" onClick={() => {
                        setSelectedCountry("all");
                        setSelectedState("all");
                        setSelectedCity("all");
                        setPriceRange([0, 500]);
                        router.push("/studios?country=all");
                 }}>
                        Clear all filters
                 </Button>
               </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                    // FIX: Smaller Cards (3 cols)
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
  const { search, style, min_price, max_price, country, state, city } = params;

  // 1. BUILD LOCATION TREE
  // Fetch distinct location data to build hierarchical dropdowns
  const { data: allLocations } = await supabase
    .from("studios")
    .select("country, state, city")
    .eq("verified", true);

  const locationTree: LocationHierarchy = {};
  
  allLocations?.forEach(loc => {
    const c = loc.country || "Other";
    const s = loc.state || "Other";
    const ci = loc.city || "Other";

    if (!locationTree[c]) locationTree[c] = {};
    if (!locationTree[c][s]) locationTree[c][s] = [];
    if (!locationTree[c][s].includes(ci)) locationTree[c][s].push(ci);
  });

  // 2. BUILD QUERY
  let query = supabase
    .from("studios")
    .select("*,latitude,longitude")
    .eq("verified", true);

  // Search Text
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Style Filter
  if (style && style !== 'all') {
    query = query.contains('styles', [style]);
  }

  // Hierarchical Location Filter
  if (country && country !== 'all') query = query.ilike('country', country as string);
  if (state && state !== 'all') query = query.ilike('state', state as string);
  if (city && city !== 'all') query = query.ilike('city', city as string);

  // Price Filter
  if (min_price) query = query.gte('priceMin', min_price);
  if (max_price) query = query.lte('priceMin', max_price); 

  // 3. EXECUTE QUERY
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching studios:", error);
    return { 
        props: { 
            studios: [], 
            locationTree,
            initialFilters: { country: 'all', state: 'all', city: 'all', priceMin: 0, priceMax: 500 }
        } 
    };
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
      locationTree,
      initialFilters: {
          country: (country as string) || 'all',
          state: (state as string) || 'all',
          city: (city as string) || 'all',
          priceMin: Number(min_price) || 0,
          priceMax: Number(max_price) || 500
      }
    },
  };
};