
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
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
          <a href="#how-it-works" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">
            How It Works
          </a>
          <a href="#for-studios" className="text-sm font-medium hover:text-[hsl(var(--ink-red))] transition-colors">
            For Studios
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Link href="/auth/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Get Started</Button>
          </Link>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96">
            <nav className="flex flex-col gap-6 mt-8">
              <Link 
                href="/studios" 
                className="text-lg font-medium hover:text-[hsl(var(--ink-red))] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Browse Studios
              </Link>
              <a 
                href="#how-it-works" 
                className="text-lg font-medium hover:text-[hsl(var(--ink-red))] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#for-studios" 
                className="text-lg font-medium hover:text-[hsl(var(--ink-red))] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                For Studios
              </a>
              <div className="border-t pt-6 space-y-3">
                <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
