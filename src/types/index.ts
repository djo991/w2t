
export interface Studio {
  id: string;
  name: string;
  location: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  styles: string[];
  images: string[];
  coverImage: string;
  featured?: boolean;
  verified?: boolean;
  description: string;
  openingHours?: OpeningHours;
  latitude: number;
  longitude: number;
  priceRange: {
    min: number;
    max: number;
  };
  responseTime?: string;
  availability: string[];
  artists: Artist[];
}

export interface Artist {
  id: string;
  name: string;
  studioId: string;
  bio: string;
  specialty: string;
  specialties: string[];
  portfolio: PortfolioItem[];
  rating: number;
  yearsExperience: number;
  avatar: string;
}

export interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  style: string;
  artistId: string;
}

export interface Review {
  id: string;
  studioId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface OpeningHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export interface Appointment {
  id: string;
  studioId: string;
  artistId: string;
  userId: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  type: "customer" | "studio_owner";
  avatar?: string;
  studioId?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  studio_id: string;
  updated_at: string;
  // We will join these in the query
  studios?: { name: string; cover_image: string };
  profiles?: { full_name: string; avatar_url?: string }; // For the customer info
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}