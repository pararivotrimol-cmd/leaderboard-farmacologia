import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { auditLog } from "../../drizzle/schema";
import { desc, and, eq, gte, lte, like } from "drizzle-orm";

export const auditRouter = router({
  // Get all audit logs with optional filters
  getLogs: protectedProcedure
    .input(
      z.object({
        action: z.string().optional(),
        teacherEmail: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        searchTerm: z.string().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // Build filter conditions
      const conditions = [];

      if (input.action && input.action !== "all") {
        conditions.push(eq(auditLog.action, input.action));
      }

      if (input.teacherEmail && input.teacherEmail !== "all") {
        conditions.push(eq(auditLog.teacherEmail, input.teacherEmail));
      }

      if (input.startDate) {
        conditions.push(gte(auditLog.createdAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(auditLog.createdAt, input.endDate));
      }

      if (input.searchTerm) {
        conditions.push(
          like(auditLog.teacherName, `%${input.searchTerm}%`)
        );
      }

      // Query logs
      const logs = await db
        .select()
        .from(auditLog)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(auditLog.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return logs.map(log => ({
        id: log.id,
        teacherName: log.teacherName,
        teacherEmail: log.teacherEmail,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.details ? JSON.parse(log.details) : null,
        createdAt: log.createdAt,
      }));
    }),

  // Get unique teachers for filter dropdown
  getTeachers: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const teachers = await db
      .selectDistinct({
        email: auditLog.teacherEmail,
        name: auditLog.teacherName,
      })
      .from(auditLog)
      .orderBy(auditLog.teacherName);

    return teachers;
  }),

  // Get unique actions for filter dropdown
  getActions: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const actions = await db
      .selectDistinct({
        action: auditLog.action,
      })
      .from(auditLog)
      .orderBy(auditLog.action);

    return actions.map(a => a.action);
  }),

  // Get audit log statistics
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalLogs: 0, logsLast24h: 0, activeTeachers: 0 };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Total logs
    const totalLogsResult = await db
      .select({ count: auditLog.id })
      .from(auditLog);

    // Logs in last 24 hours
    const logsLast24hResult = await db
      .select({ count: auditLog.id })
      .from(auditLog)
      .where(gte(auditLog.createdAt, oneDayAgo));

    // Active teachers
    const activeTeachersResult = await db
      .selectDistinct({
        email: auditLog.teacherEmail,
      })
      .from(auditLog)
      .where(gte(auditLog.createdAt, oneDayAgo));

    return {
      totalLogs: totalLogsResult[0]?.count || 0,
      logsLast24h: logsLast24hResult[0]?.count || 0,
      activeTeachers: activeTeachersResult.length,
    };
  }),
});
