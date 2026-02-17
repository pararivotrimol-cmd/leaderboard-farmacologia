import { eq, asc, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  teams, InsertTeam,
  members, InsertMember,
  xpActivities, InsertXpActivity,
  weeklyHighlights, InsertWeeklyHighlight,
  courseSettings, InsertCourseSetting,
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
