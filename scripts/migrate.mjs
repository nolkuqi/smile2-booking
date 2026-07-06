// Führt alle SQL-Migrationen aus db/migrations der Reihe nach aus.
// Aufruf: DATABASE_URL=... npm run db:migrate
import { Pool, neonConfig } from "@neondatabase/serverless";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL ist nicht gesetzt");
  process.exit(1);
}
const pool = new Pool({ connectionString: url });

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS _migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);

  const dir = path.join(import.meta.dirname, "..", "db", "migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const { rows } = await pool.query("SELECT name FROM _migrations");
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`⏭  ${file} (bereits angewendet)`);
      continue;
    }
    const content = await readFile(path.join(dir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(content);
      await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`✅ ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
  console.log("Migrationen abgeschlossen.");
} finally {
  await pool.end();
}
