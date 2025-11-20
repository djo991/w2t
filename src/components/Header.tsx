// src/components/Header.tsx

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, LayoutDashboard, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut, isLoading } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-[100]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--ink-red))] to-[hsl(var(--ink-blue))] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">W2</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Where<span className="text-[hsl(var(--ink-red))]">2</span>Tattoo
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/studios" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">
            Browse Studios
          </Link>
          {/* Common Link for everyone */}
          {user && (
             <Link href="/messages" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">
               Messages
             </Link>
          )}
          
          {profile?.role === "studio_owner" && (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">
                Dashboard
              </Link>
               <Link href="/dashboard/studio" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">
                My Studio
              </Link>
            </>
          )}

          {profile?.role === "customer" && (
            <Link href="/appointments" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">
              My Appointments
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/studios">
             <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
             </Button>
          </Link>

          {isLoading ? (
             <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback>{profile?.full_name ? getInitials(profile.full_name) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 z-[150]" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                  {profile?.role === "studio_owner" ? "Studio Account" : "Customer Account"}
                </DropdownMenuLabel>
                
                {profile?.role === "studio_owner" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {/* Admin Link */}
            {profile?.is_admin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                  Admin
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Vetting Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
                
                <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96">
            <nav className="flex flex-col gap-6 mt-8">
              {user && (
                 <div className="flex items-center gap-3 mb-4 p-4 bg-muted/20 rounded-lg">
                    <Avatar>
                      <AvatarFallback>{profile?.full_name ? getInitials(profile.full_name) : "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{profile?.full_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{profile?.role?.replace('_', ' ')}</p>
                    </div>
                 </div>
              )}

              <Link 
                href="/studios" 
                className="text-lg font-medium hover:text-[hsl(var(--ink-red))] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Browse Studios
              </Link>

              {profile?.role === "studio_owner" && (
                <Link 
                  href="/dashboard" 
                  className="text-lg font-medium hover:text-[hsl(var(--ink-red))] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              )}
               {profile?.role === "customer" && (
                <Link 
                  href="/appointments" 
                  className="text-lg font-medium hover:text-[hsl(var(--ink-red))] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  My Appointments
                </Link>
              )}

              <div className="border-t pt-6 space-y-3">
                {user ? (
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-600" onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}>
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
