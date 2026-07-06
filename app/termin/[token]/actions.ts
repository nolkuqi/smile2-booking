"use server";

import { revalidatePath } from "next/cache";
import { cancelAppointment, getAppointmentByToken } from "@/lib/booking";
import { sendCancellationConfirmation } from "@/lib/notifications";

export async function cancelAction(token: string): Promise<void> {
  const result = await cancelAppointment(token);
  if (result === "cancelled") {
    const fresh = await getAppointmentByToken(token);
    if (fresh) {
      await sendCancellationConfirmation(
        {
          firstName: fresh.customer.firstName,
          email: fresh.customer.email,
          phone: fresh.customer.phone,
        },
        {
          treatmentName: fresh.treatment.name,
          startsAt: fresh.appointment.startsAt,
          cancelToken: token,
        },
      ).catch(console.error);
    }
  }
  revalidatePath(`/termin/${token}`);
}
