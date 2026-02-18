import { eq, desc, asc, and, gte, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  teams, InsertTeam,
  members, InsertMember,
  xpActivities, InsertXpActivity,
  weeklyHighlights, InsertWeeklyHighlight,
  courseSettings, InsertCourseSetting,
  notifications, InsertNotification,
  materials, InsertMaterial,
  badges, InsertBadge,
  memberBadges, InsertMemberBadge,
  studentAccounts, InsertStudentAccount,
  attendance, InsertAttendance,
  youtubePlaylistsTable, InsertYoutubePlaylist,
  xpHistory, InsertXpHistory,
  teacherAccounts, InsertTeacherAccount,
  passwordResetTokens, InsertPasswordResetToken,
  auditLog, InsertAuditLog,
  teacherTeams, InsertTeacherTeam,
  activityTemplates, InsertActivityTemplate,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User Helpers ───

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) { values.lastSignedIn = new Date(); }
    if (Object.keys(updateSet).length === 0) { updateSet.lastSignedIn = new Date(); }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Teams ───

export async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).orderBy(asc(teams.id));
}

export async function createTeam(data: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teams).values(data);
  return result[0].insertId;
}

export async function updateTeam(id: number, data: Partial<InsertTeam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teams).set(data).where(eq(teams.id, id));
}

export async function deleteTeam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(members).where(eq(members.teamId, id));
  await db.delete(teams).where(eq(teams.id, id));
}

// ─── Members ───

export async function getAllMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).orderBy(asc(members.teamId), asc(members.name));
}

export async function getMembersByTeam(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(members).where(eq(members.teamId, teamId)).orderBy(asc(members.name));
}

export async function createMember(data: InsertMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(members).values(data);
  return result[0].insertId;
}

export async function updateMember(id: number, data: Partial<InsertMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set(data).where(eq(members.id, id));
}

export async function updateMemberXP(id: number, xp: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(members).set({ xp }).where(eq(members.id, id));
}

export async function deleteMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(members).where(eq(members.id, id));
}

export async function bulkUpdateXP(updates: { id: number; xp: string }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const u of updates) {
    await db.update(members).set({ xp: u.xp }).where(eq(members.id, u.id));
  }
}

// ─── XP Activities ───

export async function getAllXpActivities() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(xpActivities).orderBy(asc(xpActivities.id));
}

export async function createXpActivity(data: InsertXpActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(xpActivities).values(data);
  return result[0].insertId;
}

export async function updateXpActivity(id: number, data: Partial<InsertXpActivity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(xpActivities).set(data).where(eq(xpActivities.id, id));
}

export async function deleteXpActivity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(xpActivities).where(eq(xpActivities.id, id));
}

// ─── Weekly Highlights ───

export async function getAllHighlights() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyHighlights).orderBy(asc(weeklyHighlights.week));
}

export async function createHighlight(data: InsertWeeklyHighlight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(weeklyHighlights).values(data);
  return result[0].insertId;
}

export async function updateHighlight(id: number, data: Partial<InsertWeeklyHighlight>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(weeklyHighlights).set(data).where(eq(weeklyHighlights.id, id));
}

export async function deleteHighlight(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(weeklyHighlights).where(eq(weeklyHighlights.id, id));
}

// ─── Course Settings ───

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(courseSettings).where(eq(courseSettings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0].settingValue : null;
}

export async function upsertSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(courseSettings).values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseSettings);
}

// ─── Notifications ───

export async function getActiveNotifications() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const all = await db.select().from(notifications).where(eq(notifications.isActive, 1)).orderBy(desc(notifications.createdAt));
  return all.filter(n => !n.expiresAt || n.expiresAt > now);
}

export async function getAllNotifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).orderBy(desc(notifications.createdAt));
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function updateNotification(id: number, data: Partial<InsertNotification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set(data).where(eq(notifications.id, id));
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(notifications).where(eq(notifications.id, id));
}

