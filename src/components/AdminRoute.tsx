// src/components/AdminRoute.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isLoading) return;
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!data?.is_admin) {
        router.push("/"); // Kick non-admins to home
      } else {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [user, isLoading, router]);

  if (isLoading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Checking permissions...</div>;
  }

  return <>{children}</>;
}