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

/**
 * Badges - achievement definitions
 * Professor creates badges, assigns to students who earn them
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  // Icon URL (S3 or external)
  iconUrl: text("iconUrl"),
  // Category for grouping
  category: varchar("category", { length: 100 }).notNull().default("Geral"),
  // Week associated with this badge (optional)
  week: int("week"),
  // Criteria description (what the student needs to do)
  criteria: text("criteria"),
  // Whether the badge is active and can be earned
  isActive: int("isActive").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * MemberBadges - junction table linking members to earned badges
 */
export const memberBadges = mysqlTable("memberBadges", {
  id: int("id").autoincrement().primaryKey(),
  memberId: int("memberId").notNull(),
  badgeId: int("badgeId").notNull(),
  // When the badge was earned
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  // Optional note from professor
  note: text("note"),
});

export type MemberBadge = typeof memberBadges.$inferSelect;
export type InsertMemberBadge = typeof memberBadges.$inferInsert;

/**
 * Student Accounts - login with institutional email @edu.unirio.br
 * Links a student to their member record for self-service features
 */
export const studentAccounts = mysqlTable("studentAccounts", {
  id: int("id").autoincrement().primaryKey(),
  // Link to the members table
  memberId: int("memberId").notNull().unique(),
  // Institutional email (must be @edu.unirio.br)
  email: varchar("email", { length: 320 }).notNull().unique(),
  // Student registration number (matrícula)
  matricula: varchar("matricula", { length: 30 }).notNull().unique(),
  // Hashed password (bcrypt)
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  // Whether the account is verified/active
  isActive: int("isActive").notNull().default(1),
  // Session token for login persistence
  sessionToken: varchar("sessionToken", { length: 255 }),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentAccount = typeof studentAccounts.$inferSelect;
export type InsertStudentAccount = typeof studentAccounts.$inferInsert;

/**
 * Attendance - geolocation-based attendance records
 * Students check in during class hours (Tuesdays 8h-12h)
 * Location: Frei Caneca 94, sala D201 (lat/lng with 100m radius)
 */
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  // Link to the student account
  studentAccountId: int("studentAccountId").notNull(),
  // Link to the member
  memberId: int("memberId").notNull(),
  // Week number
  week: int("week").notNull(),
  // Date of the class
  classDate: varchar("classDate", { length: 20 }).notNull(),
  // Check-in timestamp
  checkedInAt: timestamp("checkedInAt").defaultNow().notNull(),
  // Geolocation data
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  // Distance from classroom in meters
  distanceMeters: decimal("distanceMeters", { precision: 8, scale: 2 }),
  // Status: valid (within range), invalid (outside range), manual (professor override)
  status: mysqlEnum("status", ["valid", "invalid", "manual"]).default("valid").notNull(),
  // IP address for audit
  ipAddress: varchar("ipAddress", { length: 45 }),
  // User agent for audit
  userAgent: text("userAgent"),
  // Optional note
  note: text("note"),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * YouTube Playlists - organized by module/theme
 * Professor adds playlists, students view embedded players
 */
export const youtubePlaylistsTable = mysqlTable("youtubePlaylistsTable", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  // YouTube playlist ID (e.g., PLxxxxxx) or video ID
  youtubeId: varchar("youtubeId", { length: 100 }).notNull(),
  // Type: playlist or single video
  videoType: mysqlEnum("videoType", ["playlist", "video"]).default("playlist").notNull(),
  // Module/category for organization (matches materials modules)
  module: varchar("module", { length: 100 }).notNull().default("Geral"),
  // Week number (optional)
  week: int("week"),
  // Thumbnail URL (auto-fetched or custom)
  thumbnailUrl: text("thumbnailUrl"),
  // Display order within module
  sortOrder: int("sortOrder").notNull().default(0),
  // Whether visible to students
  isVisible: int("isVisible").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type YoutubePlaylist = typeof youtubePlaylistsTable.$inferSelect;
export type InsertYoutubePlaylist = typeof youtubePlaylistsTable.$inferInsert;

/**
 * XP History - weekly snapshots of student PF for evolution tracking
 * Automatically recorded when admin updates member PF
 */
export const xpHistory = mysqlTable("xpHistory", {
  id: int("id").autoincrement().primaryKey(),
  // Link to the member
  memberId: int("memberId").notNull(),
  // Week number (1-17)
  week: int("week").notNull(),
  // PF value at the end of this week
  xpValue: decimal("xpValue", { precision: 6, scale: 1 }).notNull(),
  // When this snapshot was recorded
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  // Optional note about what changed
  note: text("note"),
});

export type XpHistory = typeof xpHistory.$inferSelect;
export type InsertXpHistory = typeof xpHistory.$inferInsert;

/**
 * Teacher Accounts - login with institutional email @unirio.br
 * Professors register with email and set password on first access
 */
export const teacherAccounts = mysqlTable("teacherAccounts", {
  id: int("id").autoincrement().primaryKey(),
  // Institutional email (must be @unirio.br)
  email: varchar("email", { length: 320 }).notNull().unique(),
  // Full name
  name: varchar("name", { length: 200 }).notNull(),
  // Hashed password (bcrypt)
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  // Role: super_admin (full control), coordenador (can manage teachers) or professor (regular teacher)
  role: mysqlEnum("role", ["super_admin", "coordenador", "professor"]).default("professor").notNull(),
  // Whether the account is active
  isActive: int("isActive").notNull().default(1),
  // Session token for login persistence
  sessionToken: varchar("sessionToken", { length: 255 }),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeacherAccount = typeof teacherAccounts.$inferSelect;
export type InsertTeacherAccount = typeof teacherAccounts.$inferInsert;

/**
 * Password Reset Tokens - for teacher password recovery
 * Token expires after 1 hour
 */
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  teacherAccountId: int("teacherAccountId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: int("used").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Audit Log - tracks all actions performed by teachers
 * Records who did what, when, and on which entity
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  teacherAccountId: int("teacherAccountId").notNull(),
  teacherName: varchar("teacherName", { length: 200 }).notNull(),
  teacherEmail: varchar("teacherEmail", { length: 320 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "update_xp", "create_team", "delete_member"
  entityType: varchar("entityType", { length: 50 }).notNull(), // e.g., "member", "team", "activity"
  entityId: int("entityId"), // ID of the affected entity
  details: text("details"), // JSON string with additional details
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

/**
 * Teacher Teams - relationship between teachers and teams they manage
 * Coordenador can see all teams, professor only sees assigned teams
 */
export const teacherTeams = mysqlTable("teacherTeams", {
  id: int("id").autoincrement().primaryKey(),
  teacherAccountId: int("teacherAccountId").notNull(),
  teamId: int("teamId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeacherTeam = typeof teacherTeams.$inferSelect;
export type InsertTeacherTeam = typeof teacherTeams.$inferInsert;

/**
 * Activity Templates - pre-built examples of active methodologies
 * Each template represents a complete activity with description, objectives, and methodology
 */
export const activityTemplates = mysqlTable("activityTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  methodology: varchar("methodology", { length: 100 }).notNull(), // PBL, TBL, Flipped Classroom, Gamification, Case Study
  description: text("description").notNull(),
  objectives: text("objectives").notNull(), // JSON array of learning objectives
  duration: int("duration"), // Duration in minutes
  xpValue: decimal("xpValue", { precision: 6, scale: 1 }).notNull().default("0"),
  instructions: text("instructions"), // Step-by-step instructions
  materials: text("materials"), // Required materials (JSON array)
  assessment: text("assessment"), // Assessment criteria
  isActive: int("isActive").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActivityTemplate = typeof activityTemplates.$inferSelect;
export type InsertActivityTemplate = typeof activityTemplates.$inferInsert;
