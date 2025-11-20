// src/pages/dashboard/index.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, Star, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, RefreshCcw, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import StudioRoute from "@/components/StudioRoute";
import type { Studio, Appointment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Header } from "@/components/Header"; // <--- Import Header

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: studioData, error: studioError } = await supabase
        .from("studios")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (studioError) throw studioError;
      setStudio(studioData);

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("studio_id", studioData.id)
        .order("date", { ascending: true });

      if (bookingError) throw bookingError;
      setAppointments(bookingData || []);

    } catch (error: any) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      setAppointments(prev => prev.map(app => 
        app.id === bookingId ? { ...app, status } : app
      ));

      toast({
        title: `Booking ${status}`,
        description: `The appointment has been successfully ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    }
  };

  const stats = [
    { 
      label: "Total Bookings", 
      value: appointments.length.toString(), 
      icon: Calendar, 
      trend: "up" 
    },
    { 
      label: "Pending Requests", 
      value: appointments.filter(a => a.status === 'pending').length.toString(), 
      icon: Users, 
      trend: "up" 
    },
    { 
      label: "Avg Rating", 
      value: studio?.rating?.toString() || "N/A", 
      icon: Star, 
      trend: "up" 
    },
    { 
      label: "Confirmed Revenue", 
      value: `$${appointments.filter(a => a.status === 'confirmed').length * (studio?.priceRange?.min || 0)}`, 
      icon: TrendingUp, 
      trend: "up" 
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!studio && !isLoading) {
    return (
      <StudioRoute>
         <Header />
         <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">No Studio Found</h1>
            <p>You haven't listed your studio yet.</p>
            <Link href="/studios/new">
              <Button>Create Studio Listing</Button>
            </Link>
         </div>
      </StudioRoute>
    )
  }

  return (
    <StudioRoute>
      <div className="min-h-screen bg-background">
        {/* REPLACED HARDCODED HEADER WITH COMPONENT */}
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Studio Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {studio?.name}</p>
            </div>
             <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="w-8 h-8 text-[hsl(var(--ink-red))]" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                    </TabsList>

                    {["all", "confirmed", "pending"].map((tabValue) => (
                      <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                        {appointments
                          .filter(a => tabValue === "all" || a.status === tabValue)
                          .map((appointment) => (
                          <div key={appointment.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex-1 w-full">
                              <div className="flex items-center justify-between mb-2">
                                {/* SHOW CUSTOMER NAME */}
                                <h4 className="font-semibold text-lg">
                                  {appointment.customer_name || "Customer"}
                                </h4>
                                <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                  {getStatusIcon(appointment.status)}
                                  <span className="ml-1 capitalize">{appointment.status}</span>
                                </Badge>
                              </div>
                              
                              {/* CUSTOMER DETAILS & NOTES */}
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                  {appointment.customer_email && (
                                    <div className="flex items-center gap-1">
                                      <span className="opacity-70">Email:</span> 
                                      <span className="text-foreground">{appointment.customer_email}</span>
                                    </div>
                                  )}
                                  {appointment.customer_phone && (
                                    <div className="flex items-center gap-1">
                                      <span className="opacity-70">Phone:</span> 
                                      <span className="text-foreground">{appointment.customer_phone}</span>
                                    </div>
                                  )}
                                </div>

                                {appointment.notes && (
                                  <div className="bg-muted p-2 rounded-md mt-2 text-foreground">
                                    "{appointment.notes}"
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4 pt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{format(new Date(appointment.date), "PPP")}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{appointment.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* ACTIONS (Buttons) - Kept same as before */}
                            <div className="flex gap-2 w-full sm:w-auto sm:self-center justify-end mt-2 sm:mt-0">
                              {/* ... your existing button logic ... */}
                              {appointment.status === "pending" && (
                                <>
                                  <Button size="sm" className="flex-1 sm:flex-none" variant="outline" onClick={() => updateBookingStatus(appointment.id, 'confirmed')}>
                                    <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                    Confirm
                                  </Button>
                                  <Button size="sm" className="flex-1 sm:flex-none" variant="outline" onClick={() => updateBookingStatus(appointment.id, 'cancelled')}>
                                    <XCircle className="w-4 h-4 mr-1 text-red-600" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              
                              {appointment.status === "confirmed" && (
                                <>
                                  <Button size="sm" className="flex-1 sm:flex-none" variant="outline" onClick={() => updateBookingStatus(appointment.id, 'completed')}>
                                    <CheckCircle className="w-4 h-4 mr-1 text-blue-600" />
                                    Complete
                                  </Button>
                                  <Button size="sm" className="flex-1 sm:flex-none" variant="outline" onClick={() => updateBookingStatus(appointment.id, 'cancelled')}>
                                    <XCircle className="w-4 h-4 mr-1 text-red-600" />
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        {appointments.filter(a => tabValue === "all" || a.status === tabValue).length === 0 && (
                           <div className="text-center py-8 text-muted-foreground">
                             No appointments found.
                           </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3"> {/* Changed space-y-3 to flex gap-3 for robust spacing */}
                  
                  <Link href="/dashboard/studio" className="w-full">
                    <Button className="w-full justify-start" variant="outline">
                      <Star className="w-4 h-4 mr-2" />
                      Edit Studio Profile
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/schedule" className="w-full">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Manage Schedule
                    </Button>
                  </Link>

                  <Link href="/dashboard/artists" className="w-full">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Artists
                    </Button>
                  </Link>
                    <Link href="/messages?tab=inquiries" className="w-full">
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      View Inquiries
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </StudioRoute>
  );
}