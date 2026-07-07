import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

/** Wochentage (0 = So … 6 = Sa), an denen das Studio geöffnet ist. */
export async function GET() {
  const rows = await getDb()
    .selectDistinct({ weekday: schema.openingHours.weekday })
    .from(schema.openingHours);
  return NextResponse.json({ weekdays: rows.map((r) => r.weekday) });
}
