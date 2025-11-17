// src/pages/appointments/index.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/router";

// Define a type for the joined query data
interface BookingWithStudio {
  id: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  studios: {
    name: string;
    location: string;
    id: string;
  };
}

// --- HELPER FUNCTIONS (Moved outside component) ---

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "completed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed": return <CheckCircle className="w-4 h-4" />;
    case "pending": return <AlertCircle className="w-4 h-4" />;
    case "cancelled": return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

// --- MAIN COMPONENT ---

export default function MyAppointments() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithStudio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      // Fetch bookings and join with studio details
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id, date, time, status, notes,
          studios ( id, name, location )
        `)
        .eq("customer_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      // Cast the result to our type
      setBookings(data as unknown as BookingWithStudio[]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user) {
      fetchBookings();
    }
  }, [user, authLoading, router]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({ title: "Appointment Cancelled" });
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: "cancelled" } : b
      ));
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: "Failed to cancel appointment.", 
        variant: "destructive" 
      });
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date() && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => new Date(b.date) < new Date() || b.status === 'cancelled');

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
        <p className="text-muted-foreground mb-8">Manage your upcoming sessions and view your history.</p>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">You haven't booked any appointments yet.</p>
              <Link href="/studios">
                <Button>Browse Studios</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">No upcoming appointments.</div>
              ) : (
                upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {pastBookings.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">No past appointments.</div>
              ) : (
                pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT ---

function BookingCard({ booking, onCancel }: { booking: BookingWithStudio, onCancel?: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{booking.studios?.name || "Unknown Studio"}</h3>
            <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              <span className="capitalize">{booking.status}</span>
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(booking.date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{booking.studios?.location}</span>
            </div>
          </div>

          {booking.notes && (
            <p className="text-sm bg-muted/50 p-3 rounded-md">
              <span className="font-medium text-foreground">Your Note:</span> {booking.notes}
            </p>
          )}
        </div>

        {booking.status === 'pending' && onCancel && (
          <div className="flex items-center">
            <Button variant="outline" className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onCancel(booking.id)}>
              Cancel Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}