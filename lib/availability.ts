import { TZDate } from "@date-fns/tz";

export const STUDIO_TZ = "Europe/Zurich";

/** Öffnungsfenster eines Wochentags, Zeiten als "HH:MM" (Studio-Lokalzeit). */
export interface OpeningWindow {
  /** 0 = Sonntag … 6 = Samstag (wie JS Date.getDay()) */
  weekday: number;
  openFrom: string;
  openTo: string;
}

/** Belegtes Intervall (Termin inkl. Puffer oder Blockzeit), UTC-Instants. */
export interface BusyInterval {
  startsAt: Date;
  endsAt: Date;
}

export interface ComputeSlotsOptions {
  /** Studio-lokaler Tag im Format "YYYY-MM-DD" */
  date: string;
  /** Behandlungsdauer in Minuten */
  durationMin: number;
  /** Pufferzeit nach der Behandlung in Minuten (blockiert Folgeslots) */
  bufferMin?: number;
  /** Alle Öffnungsfenster; es werden nur die des passenden Wochentags verwendet */
  openingWindows: OpeningWindow[];
  /** Termine (inkl. deren Puffer) und Blockzeiten */
  busy: BusyInterval[];
  /** Slot-Raster in Minuten (Default 15) */
  gridMin?: number;
  /** Mindestvorlauf in Minuten (Default 120) */
  minLeadMin?: number;
  /** "Jetzt" – injizierbar für Tests (Default: new Date()) */
  now?: Date;
  /** IANA-Zeitzone des Studios (Default Europe/Zurich) */
  timeZone?: string;
}

const MIN_MS = 60_000;

function parseHM(hm: string): [number, number] {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm);
  if (!m) throw new Error(`Ungültige Uhrzeit: ${hm}`);
  return [Number(m[1]), Number(m[2])];
}

function parseDateParts(date: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`Ungültiges Datum: ${date}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Instant, der der Wall-Clock-Zeit `date hh:mm` in `tz` entspricht. */
function zoned(date: string, hm: string, tz: string): Date {
  const [y, mo, d] = parseDateParts(date);
  const [h, mi] = parseHM(hm);
  return new Date(new TZDate(y, mo - 1, d, h, mi, 0, tz).getTime());
}

/** Wochentag (0–6) des Studio-lokalen Tages. */
export function weekdayOf(date: string, tz: string = STUDIO_TZ): number {
  return new TZDate(zoned(date, "12:00", tz).getTime(), tz).getDay();
}

/**
 * Berechnet buchbare Slot-Startzeiten für einen Tag.
 *
 * Regeln:
 * - Die Behandlung (durationMin) muss vollständig im Öffnungsfenster liegen;
 *   der Puffer darf über das Fenster hinausragen (Aufräumen nach Ladenschluss).
 * - Gegen belegte Intervalle wird inkl. Puffer geprüft.
 * - Slots vor `now + minLeadMin` werden entfernt.
 *
 * Pure Function – deterministisch bei gegebenem `now`, daher gut testbar.
 */
export function computeSlots(opts: ComputeSlotsOptions): Date[] {
  const tz = opts.timeZone ?? STUDIO_TZ;
  const grid = opts.gridMin ?? 15;
  const buffer = opts.bufferMin ?? 0;
  const lead = opts.minLeadMin ?? 120;
  const now = opts.now ?? new Date();

  if (opts.durationMin <= 0 || grid <= 0) return [];

  const weekday = weekdayOf(opts.date, tz);
  const windows = opts.openingWindows
    .filter((w) => w.weekday === weekday)
    .map((w) => ({
      start: zoned(opts.date, w.openFrom, tz).getTime(),
      end: zoned(opts.date, w.openTo, tz).getTime(),
    }))
    .filter((w) => w.end > w.start)
    .sort((a, b) => a.start - b.start);

  const busy = opts.busy
    .map((b) => ({ start: b.startsAt.getTime(), end: b.endsAt.getTime() }))
    .filter((b) => b.end > b.start);

  const durMs = opts.durationMin * MIN_MS;
  const blockMs = (opts.durationMin + buffer) * MIN_MS;
  const earliest = now.getTime() + lead * MIN_MS;

  const slots: Date[] = [];
  for (const win of windows) {
    for (let start = win.start; start + durMs <= win.end; start += grid * MIN_MS) {
      if (start < earliest) continue;
      const blockedUntil = start + blockMs;
      const collides = busy.some((b) => start < b.end && blockedUntil > b.start);
      if (!collides) slots.push(new Date(start));
    }
  }
  return slots;
}
