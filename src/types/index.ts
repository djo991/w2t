
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
}

export interface User {
  id: string;
  email: string;
  name: string;
  type: "customer" | "studio_owner";
  avatar?: string;
  studioId?: string;
}
