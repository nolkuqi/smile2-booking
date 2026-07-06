import type { Metadata } from "next";
import BookingWizard from "@/components/booking-wizard";

export const metadata: Metadata = {
  title: "Termin buchen",
  description: "Buche deinen Zahnbleaching-Termin bei Smile² in St. Gallen – online in 2 Minuten.",
};

export default function BuchenPage() {
  return <BookingWizard />;
}