// ─── Materials ───

export async function getAllMaterials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materials).orderBy(desc(materials.createdAt));
}

export async function getVisibleMaterials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materials).where(eq(materials.isVisible, 1)).orderBy(desc(materials.createdAt));
}

export async function createMaterial(data: InsertMaterial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(materials).values(data);
  return result[0].insertId;
}

export async function updateMaterial(id: number, data: Partial<InsertMaterial>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(materials).set(data).where(eq(materials.id, id));
}

export async function deleteMaterial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(materials).where(eq(materials.id, id));
}

// ─── Badges ───

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges).orderBy(asc(badges.id));
}

export async function getActiveBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges).where(eq(badges.isActive, 1)).orderBy(asc(badges.week), asc(badges.id));
}

export async function createBadge(data: InsertBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(badges).values(data);
  return result[0].insertId;
}

export async function updateBadge(id: number, data: Partial<InsertBadge>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(badges).set(data).where(eq(badges.id, id));
}

export async function deleteBadge(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete all member badges first
  await db.delete(memberBadges).where(eq(memberBadges.badgeId, id));
  await db.delete(badges).where(eq(badges.id, id));
}

// ─── Member Badges ───

export async function getAllMemberBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberBadges).orderBy(desc(memberBadges.earnedAt));
}

export async function getMemberBadgesByMember(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberBadges).where(eq(memberBadges.memberId, memberId)).orderBy(desc(memberBadges.earnedAt));
}

export async function getMemberBadgesByBadge(badgeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memberBadges).where(eq(memberBadges.badgeId, badgeId)).orderBy(desc(memberBadges.earnedAt));
}

export async function awardBadge(data: InsertMemberBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if already awarded
  const existing = await db.select().from(memberBadges)
    .where(sql`${memberBadges.memberId} = ${data.memberId} AND ${memberBadges.badgeId} = ${data.badgeId}`)
    .limit(1);
  if (existing.length > 0) return existing[0].id; // Already awarded
  const result = await db.insert(memberBadges).values(data);
  return result[0].insertId;
}

export async function bulkAwardBadge(badgeId: number, memberIds: number[], note?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let awarded = 0;
  for (const memberId of memberIds) {
    const existing = await db.select().from(memberBadges)
      .where(sql`${memberBadges.memberId} = ${memberId} AND ${memberBadges.badgeId} = ${badgeId}`)
      .limit(1);
    if (existing.length === 0) {
      await db.insert(memberBadges).values({ memberId, badgeId, note });
      awarded++;
    }
  }
  return awarded;
}

export async function revokeBadge(memberId: number, badgeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(memberBadges).where(
    sql`${memberBadges.memberId} = ${memberId} AND ${memberBadges.badgeId} = ${badgeId}`
  );
}

export async function deleteMemberBadge(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(memberBadges).where(eq(memberBadges.id, id));
}

// ─── Student Accounts ───

