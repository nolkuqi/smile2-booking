# Anforderungen – Buchungssystem Smile² (smilehochzwei.ch)

**Stand:** 2026-07-06 · **Status:** Abgestimmt (v1.0)

## 1. Kontext

Smile² ist ein Zahnbleaching-Studio in St. Gallen mit einer Behandlerin.
Das aktuelle Buchungssystem überzeugt weder funktional noch optisch und
verursacht laufende Kosten. Es wird ersetzt durch eine **komplett neue
Website inkl. integriertem Buchungssystem** (ein Projekt).

Öffnungszeiten (Basis für Verfügbarkeiten):

| Tag | Zeiten |
|---|---|
| Mo | 09:00–13:00 / 14:00–18:00 |
| Di, Mi | geschlossen |
| Do | 09:00–13:00 / 14:00–19:00 |
| Fr | 09:00–13:00 / 14:00–18:00 |
| Sa | 10:00–14:00 |
| So | geschlossen |

## 2. Ziele

- Buchung für Kundinnen so einfach wie möglich (mobil, ohne Konto)
- Weniger Verwaltungsaufwand und weniger No-Shows fürs Studio
- Keine/minimale laufende Kosten (Ausnahme: SMS-Versand)
- Öffentliches GitHub-Portfolio-Projekt mit professionellem Setup

## 3. Funktionale Anforderungen

### 3.1 Öffentliche Website
- **F1** Landing Page mit den bestehenden Inhalten (Über uns, Kooperation, Galerie, Kontakt) im Smile²-Branding
- **F2** Impressum & Datenschutz
- **F3** SEO-Grundlagen (Meta-Tags, sitemap, aktuell steht die Seite auf `noindex`!)

### 3.2 Buchung (Kundenseite)
- **F4** Behandlung wählen (Name, Beschreibung, Dauer, Preis)
- **F5** Freie Slots im Kalender sehen (Öffnungszeiten, Pausen, Ferien, bestehende Termine berücksichtigt)
- **F6** Buchen ohne Kundenkonto: Name, E-Mail, Telefon
- **F7** Bestätigung per E-Mail + SMS, inkl. Kalendereintrag (.ics)
- **F8** Stornieren/Verschieben über persönlichen Link (Frist konfigurierbar, Default 24 h)
- **F9** Erinnerung 24 h vor dem Termin per E-Mail + SMS

### 3.3 Admin-Bereich (Studio)
- **F10** Login (eine Admin-Rolle reicht)
- **F11** Kalenderansicht Tag/Woche mit allen Terminen
- **F12** Termine manuell anlegen, ändern, stornieren (z. B. telefonische Buchung)
- **F13** Öffnungszeiten, Pausen, Ferien und Blockzeiten pflegen
- **F14** Behandlungen verwalten (Name, Dauer, Preis, Pufferzeit, aktiv/inaktiv)
- **F15** Kundenliste mit Buchungshistorie und Notizen

### 3.4 Bewusst NICHT im Scope (v1)
- Online-Zahlung (Zahlung erfolgt vor Ort; Architektur soll spätere Stripe/Twint-Integration nicht verbauen)
- Mehrere Mitarbeiter:innen/Ressourcen (Datenmodell aber darauf vorbereiten)
- Kundenkonten mit Login

## 4. Nicht-funktionale Anforderungen

- **NF1** Mobile-first, schnelle Ladezeiten
- **NF2** Datenschutz: CH-DSG/DSGVO-konform, Datensparsamkeit, Löschkonzept
- **NF3** Sprache: Deutsch; i18n-fähig aufgebaut
- **NF4** Keine Doppelbuchungen auch bei gleichzeitigen Zugriffen (Transaktionen/Locking)
- **NF5** Betriebskosten nahe null (Free-Tier-Hosting); SMS als einziger variabler Kostenpunkt
- **NF6** Portfolio-Qualität: Tests, Linting, CI/CD, aussagekräftige Doku
- **NF7** Barrierearm (Kontraste, Tastaturbedienung, semantisches HTML)

## 5. Offene Punkte

- Konkrete Behandlungsliste mit Dauer/Preisen vom Studio einholen
- Branding-Assets (Logo, Farben, Fotos) beschaffen
- SMS-Provider wählen (Kostenvergleich, z. B. Twilio vs. CH-Anbieter)
- Domain-/Hosting-Umzug klären (aktuell WordPress/Elementor)
