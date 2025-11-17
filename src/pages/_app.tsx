import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
      {/* Global Loading Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 z-[100] h-1 w-full overflow-hidden bg-secondary">
          <div className="h-full w-full bg-[hsl(var(--ink-red))] origin-left animate-in slide-in-from-left duration-1000"></div>
        </div>
      )}
      
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  );
}