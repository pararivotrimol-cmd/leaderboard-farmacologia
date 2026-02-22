import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  qrCodeSessions,
  attendanceRecords,
  attendanceSummary,
  members,
} from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export const qrcodeRouter = router({
  /**
   * Criar nova sessão de QR Code
   * Professor define dia da semana e horário
   */
  createSession: protectedProcedure
    .input(
      z.object({
        classId: z.number(),
        dayOfWeek: z.number().min(0).max(6), // 0-6
        startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
        endTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
      })
    )
    .mutation(async ({ input, ctx }) => {
      const teacherId = ctx.user?.id || 0;

      // Gerar dados para QR Code
      const qrCodeData = {
        classId: input.classId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        timestamp: Date.now(),
        sessionId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db
        .insert(qrCodeSessions)
        .values({
          classId: input.classId,
          teacherId,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          isActive: true,
          qrCodeData: JSON.stringify(qrCodeData),
        })
        .catch((err) => {
          console.error("Erro ao criar sessão QR Code:", err);
          throw err;
        });

      return {
        success: true,
        sessionId: qrCodeData.sessionId,
        qrCodeData,
      };
    }),

  /**
   * Listar sessões de QR Code de uma turma
   */
  getSessionsByClass: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const sessions = await db
        .select()
        .from(qrCodeSessions)
        .where(eq(qrCodeSessions.classId, input.classId));

      return sessions.map((session) => ({
        ...session,
        qrCodeData: session.qrCodeData ? JSON.parse(session.qrCodeData) : null,
      }));
    }),

  /**
   * Ativar/desativar sessão de QR Code
   */
  toggleSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(qrCodeSessions)
        .set({ isActive: input.isActive })
        .where(eq(qrCodeSessions.id, input.sessionId));

      return { success: true };
    }),

  /**
   * Deletar sessão de QR Code
   */
  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(qrCodeSessions)
        .where(eq(qrCodeSessions.id, input.sessionId));

      return { success: true };
    }),

  /**
   * Registrar presença via QR Code
   * Aluno escaneia o QR Code e registra presença
   */
  checkIn: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        memberId: z.number(),
        classId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Verificar se a sessão existe e está ativa
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const session = await db
        .select()
        .from(qrCodeSessions)
        .where(eq(qrCodeSessions.id, input.sessionId));

      if (!session || session.length === 0) {
        throw new Error("Sessão de QR Code não encontrada");
      }

      if (!session[0].isActive) {
        throw new Error("Sessão de QR Code não está ativa");
      }

      // Verificar horário
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const currentDay = now.getDay();

      if (
        currentDay !== session[0].dayOfWeek ||
        currentTime < session[0].startTime ||
        currentTime > session[0].endTime
      ) {
        throw new Error("Fora do horário de presença");
      }

      // Registrar presença
      const result = await db!
        .insert(attendanceRecords)
        .values({
          qrCodeSessionId: input.sessionId,
          memberId: input.memberId,
          classId: input.classId,
          isValid: true,
        })
        .catch((err: any) => {
          console.error("Erro ao registrar presença:", err);
          throw err;
        });

      // Atualizar resumo de presença
      await updateAttendanceSummary(input.memberId, input.classId);

      return { success: true, message: "Presença registrada com sucesso!" };
    }),

  /**
   * Obter histórico de presença de um aluno
   */
  getStudentAttendance: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        classId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const records = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.memberId, input.memberId),
            eq(attendanceRecords.classId, input.classId)
          )
        );

      const summary = await db
        .select()
        .from(attendanceSummary)
        .where(
          and(
            eq(attendanceSummary.memberId, input.memberId),
            eq(attendanceSummary.classId, input.classId)
          )
        );

      return {
        records,
        summary: summary[0] || null,
      };
    }),

  /**
   * Obter relatório de presença da turma
   */
  getClassAttendanceReport: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const summaries = await db
        .select()
        .from(attendanceSummary)
        .where(eq(attendanceSummary.classId, input.classId));

      // Enriquecer com dados do aluno
      const report = await Promise.all(
        summaries.map(async (summary: typeof attendanceSummary.$inferSelect) => {
          const member = await db
            .select()
            .from(members)
            .where(eq(members.id, summary.memberId));

          return {
            ...summary,
            studentName: member[0]?.name || "Desconhecido",
          };
        })
      );

      return report;
    }),

  /**
   * Validar/invalidar presença (professor)
   */
  validateAttendance: protectedProcedure
    .input(
      z.object({
        recordId: z.number(),
        isValid: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(attendanceRecords)
        .set({
          isValid: input.isValid,
          validationNotes: input.notes || null,
        })
        .where(eq(attendanceRecords.id, input.recordId));

      // Atualizar resumo
      const record = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.id, input.recordId));

      if (record[0]) {
        await updateAttendanceSummary(record[0].memberId, record[0].classId);
      }

      return { success: true };
    }),

  /**
   * Exportar relatório de presença em CSV
   */
  exportAttendanceReport: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const summaries = await db
        .select()
        .from(attendanceSummary)
        .where(eq(attendanceSummary.classId, input.classId));

      // Enriquecer com dados do aluno
      const enrichedReport = await Promise.all(
        summaries.map(async (summary: typeof attendanceSummary.$inferSelect) => {
          const member = await db
            .select()
            .from(members)
            .where(eq(members.id, summary.memberId));

          return {
            studentName: member[0]?.name || "Desconhecido",
            totalSessions: summary.totalSessions,
            presentSessions: summary.presentSessions,
            absentSessions: summary.absentSessions,
            attendancePercentage: summary.attendancePercentage,
          };
        })
      );

      // Gerar CSV
      const headers = [
        "Nome do Aluno",
        "Total de Sessões",
        "Presenças",
        "Ausências",
        "Percentual",
      ];
      const rows = enrichedReport.map((r: any) => [
        r.studentName,
        r.totalSessions,
        r.presentSessions,
        r.absentSessions,
        `${r.attendancePercentage}%`,
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((row: any) => row.join(",")),
      ].join("\n");

      return {
        csv,
        filename: `attendance_report_${input.classId}_${Date.now()}.csv`,
      };
    }),
});

/**
 * Helper function para atualizar resumo de presença
 */
async function updateAttendanceSummary(
  memberId: number,
  classId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Contar sessões totais
  const sessions = await db
    .select()
    .from(qrCodeSessions)
    .where(eq(qrCodeSessions.classId, classId));

  // Contar presenças válidas
  const presentRecords = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.memberId, memberId),
        eq(attendanceRecords.classId, classId),
        eq(attendanceRecords.isValid, true)
      )
    );

  const totalSessions = sessions.length;
  const presentSessions = presentRecords.length;
  const absentSessions = totalSessions - presentSessions;
  const attendancePercentage =
    totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

  // Atualizar ou criar resumo
  const existing = await db
    .select()
    .from(attendanceSummary)
    .where(
      and(
        eq(attendanceSummary.memberId, memberId),
        eq(attendanceSummary.classId, classId)
      )
    );

  if (existing.length > 0) {
    await db
      .update(attendanceSummary)
      .set({
        totalSessions,
        presentSessions,
        absentSessions,
        attendancePercentage: attendancePercentage.toFixed(2),
      })
      .where(
        and(
          eq(attendanceSummary.memberId, memberId),
          eq(attendanceSummary.classId, classId)
        )
      );
  } else {
    await db.insert(attendanceSummary).values({
      memberId,
      classId,
      totalSessions,
      presentSessions,
      absentSessions,
      attendancePercentage: attendancePercentage.toFixed(2),
    });
  }
}
