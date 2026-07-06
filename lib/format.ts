import { STUDIO_TZ } from "@/lib/availability";

export function formatDate(d: Date): string {
  return d.toLocaleDateString("de-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: STUDIO_TZ,
  });
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STUDIO_TZ,
  });
}

export function formatDateTime(d: Date): string {
  return `${formatDate(d)}, ${formatTime(d)} Uhr`;
}

export function formatPrice(chf: number): string {
  return chf === 0 ? "kostenlos" : `CHF ${chf}.–`;
}
