import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: text("password_hash"),
  googleId: varchar("google_id").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;

export const passwordResetTokensTable = pgTable(
  "password_reset_tokens",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("IDX_prt_token").on(table.token), index("IDX_prt_user").on(table.userId)],
);

export type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;
