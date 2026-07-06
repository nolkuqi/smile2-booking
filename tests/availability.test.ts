import { describe, expect, it } from "vitest";
import {
  computeSlots,
  weekdayOf,
  type OpeningWindow,
} from "../lib/availability";

/** Öffnungszeiten Smile² (Mo, Do, Fr mit Mittagspause; Sa kurz; Di/Mi/So zu) */
const OPENING: OpeningWindow[] = [
  { weekday: 1, openFrom: "09:00", openTo: "13:00" },
  { weekday: 1, openFrom: "14:00", openTo: "18:00" },
  { weekday: 4, openFrom: "09:00", openTo: "13:00" },
  { weekday: 4, openFrom: "14:00", openTo: "19:00" },
  { weekday: 5, openFrom: "09:00", openTo: "13:00" },
  { weekday: 5, openFrom: "14:00", openTo: "18:00" },
  { weekday: 6, openFrom: "10:00", openTo: "14:00" },
];

/** Instant für Studio-Lokalzeit (CEST im Juli = UTC+2) */
function zurich(dateTime: string): Date {
  return new Date(`${dateTime}+02:00`);
}

const MONDAY = "2026-07-13";
const TUESDAY = "2026-07-14";
// "now" weit in der Vergangenheit → Vorlauf-Filter greift in Tests nicht
const LONG_AGO = new Date("2026-01-01T00:00:00Z");

function base(overrides: Partial<Parameters<typeof computeSlots>[0]> = {}) {
  return computeSlots({
    date: MONDAY,
    durationMin: 60,
    openingWindows: OPENING,
    busy: [],
    now: LONG_AGO,
    ...overrides,
  });
}

function local(slots: Date[]): string[] {
  return slots.map((s) =>
    s.toLocaleTimeString("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Zurich",
    }),
  );
}

describe("weekdayOf", () => {
  it("liefert den Studio-lokalen Wochentag", () => {
    expect(weekdayOf(MONDAY)).toBe(1);
    expect(weekdayOf("2026-07-18")).toBe(6); // Samstag
  });
});

describe("computeSlots", () => {
  it("liefert keine Slots an geschlossenen Tagen (Di)", () => {
    expect(base({ date: TUESDAY })).toEqual([]);
  });

  it("rastert beide Öffnungsfenster und respektiert die Mittagspause", () => {
    const slots = local(base());
    expect(slots[0]).toBe("09:00");
    expect(slots).toContain("12:00"); // letzter Vormittagsslot (60 min bis 13:00)
    expect(slots).not.toContain("12:15"); // 60 min passen nicht mehr bis 13:00
    expect(slots).not.toContain("13:00"); // Mittagspause
    expect(slots).toContain("14:00");
    expect(slots[slots.length - 1]).toBe("17:00"); // 60 min bis 18:00
    // 09:00–12:00 = 13 Starts, 14:00–17:00 = 13 Starts
    expect(slots).toHaveLength(26);
  });

  it("blockiert Slots, die mit bestehenden Terminen kollidieren", () => {
    const slots = local(
      base({
        busy: [{ startsAt: zurich(`${MONDAY}T10:00:00`), endsAt: zurich(`${MONDAY}T11:00:00`) }],
      }),
    );
    expect(slots).toContain("09:00"); // endet exakt 10:00 → keine Kollision
    expect(slots).not.toContain("09:15");
    expect(slots).not.toContain("10:45");
    expect(slots).toContain("11:00"); // beginnt exakt am Terminende
  });

  it("berücksichtigt den Puffer der zu buchenden Behandlung", () => {
    const slots = local(
      base({
        bufferMin: 15,
        busy: [{ startsAt: zurich(`${MONDAY}T10:00:00`), endsAt: zurich(`${MONDAY}T11:00:00`) }],
      }),
    );
    // 09:00 + 60 min + 15 min Puffer = 10:15 → kollidiert mit Termin ab 10:00
    expect(slots).not.toContain("09:00");
    expect(slots).toContain("11:00"); // nach dem Termin wieder frei
  });

  it("Puffer darf über Ladenschluss hinausragen, Behandlung nicht", () => {
    const slots = local(base({ durationMin: 45, bufferMin: 30 }));
    expect(slots).toContain("12:15"); // 45 min bis exakt 13:00, Puffer danach ok
    expect(slots).not.toContain("12:30");
  });

  it("filtert Slots innerhalb der Vorlaufzeit", () => {
    const slots = local(
      base({ now: zurich(`${MONDAY}T08:30:00`), minLeadMin: 120 }),
    );
    expect(slots[0]).toBe("10:30");
  });

  it("Ganztages-Blockzeit (Ferien) entfernt alle Slots", () => {
    const slots = base({
      busy: [{ startsAt: zurich(`${MONDAY}T00:00:00`), endsAt: zurich(`${MONDAY}T23:59:00`) }],
    });
    expect(slots).toEqual([]);
  });

  it("Samstag nutzt das kurze Fenster 10–14", () => {
    const slots = local(base({ date: "2026-07-18" }));
    expect(slots[0]).toBe("10:00");
    expect(slots[slots.length - 1]).toBe("13:00");
  });
});
