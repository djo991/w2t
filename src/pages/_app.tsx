import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react"; // <--- Import Icon

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleStop = () => setIsNavigating(false);

    // Listen to router events to show/hide the loader
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  return (
    <AuthProvider>
      {/* Global Loading Indicator Layer */}
      {isNavigating && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* 1. Top Progress Bar (Thicker & High Contrast) */}
            <div className="absolute top-0 left-0 h-1.5 w-full bg-secondary/20 overflow-hidden">
                <div className="h-full w-full bg-[hsl(var(--ink-red))] origin-left animate-progress shadow-[0_0_10px_hsl(var(--ink-red))]"></div>
            </div>
            
            {/* 2. Bottom Right Floating Spinner */}
            <div className="absolute bottom-6 right-6 bg-background/90 backdrop-blur-md p-3 rounded-full shadow-2xl border border-border animate-in fade-in zoom-in duration-300">
                <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--ink-red))]" />
            </div>
        </div>
      )}
      
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  );
}