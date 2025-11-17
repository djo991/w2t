// src/components/StudioRoute.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function StudioRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isStudio, setIsStudio] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      if (isLoading) return;
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      // Check if user is a studio owner in the public profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || data?.role !== "studio_owner") {
        router.push("/"); // Redirect customers to home
      } else {
        setIsStudio(true);
      }
    };

    checkRole();
  }, [user, isLoading, router]);

  if (isLoading || isStudio === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading studio dashboard...</p>
      </div>
    );
  }

  return <>{children}</>;
}