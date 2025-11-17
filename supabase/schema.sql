-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.artists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  studio_id uuid NOT NULL,
  profile_id uuid,
  name text NOT NULL,
  bio text,
  avatar_url text,
  years_experience integer,
  instagram_handle text,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT artists_pkey PRIMARY KEY (id),
  CONSTRAINT artists_studio_id_fkey FOREIGN KEY (studio_id) REFERENCES public.studios(id),
  CONSTRAINT artists_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  studio_id uuid NOT NULL,
  artist_id uuid,
  date date NOT NULL,
  time time without time zone NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])),
  tattoo_description text,
  placement text,
  size text,
  budget_range text,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id),
  CONSTRAINT bookings_studio_id_fkey FOREIGN KEY (studio_id) REFERENCES public.studios(id),
  CONSTRAINT bookings_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id)
);
CREATE TABLE public.portfolio_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  studio_id uuid NOT NULL,
  artist_id uuid,
  image_url text NOT NULL,
  title text,
  description text,
  style text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT portfolio_items_pkey PRIMARY KEY (id),
  CONSTRAINT portfolio_items_studio_id_fkey FOREIGN KEY (studio_id) REFERENCES public.studios(id),
  CONSTRAINT portfolio_items_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  studio_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  booking_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_studio_id_fkey FOREIGN KEY (studio_id) REFERENCES public.studios(id),
  CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.specialties (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artist_id uuid NOT NULL,
  style text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT specialties_pkey PRIMARY KEY (id),
  CONSTRAINT specialties_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id)
);
CREATE TABLE public.studios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid,
  name text NOT NULL,
  location text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  phone text,
  email text,
  description text,
  image_url text,
  rating numeric DEFAULT 0.00,
  review_count integer DEFAULT 0,
  price_range text,
  min_price integer,
  is_verified boolean DEFAULT false,
  opening_hours jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT studios_pkey PRIMARY KEY (id),
  CONSTRAINT studios_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);