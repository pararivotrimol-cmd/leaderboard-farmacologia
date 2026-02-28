/**
 * Schedule Router — Gerenciamento do Cronograma do Semestre
 * Permite que professores e admins editem o cronograma diretamente na plataforma
 * Suporta vinculação com semanas do jogo (gameWeekNumber)
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { scheduleEntries, gameWeeklyReleases } from "../../drizzle/schema";
import { eq, asc, and, isNull, or, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const scheduleEntryInput = z.object({
  weekLabel: z.string().min(1).max(50),
  weekDate: z.string().max(30).optional(),
  title: z.string().min(1).max(300),
  detail: z.string().optional(),
  type: z.enum(["aula", "tbl", "caso", "jigsaw", "prova"]),
  highlight: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  classId: z.number().int().optional(),
  isActive: z.boolean().default(true),
  gameWeekNumber: z.number().int().min(1).max(20).nullable().optional(),
});

export const scheduleRouter = router({
  /**
   * Public: list all active schedule entries with game week release status
   * Returns entries enriched with isGameWeekUnlocked and isCurrentGameWeek flags
   */
  getAll: publicProcedure
    .input(z.object({ classId: z.number().int().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Fetch active schedule entries
      const rows = await db
        .select()
        .from(scheduleEntries)
        .where(
          and(
            eq(scheduleEntries.isActive, true),
            input?.classId
              ? or(
                  eq(scheduleEntries.classId, input.classId),
                  isNull(scheduleEntries.classId)
                )
              : isNull(scheduleEntries.classId)
          )
        )
        .orderBy(asc(scheduleEntries.sortOrder), asc(scheduleEntries.id));

      // Fetch all released game weeks to enrich schedule entries
      const releasedWeeks = await db
        .select({
          weekNumber: gameWeeklyReleases.weekNumber,
          isReleased: gameWeeklyReleases.isReleased,
          releasedAt: gameWeeklyReleases.releasedAt,
        })
        .from(gameWeeklyReleases)
        .where(eq(gameWeeklyReleases.isReleased, true));

      // Build a set of released week numbers
      const releasedWeekNumbers = new Set(releasedWeeks.map(w => w.weekNumber));

      // Find the most recently released week (current game week)
      const mostRecentRelease = releasedWeeks
        .filter(w => w.releasedAt)
        .sort((a, b) => {
          const aTime = a.releasedAt ? new Date(a.releasedAt).getTime() : 0;
          const bTime = b.releasedAt ? new Date(b.releasedAt).getTime() : 0;
          return bTime - aTime;
        })[0];

      const currentGameWeekNumber = mostRecentRelease?.weekNumber ?? null;

      // Enrich entries with game week status
      return rows.map(entry => ({
        ...entry,
        isGameWeekUnlocked: entry.gameWeekNumber != null
          ? releasedWeekNumbers.has(entry.gameWeekNumber)
          : null,
        isCurrentGameWeek: entry.gameWeekNumber != null
          ? entry.gameWeekNumber === currentGameWeekNumber
          : false,
      }));
    }),

  /**
   * Admin/Professor: list all entries including inactive ones, with game week info
   */
  getAllAdmin: protectedProcedure
    .input(z.object({ classId: z.number().int().optional() }).optional())
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar esta rota." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db
        .select()
        .from(scheduleEntries)
        .orderBy(asc(scheduleEntries.sortOrder), asc(scheduleEntries.id));

      // Also fetch all game weeks (released and unreleased) for admin view
      const allGameWeeks = await db
        .select({
          weekNumber: gameWeeklyReleases.weekNumber,
          isReleased: gameWeeklyReleases.isReleased,
          title: gameWeeklyReleases.title,
        })
        .from(gameWeeklyReleases)
        .orderBy(asc(gameWeeklyReleases.weekNumber));

      const gameWeekMap = new Map(allGameWeeks.map(w => [w.weekNumber, w]));

      return rows.map(entry => ({
        ...entry,
        gameWeekInfo: entry.gameWeekNumber != null
          ? (gameWeekMap.get(entry.gameWeekNumber) ?? null)
          : null,
      }));
    }),

  /**
   * Public: get available game weeks for linking (for admin selector)
   */
  getGameWeeks: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar esta rota." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const weeks = await db
        .select({
          id: gameWeeklyReleases.id,
          weekNumber: gameWeeklyReleases.weekNumber,
          title: gameWeeklyReleases.title,
          isReleased: gameWeeklyReleases.isReleased,
        })
        .from(gameWeeklyReleases)
        .orderBy(asc(gameWeeklyReleases.weekNumber));

      return weeks;
    }),

  /**
   * Admin/Professor: create a new schedule entry
   */
  create: protectedProcedure
    .input(scheduleEntryInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem criar entradas no cronograma." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [result] = await db.insert(scheduleEntries).values({
        ...input,
        classId: input.classId ?? null,
        weekDate: input.weekDate ?? null,
        detail: input.detail ?? null,
        gameWeekNumber: input.gameWeekNumber ?? null,
        createdBy: ctx.user.id,
      });
      const id = (result as any).insertId;
      const [row] = await db
        .select()
        .from(scheduleEntries)
        .where(eq(scheduleEntries.id, id));
      return row;
    }),

  /**
   * Admin/Professor: update an existing schedule entry
   */
  update: protectedProcedure
    .input(z.object({ id: z.number().int() }).merge(scheduleEntryInput.partial()))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem editar o cronograma." });
      }
      const { id, ...data } = input;
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db
        .update(scheduleEntries)
        .set({
          ...data,
          ...(data.classId !== undefined ? { classId: data.classId ?? null } : {}),
          ...(data.weekDate !== undefined ? { weekDate: data.weekDate ?? null } : {}),
          ...(data.detail !== undefined ? { detail: data.detail ?? null } : {}),
          ...(data.gameWeekNumber !== undefined ? { gameWeekNumber: data.gameWeekNumber ?? null } : {}),
        })
        .where(eq(scheduleEntries.id, id));
      const [row] = await db
        .select()
        .from(scheduleEntries)
        .where(eq(scheduleEntries.id, id));
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Entrada não encontrada." });
      return row;
    }),

  /**
   * Admin/Professor: delete a schedule entry
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem remover entradas do cronograma." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.delete(scheduleEntries).where(eq(scheduleEntries.id, input.id));
      return { success: true };
    }),

  /**
   * Admin/Professor: reorder entries by providing an ordered array of IDs
   */
  reorder: protectedProcedure
    .input(z.object({ orderedIds: z.array(z.number().int()) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem reordenar o cronograma." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      for (let i = 0; i < input.orderedIds.length; i++) {
        await db
          .update(scheduleEntries)
          .set({ sortOrder: i + 1 })
          .where(eq(scheduleEntries.id, input.orderedIds[i]));
      }
      return { success: true };
    }),
});
