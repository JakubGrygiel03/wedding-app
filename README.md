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

> 🔐 Panel `/admin` jest chroniony hasłem. Użyj **`1234AJ`**, aby zobaczyć: zakładkę **RSVP** (lista gości, CRUD, sortowanie, statystyki, śledzenie postępu zaproszeń, eksport CSV) oraz zakładkę **Harmonogram** (CRUD planu dnia).

---

## 📄 Strona publiczna — co zobaczy gość

| Sekcja | Opis |
|---|---|
| **Hero** | Zdjęcie tła z efektem vignette, imiona pary, data i godzina, **Hotel Trylogia** (Zielonka k. Warszawy), odliczanie do wesela (po ślubie — licznik „minęło” + zmiana copy) |
| **Nasza Historia** | 5-krokowa scroll-driven timeline ze zdjęciami (**Framer Motion**) — narracja fantasy/wiedźmińska |
| **Harmonogram** | Plan dnia z bazy `timeline_events` (fallback: dane statyczne), filtry (wszystkie / nadchodzące / minione), Google Calendar + `.ics` |
| **RSVP** | Formularz z dietą (5 opcji + osobna dieta +1), noclegiem, wiadomością; edycja przez token w `localStorage`; numery kontaktowe pary młodej |
| **Galeria** | Link do albumu fotografa po weselu (`NEXT_PUBLIC_GALLERY_URL`) — przed weselem przycisk nieaktywny |
| **FAQ** | Termin RSVP, prezenty, dress code, parking, nocleg, diety, poprawiny/śniadanie, transport, zdjęcia |
| **Stopka** | Imiona pary młodej |

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
| Ręczne zliczanie gości | Statystyki na żywo + śledzenie postępu względem liczby zaproszeń |
| Chaos dietetyczny | Enum diet + osobna dieta dla +1 |
| Eksport „na kolanie” | Pobranie CSV jednym kliknięciem |
| Gość musi dzwonić | Formularz **lub** kontakt telefoniczny (numery w sekcji RSVP) |
| Zmiany w planie dnia → developer | Edycja harmonogramu w panelu admina bez dotykania kodu |
| Gość nie może edytować RSVP | Token w `localStorage` — powrót i aktualizacja bez duplikatu |

**ROI organizacyjny:** para młoda oszczędza czas, catering dostaje ustrukturyzowane dane, gość ma frictionless UX na mobile.

---

## ✨ Kluczowe Funkcjonalności

### 📋 Cyfrowe RSVP
- Interaktywny formularz (**React Hook Form + Zod**) z dynamicznymi polami (+1, dieta, nocleg).
- **5 opcji dietetycznych:** Standardowa, Wegetariańska, Wegańska, Bezglutenowa, Bez laktozy — osobno dla gościa i +1.
- Zapis przez **Next.js Server Actions** bezpośrednio do Supabase.
- Walidacja po stronie klienta i serwera, toasty, animacja confetti po potwierdzeniu obecności.
- **Persystencja tokena** (`localStorage`) — gość może wrócić i edytować swoją odpowiedź bez tworzenia duplikatu.
- Przycisk **„Potwierdź inną osobę”** — nowe RSVP od zera.
- Numery kontaktowe pary młodej (`tel:`) jako alternatywa dla formularza.

### ⏱️ Hero & Smart Countdown
- Sekcja powitalna ze zdjęciem tła, datą, lokalizacją (**Hotel Trylogia**) i odliczaniem do wesela.
- **Automatyczne przełączenie po dacie ślubu** — teksty „Pobieramy się!” / „Jesteśmy małżeństwem!” + licznik w górę (elapsed time).
- Link przewijający do harmonogramu (`#harmonogram`).

### 📖 Interaktywna Historia (Scroll Story)
- **5 kroków** narracji pary młodej (LARP Velen → Szkocja → zaręczyny → zaproszenie).
- Scroll-driven animacje (**Framer Motion**) z zoptymalizowanymi obrazami (`next/image` + blur placeholders).

### 📅 Harmonogram Dnia
- Dynamiczny plan z tabeli `timeline_events` w Supabase (fallback do danych statycznych w kodzie).
- Integracja kalendarza: **Google Calendar** + pobieranie pliku **`.ics`**.
- Filtrowanie wydarzeń (wszystkie / nadchodzące / minione) na stronie publicznej.

### 🖼️ Galeria Wspomnień
- Sekcja informacyjna z linkiem do zewnętrznego albumu fotografa (`NEXT_PUBLIC_GALLERY_URL`).
- Stan „przed weselem” (przycisk nieaktywny) / „po weselu” (aktywny link).

### ❓ FAQ
- Accordion z **9 pytaniami:** termin RSVP, prezenty, dress code (fantasy/elegancki), parking, nocleg, diety, poprawiny/śniadanie w niedzielę, transport, zdjęcia po weselu.

### 🛡️ Panel Administratora (`/admin`)

Panel z dwiema zakładkami: **RSVP** i **Harmonogram**.

