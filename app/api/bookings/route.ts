import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { bookAppointment, getAppointmentByToken } from "@/lib/booking";
import { sendBookingConfirmation, sendStudioNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  slot_taken: "Dieser Termin wurde soeben vergeben. Bitte wähle einen anderen Slot.",
  invalid_slot: "Dieser Termin ist nicht (mehr) verfügbar.",
  treatment_not_found: "Die gewählte Behandlung existiert nicht.",
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  try {
    const result = await bookAppointment(body);
    if (!result.ok) {
      return NextResponse.json(
        { error: ERROR_MESSAGES[result.error] ?? "Buchung fehlgeschlagen" },
        { status: 409 },
      );
    }

    // Bestätigungen senden (Fehler beim Versand dürfen die Buchung nicht kippen)
    const row = await getAppointmentByToken(result.cancelToken);
    if (row) {
      const info = {
        treatmentName: row.treatment.name,
        startsAt: row.appointment.startsAt,
        cancelToken: row.appointment.cancelToken,
      };
      await Promise.allSettled([
        sendBookingConfirmation(
          {
            firstName: row.customer.firstName,
            email: row.customer.email,
            phone: row.customer.phone,
          },
          info,
        ),
        sendStudioNotification("booked", row.customer, info),
      ]);
    }

    return NextResponse.json({ cancelToken: result.cancelToken }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Bitte überprüfe deine Angaben." }, { status: 400 });
    }
    console.error("[bookings] Unerwarteter Fehler:", err);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
