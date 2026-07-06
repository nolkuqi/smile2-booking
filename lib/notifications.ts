import { Resend } from "resend";
import { formatDateTime } from "@/lib/format";

const STUDIO_NAME = "Smile²";
const STUDIO_ADDRESS = "Feldlistrasse 17, 9000 St. Gallen";

export interface NotificationTarget {
  firstName: string;
  email: string;
  phone: string;
}

export interface AppointmentInfo {
  treatmentName: string;
  startsAt: Date;
  cancelToken: string;
}

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(`[notifications] E-Mail übersprungen (RESEND_API_KEY/EMAIL_FROM fehlt): ${subject}`);
    return;
  }
  const resend = new Resend(key);
  await resend.emails.send({ from, to, subject, text });
}

async function sendSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("[notifications] SMS übersprungen (Twilio-Env-Vars fehlen)");
    return;
  }
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    },
  );
  if (!res.ok) {
    console.error(`[notifications] Twilio-Fehler ${res.status}: ${await res.text()}`);
  }
}

export async function sendBookingConfirmation(
  target: NotificationTarget,
  appt: AppointmentInfo,
): Promise<void> {
  const when = formatDateTime(appt.startsAt);
  const manageUrl = `${baseUrl()}/termin/${appt.cancelToken}`;
  const text = [
    `Hallo ${target.firstName}`,
    ``,
    `Dein Termin bei ${STUDIO_NAME} ist bestätigt:`,
    ``,
    `${appt.treatmentName}`,
    `${when}`,
    `${STUDIO_ADDRESS}`,
    ``,
    `Kalendereintrag: ${baseUrl()}/api/ics/${appt.cancelToken}`,
    `Termin verwalten (stornieren/verschieben): ${manageUrl}`,
    ``,
    `Wir freuen uns auf dich!`,
    `${STUDIO_NAME}`,
  ].join("\n");

  await Promise.allSettled([
    sendEmail(target.email, `Terminbestätigung ${STUDIO_NAME} – ${when}`, text),
    sendSms(
      target.phone,
      `${STUDIO_NAME}: Dein Termin (${appt.treatmentName}) am ${when} ist bestätigt. Verwalten: ${manageUrl}`,
    ),
  ]);
}

export async function sendReminder(
  target: NotificationTarget,
  appt: AppointmentInfo,
): Promise<void> {
  const when = formatDateTime(appt.startsAt);
  const text = [
    `Hallo ${target.firstName}`,
    ``,
    `Erinnerung: Dein Termin bei ${STUDIO_NAME} ist morgen.`,
    ``,
    `${appt.treatmentName}`,
    `${when}`,
    `${STUDIO_ADDRESS}`,
    ``,
    `Bis bald!`,
  ].join("\n");

  await Promise.allSettled([
    sendEmail(target.email, `Erinnerung: Termin ${STUDIO_NAME} – ${when}`, text),
    sendSms(target.phone, `${STUDIO_NAME}: Erinnerung an deinen Termin morgen, ${when}.`),
  ]);
}

/**
 * Info ans Studio bei jeder Buchung/Stornierung – so braucht es (noch) keinen
 * Admin-Bereich: Das Studio pflegt seinen Kalender direkt aus der Mail.
 */
export async function sendStudioNotification(
  kind: "booked" | "cancelled",
  customer: { firstName: string; lastName: string; email: string; phone: string },
  appt: { treatmentName: string; startsAt: Date },
): Promise<void> {
  const to = process.env.STUDIO_NOTIFY_EMAIL;
  if (!to) {
    console.warn("[notifications] Studio-Info übersprungen (STUDIO_NOTIFY_EMAIL fehlt)");
    return;
  }
  const when = formatDateTime(appt.startsAt);
  const verb = kind === "booked" ? "Neue Buchung" : "Stornierung";
  await sendEmail(
    to,
    `${verb}: ${appt.treatmentName} – ${when}`,
    [
      `${verb} über die Website:`,
      ``,
      `Behandlung: ${appt.treatmentName}`,
      `Termin: ${when}`,
      ``,
      `Kundin/Kunde: ${customer.firstName} ${customer.lastName}`,
      `Telefon: ${customer.phone}`,
      `E-Mail: ${customer.email}`,
    ].join("\n"),
  );
}

export async function sendCancellationConfirmation(
  target: NotificationTarget,
  appt: AppointmentInfo,
): Promise<void> {
  const when = formatDateTime(appt.startsAt);
  await sendEmail(
    target.email,
    `Termin storniert – ${STUDIO_NAME}`,
    `Hallo ${target.firstName}\n\nDein Termin (${appt.treatmentName}, ${when}) wurde storniert.\nDu kannst jederzeit einen neuen Termin buchen: ${baseUrl()}/buchen\n\n${STUDIO_NAME}`,
  );
}
