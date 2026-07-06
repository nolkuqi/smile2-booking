import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, isNull, lt } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { sendReminder } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Stündlich via Vercel Cron aufgerufen (siehe vercel.json).
 * Erinnert an bestätigte Termine, die in 23–25 h beginnen.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const from = new Date(Date.now() + 23 * 3600_000);
  const to = new Date(Date.now() + 25 * 3600_000);

  const due = await db
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
        isNull(schema.appointments.reminderSentAt),
        gte(schema.appointments.startsAt, from),
        lt(schema.appointments.startsAt, to),
      ),
    );

  let sent = 0;
  for (const row of due) {
    try {
      await sendReminder(
        {
          firstName: row.customer.firstName,
          email: row.customer.email,
          phone: row.customer.phone,
        },
        {
          treatmentName: row.treatment.name,
          startsAt: row.appointment.startsAt,
          cancelToken: row.appointment.cancelToken,
        },
      );
      await db
        .update(schema.appointments)
        .set({ reminderSentAt: new Date() })
        .where(eq(schema.appointments.id, row.appointment.id));
      sent++;
    } catch (err) {
      console.error(`[cron] Erinnerung für ${row.appointment.id} fehlgeschlagen:`, err);
    }
  }

  return NextResponse.json({ due: due.length, sent });
}
