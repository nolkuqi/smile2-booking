# Smile² – Website & Buchungssystem

Neue Website mit integriertem Terminbuchungssystem für [Smile²](https://smilehochzwei.ch/),
ein Zahnbleaching-Studio in St. Gallen. Ersetzt das bisherige Buchungswidget durch eine
massgeschneiderte, kostenlose Lösung: Online-Buchung ohne Kundenkonto, automatische
E-Mail-/SMS-Erinnerungen und ein Admin-Bereich für das Studio.

## Features (geplant)

- 📅 Terminbuchung mit Live-Verfügbarkeiten (Öffnungszeiten, Pausen, Ferien)
- 📱 Mobile-first Buchungs-Wizard ohne Registrierung
- ✉️ Bestätigung & Erinnerung per E-Mail und SMS, inkl. .ics-Kalendereintrag
- 🔁 Selbstständiges Stornieren/Verschieben per persönlichem Link
- 🛠️ Admin-Bereich: Kalender, Behandlungen, Zeiten, Kundenhistorie
- 🚫 Doppelbuchungen auf Datenbank-Ebene ausgeschlossen (Postgres Exclusion Constraint)

## Tech-Stack

Next.js (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Neon) · Drizzle ORM ·
Auth.js · Resend · Twilio · Vitest · Playwright · Vercel

Details: [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md) · Anforderungen: [docs/ANFORDERUNGEN.md](docs/ANFORDERUNGEN.md)

## Entwicklung

```bash
npm install
cp .env.example .env.local   # Secrets eintragen
npm run dev                  # http://localhost:3000
```

```bash
npm run lint    # ESLint
npm run build   # Produktions-Build
```

## Branching-Strategie

Trunk-based Development:

- `main` ist immer deploybar; jeder Push auf `main` deployt nach Production (Vercel)
- Features auf kurzlebigen Branches: `feat/...`, `fix/...`, `chore/...`
- Merge nur via Pull Request; CI (Lint, Tests, Build) muss grün sein
- Commits nach [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:` …)

## Lizenz

MIT
