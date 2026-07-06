"use server";

import { revalidatePath } from "next/cache";
import { cancelAppointment, getAppointmentByToken } from "@/lib/booking";
import { sendCancellationConfirmation, sendStudioNotification } from "@/lib/notifications";

export async function cancelAction(token: string): Promise<void> {
  const result = await cancelAppointment(token);
  if (result === "cancelled") {
    const fresh = await getAppointmentByToken(token);
    if (fresh) {
      const info = {
        treatmentName: fresh.treatment.name,
        startsAt: fresh.appointment.startsAt,
        cancelToken: token,
      };
      await Promise.allSettled([
        sendCancellationConfirmation(
          {
            firstName: fresh.customer.firstName,
            email: fresh.customer.email,
            phone: fresh.customer.phone,
          },
          info,
        ),
        sendStudioNotification("cancelled", fresh.customer, info),
      ]);
    }
  }
  revalidatePath(`/termin/${token}`);
}
