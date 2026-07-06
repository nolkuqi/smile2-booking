// Befüllt die Datenbank mit Behandlungen und Öffnungszeiten (idempotent).
// Aufruf: DATABASE_URL=... npm run db:seed
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL ist nicht gesetzt");
  process.exit(1);
}
const pool = new Pool({ connectionString: url });

// TODO: Finale Behandlungen, Dauern und Preise mit dem Studio abstimmen
const TREATMENTS = [
  ["Kostenlose Beratung", "Persönliche Beratung inkl. Farbbestimmung und Kontrolle.", 20, 10, 0, 1],
  ["Zahnbleaching Classic", "Schonende kosmetische Zahnaufhellung, eine Sitzung.", 60, 15, 189, 2],
  ["Zahnbleaching Intensiv", "Intensive Aufhellung für stärkere Verfärbungen, inkl. Nachkontrolle.", 90, 15, 269, 3],
  ["Auffrischung", "Nachbehandlung für bestehende Kundinnen und Kunden.", 30, 10, 99, 4],
];

// 0 = So … 6 = Sa (Website: Mo/Do/Fr mit Mittagspause, Sa kurz, Di/Mi/So zu)
const OPENING_HOURS = [
  [1, "09:00", "13:00"],
  [1, "14:00", "18:00"],
  [4, "09:00", "13:00"],
  [4, "14:00", "19:00"],
  [5, "09:00", "13:00"],
  [5, "14:00", "18:00"],
  [6, "10:00", "14:00"],
];

try {
  for (const [name, description, duration, buffer, price, sort] of TREATMENTS) {
    await pool.query(
      `INSERT INTO treatments (name, description, duration_min, buffer_min, price_chf, sort_order)
       SELECT $1, $2, $3, $4, $5, $6
       WHERE NOT EXISTS (SELECT 1 FROM treatments WHERE name = $1)`,
      [name, description, duration, buffer, price, sort],
    );
  }
  for (const [weekday, from, to] of OPENING_HOURS) {
    await pool.query(
      `INSERT INTO opening_hours (weekday, open_from, open_to)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (
         SELECT 1 FROM opening_hours WHERE weekday = $1 AND open_from = $2
       )`,
      [weekday, from, to],
    );
  }
  console.log("Seed abgeschlossen.");
} finally {
  await pool.end();
}
