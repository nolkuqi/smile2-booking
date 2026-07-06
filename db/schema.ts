import {
  boolean,
  integer,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const treatments = pgTable("treatments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  durationMin: integer("duration_min").notNull(),
  bufferMin: integer("buffer_min").notNull().default(0),
  priceChf: integer("price_chf").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  treatmentId: uuid("treatment_id").notNull().references(() => treatments.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  /** Ende der Behandlung (ohne Puffer) – für Anzeige & Kalendereintrag */
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  /** Ende inkl. Puffer – Basis des Exclusion Constraints */
  blockedUntil: timestamp("blocked_until", { withTimezone: true }).notNull(),
  status: text("status").$type<AppointmentStatus>().notNull().default("confirmed"),
  cancelToken: uuid("cancel_token").notNull().defaultRandom().unique(),
  reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const openingHours = pgTable("opening_hours", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** 0 = Sonntag … 6 = Samstag */
  weekday: smallint("weekday").notNull(),
  openFrom: time("open_from").notNull(),
  openTo: time("open_to").notNull(),
});

export const timeBlocks = pgTable("time_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: text("reason").notNull().default(""),
});

export type Treatment = typeof treatments.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
