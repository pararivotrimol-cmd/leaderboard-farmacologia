import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teams table - 16 teams for the semester
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull().default("🧪"),
  color: varchar("color", { length: 20 }).notNull().default("#10b981"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Members table - students belonging to teams
 */
export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  xp: decimal("xp", { precision: 6, scale: 1 }).notNull().default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

/**
 * XP Activities - types of activities that generate XP
 */
export const xpActivities = mysqlTable("xpActivities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull().default("🎯"),
  maxXP: decimal("maxXP", { precision: 5, scale: 1 }).notNull().default("1"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XpActivity = typeof xpActivities.$inferSelect;
export type InsertXpActivity = typeof xpActivities.$inferInsert;

/**
 * Weekly Highlights - notable events each week
 */
export const weeklyHighlights = mysqlTable("weeklyHighlights", {
  id: int("id").autoincrement().primaryKey(),
  week: int("week").notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  activity: varchar("activity", { length: 100 }).notNull(),
  description: text("description").notNull(),
  topTeam: varchar("topTeam", { length: 100 }).notNull().default("—"),
  topStudent: varchar("topStudent", { length: 200 }).notNull().default("—"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyHighlight = typeof weeklyHighlights.$inferSelect;
export type InsertWeeklyHighlight = typeof weeklyHighlights.$inferInsert;

/**
 * Course Settings - semester info and admin password
 */
export const courseSettings = mysqlTable("courseSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 50 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseSetting = typeof courseSettings.$inferSelect;
export type InsertCourseSetting = typeof courseSettings.$inferInsert;

/**
 * Notifications - announcements and alerts for students
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  priority: mysqlEnum("priority", ["normal", "important", "urgent"]).default("normal").notNull(),
  type: mysqlEnum("type", ["banner", "announcement", "reminder"]).default("announcement").notNull(),
  isActive: int("isActive").notNull().default(1),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Materials - files, links, and comments organized by module/week
 * Professor uploads materials, students can view and download
 */
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["file", "link", "comment"]).notNull(),
  // For files: S3 URL; For links: external URL; For comments: null
  url: text("url"),
  // S3 file key for files
  fileKey: varchar("fileKey", { length: 500 }),
  // Original filename for files
  fileName: varchar("fileName", { length: 300 }),
  // MIME type for files
  mimeType: varchar("mimeType", { length: 100 }),
  // Module/category for organization
  module: varchar("module", { length: 100 }).notNull().default("Geral"),
  // Week number (optional)
  week: int("week"),
  // Whether the material is visible to students
  isVisible: int("isVisible").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;
