import { TZDate } from "@date-fns/tz";
import { and, asc, eq, gt, lt } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import {
  computeSlots,
  STUDIO_TZ,
  type BusyInterval,
  type OpeningWindow,
} from "@/lib/availability";

const MIN_MS = 60_000;

/** Frist in Stunden, bis zu der Kund:innen selbst stornieren können. */
export const CANCEL_DEADLINE_HOURS = Number(process.env.CANCEL_DEADLINE_HOURS ?? 24);

export const bookingInputSchema = z.object({
  treatmentId: z.uuid(),
  /** Slot-Start als ISO-String (UTC-Instant) */
  startsAt: z.iso.datetime({ offset: true }),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()/-]{7,20}$/, "Ungültige Telefonnummer"),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export type BookingResult =
  | { ok: true; appointmentId: string; cancelToken: string }
  | { ok: false; error: "slot_taken" | "treatment_not_found" | "invalid_slot" };

/** Studio-lokaler Tagesbeginn/-ende als UTC-Instants. */
function dayBounds(date: string): [Date, Date] {
  const [y, m, d] = date.split("-").map(Number);
  const start = new Date(new TZDate(y, m - 1, d, 0, 0, 0, STUDIO_TZ).getTime());
  const end = new Date(new TZDate(y, m - 1, d + 1, 0, 0, 0, STUDIO_TZ).getTime());
  return [start, end];
}

export async function listActiveTreatments() {
  return getDb()
    .select()
    .from(schema.treatments)
    .where(eq(schema.treatments.active, true))
    .orderBy(asc(schema.treatments.sortOrder));
}

/** Belegte Intervalle (bestätigte Termine inkl. Puffer + Blockzeiten) eines Tages. */
async function busyIntervals(dayStart: Date, dayEnd: Date): Promise<BusyInterval[]> {
  const db = getDb();
  const [appts, blocks] = await Promise.all([
    db
      .select({
        startsAt: schema.appointments.startsAt,
        endsAt: schema.appointments.blockedUntil,
      })
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.status, "confirmed"),
          gt(schema.appointments.blockedUntil, dayStart),
          lt(schema.appointments.startsAt, dayEnd),
        ),
      ),
    db
      .select({ startsAt: schema.timeBlocks.startsAt, endsAt: schema.timeBlocks.endsAt })
      .from(schema.timeBlocks)
      .where(and(gt(schema.timeBlocks.endsAt, dayStart), lt(schema.timeBlocks.startsAt, dayEnd))),
  ]);
  return [...appts, ...blocks];
}

/** Buchbare Slot-Startzeiten für Behandlung + Tag ("YYYY-MM-DD"). */
export async function availableSlots(treatmentId: string, date: string): Promise<Date[]> {
  const db = getDb();
  const [treatment] = await db
    .select()
    .from(schema.treatments)
    .where(and(eq(schema.treatments.id, treatmentId), eq(schema.treatments.active, true)));
  if (!treatment) return [];

  const [dayStart, dayEnd] = dayBounds(date);
  const [windows, busy] = await Promise.all([
    db.select().from(schema.openingHours) as Promise<
      Array<{ weekday: number; openFrom: string; openTo: string }>
    >,
    busyIntervals(dayStart, dayEnd),
  ]);

  const openingWindows: OpeningWindow[] = windows.map((w) => ({
    weekday: w.weekday,
    openFrom: w.openFrom.slice(0, 5),
    openTo: w.openTo.slice(0, 5),
  }));

  return computeSlots({
    date,
    durationMin: treatment.durationMin,
    bufferMin: treatment.bufferMin,
    openingWindows,
    busy,
  });
}

/**
 * Bucht einen Termin transaktional.
 * Doppelbuchungen werden zusätzlich vom Exclusion Constraint der DB verhindert –
 * bei Kollision (Fehlercode 23P01) wird `slot_taken` zurückgegeben.
 */
