# 💍 Wedding Guest Management & Event Platform

> Produkcja-ready aplikacja weselna łącząca eleganckie doświadczenie gościa z automatyzacją RSVP i panelem organizatora.

[![Live Demo](https://img.shields.io/badge/🚀_Zobacz_Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://wedding-app-seven-liart.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)

---

## 🌐 Live Demo

| | Link |
|---|---|
| **Strona weselna (goście)** | [**wedding-app-seven-liart.vercel.app**](https://wedding-app-seven-liart.vercel.app) |
| **Panel administratora** | [/admin](https://wedding-app-seven-liart.vercel.app/admin) |
| **Hasło demo (admin)** | `1234AJ` |

> 🔐 Panel `/admin` jest chroniony hasłem. Użyj **`1234AJ`**, aby zobaczyć listę gości, statystyki RSVP i eksport CSV.

---

## 🎯 Elevator Pitch

**Wedding Guest Management & Event Platform** to full-stackowa aplikacja eventowa zbudowana dla pary młodej i gości weselnych. Zastępuje rozproszone potwierdzenia przez SMS, telefon i kartki papierowe **jednym, spójnym cyfrowym hubem** — od zaproszenia z odliczaniem do wesela, przez RSVP z preferencjami dietetycznymi, po panel organizatora z analityką i eksportem danych.

Projekt powstał jako **realny produkt weselny** (Adrianna & Jan, 16.01.2027) i jednocześnie jako **portfolio piece** demonstrujący nowoczesne wzorce Next.js App Router, Server Actions, walidację end-to-end oraz integrację z Supabase PostgreSQL.

---

## 💼 Problem & Rozwiązanie (Business Value)

### Problem
Organizacja wesela generuje setki mikro-decyzji logistycznych: kto przychodzi, kto ma +1, jakie diety, kto potrzebuje noclegu, ile osób usiądzie przy stole. Tradycyjne metody (telefon, Messenger, kartki RSVP) prowadzą do:

- **utraty danych** w wątkach czatu,
- **błędów cateringu** przez nieujawnione alergie,
- **godzin ręcznego przepisywania** do Excela,
- **braku jednego źródła prawdy** dla pary młodej.

### Rozwiązanie
Cyfrowe RSVP + panel admina daje:

| Tradycyjnie | W aplikacji |
|---|---|
| Rozproszone odpowiedzi | Jeden formularz → PostgreSQL |
| Ręczne zliczanie gości | Statystyki na żywo (obecni / odmowy / oczekujący) |
| Chaos dietetyczny | Enum diet + osobna dieta dla +1 |
| Eksport „na kolanie” | Pobranie CSV jednym kliknięciem |
| Gość musi dzwonić | Formularz **lub** kontakt telefoniczny (numery w sekcji RSVP) |

**ROI organizacyjny:** para młoda oszczędza czas, catering dostaje ustrukturyzowane dane, gość ma frictionless UX na mobile.

---

## ✨ Kluczowe Funkcjonalności

### 📋 Cyfrowe RSVP
- Interaktywny formularz (**React Hook Form + Zod**) z dynamicznymi polami (+1, dieta, nocleg).
- Zapis przez **Next.js Server Actions** bezpośrednio do Supabase.
- Walidacja po stronie klienta i serwera, toasty, animacja confetti po potwierdzeniu obecności.
- Numery kontaktowe pary młodej (`tel:`) jako alternatywa dla formularza.

### ⏱️ Hero & Smart Countdown
- Sekcja powitalna z parallax tłem, lokalizacją i odliczaniem do wesela.
- **Automatyczne przełączenie po dacie ślubu** — teksty „przed” / „po weselu” + licznik w górę (elapsed time).

### 📖 Interaktywna Historia (Scroll Story)
- Scroll-driven timeline (**Framer Motion**) z narracją i zoptymalizowanymi obrazami (`next/image` + blur placeholders).

### 📅 Harmonogram Dnia
- Dynamiczny plan z tabeli `timeline_events` w Supabase (fallback do danych statycznych).
- Integracja kalendarza: **Google Calendar** + pobieranie pliku **`.ics`**.

### 🖼️ Galeria Wspomnień
- Sekcja informacyjna z linkiem do zewnętrznego albumu fotografa (`NEXT_PUBLIC_GALLERY_URL`).
- Stan „przed weselem” (przycisk nieaktywny) / „po weselu” (aktywny link).

### ❓ FAQ
- Accordion z najczęstszymi pytaniami (dress code, prezenty, parking, diety, zdjęcia).

### 🛡️ Panel Administratora (`/admin`)
- Logowanie hasłem (sesja HTTP-only cookie, `timingSafeEqual`).
- Dashboard: lista gości, statusy RSVP, podsumowanie diet, liczba +1 i noclegów.
- **Eksport CSV** przez Route Handler (`/api/export-guests`).
- Dostęp do danych przez Supabase **Service Role** (tylko serwer).

### 📱 Mobile-First & Performance
- Tailwind CSS, touch targets ≥ 44px, semantyczny HTML, ARIA.
- Server Components tam, gdzie to możliwe; minimalny JS na stronie publicznej.
- `next/font` (Playfair Display + Geist), zero layout shift na obrazach.

---

## 🏗️ Stos Technologiczny

| Warstwa | Technologie |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Shadcn UI, Framer Motion, Lucide React |
| **Formularze** | React Hook Form, Zod 4 |
| **Backend** | Next.js Server Actions, Route Handlers |
| **Baza danych** | Supabase (PostgreSQL, Row Level Security) |
| **Deployment** | Vercel (CI/CD, serverless) |

### Architektura (high-level)

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Server       │  │ Server       │  │ Route Handler     │  │
│  │ Components   │  │ Actions      │  │ /api/export-guests│  │
│  │ (RSC)        │  │ rsvp, admin  │  │                   │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         │                 │                     │           │
│         └─────────────────┼─────────────────────┘           │
│                           ▼                                 │
│              ┌────────────────────────┐                     │
│              │ Supabase PostgreSQL    │                     │
│              │ guests, timeline_events│                     │
│              └────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
         ▲                                    ▲
         │ anon key (public read)             │ service role (admin)
    Gość (przeglądarka)                   Panel /admin
```

---

## 🗄️ Schemat Bazy Danych (PostgreSQL)

### Tabela `guests` — RSVP i goście

| Kolumna | Typ | Opis |
|---|---|---|
| `id` | `uuid` | PK |
| `token` | `text` | Unikalny identyfikator gościa |
| `guest_name` | `text` | Imię i nazwisko |
| `is_attending` | `boolean` | Potwierdzenie obecności |
| `plus_one` | `boolean` | Osoba towarzysząca |
| `plus_one_diet` | `text` | Dieta +1 |
| `dietary_requirements` | `text` | Dieta gościa |
| `accommodation_needed` | `boolean` | Potrzeba noclegu |
| `message` | `text` | Wiadomość dla pary młodej |
| `created_at`, `updated_at` | `timestamptz` | Audyt |

### Tabela `timeline_events` — harmonogram

| Kolumna | Typ | Opis |
|---|---|---|
| `id` | `uuid` | PK |
| `title` | `text` | Nazwa punktu programu |
| `event_time` | `time` | Godzina |
| `description` | `text` | Opis |
| `location_name` | `text` | Miejsce |
| `google_maps_url` | `text` | Link do mapy |
| `order_index` | `int` | Kolejność wyświetlania |

### Tabela `gallery_images` *(schema ready)*

Przygotowana pod przyszłą integrację galerii w Supabase Storage. Obecnie sekcja galerii korzysta z zewnętrznego URL.

### Row Level Security (RLS)

| Tabela | Polityka | Dostęp |
|---|---|---|
| `timeline_events` | Public SELECT | Goście czytają harmonogram |
| `gallery_images` | Public SELECT | Publiczny odczyt zdjęć |
| `guests` | Public SELECT / UPDATE | RSVP przez formularz |
| `guests` | Service Role (admin) | Pełny odczyt w panelu |

---

## 🚀 Uruchomienie Lokalne

### Wymagania

- **Node.js** 20+
- **npm** 10+
- Konto **Supabase** (darmowy tier wystarczy)
- Konto **Vercel** (opcjonalnie, do deployu)

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/JakubGrygiel03/wedding-app.git
cd wedding-app
```

### 2. Instalacja zależności

```bash
npm install
```

### 3. Konfiguracja `.env.local`

Utwórz plik `.env.local` w katalogu głównym:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj_anon_key
SUPABASE_SERVICE_ROLE_KEY=twoj_service_role_key

# Admin panel
ADMIN_PASSWORD=twoje_bezpieczne_haslo

# Opcjonalnie
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GALLERY_URL=https://link-do-albumu-po-weselu.pl
```

> ⚠️ **`SUPABASE_SERVICE_ROLE_KEY`** nigdy nie dodawaj z prefiksem `NEXT_PUBLIC_` — to klucz serwerowy z pełnymi uprawnieniami.

### 4. Migracja bazy (Supabase SQL Editor)

Uruchom schemat z `WEDDING_CONCEPT.md` oraz migrację:

```bash
supabase/migrations/20260326120000_add_plus_one_diet.sql
```

### 5. Start dev servera

```bash
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)  
Panel admina: [http://localhost:3000/admin](http://localhost:3000/admin)

### Dostępne skrypty

| Komenda | Opis |
|---|---|
| `npm run dev` | Serwer deweloperski |
| `npm run build` | Produkcyjny build |
| `npm run start` | Uruchomienie buildu |
| `npm run lint` | ESLint |

---

## 📁 Struktura Projektu (skrót)

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── admin/page.tsx        # Panel admina
│   ├── actions/              # Server Actions (RSVP, admin)
│   └── api/export-guests/    # Eksport CSV
├── components/
│   ├── hero.tsx              # Hero + countdown
│   ├── rsvp-form.tsx         # Formularz RSVP
│   ├── schedule-section.tsx  # Harmonogram
│   ├── interactive-story.tsx # Scroll story
│   ├── faq.tsx               # FAQ
│   └── admin/                # Dashboard, login
└── lib/
    ├── supabase/             # Klienty Supabase
    ├── validations/rsvp.ts   # Schemat Zod
    └── wedding-config.ts     # Daty, kontakty, copy
```

---

## 🔮 Roadmap (kierunek rozwoju)

Funkcje zaplanowane w architekturze „Plan Maksimum”, nad którymi można kontynuować rozwój:

- [ ] **Live Photo Wall** — galeria na żywo (Supabase Realtime / polling) pod projektor
- [ ] **Client-side compression** — optymalizacja zdjęć przed uploadem do Storage
- [ ] **Tokenized RSVP links** — `/rsvp/[token]` dla spersonalizowanych zaproszeń
- [ ] **Admin CRUD** — edycja harmonogramu i galerii z poziomu panelu

---

## 👨‍💻 Autor

**Jakub Grygla**  
Full-Stack Developer · Next.js · TypeScript · Supabase

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/JakubGrygiel03)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jakubgrygiel/)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:jakubgrygiel.official@gmail.com)

---

<p align="center">
  Zbudowane z ❤️ jako prezent ślubny i projekt portfolio.<br/>
  <sub>© 2027 Adrianna & Jan · Wedding App</sub>
</p>
