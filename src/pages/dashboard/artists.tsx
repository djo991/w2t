// src/pages/dashboard/artists.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, User as UserIcon, ArrowLeft, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import StudioRoute from "@/components/StudioRoute";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { Artist } from "@/types";
import { ImageUpload } from "@/components/ImageUpload";

export default function ArtistsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [studioId, setStudioId] = useState<string | null>(null);
  
  // Track if we are editing an existing artist
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    yearsExperience: 0,
    specialties: "", // Comma separated string for input
    avatar: "",
  });

  // Fetch Artists
  const fetchArtists = async () => {
    if (!user) return;
    try {
      const { data: studio, error: studioError } = await supabase
        .from("studios")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (studioError) throw studioError;
      setStudioId(studio.id);

      const { data: artistsData, error: artistsError } = await supabase
        .from("artists")
        .select("*")
        .eq("studio_id", studio.id);

      if (artistsError) throw artistsError;

      const mappedArtists = artistsData.map((a: any) => ({
        ...a,
        avatar: a.avatar_url,
        yearsExperience: a.years_experience,
        specialties: a.specialties || []
      }));

      setArtists(mappedArtists);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, [user]);

  // Open Dialog for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", bio: "", yearsExperience: 0, specialties: "", avatar: "" });
    setIsDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (artist: Artist) => {
    setEditingId(artist.id);
    setFormData({
      name: artist.name,
      bio: artist.bio,
      yearsExperience: artist.yearsExperience,
      specialties: artist.specialties.join(", "),
      avatar: artist.avatar,
    });
    setIsDialogOpen(true);
  };

  // Handlers
  const handleSaveArtist = async () => {
    if (!studioId) return;

    try {
      const artistPayload = {
        studio_id: studioId,
        name: formData.name,
        bio: formData.bio,
        years_experience: formData.yearsExperience,
        avatar_url: formData.avatar,
        specialties: formData.specialties.split(",").map(s => s.trim()).filter(s => s.length > 0)
      };

      if (editingId) {
        // UPDATE Existing
        const { error } = await supabase
          .from("artists")
          .update(artistPayload)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Artist Updated", description: "Changes saved successfully." });
      } else {
        // INSERT New
        const { error } = await supabase
          .from("artists")
          .insert(artistPayload);
        if (error) throw error;
        toast({ title: "Artist Added", description: `${formData.name} has been added to your team.` });
      }

      setIsDialogOpen(false);
      fetchArtists(); // Refresh list
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this artist?")) return;
    try {
        const { error } = await supabase.from("artists").delete().eq("id", id);
        if (error) throw error;
        toast({ title: "Artist Removed" });
        fetchArtists();
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <StudioRoute>
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-[hsl(var(--ink-red))] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Artists</h1>
              <p className="text-muted-foreground">Add or remove artists from your studio profile.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Artist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Artist" : "Add New Artist"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            placeholder="Artist Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea 
                            value={formData.bio} 
                            onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                            placeholder="Short bio..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Experience (Years)</Label>
                            <Input 
                                type="number"
                                value={formData.yearsExperience} 
                                onChange={(e) => setFormData({...formData, yearsExperience: parseInt(e.target.value) || 0})} 
                            />
                        </div>
                         <div className="space-y-2">
                        <Label>Avatar</Label>
                        <ImageUpload 
                            bucket="avatars"
                            currentImage={formData.avatar}
                            onUpload={(url) => setFormData({...formData, avatar: url})}
                            label="Upload Photo"
                        />
                    </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Specialties (comma separated)</Label>
                        <Input 
                            value={formData.specialties} 
                            onChange={(e) => setFormData({...formData, specialties: e.target.value})} 
                            placeholder="Realism, Blackwork, Traditional"
                        />
                    </div>
                    <Button onClick={handleSaveArtist} className="w-full mt-4">
                      {editingId ? "Save Changes" : "Add Artist"}
                    </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {loading ? (
                <p>Loading artists...</p>
            ) : artists.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    No artists found. Add one to get started!
                </div>
            ) : (
                artists.map((artist) => (
                    <Card key={artist.id} className="flex items-center p-4 gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={artist.avatar} />
                            <AvatarFallback><UserIcon /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{artist.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{artist.bio}</p>
                            <div className="flex gap-2 mt-1">
                                {artist.specialties.map((s, i) => (
                                    <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-full">{s}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(artist)}>
                                <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            {/* Delete Button */}
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(artist.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))
            )}
          </div>
        </div>
      </div>
    </StudioRoute>
  );
}