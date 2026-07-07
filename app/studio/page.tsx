import type { Metadata } from "next";
import { listUpcomingAppointments } from "@/lib/booking";
import { formatDate, formatTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Studio-Übersicht",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Interne Terminübersicht fürs Studio – geschützt über einen geheimen Link
 * (?key=STUDIO_ACCESS_KEY). Bewusst ohne Login-System gehalten (KISS);
 * bei Bedarf später durch echtes Auth ersetzbar.
 */
export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const accessKey = process.env.STUDIO_ACCESS_KEY;

  if (!accessKey) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-ink-soft">
        <h1 className="text-3xl font-semibold tracking-wide text-ink">Nicht konfiguriert</h1>
        <p className="mt-2">
          Die Umgebungsvariable <code>STUDIO_ACCESS_KEY</code> ist nicht gesetzt.
        </p>
      </div>
    );
  }

  if (key?.trim() !== accessKey.trim()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-ink-soft">
        <h1 className="text-3xl font-semibold tracking-wide text-ink">Kein Zugriff</h1>
        <p className="mt-2">Dieser Bereich ist dem Studio vorbehalten.</p>
      </div>
    );
  }

  const rows = await listUpcomingAppointments(30);

  // Nach Studio-lokalem Tag gruppieren
  const byDay = new Map<string, typeof rows>();
  for (const row of rows) {
    const day = formatDate(row.appointment.startsAt);
    byDay.set(day, [...(byDay.get(day) ?? []), row]);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-wide text-ink">Kommende Termine</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Nächste 30 Tage · {rows.length} {rows.length === 1 ? "Termin" : "Termine"}
      </p>

      {rows.length === 0 && (
        <p className="mt-8 rounded-lg bg-white border border-sand px-4 py-6 text-center text-ink-soft">
          Keine Termine in den nächsten 30 Tagen.
        </p>
      )}

      <div className="mt-8 space-y-8">
        {[...byDay.entries()].map(([day, appointments]) => (
          <section key={day}>
            <h2 className="border-b border-sand pb-2 font-semibold text-brand-dark">{day}</h2>
            <ul className="divide-y divide-sand">
              {appointments.map(({ appointment, treatment, customer }) => (
                <li key={appointment.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
                  <span className="w-24 font-mono text-sm font-semibold text-ink">
                    {formatTime(appointment.startsAt)}–{formatTime(appointment.endsAt)}
                  </span>
                  <span className="font-medium text-ink">{treatment.name}</span>
                  <span className="text-sm text-ink-soft">
                    {customer.firstName} {customer.lastName}
                  </span>
                  <a href={`tel:${customer.phone}`} className="text-sm text-brand-dark hover:underline">
                    {customer.phone}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