export async function getStudentAccountByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentAccounts).where(eq(studentAccounts.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentAccountByMatricula(matricula: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentAccounts).where(eq(studentAccounts.matricula, matricula)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentAccountByMemberId(memberId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentAccounts).where(eq(studentAccounts.memberId, memberId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentAccountBySessionToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(studentAccounts)
    .where(and(eq(studentAccounts.sessionToken, token), eq(studentAccounts.isActive, 1)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStudentAccount(data: InsertStudentAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(studentAccounts).values(data);
  return result[0].insertId;
}

export async function updateStudentAccountSession(id: number, sessionToken: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(studentAccounts).set({
    sessionToken,
    lastLoginAt: sessionToken ? new Date() : undefined,
  }).where(eq(studentAccounts.id, id));
}

export async function updateStudentAccountPassword(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(studentAccounts).set({ passwordHash }).where(eq(studentAccounts.id, id));
}

export async function getAllStudentAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentAccounts).orderBy(asc(studentAccounts.email));
}

export async function deleteStudentAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete attendance records first
  await db.delete(attendance).where(eq(attendance.studentAccountId, id));
  await db.delete(studentAccounts).where(eq(studentAccounts.id, id));
}

// ─── Attendance ───

export async function createAttendanceRecord(data: InsertAttendance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if already checked in for this week
  const existing = await db.select().from(attendance)
    .where(and(
      eq(attendance.studentAccountId, data.studentAccountId!),
      eq(attendance.week, data.week!),
    ))
    .limit(1);
  if (existing.length > 0) return { id: existing[0].id, alreadyCheckedIn: true };
  const result = await db.insert(attendance).values(data);
  return { id: result[0].insertId, alreadyCheckedIn: false };
}

export async function getAttendanceByStudent(studentAccountId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance)
    .where(eq(attendance.studentAccountId, studentAccountId))
    .orderBy(asc(attendance.week));
}

export async function getAttendanceByWeek(week: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance)
    .where(eq(attendance.week, week))
    .orderBy(asc(attendance.memberId));
}

export async function getAllAttendance() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance).orderBy(desc(attendance.checkedInAt));
}

export async function getAttendanceSummary() {
  const db = await getDb();
  if (!db) return [];
  // Get count of attendance per member across all weeks
  const result = await db.select({
    memberId: attendance.memberId,
    totalPresent: sql<number>`COUNT(DISTINCT ${attendance.week})`,
    validPresent: sql<number>`COUNT(DISTINCT CASE WHEN ${attendance.status} IN ('valid', 'manual') THEN ${attendance.week} END)`,
  }).from(attendance).groupBy(attendance.memberId);
  return result;
}

export async function updateAttendanceStatus(id: number, status: "valid" | "invalid" | "manual", note?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (note !== undefined) updateData.note = note;
  await db.update(attendance).set(updateData as any).where(eq(attendance.id, id));
}

export async function deleteAttendanceRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(attendance).where(eq(attendance.id, id));
}

export async function createManualAttendance(memberId: number, week: number, classDate: string, note?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Find the student account for this member
  const account = await db.select().from(studentAccounts).where(eq(studentAccounts.memberId, memberId)).limit(1);
  const studentAccountId = account.length > 0 ? account[0].id : 0;
  // Check if already has attendance for this week
  if (studentAccountId > 0) {
    const existing = await db.select().from(attendance)
      .where(and(eq(attendance.studentAccountId, studentAccountId), eq(attendance.week, week)))
      .limit(1);
    if (existing.length > 0) {
      // Update to manual
      await db.update(attendance).set({ status: "manual", note }).where(eq(attendance.id, existing[0].id));
      return existing[0].id;
    }
  }
  const result = await db.insert(attendance).values({
    studentAccountId: studentAccountId || 0,
    memberId,
    week,
    classDate,
    status: "manual",
    note: note || "Presença registrada manualmente pelo professor",
  });
  return result[0].insertId;
}

// ─── YouTube Playlists ───

export async function createYoutubePlaylist(data: InsertYoutubePlaylist) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(youtubePlaylistsTable).values(data);
  return result[0].insertId;
}

export async function getAllYoutubePlaylists() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(youtubePlaylistsTable).orderBy(youtubePlaylistsTable.sortOrder, youtubePlaylistsTable.createdAt);
}

export async function getVisibleYoutubePlaylists() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(youtubePlaylistsTable)
    .where(eq(youtubePlaylistsTable.isVisible, 1))
    .orderBy(youtubePlaylistsTable.sortOrder, youtubePlaylistsTable.createdAt);
}

export async function updateYoutubePlaylist(id: number, data: Partial<InsertYoutubePlaylist>) {
  const db = await getDb();
  if (!db) return;
  await db.update(youtubePlaylistsTable).set(data).where(eq(youtubePlaylistsTable.id, id));
}

export async function deleteYoutubePlaylist(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(youtubePlaylistsTable).where(eq(youtubePlaylistsTable.id, id));
}

