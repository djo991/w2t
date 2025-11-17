#Where2Tattoo
A web platform designed to connect tattoo studios and artists with customers. This app allows customers to discover studios, browse portfolios, and book appointments, while providing studios with a dashboard to manage their artists, bookings, and public profiles.

✨ Core Features
Customer Portal:

Browse studios with advanced search and filters.

View detailed studio pages, including artist profiles and portfolios.

Book appointments directly with studios/artists.

(Coming Soon) Real-time messaging with studios.

Studio Portal:

Secure sign-up and vetting process for studio owners.

A comprehensive dashboard to manage appointments (confirm, deny, complete).

Tools to manage the studio's public profile, artists, and portfolio images.

🚀 Tech Stack
Framework: Next.js (with Turbopack)

Database & Auth: Supabase (Postgres + Auth + RLS)

UI: Tailwind CSS

Components: shadcn/ui

Language: TypeScript

Forms: React Hook Form & Zod

🏁 Getting Started
Follow these instructions to get the project up and running on your local machine.

1. Clone the Repository
Bash

# Replace this with your own repository URL
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
2. Install Dependencies
This project uses npm to manage packages.

Bash

npm install
3. Set Up Environment Variables
This project requires a connection to a Supabase project to run.

Create a new file named .env.local in the root of the project.

Go to your Supabase project's Settings > API.

Copy the URL and the anon (public) key.

Add them to your .env.local file:

Bash

NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
Note: Your .gitignore file is already configured to ignore this file, so your keys will not be committed to Git.

4. Set Up the Database
Your Supabase database needs to be set up to match the application's needs. You will need to run the SQL scripts located in your supabase/schema.sql file (or from our chat history) in your Supabase SQL Editor.

The key scripts to run are:

The CREATE TABLE statements for all your tables.

The handle_new_user function and its associated trigger.

The Row Level Security (RLS) policies for all tables.

5. Run the Development Server
Bash

npm run dev
Open http://localhost:3000 with your browser to see the result.