#### Zakładka RSVP
- Logowanie hasłem (sesja HTTP-only cookie, `timingSafeEqual`).
- **Statystyki na żywo:** łączna liczba gości, potwierdzeni, odmowy, +1, noclegi, podsumowanie diet.
- **Śledzenie postępu zaproszeń** — na dole zakładki ustawiasz oczekiwaną liczbę odpowiedzi; statystyki (w tym „Oczekujący”) aktualizują się **na żywo podczas wpisywania**, jeszcze przed zapisem.
- **Lista gości** z sortowaniem po kolumnach (imię, obecność, dieta, +1, nocleg, wiadomość).
- **CRUD gości:** przycisk „Dodaj gościa” obok listy, edycja w modalu, usuwanie z potwierdzeniem.
- **Eksport CSV** przez Route Handler (`/api/export-guests`) — bez wiersza systemowego ustawień.

#### Zakładka Harmonogram
- **CRUD punktów programu** w tabeli `timeline_events`: dodawanie, edycja (modal), usuwanie.
- Pola: godzina, tytuł, opis, kolejność (`order_index`).
- Sortowanie wg kolejności i godziny; zmiany widoczne od razu na stronie głównej po zapisie.

#### Bezpieczeństwo admina
- Dostęp do mutacji przez Supabase **Service Role** (tylko serwer).
- Panel oznaczony `noindex` — nie indeksowany przez wyszukiwarki.

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
│  │ (RSC)        │  │ rsvp, admin, │  │                   │  │
│  │              │  │ schedule     │  │                   │  │
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

### Tabela `gallery_images` *(schema ready, nieużywana)*

Przygotowana pod przyszłą integrację galerii w Supabase Storage. Obecnie sekcja galerii korzysta z zewnętrznego URL.

> **Uwaga:** Oczekiwana liczba zaproszeń RSVP (panel admina) zapisywana jest jako ukryty wiersz systemowy w tabeli `guests` (token `__expected_rsvp_setting__`) — nie pojawia się na liście gości ani w eksporcie CSV.

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
│   ├── page.tsx                    # Landing page (wszystkie sekcje publiczne)
│   ├── admin/page.tsx              # Panel admina (RSVP + Harmonogram)
│   ├── actions/
│   │   ├── rsvp.ts                 # Server Actions — formularz RSVP
│   │   ├── admin.ts                # Login, CRUD gości, oczekiwana liczba RSVP
│   │   └── schedule.ts             # CRUD harmonogramu (admin)
│   └── api/export-guests/          # Eksport CSV
├── components/
│   ├── hero.tsx                    # Hero + countdown
│   ├── interactive-story.tsx       # Scroll story
│   ├── schedule-section.tsx        # Harmonogram (publiczny)
│   ├── rsvp-form.tsx               # Formularz RSVP
│   ├── photo-gallery-section.tsx   # Galeria (link zewnętrzny)
│   ├── faq.tsx                     # FAQ
│   └── admin/
│       ├── admin-panel.tsx         # Zakładki RSVP / Harmonogram
│       ├── guest-dashboard.tsx     # Lista gości, statystyki, sortowanie
│       ├── admin-schedule-manager.tsx
│       ├── schedule-event-dialog.tsx
│       ├── schedule-delete-dialog.tsx
│       ├── expected-rsvp-setting.tsx
│       ├── guest-edit-dialog.tsx   # Dodawanie / edycja gościa
│       └── guest-delete-dialog.tsx
└── lib/
    ├── supabase/                   # Klienty Supabase (browser, server, admin)
    ├── validations/                # Schematy Zod (rsvp, admin-guest, schedule)
    ├── admin/                      # Auth, sort-guests, rsvp-progress, expected-rsvp-storage, export CSV
    └── wedding-config.ts           # Daty, kontakty, copy
```

---

## 🔮 Roadmap (kierunek rozwoju)

Zrealizowane w obecnej wersji:

**Strona publiczna**
- [x] Hero z odliczaniem + tryb „po weselu” (elapsed time, zmiana copy)
- [x] Interaktywna historia (5 kroków, Framer Motion)
- [x] Harmonogram z Supabase + fallback statyczny, filtry, Google Calendar / `.ics`
- [x] Formularz RSVP (diety, +1, nocleg, confetti, persystencja tokena)
- [x] Galeria (link zewnętrzny, stan przed/po weselu)
- [x] FAQ (9 pytań)

**Panel admina**
- [x] **Admin CRUD gości** — dodawanie, edycja, usuwanie, sortowanie listy
- [x] **Admin CRUD harmonogramu** — zarządzanie `timeline_events` z panelu
- [x] **Śledzenie postępu RSVP** — oczekiwana liczba zaproszeń vs. otrzymane odpowiedzi (live preview)
- [x] Eksport CSV gości (bez wiersza systemowego)

Planowane dalej:
- [ ] **Live Photo Wall** — galeria na żywo (Supabase Realtime / polling) pod projektor
- [ ] **Client-side compression** — optymalizacja zdjęć przed uploadem do Storage
- [ ] **Tokenized RSVP links** — `/rsvp/[token]` dla spersonalizowanych zaproszeń
- [ ] **Optymalizacja LCP** — kompresja hero do WebP (Lighthouse Performance 90+)
- [ ] **SEO package** — OG image, sitemap, JSON-LD Event + FAQ
- [ ] **Zaostrzenie RLS** — polityki `guests` zamiast `using (true)`

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