// ─── Dashboard Helpers ───

export async function getTeamById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0] || null;
}

// Note: getActivitiesByMember removed - xpActivities table doesn't track individual member activities
// TODO: Create a separate memberActivities table if detailed weekly tracking is needed

export async function getStudentBadges(studentAccountId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // First get the student account to find their member ID
  const account = await db.select().from(studentAccounts).where(eq(studentAccounts.id, studentAccountId)).limit(1);
  if (!account[0] || !account[0].memberId) return [];
  
  const memberId = account[0].memberId;
  
  // Get all badges awarded to this member with badge details
  const result = await db
    .select({
      id: memberBadges.id,
      badgeId: memberBadges.badgeId,
      earnedAt: memberBadges.earnedAt,
      note: memberBadges.note,
      badgeName: badges.name,
      badgeDescription: badges.description,
      badgeIconUrl: badges.iconUrl,
      week: badges.week,
    })
    .from(memberBadges)
    .leftJoin(badges, eq(memberBadges.badgeId, badges.id))
    .where(eq(memberBadges.memberId, memberId))
    .orderBy(desc(memberBadges.earnedAt));
  
  return result;
}

// ─── XP History ───

/**
 * Record a snapshot of a member's PF for a specific week
 */
export async function recordXpHistory(data: InsertXpHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if record already exists for this member and week
  const existing = await db.select()
    .from(xpHistory)
    .where(
      sql`${xpHistory.memberId} = ${data.memberId} AND ${xpHistory.week} = ${data.week}`
    )
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing record
    await db.update(xpHistory)
      .set({ xpValue: data.xpValue, recordedAt: new Date(), note: data.note })
      .where(eq(xpHistory.id, existing[0].id));
    return existing[0].id;
  } else {
    // Insert new record
    const result = await db.insert(xpHistory).values(data);
    return result[0].insertId;
  }
}

/**
 * Get XP history for a specific member
 */
export async function getXpHistoryByMember(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(xpHistory)
    .where(eq(xpHistory.memberId, memberId))
    .orderBy(asc(xpHistory.week));
}

/**
 * Get XP history for a specific member and week range
 */
export async function getXpHistoryByMemberAndWeeks(memberId: number, startWeek: number, endWeek: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(xpHistory)
    .where(
      sql`${xpHistory.memberId} = ${memberId} AND ${xpHistory.week} >= ${startWeek} AND ${xpHistory.week} <= ${endWeek}`
    )
    .orderBy(asc(xpHistory.week));
}

/**
 * Get latest XP snapshot for all members (for a specific week)
 */
export async function getXpHistoryByWeek(week: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(xpHistory)
    .where(eq(xpHistory.week, week))
    .orderBy(desc(xpHistory.xpValue));
}

/**
 * Delete all XP history for a member (used when deleting a member)
 */
export async function deleteXpHistoryByMember(memberId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(xpHistory).where(eq(xpHistory.memberId, memberId));
}

// ─── Teacher Accounts ───

/**
 * Create a new teacher account
 */
export async function createTeacherAccount(data: InsertTeacherAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teacherAccounts).values(data);
  return result[0].insertId;
}

/**
 * Get teacher account by email
 */
export async function getTeacherAccountByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teacherAccounts).where(eq(teacherAccounts.email, email)).limit(1);
  return result[0] || null;
}

/**
 * Get teacher account by session token
 */
export async function getTeacherAccountBySessionToken(sessionToken: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teacherAccounts)
    .where(eq(teacherAccounts.sessionToken, sessionToken))
    .limit(1);
  return result[0] || null;
}

/**
 * Update teacher account session token
 */
export async function updateTeacherSessionToken(id: number, sessionToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teacherAccounts)
    .set({ sessionToken, lastLoginAt: new Date() })
    .where(eq(teacherAccounts.id, id));
}

/**
 * Clear teacher session token (logout)
 */
