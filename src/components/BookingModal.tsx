// src/components/BookingModal.tsx

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react"; // Added Loader2
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { format, getDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Artist, OpeningHours } from "@/types";

const bookingSchema = z.object({
  artistId: z.string().min(1, "Please select an artist"),
  time: z.string().min(1, "Please select a time"),
  date: z.date({ required_error: "Please select a date" }),
  notes: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artists: Artist[];
  studioName: string;
  studioId: string;
  openingHours?: OpeningHours;
}

export function BookingModal({ open, onOpenChange, artists, studioName, studioId, openingHours }: BookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // New State for Availability
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || "",
      email: user?.email || "",
    }
  });

  const selectedDate = watch("date");
  const selectedArtist = watch("artistId");

  // --- 1. Fetch Taken Slots ---
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate || !selectedArtist) {
        setTakenSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        // Format date as YYYY-MM-DD for DB query
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        // Use RPC to fetch taken slots (bypasses RLS securely)
        const { data, error } = await supabase
          .rpc("get_taken_times", {
            p_artist_id: selectedArtist,
            p_date: dateStr
          });

        if (error) throw error;

        // Normalize times (DB might return "14:00:00", we need "14:00")
        // Extract just the time strings (using the new 'slot' property)
        const times = (data as any[]).map((row: any) => row.slot.substring(0, 5));
        setTakenSlots(times);
      } catch (err) {
        console.error("Error checking availability", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, selectedArtist]);


  // --- 2. Generate Available Slots ---
  const getDayName = (date: Date) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[getDay(date)];
  };

  const generateTimeSlots = () => {
    if (!selectedDate || !openingHours) {
      return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    }

    const dayName = getDayName(selectedDate);
    const daySchedule = openingHours[dayName];

    if (!daySchedule || !daySchedule.isOpen) return [];

    const slots = [];
    let currentHour = parseInt(daySchedule.open.split(":")[0]);
    const endHour = parseInt(daySchedule.close.split(":")[0]);

    while (currentHour < endHour) {
      const hourStr = currentHour.toString().padStart(2, "0") + ":00";
      
      // FILTER: Only add if NOT in takenSlots
      if (!takenSlots.includes(hourStr)) {
          slots.push(hourStr);
      }
      currentHour++;
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const isDateDisabled = (date: Date) => {
    if (date < new Date()) return true; 
    if (openingHours) {
      const dayName = getDayName(date);
      return !openingHours[dayName]?.isOpen;
    }
    return false;
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be logged in to book an appointment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("bookings").insert({
        customer_id: user.id,
        studio_id: studioId,
        artist_id: data.artistId,
        date: format(data.date, "yyyy-MM-dd"),
        time: data.time,
        status: "pending",
        notes: data.notes,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        tattoo_description: data.notes || "No description provided",
        placement: "To be discussed",
        size: "To be discussed",
        budget_range: "To be discussed"
      });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: "The studio will review your appointment request shortly.",
      });
      
      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book Appointment at {studioName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Artist</Label>
              <Select onValueChange={(value) => setValue("artistId", value)}>
                <SelectTrigger className={errors.artistId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Choose an artist" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name} - {artist.specialties?.[0] || "Artist"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.artistId && <p className="text-sm text-red-500">{errors.artistId.message}</p>}
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Select Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                      errors.date && "border-red-500"
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setValue("date", date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                  <Label>Select Time</Label>
                  {isLoadingSlots && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
              </div>
              <Select onValueChange={(value) => setValue("time", value)} disabled={!selectedDate || !selectedArtist}>
                <SelectTrigger className={errors.time ? "border-red-500" : ""}>
                  <SelectValue placeholder={
                      !selectedArtist ? "Select artist first" :
                      !selectedDate ? "Select date first" :
                      isLoadingSlots ? "Checking availability..." :
                      timeSlots.length > 0 ? "Choose a time slot" : 
                      "No slots available"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.length > 0 ? (
                    timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {takenSlots.length > 0 ? "Fully booked for this artist" : "Studio closed"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.time && <p className="text-sm text-red-500">{errors.time.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Design Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe your tattoo idea..."
                {...register("notes")}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} className={errors.name ? "border-red-500" : ""} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="(555) 123-4567" {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} className={errors.email ? "border-red-500" : ""} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Request Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}