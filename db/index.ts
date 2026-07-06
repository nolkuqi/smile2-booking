import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Ausserhalb von Edge/Browser braucht der Neon-Treiber eine WebSocket-Implementierung
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

export type Db = NeonDatabase<typeof schema>;

let _db: Db | undefined;

/** Lazy Singleton – vermeidet DB-Verbindung zur Build-Zeit. */
export function getDb(): Db {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL ist nicht gesetzt");
    _db = drizzle(new Pool({ connectionString: url }), { schema });
  }
  return _db;
}

export { schema };
