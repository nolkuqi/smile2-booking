import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { availableSlots } from "@/lib/booking";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  treatmentId: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    treatmentId: req.nextUrl.searchParams.get("treatmentId"),
    date: req.nextUrl.searchParams.get("date"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Parameter" }, { status: 400 });
  }
  const slots = await availableSlots(parsed.data.treatmentId, parsed.data.date);
  return NextResponse.json({ slots: slots.map((s) => s.toISOString()) });
}
