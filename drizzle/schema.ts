import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // For traditional email/password login
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
  classId: int("classId"), // optional link to a class (turma)
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
  classId: int("classId"), // optional link to a class (turma)
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
  // Link to the members table (optional for external students/monitors)
  memberId: int("memberId").unique(),
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

/**
 * Seminars table - Jigsaw seminars (6 groups)
 */
export const seminars = mysqlTable("seminars", {
  id: int("id").autoincrement().primaryKey(),
  week: int("week").notNull(), // Week number (7 or 13)
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  date: varchar("date", { length: 20 }).notNull(),
  groupPF: decimal("groupPF", { precision: 5, scale: 1 }).default("0"), // Total PF for the group
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Seminar = typeof seminars.$inferSelect;
export type InsertSeminar = typeof seminars.$inferInsert;

/**
 * Seminar roles/functions (coordenador, relator, etc.)
 */
export const seminarRoles = mysqlTable("seminarRoles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Coordenador", "Relator", "Pesquisador 1"
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SeminarRole = typeof seminarRoles.$inferSelect;
export type InsertSeminarRole = typeof seminarRoles.$inferInsert;

/**
 * Seminar participants - students assigned to roles in seminars
 */
export const seminarParticipants = mysqlTable("seminarParticipants", {
  id: int("id").autoincrement().primaryKey(),
  seminarId: int("seminarId").notNull(),
  roleId: int("roleId").notNull(),
  memberId: int("memberId"), // NULL if not yet assigned
  memberName: varchar("memberName", { length: 200 }), // Cached name for display
  individualPF: decimal("individualPF", { precision: 5, scale: 1 }).default("0"), // Individual PF for this role
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SeminarParticipant = typeof seminarParticipants.$inferSelect;
export type InsertSeminarParticipant = typeof seminarParticipants.$inferInsert;

/**
 * PubMed articles for seminars
 */
export const seminarArticles = mysqlTable("seminarArticles", {
  id: int("id").autoincrement().primaryKey(),
  seminarId: int("seminarId").notNull(),
  pmid: varchar("pmid", { length: 50 }).notNull(), // PubMed ID
  title: text("title").notNull(),
  authors: text("authors"),
  journal: varchar("journal", { length: 300 }),
  year: int("year"),
  abstract: text("abstract"),
  url: varchar("url", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SeminarArticle = typeof seminarArticles.$inferSelect;
export type InsertSeminarArticle = typeof seminarArticles.$inferInsert;

/**
 * Email log - track emails sent to seminar groups
 */
export const emailLog = mysqlTable("emailLog", {
  id: int("id").autoincrement().primaryKey(),
  teacherAccountId: int("teacherAccountId").notNull(),
  teacherName: varchar("teacherName", { length: 200 }).notNull(),
  teacherEmail: varchar("teacherEmail", { length: 200 }).notNull(),
  seminarId: int("seminarId"), // NULL if email not related to a specific seminar
  subject: varchar("subject", { length: 300 }).notNull(),
  body: text("body").notNull(),
  recipientCount: int("recipientCount").notNull().default(0),
  recipients: text("recipients"), // JSON array of recipient emails
  status: varchar("status", { length: 50 }).notNull().default("sent"), // sent, failed, pending
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLog.$inferSelect;
export type InsertEmailLog = typeof emailLog.$inferInsert;

/**
 * Classes (Turmas) - each class belongs to a professor
 * A class represents a discipline+course combination (e.g., Farmacologia 1 - Medicina)
 */
export const classes = mysqlTable("classes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(), // e.g., "Farmacologia 1 - Medicina"
  course: varchar("course", { length: 200 }).notNull(), // e.g., "Medicina", "Biomedicina"
  discipline: varchar("discipline", { length: 200 }).notNull(), // e.g., "Farmacologia 1"
  semester: varchar("semester", { length: 20 }).notNull().default("2026.1"),
  teacherAccountId: int("teacherAccountId"), // professor responsável
  teacherName: varchar("teacherName", { length: 200 }), // cached name
  color: varchar("color", { length: 20 }).notNull().default("#F7941D"),
  isActive: int("isActive").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;

/**
 * Invite codes - codes generated by professors/admin for monitor/external student registration
 */
export const inviteCodes = mysqlTable("inviteCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: varchar("description", { length: 200 }),
  maxUses: int("maxUses").notNull().default(1),
  usedCount: int("usedCount").notNull().default(0),
  createdBy: varchar("createdBy", { length: 200 }).notNull(), // email of professor/admin who created
  isActive: boolean("isActive").notNull().default(true),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InviteCode = typeof inviteCodes.$inferSelect;
export type InsertInviteCode = typeof inviteCodes.$inferInsert;


/**
 * Jigsaw Groups - groups for seminars, clinical cases, and Kahoot quizzes
 * Students create and join groups for collaborative learning activities
 */
export const jigsawGroups = mysqlTable("jigsawGroups", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(), // Link to the class (turma)
  groupType: mysqlEnum("groupType", ["seminar", "clinical_case", "kahoot"]).notNull(),
  name: varchar("name", { length: 200 }).notNull(), // e.g., "Grupo 1 - Seminário Farmacocinética"
  description: text("description"),
  maxMembers: int("maxMembers").notNull().default(5),
  currentMembers: int("currentMembers").notNull().default(0),
  createdBy: int("createdBy"), // memberId of the student who created the group
  createdByName: varchar("createdByName", { length: 200 }),
  isActive: int("isActive").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JigsawGroup = typeof jigsawGroups.$inferSelect;
export type InsertJigsawGroup = typeof jigsawGroups.$inferInsert;

/**
 * Jigsaw Members - students in jigsaw groups
 */
export const jigsawMembers = mysqlTable("jigsawMembers", {
  id: int("id").autoincrement().primaryKey(),
  jigsawGroupId: int("jigsawGroupId").notNull(),
  memberId: int("memberId").notNull(),
  memberName: varchar("memberName", { length: 200 }).notNull(),
  role: mysqlEnum("role", ["coordinator", "reporter", "researcher", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type JigsawMember = typeof jigsawMembers.$inferSelect;
export type InsertJigsawMember = typeof jigsawMembers.$inferInsert;


/**
 * Import History - records of UNIRIO imports with timestamps and details
 * Tracks each import operation for audit and monitoring purposes
 */
export const importHistory = mysqlTable("importHistory", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(), // Link to the class (turma)
  importedBy: int("importedBy"), // userId of admin who triggered import
  importedByName: varchar("importedByName", { length: 200 }),
  totalStudents: int("totalStudents").notNull().default(0), // Total students imported
  successCount: int("successCount").notNull().default(0), // Successfully imported
  errorCount: int("errorCount").notNull().default(0), // Failed to import
  errors: text("errors"), // JSON array of error messages
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  source: varchar("source", { length: 50 }).default("unirio").notNull(), // e.g., "unirio", "manual", "csv"
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  notes: text("notes"), // Additional notes about the import
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImportHistory = typeof importHistory.$inferSelect;
export type InsertImportHistory = typeof importHistory.$inferInsert;


/**
 * System Settings - Global configuration for the platform
 * Stores general settings like course name, semester, schedule, etc.
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  courseName: varchar("courseName", { length: 255 }).notNull().default("Farmacologia I"),
  semester: varchar("semester", { length: 50 }).notNull().default("2026.1"),
  academicYear: varchar("academicYear", { length: 50 }).notNull().default("2026"),
  institution: varchar("institution", { length: 255 }).notNull().default("UNIRIO"),
  department: varchar("department", { length: 255 }).notNull().default("Farmacologia"),
  startDate: varchar("startDate", { length: 20 }),
  endDate: varchar("endDate", { length: 20 }),
  totalWeeks: int("totalWeeks").notNull().default(17),
  schedule: text("schedule"), // JSON with weekly schedule
  description: text("description"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#FF9500"), // Hex color
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#1A1A2E"),
  updatedBy: int("updatedBy"),
  updatedByName: varchar("updatedByName", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = typeof systemSettings.$inferInsert;

/**
 * Backup Records - Track all backups for recovery purposes
 * Stores metadata about each backup operation
 */
export const backupRecords = mysqlTable("backupRecords", {
  id: int("id").autoincrement().primaryKey(),
  backupName: varchar("backupName", { length: 255 }).notNull(),
  backupType: mysqlEnum("backupType", ["full", "partial", "incremental"]).default("full").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  fileSize: int("fileSize"), // Size in bytes
  fileUrl: varchar("fileUrl", { length: 500 }), // URL to download backup
  fileKey: varchar("fileKey", { length: 500 }), // S3 key for backup file
  totalRecords: int("totalRecords").notNull().default(0),
  recordsIncluded: text("recordsIncluded"), // JSON array of record types included
  createdBy: int("createdBy").notNull(),
  createdByName: varchar("createdByName", { length: 200 }),
  notes: text("notes"),
  errorMessage: text("errorMessage"),
  expiresAt: timestamp("expiresAt"), // When backup will be deleted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});
export type BackupRecord = typeof backupRecords.$inferSelect;
export type InsertBackupRecord = typeof backupRecords.$inferInsert;

/**
 * Restore History - Track all restore operations
 */
export const restoreHistory = mysqlTable("restoreHistory", {
  id: int("id").autoincrement().primaryKey(),
  backupId: int("backupId").notNull().references(() => backupRecords.id),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  recordsRestored: int("recordsRestored").notNull().default(0),
  recordsFailed: int("recordsFailed").notNull().default(0),
  restoredBy: int("restoredBy").notNull(),
  restoredByName: varchar("restoredByName", { length: 200 }),
  notes: text("notes"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});
export type RestoreHistory = typeof restoreHistory.$inferSelect;
export type InsertRestoreHistory = typeof restoreHistory.$inferInsert;


/**
 * ========================================
 * JIGSAW METHOD - COOPERATIVE LEARNING
 * ========================================
 * Tables for implementing the complete Jigsaw method:
 * - Expert Groups: Students study one topic in depth
 * - Home Groups (Jigsaw): Students teach each other all topics
 * - Scoring: Individual and group evaluation
 */

/**
 * Jigsaw Topics - The 6 topics for expert groups
 */
export const jigsawTopics = mysqlTable("jigsawTopics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  articleUrl: varchar("articleUrl", { length: 500 }),
  articleTitle: varchar("articleTitle", { length: 300 }),
  articleAuthors: varchar("articleAuthors", { length: 300 }),
  articleYear: int("articleYear"),
  keyPoints: text("keyPoints"), // JSON array of key points
  studyDuration: int("studyDuration").notNull().default(5), // hours
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JigsawTopic = typeof jigsawTopics.$inferSelect;
export type InsertJigsawTopic = typeof jigsawTopics.$inferInsert;

/**
 * Jigsaw Expert Groups - Groups of students studying one topic
 */
export const jigsawExpertGroups = mysqlTable("jigsawExpertGroups", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  topicId: int("topicId").notNull().references(() => jigsawTopics.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  maxMembers: int("maxMembers").notNull().default(14),
  status: mysqlEnum("status", ["forming", "active", "presenting", "completed"]).default("forming").notNull(),
  presentationDate: timestamp("presentationDate"),
  presentationNotes: text("presentationNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JigsawExpertGroup = typeof jigsawExpertGroups.$inferSelect;
export type InsertJigsawExpertGroup = typeof jigsawExpertGroups.$inferInsert;

/**
 * Jigsaw Expert Members - Students in expert groups
 */
export const jigsawExpertMembers = mysqlTable("jigsawExpertMembers", {
  id: int("id").autoincrement().primaryKey(),
  expertGroupId: int("expertGroupId").notNull().references(() => jigsawExpertGroups.id, { onDelete: "cascade" }),
  memberId: int("memberId").notNull().references(() => members.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["member", "coordinator", "presenter"]).default("member").notNull(),
  presentationScore: decimal("presentationScore", { precision: 3, scale: 1 }).default("0"), // 0-5
  participationScore: decimal("participationScore", { precision: 3, scale: 1 }).default("0"), // 0-2
  readingProgress: int("readingProgress").default(0), // 0-100%
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JigsawExpertMember = typeof jigsawExpertMembers.$inferSelect;
export type InsertJigsawExpertMember = typeof jigsawExpertMembers.$inferInsert;

/**
 * Jigsaw Home Groups - Groups where students teach each other (Jigsaw groups)
 */
export const jigsawHomeGroups = mysqlTable("jigsawHomeGroups", {
  id: int("id").autoincrement().primaryKey(),
  classId: int("classId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  meetingNumber: int("meetingNumber").notNull(), // 1st, 2nd, 3rd, 4th, 5th Jigsaw meeting
  meetingDate: timestamp("meetingDate"),
  status: mysqlEnum("status", ["forming", "active", "completed"]).default("forming").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JigsawHomeGroup = typeof jigsawHomeGroups.$inferSelect;
export type InsertJigsawHomeGroup = typeof jigsawHomeGroups.$inferInsert;

/**
 * Jigsaw Home Members - Students in home groups (Jigsaw groups)
 * Each student brings expertise from one topic and learns from others
 */
export const jigsawHomeMembers = mysqlTable("jigsawHomeMembers", {
  id: int("id").autoincrement().primaryKey(),
  homeGroupId: int("homeGroupId").notNull().references(() => jigsawHomeGroups.id, { onDelete: "cascade" }),
  memberId: int("memberId").notNull().references(() => members.id, { onDelete: "cascade" }),
  topicId: int("topicId").notNull().references(() => jigsawTopics.id), // Topic this student teaches
  presentationScore: decimal("presentationScore", { precision: 3, scale: 1 }).default("0"), // 0-5
  participationScore: decimal("participationScore", { precision: 3, scale: 1 }).default("0"), // 0-2
  peerRating: decimal("peerRating", { precision: 3, scale: 1 }).default("0"), // 0-5 (peer evaluation)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JigsawHomeMember = typeof jigsawHomeMembers.$inferSelect;
export type InsertJigsawHomeMember = typeof jigsawHomeMembers.$inferInsert;

/**
 * Jigsaw Scores - Aggregated scores for each student
 */
export const jigsawScores = mysqlTable("jigsawScores", {
  id: int("id").autoincrement().primaryKey(),
  memberId: int("memberId").notNull().references(() => members.id, { onDelete: "cascade" }),
  classId: int("classId").notNull(),
  expertGroupId: int("expertGroupId").references(() => jigsawExpertGroups.id), // Expert group they participated in
  homeGroupIds: text("homeGroupIds"), // JSON array of home group IDs
  totalPresentationScore: decimal("totalPresentationScore", { precision: 5, scale: 1 }).default("0"),
  totalParticipationScore: decimal("totalParticipationScore", { precision: 5, scale: 1 }).default("0"),
  totalPeerRating: decimal("totalPeerRating", { precision: 5, scale: 1 }).default("0"),
  totalJigsawPF: decimal("totalJigsawPF", { precision: 6, scale: 1 }).default("0"), // Total PF from Jigsaw
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JigsawScore = typeof jigsawScores.$inferSelect;
export type InsertJigsawScore = typeof jigsawScores.$inferInsert;
