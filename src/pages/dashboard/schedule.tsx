// src/pages/dashboard/schedule.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import StudioRoute from "@/components/StudioRoute";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { OpeningHours } from "@/types";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Generate time slots (00:00 - 23:00)
const TIME_SLOTS = Array.from({ length: 24 }).map((_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export default function SchedulePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studioId, setStudioId] = useState<string | null>(null);

  // Default Schedule State
  const [schedule, setSchedule] = useState<OpeningHours>({
    monday: { open: "09:00", close: "17:00", isOpen: true },
    tuesday: { open: "09:00", close: "17:00", isOpen: true },
    wednesday: { open: "09:00", close: "17:00", isOpen: true },
    thursday: { open: "09:00", close: "17:00", isOpen: true },
    friday: { open: "09:00", close: "17:00", isOpen: true },
    saturday: { open: "10:00", close: "16:00", isOpen: false },
    sunday: { open: "10:00", close: "16:00", isOpen: false },
  });

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("studios")
          .select("id, opening_hours")
          .eq("owner_id", user.id)
          .single();

        if (error) throw error;
        
        setStudioId(data.id);
        if (data.opening_hours) {
          setSchedule(data.opening_hours as OpeningHours);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  const handleSave = async () => {
    if (!studioId) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("studios")
        .update({ opening_hours: schedule })
        .eq("id", studioId);

      if (error) throw error;

      toast({ title: "Schedule Saved", description: "Your availability has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (day: string, field: keyof OpeningHours[string], value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <StudioRoute>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-[hsl(var(--ink-red))] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Schedule</h1>
              <p className="text-muted-foreground">Set your studio's weekly operating hours.</p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Hours</CardTitle>
              <CardDescription>Toggle days off or adjust opening and closing times.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {DAYS.map((day) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card gap-4">
                  
                  <div className="flex items-center gap-4 min-w-[140px]">
                    <Switch 
                      checked={schedule[day]?.isOpen} 
                      onCheckedChange={(val) => updateDay(day, 'isOpen', val)}
                    />
                    <span className="capitalize font-medium text-lg">{day}</span>
                  </div>

                  {schedule[day]?.isOpen ? (
                    <div className="flex items-center gap-3 flex-1">
                       <div className="flex items-center gap-2 w-full">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <Select 
                            value={schedule[day].open} 
                            onValueChange={(val) => updateDay(day, 'open', val)}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {TIME_SLOTS.map(t => <SelectItem key={`open-${t}`} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">-</span>
                          <Select 
                            value={schedule[day].close} 
                            onValueChange={(val) => updateDay(day, 'close', val)}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {TIME_SLOTS.map(t => <SelectItem key={`close-${t}`} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center sm:justify-start text-muted-foreground italic bg-muted/50 py-2 px-4 rounded text-sm">
                        Closed
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudioRoute>
  );
}