export async function bookAppointment(raw: unknown): Promise<BookingResult> {
  const input = bookingInputSchema.parse(raw);
  const db = getDb();

  const [treatment] = await db
    .select()
    .from(schema.treatments)
    .where(and(eq(schema.treatments.id, input.treatmentId), eq(schema.treatments.active, true)));
  if (!treatment) return { ok: false, error: "treatment_not_found" };

  const startsAt = new Date(input.startsAt);
  // Slot gegen die aktuelle Verfügbarkeit validieren (Raster, Öffnungszeiten, Vorlauf)
  const date = new TZDate(startsAt.getTime(), STUDIO_TZ);
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
  const slots = await availableSlots(treatment.id, dateStr);
  if (!slots.some((s) => s.getTime() === startsAt.getTime())) {
    return { ok: false, error: "invalid_slot" };
  }

  const endsAt = new Date(startsAt.getTime() + treatment.durationMin * MIN_MS);
  const blockedUntil = new Date(endsAt.getTime() + treatment.bufferMin * MIN_MS);

  try {
    return await db.transaction(async (tx) => {
      const [customer] = await tx
        .insert(schema.customers)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email.toLowerCase(),
          phone: input.phone,
        })
        .onConflictDoUpdate({
          target: schema.customers.email,
          set: { firstName: input.firstName, lastName: input.lastName, phone: input.phone },
        })
        .returning();

      const [appointment] = await tx
        .insert(schema.appointments)
        .values({
          treatmentId: treatment.id,
          customerId: customer.id,
          startsAt,
          endsAt,
          blockedUntil,
        })
        .returning();

      return { ok: true, appointmentId: appointment.id, cancelToken: appointment.cancelToken };
    });
  } catch (err) {
    if (isExclusionViolation(err)) return { ok: false, error: "slot_taken" };
    throw err;
  }
}

function isExclusionViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23P01"
  );
}

/** Kommende bestätigte Termine (für die Studio-Übersicht), aufsteigend sortiert. */
export async function listUpcomingAppointments(days = 30) {
  const db = getDb();
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 3600_000);
  return db
    .select({
      appointment: schema.appointments,
      treatment: schema.treatments,
      customer: schema.customers,
    })
    .from(schema.appointments)
    .innerJoin(schema.treatments, eq(schema.appointments.treatmentId, schema.treatments.id))
    .innerJoin(schema.customers, eq(schema.appointments.customerId, schema.customers.id))
    .where(
      and(
        eq(schema.appointments.status, "confirmed"),
        gt(schema.appointments.endsAt, now),
        lt(schema.appointments.startsAt, until),
      ),
    )
    .orderBy(asc(schema.appointments.startsAt));
}

export async function getAppointmentByToken(token: string) {
  const db = getDb();
  const [row] = await db
    .select({
      appointment: schema.appointments,
      treatment: schema.treatments,
      customer: schema.customers,
    })
    .from(schema.appointments)
    .innerJoin(schema.treatments, eq(schema.appointments.treatmentId, schema.treatments.id))
    .innerJoin(schema.customers, eq(schema.appointments.customerId, schema.customers.id))
    .where(eq(schema.appointments.cancelToken, token));
  return row ?? null;
}

/** Darf dieser Termin (noch) online storniert werden? */
export function isCancellable(appointment: { status: string; startsAt: Date }): boolean {
  return (
    appointment.status === "confirmed" &&
    Date.now() < appointment.startsAt.getTime() - CANCEL_DEADLINE_HOURS * 3600_000
  );
}

export type CancelResult = "cancelled" | "not_found" | "too_late" | "already_cancelled";

export async function cancelAppointment(token: string): Promise<CancelResult> {
  const row = await getAppointmentByToken(token);
  if (!row) return "not_found";
  if (row.appointment.status === "cancelled") return "already_cancelled";

  const deadline = row.appointment.startsAt.getTime() - CANCEL_DEADLINE_HOURS * 60 * MIN_MS;
  if (Date.now() > deadline) return "too_late";

  await getDb()
    .update(schema.appointments)
    .set({ status: "cancelled" })
    .where(eq(schema.appointments.id, row.appointment.id));
  return "cancelled";
}
