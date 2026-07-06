import { NextResponse } from "next/server";
import { listActiveTreatments } from "@/lib/booking";

export const dynamic = "force-dynamic";

export async function GET() {
  const treatments = await listActiveTreatments();
  return NextResponse.json(
    treatments.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      durationMin: t.durationMin,
      priceChf: t.priceChf,
    })),
  );
}
