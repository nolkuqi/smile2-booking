# Architektur – Buchungssystem Smile²

**Stand:** 2026-07-06 · **Stack:** Next.js Full-Stack (Option A, abgestimmt)

## 1. Tech-Stack

| Bereich | Technologie | Begründung |
|---|---|---|
| Framework | Next.js 15 (App Router), TypeScript | Eine Codebase für Website, Buchung, Admin; SSR für SEO |
| Styling | Tailwind CSS + shadcn/ui | Schnell, konsistent, mobile-first |
| Datenbank | PostgreSQL (Neon, Free Tier) | Relational, Transaktionen gegen Doppelbuchungen |
| ORM | Drizzle | Typsicher, leichtgewichtig, SQL-nah |
| Auth (Admin) | Auth.js (Credentials) | Eine Admin-Rolle, kein Kunden-Login nötig |
| E-Mail | Resend + React Email | Free Tier, schöne Templates |
| SMS | Twilio | Bestätigung + Erinnerung |
| Cron | Vercel Cron | Tägliche/stündliche Erinnerungs-Jobs |
| Validierung | Zod | Geteilte Schemas Client/Server |
| Tests | Vitest (Unit), Playwright (E2E) | Portfolio-Qualität |
| Hosting | Vercel (Free Tier) | 0 CHF, Preview-Deployments pro PR |

## 2. Systemübersicht

```
Kundin (Mobile/Desktop)          Studio (Admin)
        │                              │
        ▼                              ▼
┌─────────────────────────────────────────────┐
│                Next.js App (Vercel)         │
│                                             │
│  / (Landing)   /buchen (Wizard)   /admin    │
│  ────────────────────────────────────────   │
│  Server Actions & Route Handlers            │
│  ├─ Availability-Service (Slot-Berechnung)  │
│  ├─ Booking-Service (transaktional)         │
│  └─ Notification-Service (E-Mail/SMS)       │
└──────┬──────────────┬──────────────┬────────┘
       │              │              │
       ▼              ▼              ▼
   Neon Postgres   Resend        Twilio
                  (E-Mail)        (SMS)
       ▲
       │  Vercel Cron (Erinnerungen, stündlich)
```

## 3. Datenmodell

```
treatments                appointments               customers
─────────────             ─────────────              ─────────────
id (pk)                   id (pk)                    id (pk)
name                      treatment_id (fk)          first_name
description               customer_id (fk)           last_name
duration_min              starts_at (timestamptz)    email
buffer_min                ends_at (timestamptz)      phone
price_chf                 status: confirmed |        notes
active                      cancelled | completed    created_at
sort_order                cancel_token (uuid)
                          reminder_sent_at
                          created_at

opening_hours             time_blocks                users (admin)
─────────────             ─────────────              ─────────────
id (pk)                   id (pk)                    id (pk)
weekday (0–6)             starts_at                  email
open_from  (time)         ends_at                    password_hash
open_to    (time)         reason (Ferien, Pause…)    created_at
```

Hinweise:
- `appointments` bekommt einen **Exclusion-Constraint** (Postgres `tstzrange` + GiST) → Doppelbuchungen sind auf DB-Ebene unmöglich (NF4)
- Buchung läuft in einer Transaktion: Slot prüfen → Kunde upserten → Termin einfügen
- `customers` wird per E-Mail/Telefon dedupliziert (upsert) → Historie ohne Kundenkonto
- Vorbereitet auf mehrere Behandler:innen: später `resource_id` an `appointments`/`opening_hours` ergänzen

## 4. Routen & API

| Route | Zweck |
|---|---|
| `/` | Landing Page (Über uns, Kooperation, Galerie, Kontakt) |
| `/buchen` | Buchungs-Wizard: Behandlung → Slot → Daten → Bestätigung |
| `/termin/[token]` | Termin ansehen, stornieren, verschieben (Cancel-Token) |
| `/admin` | Kalender (Tag/Woche), geschützt |
| `/admin/behandlungen` | Behandlungen verwalten |
| `/admin/zeiten` | Öffnungszeiten, Ferien, Blockzeiten |
| `/admin/kunden` | Kundenliste + Historie |
| `GET /api/availability?treatment=&date=` | Freie Slots (öffentlich, read-only) |
| `POST` Server Action `bookAppointment` | Transaktionale Buchung |
| `GET /api/cron/reminders` | Vercel Cron: Erinnerungen T-24h (secret-geschützt) |
| `GET /api/ics/[token]` | Kalendereintrag (.ics) |

## 5. Slot-Berechnung (Kernlogik)

1. Öffnungszeiten des Tages laden, `time_blocks` abziehen
2. Bestehende Termine (inkl. `buffer_min`) abziehen
3. Restfenster in Slots à `duration_min` rastern (15-Min-Raster)
4. Slots in der Vergangenheit + innerhalb Vorlaufzeit (z. B. 2 h) filtern

Diese Logik lebt in `lib/availability.ts` als pure Function → gut unit-testbar.

## 6. Projektstruktur

```
smile2-booking/
├── app/                  # Routen (App Router)
│   ├── (marketing)/      # Landing, Impressum, Datenschutz
│   ├── buchen/
│   ├── termin/[token]/
│   ├── admin/
│   └── api/
├── components/           # UI-Komponenten
├── lib/                  # Domänenlogik (availability, booking, notifications)
├── db/                   # Drizzle-Schema, Migrationen, Seed
├── emails/               # React-Email-Templates
├── tests/                # Vitest + Playwright
├── docs/                 # Diese Doku
└── .github/workflows/    # CI/CD
```

## 7. Sicherheit & Datenschutz

- Admin-Routen via Middleware geschützt; Rate-Limiting auf Buchungs-Action
- Cancel-Token = UUID v4, kein Enumerationsrisiko
- Datensparsamkeit: nur Name, E-Mail, Telefon; Löschkonzept (Anonymisierung alter Termine nach X Monaten)
- Secrets ausschliesslich via Env-Vars (Vercel), nie im Repo
