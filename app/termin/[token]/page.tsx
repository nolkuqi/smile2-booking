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
        <h1 className="text-3xl font-semibold tracking-wide text-ink">Termin nicht gefunden</h1>
        <p className="mt-2 text-ink-soft">
          Der Link ist ungültig. Bei Fragen erreichst du uns unter{" "}
          <a href="tel:+41765677693" className="text-brand-dark">076 567 76 93</a>.
        </p>
      </Shell>
    );
  }

  const { appointment, treatment } = row;
  const cancellable = isCancellable(appointment);

  return (
    <Shell>
      <h1 className="text-3xl font-semibold tracking-wide text-ink">Dein Termin</h1>

      <div className="mt-6 border border-sand bg-white p-6">
        <p className="font-semibold text-ink">{treatment.name}</p>
        <p className="mt-1 text-ink-soft">{formatDateTime(appointment.startsAt)}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {treatment.durationMin} Min. · {formatPrice(treatment.priceChf)} · Feldlistrasse 17, 9000 St. Gallen
        </p>
        <p className="mt-3">
          {appointment.status === "confirmed" && (
            <span className="bg-sand px-3 py-1 text-xs font-medium tracking-wide text-ink">
              Bestätigt
            </span>
          )}
          {appointment.status === "cancelled" && (
            <span className="bg-red-100 px-3 py-1 text-xs font-medium tracking-wide text-red-800">
              Storniert
            </span>
          )}
          {appointment.status === "completed" && (
            <span className="bg-sand px-3 py-1 text-xs font-medium tracking-wide text-ink-soft">
              Abgeschlossen
            </span>
          )}
        </p>
      </div>

      {appointment.status === "confirmed" && (
        <div className="mt-6 grid gap-3">
          <a
            href={`/api/ics/${token}`}
            className="rounded-[3px] border border-brand px-6 py-3 text-center text-sm font-medium tracking-wide text-brand-dark transition hover:bg-brand hover:text-white"
          >
            📅 Zum Kalender hinzufügen
          </a>
          {cancellable ? (
            <form action={cancelAction.bind(null, token)} className="grid gap-3">
              <button
                type="submit"
                className="rounded-[3px] border border-red-300 px-6 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Termin stornieren
              </button>
              <p className="text-center text-xs text-ink-soft/70">
                Zum Verschieben: stornieren und neu buchen. Kostenlos möglich bis{" "}
                {CANCEL_DEADLINE_HOURS} h vor dem Termin.
              </p>
            </form>
          ) : (
            <p className="text-center text-sm text-ink-soft">
              Eine Online-Stornierung ist nur bis {CANCEL_DEADLINE_HOURS} h vor dem Termin möglich.
              Bitte melde dich telefonisch: <a href="tel:+41765677693" className="text-brand-dark">076 567 76 93</a>
            </p>
          )}
        </div>
      )}

      {appointment.status === "cancelled" && (
        <div className="mt-6 text-center">
          <Link
            href="/buchen"
            className="rounded-[3px] bg-brand px-10 py-4 font-medium tracking-wide text-white transition hover:bg-brand-dark"
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
