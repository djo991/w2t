// src/pages/auth/signup.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

// --- Zod Schemas for Validation ---
const customerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const studioSchema = z.object({
  studioName: z.string().min(2, "Studio name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const customerForm = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const studioForm = useForm<z.infer<typeof studioSchema>>({
    resolver: zodResolver(studioSchema),
    defaultValues: { studioName: "", location: "", email: "", password: "" },
  });

  const handleCustomerSignUp = async (values: z.infer<typeof customerSchema>) => {
    setError(null);
    setSuccess(null);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: "customer", // This data is passed to our SQL trigger
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Check your email for a verification link!");
      customerForm.reset();
    }
  };

  const handleStudioSignUp = async (values: z.infer<typeof studioSchema>) => {
    setError(null);
    setSuccess(null);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.studioName, // We pass studioName as the full_name
          role: "studio_owner",
          // You could add location to user_meta_data too if needed
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Check your email for a verification link!");
      // Here you would also create the initial studio row, linking it to the new user.
      // We'll add that after. For now, just sign up.
      studioForm.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--ink-red))] to-[hsl(var(--ink-blue))] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">W2</span>
          </div>
          <span className="text-3xl font-bold tracking-tight">Where<span className="text-[hsl(var(--ink-red))]">2</span>Tattoo</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-center text-sm text-destructive mb-4">{error}</p>}
            {success && <p className="text-center text-sm text-green-600 mb-4">{success}</p>}
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="studio">Studio Owner</TabsTrigger>
              </TabsList>

              <TabsContent value="customer">
                <Form {...customerForm}>
                  <form onSubmit={customerForm.handleSubmit(handleCustomerSignUp)} className="space-y-4">
                    <FormField
                      control={customerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={customerForm.formState.isSubmitting}>
                      {customerForm.formState.isSubmitting ? "Creating..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="studio">
                <Form {...studioForm}>
                  <form onSubmit={studioForm.handleSubmit(handleStudioSignUp)} className="space-y-4">
                    <FormField
                      control={studioForm.control}
                      name="studioName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Studio Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ink Masters Studio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={studioForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Brooklyn, NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={studioForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="studio@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={studioForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={studioForm.formState.isSubmitting}>
                      {studioForm.formState.isSubmitting ? "Submitting..." : "List Your Studio"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            <p className="text-center text-sm text-muted-foreground pt-4">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-[hsl(var(--ink-red))] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}