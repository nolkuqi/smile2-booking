import { NextRequest, NextResponse } from "next/server";
import { TZDate } from "@date-fns/tz";
import { and, eq, gte, isNull, lt } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { STUDIO_TZ } from "@/lib/availability";
import { sendReminder } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Täglich um 17:00 UTC via Vercel Cron aufgerufen (siehe vercel.json;
 * Hobby-Plan erlaubt nur tägliche Crons). Erinnert an alle bestätigten
 * Termine des morgigen Tages (Studio-Zeitzone).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const today = new TZDate(Date.now(), STUDIO_TZ);
  const from = new Date(
    new TZDate(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, STUDIO_TZ).getTime(),
  );
  const to = new Date(
    new TZDate(today.getFullYear(), today.getMonth(), today.getDate() + 2, 0, 0, 0, STUDIO_TZ).getTime(),
  );

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
