import type { Metadata } from "next";
import Link from "next/link";
import { CANCEL_DEADLINE_HOURS, getAppointmentByToken, isCancellable } from "@/lib/booking";
import { formatDateTime, formatPrice } from "@/lib/format";
import { cancelAction } from "./actions";

export const metadata: Metadata = {
  title: "Termin verwalten",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function TerminPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const row = await getAppointmentByToken(token);

  if (!row) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold text-slate-900">Termin nicht gefunden</h1>
        <p className="mt-2 text-slate-600">
          Der Link ist ungültig. Bei Fragen erreichst du uns unter{" "}
          <a href="tel:+41765677693" className="text-teal-700">076 567 76 93</a>.
        </p>
      </Shell>
    );
  }

  const { appointment, treatment } = row;
  const cancellable = isCancellable(appointment);

  return (
    <Shell>
      <h1 className="text-2xl font-semibold text-slate-900">Dein Termin</h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-semibold text-slate-900">{treatment.name}</p>
        <p className="mt-1 text-slate-600">{formatDateTime(appointment.startsAt)}</p>
        <p className="mt-1 text-sm text-slate-500">
          {treatment.durationMin} Min. · {formatPrice(treatment.priceChf)} · Feldlistrasse 17, 9000 St. Gallen
        </p>
        <p className="mt-3">
          {appointment.status === "confirmed" && (
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800">
              Bestätigt
            </span>
          )}
          {appointment.status === "cancelled" && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
              Storniert
            </span>
          )}
          {appointment.status === "completed" && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Abgeschlossen
            </span>
          )}
        </p>
      </div>

      {appointment.status === "confirmed" && (
        <div className="mt-6 grid gap-3">
          <a
            href={`/api/ics/${token}`}
            className="rounded-full border border-teal-600 px-6 py-2 text-center text-sm font-medium text-teal-700 hover:bg-teal-50"
          >
            📅 Zum Kalender hinzufügen
          </a>
          {cancellable ? (
            <form action={cancelAction.bind(null, token)} className="grid gap-3">
              <button
                type="submit"
                className="rounded-full border border-red-300 px-6 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Termin stornieren
              </button>
              <p className="text-center text-xs text-slate-400">
                Zum Verschieben: stornieren und neu buchen. Kostenlos möglich bis{" "}
                {CANCEL_DEADLINE_HOURS} h vor dem Termin.
              </p>
            </form>
          ) : (
            <p className="text-center text-sm text-slate-500">
              Eine Online-Stornierung ist nur bis {CANCEL_DEADLINE_HOURS} h vor dem Termin möglich.
              Bitte melde dich telefonisch: <a href="tel:+41765677693" className="text-teal-700">076 567 76 93</a>
            </p>
          )}
        </div>
      )}

      {appointment.status === "cancelled" && (
        <div className="mt-6 text-center">
          <Link
            href="/buchen"
            className="rounded-full bg-teal-600 px-8 py-3 font-medium text-white transition hover:bg-teal-700"
          >
            Neuen Termin buchen
          </Link>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-xl px-4 py-12">{children}</div>;
}
