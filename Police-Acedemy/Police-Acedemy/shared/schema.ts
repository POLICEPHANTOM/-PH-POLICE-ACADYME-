import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  discord: text("discord"),
  role: text("role").notNull().default("citizen"), // 'admin', 'police', 'citizen', 'recruit', 'ftp', 'fto'
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull().default("academy"), // 'academy' or 'police'
  charName: text("char_name"),
  discord: text("discord"),
  experience: text("experience"),
  joinedBefore: text("joined_before"),
  protocols: text("protocols").array(),
  answers: jsonb("answers"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., 'applications_open'
  value: text("value").notNull(), // JSON stringified value
});

export const ranks = pgTable("ranks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),   // الرتبة
  name: text("name").notNull(),    // الاسم
  code: text("code").notNull(),    // الكود
  order: integer("order").notNull(), // For sorting
});

export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: text("category").default("general"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  content: true,
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  discord: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  content: true,
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  type: true,
  charName: true,
  discord: true,
  experience: true,
  joinedBefore: true,
  protocols: true,
  answers: true,
});

export const insertRankSchema = createInsertSchema(ranks).omit({ id: true });
export const insertRuleSchema = createInsertSchema(rules).omit({ id: true });

// === EXPLICIT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Rank = typeof ranks.$inferSelect;
export type Rule = typeof rules.$inferSelect;
