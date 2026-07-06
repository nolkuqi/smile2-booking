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

function fmtDay(d: Date): string {
  return d.toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

function toDateStr(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: TZ }); // YYYY-MM-DD
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
  const days = useMemo(() => nextDays(21), []);
  const [date, setDate] = useState<string>(() => toDateStr(nextDays(1)[0]));
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
  }, []);

  const loadSlots = useCallback((treatmentId: string, dateStr: string) => {
    setSlots(null);
    setSlot(null);
    fetch(`/api/availability?treatmentId=${treatmentId}&date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setError("Verfügbarkeiten konnten nicht geladen werden."));
  }, []);

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
        if (res.status === 409) {
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

  const stepIndex = { treatment: 0, slot: 1, details: 2, done: 3 }[step];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Fortschritt */}
      <ol className="mb-8 flex items-center gap-2 text-xs text-slate-500">
        {["Behandlung", "Termin", "Deine Daten", "Bestätigung"].map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                i <= stepIndex ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </span>
            <span className={i === stepIndex ? "font-medium text-slate-800" : "hidden sm:inline"}>
              {label}
            </span>
            {i < 3 && <span className="h-px w-4 bg-slate-200 sm:w-8" />}
          </li>
        ))}
      </ol>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* Schritt 1: Behandlung */}
      {step === "treatment" && (
        <div className="grid gap-4">
          <h1 className="text-2xl font-semibold text-slate-900">Wähle deine Behandlung</h1>
          {treatments === null && <p className="text-slate-500">Lade Behandlungen…</p>}
          {treatments?.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTreatment(t);
                setStep("slot");
                loadSlots(t.id, date);
              }}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-500 hover:shadow"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold text-slate-900">{t.name}</span>
                <span className="whitespace-nowrap text-teal-700">
                  {t.priceChf === 0 ? "kostenlos" : `CHF ${t.priceChf}.–`}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{t.description}</p>
              <p className="mt-2 text-xs text-slate-400">{t.durationMin} Minuten</p>
            </button>
          ))}
        </div>
      )}

      {/* Schritt 2: Slot */}
      {step === "slot" && treatment && (
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Wähle deinen Termin</h1>
          <p className="mt-1 text-sm text-slate-500">
            {treatment.name} · {treatment.durationMin} Min.
          </p>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => {
              const ds = toDateStr(d);
              return (
                <button
                  key={ds}
                  onClick={() => {
                    setDate(ds);
                    loadSlots(treatment.id, ds);
                  }}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-sm transition ${
                    ds === date
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-400"
                  }`}
                >
                  {fmtDay(d)}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            {slots === null && <p className="text-slate-500">Lade freie Termine…</p>}
            {slots?.length === 0 && (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                An diesem Tag sind keine Termine frei – wähle bitte einen anderen Tag.
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots?.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSlot(s);
                    setStep("details");
                  }}
                  className="rounded-lg border border-slate-200 bg-white py-2 text-sm text-slate-800 transition hover:border-teal-500 hover:bg-teal-50"
                >
                  {fmtTime(s)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("treatment")}
            className="mt-8 text-sm text-slate-500 hover:text-teal-700"
          >
            ← Andere Behandlung wählen
          </button>
        </div>
      )}

      {/* Schritt 3: Daten */}
      {step === "details" && treatment && slot && (
        <form onSubmit={submit} className="grid gap-4">
          <h1 className="text-2xl font-semibold text-slate-900">Deine Daten</h1>
          <p className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-900">
            {treatment.name} ·{" "}
            {new Date(slot).toLocaleDateString("de-CH", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: TZ,
            })}
            , {fmtTime(slot)} Uhr
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Vorname</span>
              <input
                required
                maxLength={100}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-500"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nachname</span>
              <input
                required
                maxLength={100}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-500"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">E-Mail</span>
            <input
              required
              type="email"
              maxLength={200}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-500"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Telefon (für SMS-Erinnerung)</span>
            <input
              required
              type="tel"
              pattern="^\+?[0-9 ()/-]{7,20}$"
              placeholder="+41 76 123 45 67"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-teal-500"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-teal-600 px-8 py-3 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? "Wird gebucht…" : "Verbindlich buchen"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("slot");
              loadSlots(treatment.id, date);
            }}
            className="text-sm text-slate-500 hover:text-teal-700"
          >
            ← Anderen Termin wählen
          </button>
        </form>
      )}

      {/* Schritt 4: Bestätigung */}
      {step === "done" && treatment && slot && cancelToken && (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-2xl">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Termin bestätigt!</h1>
          <p className="mt-2 text-slate-600">
            {treatment.name} –{" "}
            {new Date(slot).toLocaleDateString("de-CH", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: TZ,
            })}
            , {fmtTime(slot)} Uhr
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Du erhältst eine Bestätigung per E-Mail und SMS.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href={`/api/ics/${cancelToken}`}
              className="rounded-full border border-teal-600 px-6 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
            >
              📅 Zum Kalender hinzufügen
            </a>
            <a href={`/termin/${cancelToken}`} className="text-sm text-slate-500 hover:text-teal-700">
              Termin verwalten (stornieren/verschieben)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
