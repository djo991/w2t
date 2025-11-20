// src/components/ContactModal.tsx

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studioId: string;
  studioName: string;
}

export function ContactModal({ open, onOpenChange, studioId, studioName }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_requests").insert({
        studio_id: studioId,
        name,
        email,
        message,
      });

      if (error) throw error;

      toast({ 
        title: "Message Sent", 
        description: `Your message has been sent to ${studioName}. They will contact you via email.` 
      });
      
      onOpenChange(false);
      setName("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: "Failed to send message. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {studioName}</DialogTitle>
          <DialogDescription>
            Send an email inquiry to the studio.
          </DialogDescription>
        </DialogHeader>

        {/* Upsell Area */}
        <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2 border border-blue-100 dark:border-blue-900">
          <p>
            <span className="font-semibold">Want instant chat & history?</span>
          </p>
          <p className="text-muted-foreground">
            Create a free account to message studios directly and keep track of all your conversations in one place.
          </p>
          <div className="pt-1">
             <Link href="/auth/signup" className="text-[hsl(var(--ink-red))] font-medium hover:underline">
                Create Account
             </Link>
             <span className="mx-2 text-muted-foreground">or</span>
             <Link href="/auth/signin" className="text-[hsl(var(--ink-red))] font-medium hover:underline">
                Log In
             </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input 
              id="name" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Jane Doe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              required 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Hi, do you have availability for..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}