import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb, getTeacherAccountBySessionToken } from "../db";
import { scheduleEntries, gameWeeklyReleases } from "../../drizzle/schema";
import { eq, asc, desc, and, isNull, or } from "drizzle-orm";

export const scheduleRouter = router({
  // Get schedule entries for a specific class (or global if no classId)
  getAll: publicProcedure
    .input(z.object({ classId: z.number().int().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let entries;
      if (input?.classId) {
        // Return entries for this specific class
        entries = await db
          .select()
          .from(scheduleEntries)
          .where(and(eq(scheduleEntries.isActive, true), eq(scheduleEntries.classId, input.classId)))
          .orderBy(asc(scheduleEntries.sortOrder));
      } else {
        // Return global entries (no classId) for backward compatibility
        entries = await db
          .select()
          .from(scheduleEntries)
          .where(and(eq(scheduleEntries.isActive, true), isNull(scheduleEntries.classId)))
          .orderBy(asc(scheduleEntries.sortOrder));
      }

      let releasedWeeks: number[] = [];
      let currentGameWeek: number | null = null;
      try {
        const releases = await db
          .select()
          .from(gameWeeklyReleases)
          .where(eq(gameWeeklyReleases.isReleased, true))
          .orderBy(desc(gameWeeklyReleases.weekNumber));
        releasedWeeks = releases.map((r) => r.weekNumber);
        currentGameWeek = releases.length > 0 ? releases[0].weekNumber : null;
      } catch {}
      return entries.map((e) => ({
        ...e,
        isCurrentGameWeek: e.gameWeekNumber !== null && e.gameWeekNumber === currentGameWeek,
        isGameWeekUnlocked: e.gameWeekNumber !== null ? releasedWeeks.includes(e.gameWeekNumber) : null,
      }));
    }),

  getAllAdmin: publicProcedure
    .input(z.object({ teacherSessionToken: z.string(), classId: z.number().int().optional() }))
    .query(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      let entries;
      if (input.classId) {
        entries = await db
          .select()
          .from(scheduleEntries)
          .where(eq(scheduleEntries.classId, input.classId))
          .orderBy(asc(scheduleEntries.sortOrder));
      } else {
        entries = await db
          .select()
          .from(scheduleEntries)
          .orderBy(asc(scheduleEntries.sortOrder));
      }

      let gameWeeks: { weekNumber: number; isReleased: boolean }[] = [];
      try {
        gameWeeks = await db
          .select({ weekNumber: gameWeeklyReleases.weekNumber, isReleased: gameWeeklyReleases.isReleased })
          .from(gameWeeklyReleases)
          .orderBy(asc(gameWeeklyReleases.weekNumber));
      } catch {}
      return entries.map((e) => ({
        ...e,
        gameWeekInfo: e.gameWeekNumber !== null
          ? gameWeeks.find((w) => w.weekNumber === e.gameWeekNumber) ?? null
          : null,
      }));
    }),

  getGameWeeks: publicProcedure
    .input(z.object({ teacherSessionToken: z.string() }))
    .query(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) return [];
      try {
        return await db
          .select({ weekNumber: gameWeeklyReleases.weekNumber, isReleased: gameWeeklyReleases.isReleased })
          .from(gameWeeklyReleases)
          .orderBy(asc(gameWeeklyReleases.weekNumber));
      } catch {
        return [];
      }
    }),

  create: publicProcedure
    .input(z.object({
      teacherSessionToken: z.string(),
      weekLabel: z.string().min(1).max(50),
      weekDate: z.string().max(20).optional(),
      title: z.string().min(1).max(300),
      detail: z.string().optional(),
      type: z.enum(["aula", "tbl", "caso", "jigsaw", "prova"]).default("aula"),
      highlight: z.boolean().default(false),
      isActive: z.boolean().default(true),
      sortOrder: z.number().int().default(0),
      gameWeekNumber: z.number().int().nullable().optional(),
      classId: z.number().int().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { teacherSessionToken, ...data } = input;
      await db.insert(scheduleEntries).values({
        weekLabel: data.weekLabel,
        weekDate: data.weekDate ?? null,
        title: data.title,
        detail: data.detail ?? null,
        type: data.type,
        highlight: data.highlight,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        gameWeekNumber: data.gameWeekNumber ?? null,
        classId: data.classId ?? null,
      });
      return { success: true };
    }),

  update: publicProcedure
    .input(z.object({
      teacherSessionToken: z.string(),
      id: z.number().int(),
      weekLabel: z.string().min(1).max(50).optional(),
      weekDate: z.string().max(20).nullable().optional(),
      title: z.string().min(1).max(300).optional(),
      detail: z.string().nullable().optional(),
      type: z.enum(["aula", "tbl", "caso", "jigsaw", "prova"]).optional(),
      highlight: z.boolean().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
      gameWeekNumber: z.number().int().nullable().optional(),
      classId: z.number().int().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { teacherSessionToken, id, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      if (fields.weekLabel !== undefined) updateData.weekLabel = fields.weekLabel;
      if (fields.weekDate !== undefined) updateData.weekDate = fields.weekDate;
      if (fields.title !== undefined) updateData.title = fields.title;
      if (fields.detail !== undefined) updateData.detail = fields.detail;
      if (fields.type !== undefined) updateData.type = fields.type;
      if (fields.highlight !== undefined) updateData.highlight = fields.highlight;
      if (fields.isActive !== undefined) updateData.isActive = fields.isActive;
      if (fields.sortOrder !== undefined) updateData.sortOrder = fields.sortOrder;
      if (fields.gameWeekNumber !== undefined) updateData.gameWeekNumber = fields.gameWeekNumber;
      if (fields.classId !== undefined) updateData.classId = fields.classId;
      await db.update(scheduleEntries).set(updateData).where(eq(scheduleEntries.id, id));
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ teacherSessionToken: z.string(), id: z.number().int() }))
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(scheduleEntries).where(eq(scheduleEntries.id, input.id));
      return { success: true };
    }),

  reorder: publicProcedure
    .input(z.object({
      teacherSessionToken: z.string(),
      orderedIds: z.array(z.number().int()),
    }))
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await Promise.all(
        input.orderedIds.map((id, index) =>
          db.update(scheduleEntries).set({ sortOrder: index + 1 }).where(eq(scheduleEntries.id, id))
        )
      );
      return { success: true };
    }),

  // Delete all entries for a specific class (for reimport)
  deleteByClass: publicProcedure
    .input(z.object({ teacherSessionToken: z.string(), classId: z.number().int() }))
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(scheduleEntries).where(eq(scheduleEntries.classId, input.classId));
      return { success: true };
    }),
});
