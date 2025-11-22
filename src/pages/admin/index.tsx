// src/pages/admin/index.tsx

import AdminRoute from "@/components/AdminRoute";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Palette, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function AdminHome() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage the platform settings, content, and approvals.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* 1. Vetting */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[hsl(var(--ink-red))]" />
                  Studio Vetting
                </CardTitle>
                <CardDescription>Review and approve new studio applications.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/vetting">
                  <Button className="w-full" variant="outline">Go to Approvals</Button>
                </Link>
              </CardContent>
            </Card>

            {/* 2. Quiz Manager */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[hsl(var(--ink-blue))]" />
                  Quiz Manager
                </CardTitle>
                <CardDescription>Edit questions, answers, and logic for the Style Quiz.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/quiz">
                  <Button className="w-full" variant="outline">Manage Quiz</Button>
                </Link>
              </CardContent>
            </Card>

            {/* 3. Style Manager */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[hsl(var(--accent-gold))]" />
                  Tattoo Styles
                </CardTitle>
                <CardDescription>Manage style result images and descriptions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/styles">
                  <Button className="w-full" variant="outline">Manage Images</Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AdminRoute>
  );
}