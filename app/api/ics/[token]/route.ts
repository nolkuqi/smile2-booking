import { NextResponse } from "next/server";
import { getAppointmentByToken } from "@/lib/booking";
import { buildIcs } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const row = await getAppointmentByToken(token);
  if (!row || row.appointment.status === "cancelled") {
    return NextResponse.json({ error: "Termin nicht gefunden" }, { status: 404 });
  }

  const ics = buildIcs({
    uid: row.appointment.id,
    title: `Smile² – ${row.treatment.name}`,
    description: "Dein Termin bei Smile², Zahnbleaching-Studio St. Gallen.",
    location: "Feldlistrasse 17, 9000 St. Gallen",
    start: row.appointment.startsAt,
    end: row.appointment.endsAt,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="smile2-termin.ics"',
    },
  });
}
