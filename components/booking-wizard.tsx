"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface Treatment {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  priceChf: number;
}

type Step = "treatment" | "slot" | "details" | "done";

const TZ = "Europe/Zurich";
const STEP_LABELS: Record<Step, string> = {
  treatment: "Behandlung wählen",
  slot: "Termin wählen",
  details: "Deine Angaben",
  done: "Bestätigt",
};

function fmtWeekday(d: Date): string {
  return d.toLocaleDateString("de-CH", { weekday: "short", timeZone: TZ });
}

function fmtDayNum(d: Date): string {
  return d.toLocaleDateString("de-CH", { day: "numeric", month: "short", timeZone: TZ });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

function fmtLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  });
}

function toDateStr(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: TZ }); // YYYY-MM-DD
}

function weekdayInZurich(d: Date): number {
  return "So Mo Di Mi Do Fr Sa"
    .split(" ")
    .indexOf(d.toLocaleDateString("de-CH", { weekday: "short", timeZone: TZ }).replace(".", ""));
}

/** Die nächsten n Tage ab morgen. */
function nextDays(n: number): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    return d;
  });
}

export default function BookingWizard() {
  const [step, setStep] = useState<Step>("treatment");
  const [treatments, setTreatments] = useState<Treatment[] | null>(null);
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [openDays, setOpenDays] = useState<number[] | null>(null);
  const days = useMemo(() => nextDays(28), []);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelToken, setCancelToken] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/treatments")
      .then((r) => r.json())
      .then(setTreatments)
      .catch(() => setError("Behandlungen konnten nicht geladen werden."));
    fetch("/api/opening-days")
      .then((r) => r.json())
      .then((d) => setOpenDays(d.weekdays ?? null))
      .catch(() => setOpenDays(null));
  }, []);

  const firstOpenDay = useMemo(() => {
    if (!openDays) return null;
    return days.find((d) => openDays.includes(weekdayInZurich(d))) ?? null;
  }, [days, openDays]);

  const loadSlots = useCallback((treatmentId: string, dateStr: string) => {
    setSlots(null);
    setSlot(null);
    setError(null);
    fetch(`/api/availability?treatmentId=${treatmentId}&date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setError("Verfügbarkeiten konnten nicht geladen werden."));
  }, []);

  function chooseTreatment(t: Treatment) {
    setTreatment(t);
    setStep("slot");
    const initial = date ?? (firstOpenDay ? toDateStr(firstOpenDay) : toDateStr(days[0]));
    setDate(initial);
    loadSlots(t.id, initial);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!treatment || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ treatmentId: treatment.id, startsAt: slot, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Buchung fehlgeschlagen.");
        if (res.status === 409 && date) {
          setStep("slot");
          loadSlots(treatment.id, date);
        }
        return;
      }
      setCancelToken(data.cancelToken);
      setStep("done");
    } catch {
      setError("Netzwerkfehler – bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = { treatment: 1, slot: 2, details: 3, done: 3 }[step];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Fortschritt */}
      {step !== "done" && (
        <p className="text-xs uppercase tracking-[0.25em] text-ink-soft">
          Schritt {stepIndex} von 3 · {STEP_LABELS[step]}
        </p>
      )}

      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {/* Schritt 1: Behandlung */}
      {step === "treatment" && (
        <div className="mt-6 grid gap-4">
          <h1 className="text-3xl font-semibold tracking-wide text-ink">Wähle deine Behandlung</h1>
          {treatments === null && !error && (
            <p className="font-light text-ink-soft">Behandlungen werden geladen…</p>
          )}
          {treatments?.map((t) => (
            <button
              key={t.id}
              onClick={() => chooseTreatment(t)}
              className="border border-sand bg-white p-6 text-left transition hover:border-brand"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold tracking-wide text-ink">{t.name}</span>
                <span className="whitespace-nowrap font-medium text-brand-dark">
                  {t.priceChf === 0 ? "kostenlos" : `CHF ${t.priceChf}.–`}
                </span>
              </div>
              <p className="mt-2 text-sm font-light leading-relaxed text-ink-soft">{t.description}</p>
              <p className="mt-3 text-xs uppercase tracking-widest text-ink-soft/70">
                {t.durationMin} Minuten
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Schritt 2: Slot */}
      {step === "slot" && treatment && date && (
        <div className="mt-6">
          <h1 className="text-3xl font-semibold tracking-wide text-ink">Wähle deinen Termin</h1>
          <p className="mt-2 font-light text-ink-soft">
            {treatment.name} · {treatment.durationMin} Minuten
          </p>

          <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2">
            {days.map((d) => {
              const ds = toDateStr(d);
              const closed = openDays ? !openDays.includes(weekdayInZurich(d)) : false;
              const active = ds === date;
              return (
                <button
                  key={ds}
                  disabled={closed}
                  onClick={() => {
                    setDate(ds);
                    loadSlots(treatment.id, ds);
                  }}
                  className={`flex w-16 shrink-0 flex-col items-center gap-0.5 border py-2.5 text-sm transition ${
                    active
                      ? "border-brand bg-brand text-white"
                      : closed
                        ? "cursor-not-allowed border-sand bg-cream text-ink-soft/40"
                        : "border-sand bg-white text-ink hover:border-brand"
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider">{fmtWeekday(d)}</span>
                  <span className="font-medium">{fmtDayNum(d)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            {slots === null && !error && (
              <p className="font-light text-ink-soft">Freie Termine werden geladen…</p>
            )}
            {slots?.length === 0 && (
              <p className="border border-sand bg-white px-4 py-4 text-sm font-light text-ink-soft">
                An diesem Tag sind keine Termine mehr frei – bitte wähle einen anderen Tag.
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots?.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSlot(s);
                    setStep("details");
                  }}
                  className="border border-sand bg-white py-3 text-sm font-medium text-ink transition hover:border-brand hover:bg-brand hover:text-white"
                >
                  {fmtTime(s)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("treatment")}
            className="mt-10 text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
          >
            ← Andere Behandlung wählen
          </button>
        </div>
      )}

      {/* Schritt 3: Daten */}
      {step === "details" && treatment && slot && (
        <form onSubmit={submit} className="mt-6 grid gap-5">
          <h1 className="text-3xl font-semibold tracking-wide text-ink">Deine Angaben</h1>
          <p className="border border-sand bg-white px-4 py-3.5 text-sm text-ink">
            <span className="font-semibold">{treatment.name}</span>
            <br />
            <span className="font-light text-ink-soft">
              {fmtLongDate(slot)}, {fmtTime(slot)} Uhr
            </span>
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium tracking-wide text-ink">Vorname</span>
              <input
                required
                maxLength={100}
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="border border-sand bg-white px-3.5 py-3 outline-none transition focus:border-brand"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium tracking-wide text-ink">Nachname</span>
              <input
                required
                maxLength={100}
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="border border-sand bg-white px-3.5 py-3 outline-none transition focus:border-brand"
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium tracking-wide text-ink">E-Mail</span>
            <input
              required
              type="email"
              maxLength={200}
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-sand bg-white px-3.5 py-3 outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium tracking-wide text-ink">Telefon</span>
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              pattern="^\+?[0-9 ()/-]{7,20}$"
              placeholder="+41 76 123 45 67"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border border-sand bg-white px-3.5 py-3 outline-none transition focus:border-brand"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-[3px] bg-brand px-10 py-4 text-lg font-medium tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {submitting ? "Wird gebucht…" : "Verbindlich buchen"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("slot");
              if (date) loadSlots(treatment.id, date);
            }}
            className="justify-self-start text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
          >
            ← Anderen Termin wählen
          </button>
        </form>
      )}

      {/* Bestätigung */}
      {step === "done" && treatment && slot && cancelToken && (
        <div className="mt-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl text-white">
            ✓
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-wide text-ink">Termin bestätigt</h1>
          <p className="mt-4 font-light text-ink-soft">
            {treatment.name}
            <br />
            <span className="font-normal text-ink">
              {fmtLongDate(slot)}, {fmtTime(slot)} Uhr
            </span>
            <br />
            Feldlistrasse 17, 9000 St. Gallen
          </p>
          <p className="mt-4 text-sm font-light text-ink-soft">
            Du erhältst eine Bestätigung per E-Mail und SMS.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <a
              href={`/api/ics/${cancelToken}`}
              className="rounded-[3px] border border-brand px-8 py-3 text-sm font-medium tracking-wide text-brand-dark transition hover:bg-brand hover:text-white"
            >
              Zum Kalender hinzufügen
            </a>
            <a
              href={`/termin/${cancelToken}`}
              className="text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
            >
              Termin verwalten
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
