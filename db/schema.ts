/**
 * Drizzle table definitions and inferred types for users, tools, agent configs, and agent runs.
 */
import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  agentCredits: integer('agentCredits').default(3),
  usageCredits: integer('ussageCredits').default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
