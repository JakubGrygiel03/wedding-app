# Cursor Context: Modern Wedding Management & RSVP Application (Plan Maksimum)

##  Project Overview
**Goal:** Create a production-ready, full-stack event application designed for a wedding couple and their guests. Built from the ground up using **Plan Maksimum** architecture to serve as a high-impact portfolio project showcasing advanced Next.js App Router patterns, real-time database management, fine-grained access control, and smooth scroll UX.

- **Target Audience:** Wedding guests (accessing primarily via mobile devices) and recruiters/engineers evaluating full-stack TypeScript, UX, and software engineering capabilities.
- **Tone & Style:** Elegant, modern, intuitive, performant, and fully accessible.
- **Language:** Polish (UI Content), English (Code, Commit Messages, and Technical Documentation).

---

##  Tech Stack & Architecture

- **Framework:** Next.js (App Router, Server Components, Server Actions, Route Handlers)
- **Language:** TypeScript (Strict Mode Enabled)
- **Styling:** Tailwind CSS (Mobile-First approach)
- **UI & Icons:** Shadcn UI + Lucide React
- **Animations & UX:** Framer Motion (Scroll-driven animations, parallax effects, micro-interactions)
- **Database & Backend:** Supabase (PostgreSQL, Row Level Security, Storage, Auth)
- **Form Handling:** React Hook Form + Zod (Strict schema validation)
- **Deployment:** Vercel

---

##  Core Architecture & Features (Plan Maksimum)

### 1. Guest Experience (Public & Token-based)
- **Hero & Countdown:** Interactive cover with newlyweds' names, wedding date, and real-time countdown timer.
- **Interactive Story & Scroll Gallery:** Dynamic, scroll-driven visual timeline using Framer Motion (`useScroll`, `useTransform`) with Next.js Image blur placeholders for maximum visual performance.
- **Tokenized Dynamic RSVP (`/rsvp/[token]` or `/rsvp`):** 
  - Guests confirm attendance using personal token links.
  - Multi-step / single-card form powered by React Hook Form & Zod.
  - Form fields: Guest Name(s), Attendance confirmation, Plus-One details, Dietary preferences (Vegan, Vegetarian, Gluten-Free), Accommodation/Transport needs, Custom message.
  - Direct submission via **Next.js Server Actions** to Supabase with immediate optimistic UI updates and toast notifications.
- **Event Details & Timeline:** Dynamic schedule display with interactive map links (Google Maps / Waze) and "Add to Calendar" (.ics / Google Calendar) integration.
- **Interactive FAQ Accordion:** Common questions (Dress Code, Gifts, Parking, Children Policy).

### 2. Admin Dashboard (`/admin`)
- **Protected Authentication:** Secured via Next.js Middleware and Supabase Auth.
- **RSVP & Guest Management:** Real-time guest list with search, status filtering (Confirmed, Pending, Declined), dietary summary, and CSV export functionality.
- **Content & Schedule Management:** CRUD interface for updating event timeline items (`timeline_events`).
- **Gallery Storage Management:** UI for uploading and managing high-res photos via Supabase Storage buckets.

---

##  Design Guidelines & UX Standards

### Color Palette
- **Primary:** Warm Sage Green (`#4A6B5D`)
- **Secondary / Accent:** Gold / Warm Amber (`#D4AF37`)
- **Background:** Soft Cream / Off-White (`#FAF9F6`)
- **Surface / Cards:** Pure White (`#FFFFFF`) or Soft Off-White
- **Text:** Dark Slate (`#1A1A1A`) for WCAG AAA contrast compliance

### Typography
- **Headings:** Serif / Display font (e.g., `Playfair Display` or `Cormorant Garamond` via `next/font`)
- **Body:** Clean Sans-serif (e.g., `Inter` or `Plus Jakarta Sans`)

### Engineering & UX Standards (Portfolio Focus)
- **Mobile-First Touch Targets:** Minimum interactive target sizes (44x44px).
- **Accessibility (a11y):** Full keyboard navigation, proper ARIA attributes, semantic HTML.
- **Zero Layout Shift:** Image aspect ratio reservations with blur placeholders.
- **Type Safety:** End-to-end TypeScript types generated from Supabase DB schema.

---

##  Database Schema (Supabase PostgreSQL)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Guests & RSVP Responses Table
create table guests (
  id uuid default gen_random_uuid() primary key,
  token text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  guest_name text not null,
  is_attending boolean default null,
  plus_one boolean default false,
  plus_one_name text,
  dietary_requirements text,
  accommodation_needed boolean default false,
  message text
);

-- Dynamic Timeline Events Table
create table timeline_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  event_time time not null,
  description text,
  location_name text,
  google_maps_url text,
  order_index int not null default 0
);

-- Gallery Images Table
create table gallery_images (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  image_url text not null,
  caption text,
  display_order int default 0
);

-- Row Level Security (RLS)
alter table guests enable row level security;
alter table timeline_events enable row level security;
alter table gallery_images enable row level security;

-- Public read policies
create policy "Allow public read access to timeline_events" on timeline_events for select using (true);
create policy "Allow public read access to gallery_images" on gallery_images for select using (true);
create policy "Allow guest to update own RSVP via token" on guests for update using (true);
create policy "Allow public read guest token" on guests for select using (true);

## Folder Structure

├── app/
│   ├── (public)/
│   │   ├── layout.tsx             # Global fonts, OG meta tags, public shell
│   │   ├── page.tsx               # Main landing page aggregating interactive sections
│   │   └── rsvp/[token]/page.tsx  # Dynamic tokenized RSVP page
│   ├── admin/
│   │   ├── layout.tsx             # Admin layout shell with authentication checks
│   │   ├── login/page.tsx         # Admin login form
│   │   ├── dashboard/page.tsx     # Guest list summary, dietary analytics, CSV export
│   │   ├── schedule/page.tsx      # CRUD interface for timeline_events
│   │   └── gallery/page.tsx       # Photo bucket manager
│   ├── actions/
│   │   ├── rsvp.ts                # Server Action for submitting/updating RSVP
│   │   ├── schedule.ts            # Admin Server Actions for managing timeline
│   │   └── gallery.ts             # Admin Server Actions for photo management
│   └── api/
│       └── export-guests/route.ts # Route Handler for downloading CSV reports
├── components/
│   ├── ui/                        # Shadcn UI primitives (Button, Dialog, Accordion, etc.)
│   ├── hero.tsx                   # Hero section with dynamic countdown timer
│   ├── interactive-story.tsx      # Framer Motion scroll-driven photo & narrative section
│   ├── schedule.tsx               # Timeline component with iCal / Google Calendar generation
│   ├── rsvp-form.tsx              # Client form with React Hook Form + Zod schema validation
│   ├── faq.tsx                    # Accordion FAQ section
│   └── admin/                     # Dashboard tables, forms, and analytical widgets
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server-side Supabase client (Cookies / RSC)
│   │   └── middleware.ts          # Auth session refresh & path protection middleware
│   ├── utils.ts                   # Helpers (cn, date formats, calendar link generators)
│   └── validatons/
│       └── rsvp.ts                # Zod schema definitions for RSVP forms
├── middleware.ts                  # Next.js Middleware protecting /admin routes
└── public/
    └── og-image.png               # Custom OpenGraph image for WhatsApp/Messenger link previews