export async function clearTeacherSessionToken(sessionToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teacherAccounts)
    .set({ sessionToken: null })
    .where(eq(teacherAccounts.sessionToken, sessionToken));
}

/**
 * Get all teacher accounts (admin only)
 */
export async function getAllTeacherAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teacherAccounts).orderBy(asc(teacherAccounts.name));
}

/**
 * Update teacher account
 */
export async function updateTeacherAccount(id: number, data: Partial<InsertTeacherAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teacherAccounts).set(data).where(eq(teacherAccounts.id, id));
}

/**
 * Delete teacher account
 */
export async function deleteTeacherAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(teacherAccounts).where(eq(teacherAccounts.id, id));
}

// ─── Password Reset Tokens ───

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(data: InsertPasswordResetToken) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(passwordResetTokens).values(data);
  return result[0].insertId;
}

/**
 * Get password reset token by token string
 */
export async function getPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);
  return result[0] || null;
}

/**
 * Mark password reset token as used
 */
export async function markPasswordResetTokenUsed(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(passwordResetTokens)
    .set({ used: 1 })
    .where(eq(passwordResetTokens.id, id));
}

/**
 * Delete expired password reset tokens (cleanup)
 */
export async function deleteExpiredPasswordResetTokens() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(passwordResetTokens)
    .where(sql`${passwordResetTokens.expiresAt} < NOW()`);
}

// ─── Audit Log ───

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(auditLog).values(data);
  return result[0].insertId;
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(filters?: {
  teacherAccountId?: number;
  action?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditLog);
  
  if (filters?.teacherAccountId) {
    query = query.where(eq(auditLog.teacherAccountId, filters.teacherAccountId)) as any;
  }
  if (filters?.action) {
    query = query.where(eq(auditLog.action, filters.action)) as any;
  }
  if (filters?.entityType) {
    query = query.where(eq(auditLog.entityType, filters.entityType)) as any;
  }
  
  query = query.orderBy(desc(auditLog.createdAt)) as any;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }
  
  return query;
}

// ─── Teacher Teams ───

/**
 * Assign a teacher to a team
 */
export async function assignTeacherToTeam(teacherAccountId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teacherTeams).values({ teacherAccountId, teamId });
  return result[0].insertId;
}

/**
 * Get all teams for a teacher
 */
export async function getTeacherTeams(teacherAccountId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teacherTeams)
    .where(eq(teacherTeams.teacherAccountId, teacherAccountId));
}

/**
 * Remove teacher from a team
 */
export async function removeTeacherFromTeam(teacherAccountId: number, teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(teacherTeams)
    .where(sql`${teacherTeams.teacherAccountId} = ${teacherAccountId} AND ${teacherTeams.teamId} = ${teamId}`);
}

/**
 * Remove all team assignments for a teacher
 */
export async function removeAllTeacherTeams(teacherAccountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(teacherTeams)
    .where(eq(teacherTeams.teacherAccountId, teacherAccountId));
}

// ─── Activity Templates ───

/**
 * Create an activity template
 */
export async function createActivityTemplate(data: InsertActivityTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activityTemplates).values(data);
  return result[0].insertId;
}

/**
 * Get all activity templates
 */
export async function getAllActivityTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityTemplates).orderBy(asc(activityTemplates.name));
}

/**
 * Get active activity templates
 */
export async function getActiveActivityTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityTemplates)
    .where(eq(activityTemplates.isActive, 1))
    .orderBy(asc(activityTemplates.name));
}

/**
 * Get activity template by ID
 */
export async function getActivityTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(activityTemplates)
    .where(eq(activityTemplates.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * Update activity template
 */
export async function updateActivityTemplate(id: number, data: Partial<InsertActivityTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(activityTemplates).set(data).where(eq(activityTemplates.id, id));
}

/**
 * Delete activity template
 */
export async function deleteActivityTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(activityTemplates).where(eq(activityTemplates.id, id));
}
