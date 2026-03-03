import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  qrCodeSessions,
  attendanceRecords,
  attendanceSummary,
  members,
  teams,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";

// ═══════ TOKEN CONFIGURATION ═══════
const TOKEN_VALIDITY_MINUTES = 10;
const TOKEN_SECRET = process.env.JWT_SECRET || "qrcode-attendance-secret-key";

/**
 * Generate a rotating HMAC token for a QR Code session
 * Token = HMAC-SHA256(sessionId + rotationCount + timestamp, secret)
 */
function generateRotatingToken(sessionId: number, rotationCount: number): {
  token: string;
  expiresAt: Date;
} {
  const timestamp = Date.now();
  const payload = `${sessionId}:${rotationCount}:${timestamp}`;
  const token = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("hex")
    .substring(0, 32); // 32 char token for QR readability

  const expiresAt = new Date(timestamp + TOKEN_VALIDITY_MINUTES * 60 * 1000);

  return { token, expiresAt };
}

/**
 * Validate a token against the session's current token
 */
function isTokenValid(
  sessionToken: string | null,
  providedToken: string,
  tokenExpiresAt: Date | null
): boolean {
  if (!sessionToken || !tokenExpiresAt) return false;
  if (sessionToken !== providedToken) return false;
  // Tolerância de 30 segundos após expiração para evitar falhas no limite do tempo
  const GRACE_PERIOD_MS = 30_000;
  const now = new Date();
  const expiresWithGrace = new Date(tokenExpiresAt.getTime() + GRACE_PERIOD_MS);
  if (now > expiresWithGrace) return false;
  return true;
}

export const qrcodeRouter = router({
  /**
   * Criar nova sessão de QR Code com token rotativo
   * Professor define dia da semana e horário
   */
  createSession: protectedProcedure
    .input(
      z.object({
        classId: z.number(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const teacherId = ctx.user?.id || 0;

      // Generate initial rotating token
      const { token, expiresAt } = generateRotatingToken(0, 0);

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
          currentToken: token,
          tokenExpiresAt: expiresAt,
          tokenRotationCount: 0,
        })
        .catch((err) => {
          console.error("Erro ao criar sessão QR Code:", err);
          throw err;
        });

      // Get the inserted ID
      const insertedId = (result as any)[0]?.insertId || (result as any).insertId;

      return {
        success: true,
        sessionId: insertedId,
        qrCodeData,
        token,
        tokenExpiresAt: expiresAt.toISOString(),
      };
    }),

  /**
   * Gerar novo token rotativo para uma sessão ativa
   * Chamado automaticamente a cada 10 minutos pelo frontend
   */
  rotateToken: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get current session
      const session = await db
        .select()
        .from(qrCodeSessions)
        .where(eq(qrCodeSessions.id, input.sessionId));

      if (!session || session.length === 0) {
        throw new Error("Sessão não encontrada");
      }

      if (!session[0].isActive) {
        throw new Error("Sessão não está ativa");
      }

      const newRotationCount = (session[0].tokenRotationCount || 0) + 1;
      const { token, expiresAt } = generateRotatingToken(
        input.sessionId,
        newRotationCount
      );

      // Update session with new token
      await db
        .update(qrCodeSessions)
        .set({
          currentToken: token,
          tokenExpiresAt: expiresAt,
          tokenRotationCount: newRotationCount,
        })
        .where(eq(qrCodeSessions.id, input.sessionId));

      return {
        success: true,
        token,
        tokenExpiresAt: expiresAt.toISOString(),
        rotationCount: newRotationCount,
      };
    }),

  /**
   * Obter token atual e tempo restante de uma sessão
   */
  getCurrentToken: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const session = await db
        .select()
        .from(qrCodeSessions)
        .where(eq(qrCodeSessions.id, input.sessionId));

      if (!session || session.length === 0) {
        throw new Error("Sessão não encontrada");
      }

      const s = session[0];
      const now = new Date();
      const isExpired = s.tokenExpiresAt ? now > s.tokenExpiresAt : true;
      const remainingMs = s.tokenExpiresAt
        ? Math.max(0, s.tokenExpiresAt.getTime() - now.getTime())
        : 0;

      return {
        token: s.currentToken,
        tokenExpiresAt: s.tokenExpiresAt?.toISOString() || null,
        isExpired,
        remainingSeconds: Math.floor(remainingMs / 1000),
        rotationCount: s.tokenRotationCount,
        isActive: s.isActive,
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
        .where(eq(qrCodeSessions.classId, input.classId))
        .orderBy(desc(qrCodeSessions.createdAt));

      return sessions.map((session) => ({
        ...session,
        qrCodeData: session.qrCodeData ? JSON.parse(session.qrCodeData) : null,
        tokenExpiresAt: session.tokenExpiresAt?.toISOString() || null,
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
   * Registrar presença via QR Code com validação de token rotativo
   * Aluno escaneia o QR Code e registra presença
   */
  checkIn: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        memberId: z.number(),
        classId: z.number(),
        token: z.string().min(1), // Token rotativo obrigatório
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se a sessão existe e está ativa
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

      // ═══════ VALIDAR TOKEN ROTATIVO ═══════
      const tokenValid = isTokenValid(
        session[0].currentToken,
        input.token,
        session[0].tokenExpiresAt
      );

      if (!tokenValid) {
        // Check if token is expired vs wrong
        if (
          session[0].tokenExpiresAt &&
          new Date() > session[0].tokenExpiresAt
        ) {
          throw new Error(
            "QR Code expirado. Peça ao professor para gerar um novo QR Code."
          );
        }
        throw new Error(
          "Token inválido. Escaneie o QR Code atualizado na tela do professor."
        );
      }

      // Permitir check-in a qualquer hora e dia (sem restrições)
      // O professor controla quando o QR code está ativo

      // Verificar se aluno já registrou presença nesta sessão
      const existingRecord = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.qrCodeSessionId, input.sessionId),
            eq(attendanceRecords.memberId, input.memberId)
          )
        );

      if (existingRecord.length > 0) {
        return {
          success: true,
          message: "Presença já registrada anteriormente!",
          alreadyCheckedIn: true,
        };
      }

      // Registrar presença
      await db
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

      return {
        success: true,
        message: "Presença registrada com sucesso!",
        alreadyCheckedIn: false,
      };
    }),

  /**
   * Contar check-ins de uma sessão (para exibir no projetor)
   */
  getSessionCheckInCount: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const records = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.qrCodeSessionId, input.sessionId));

      return {
        count: records.length,
        records: records.map((r) => ({
          memberId: r.memberId,
          checkedInAt: r.checkedInAt,
        })),
      };
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
   * Obter relatório detalhado de presença da turma por sessão
   * Inclui dados de cada sessão com lista de presentes/ausentes
   */
  getDetailedAttendanceReport: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all sessions for this class
      const sessions = await db
        .select()
        .from(qrCodeSessions)
        .where(eq(qrCodeSessions.classId, input.classId))
        .orderBy(desc(qrCodeSessions.createdAt));

      // Get all members for this class
      const allMembers = await db
        .select()
        .from(members)
        .where(eq(members.classId, input.classId));

      // Get all attendance records for this class
      const allRecords = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.classId, input.classId));

      // Get team info
      const allTeams = await db.select().from(teams);
      const teamMap = new Map(allTeams.map((t) => [t.id, t]));

      // Build report per session
      const sessionReports = sessions.map((session) => {
        const sessionRecords = allRecords.filter(
          (r) => r.qrCodeSessionId === session.id
        );
        const presentMemberIds = new Set(sessionRecords.map((r) => r.memberId));

        const presentMembers = allMembers
          .filter((m) => presentMemberIds.has(m.id))
          .map((m) => ({
            id: m.id,
            name: m.name,
            teamName: teamMap.get(m.teamId || 0)?.name || "Sem equipe",
            checkedInAt: sessionRecords.find((r) => r.memberId === m.id)
              ?.checkedInAt,
          }));

        const absentMembers = allMembers
          .filter((m) => !presentMemberIds.has(m.id))
          .map((m) => ({
            id: m.id,
            name: m.name,
            teamName: teamMap.get(m.teamId || 0)?.name || "Sem equipe",
          }));

        const DAYS = [
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ];

        return {
          sessionId: session.id,
          date: session.createdAt,
          dayOfWeek: DAYS[session.dayOfWeek] || "Desconhecido",
          startTime: session.startTime,
          endTime: session.endTime,
          totalStudents: allMembers.length,
          presentCount: presentMembers.length,
          absentCount: absentMembers.length,
          attendanceRate:
            allMembers.length > 0
              ? ((presentMembers.length / allMembers.length) * 100).toFixed(1)
              : "0.0",
          presentMembers,
          absentMembers,
        };
      });

      // Build summary per student
      const studentSummaries = allMembers.map((member) => {
        const memberRecords = allRecords.filter(
          (r) => r.memberId === member.id
        );
        const presentCount = memberRecords.length;
        const totalSessions = sessions.length;
        const absentCount = totalSessions - presentCount;
        const percentage =
          totalSessions > 0
            ? ((presentCount / totalSessions) * 100).toFixed(1)
            : "0.0";

        return {
          memberId: member.id,
          name: member.name,
          teamName: teamMap.get(member.teamId || 0)?.name || "Sem equipe",
          totalSessions,
          presentCount,
          absentCount,
          attendancePercentage: percentage,
        };
      });

      return {
        sessions: sessionReports,
        studentSummaries: studentSummaries.sort(
          (a, b) => parseFloat(b.attendancePercentage) - parseFloat(a.attendancePercentage)
        ),
        totalSessions: sessions.length,
        totalStudents: allMembers.length,
      };
    }),

  /**
   * Exportar relatório de presença em CSV
   */
  exportAttendanceCSV: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all sessions
      const sessions = await db
        .select()
        .from(qrCodeSessions)
        .where(eq(qrCodeSessions.classId, input.classId))
        .orderBy(qrCodeSessions.createdAt);

      // Get all members
      const allMembers = await db
        .select()
        .from(members)
        .where(eq(members.classId, input.classId));

      // Get all records
      const allRecords = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.classId, input.classId));

      // Get teams
      const allTeams = await db.select().from(teams);
      const teamMap = new Map(allTeams.map((t) => [t.id, t]));

      const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

      // Build CSV headers: Nome, Equipe, Sessão1, Sessão2, ..., Total, Percentual
      const sessionHeaders = sessions.map((s, i) => {
        const date = s.createdAt
          ? new Date(s.createdAt).toLocaleDateString("pt-BR")
          : `Sessão ${i + 1}`;
        return `${DAYS[s.dayOfWeek]} ${date}`;
      });

      const headers = [
        "Nome do Aluno",
        "Equipe",
        ...sessionHeaders,
        "Presenças",
        "Faltas",
        "Total Sessões",
        "Percentual (%)",
      ];

      // Build rows
      const rows = allMembers
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((member) => {
          const memberRecords = allRecords.filter(
            (r) => r.memberId === member.id
          );
          const presentSessionIds = new Set(
            memberRecords.map((r) => r.qrCodeSessionId)
          );

          const sessionCells = sessions.map((s) =>
            presentSessionIds.has(s.id) ? "P" : "F"
          );

          const presentCount = memberRecords.length;
          const totalSessions = sessions.length;
          const absentCount = totalSessions - presentCount;
          const percentage =
            totalSessions > 0
              ? ((presentCount / totalSessions) * 100).toFixed(1)
              : "0.0";

          return [
            `"${member.name}"`,
            `"${teamMap.get(member.teamId || 0)?.name || "Sem equipe"}"`,
            ...sessionCells,
            presentCount,
            absentCount,
            totalSessions,
            percentage,
          ];
        });

      const csv = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      return {
        csv,
        filename: `relatorio_presenca_turma_${input.classId}_${new Date().toISOString().split("T")[0]}.csv`,
      };
    }),

  /**
   * Obter relatório de presença da turma (resumo)
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

      const report = await Promise.all(
        summaries.map(
          async (summary: typeof attendanceSummary.$inferSelect) => {
            const member = await db
              .select()
              .from(members)
              .where(eq(members.id, summary.memberId));

            return {
              ...summary,
              studentName: member[0]?.name || "Desconhecido",
            };
          }
        )
      );

      return report;
    }),

  /**
   * Verificar se existe alguma sessão de QR Code ativa (para badge no botão Presença)
   */
  hasActiveSession: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { hasActive: false };
    const activeSessions = await db
      .select({ id: qrCodeSessions.id })
      .from(qrCodeSessions)
      .where(eq(qrCodeSessions.isActive, true))
      .limit(1);
    return { hasActive: activeSessions.length > 0 };
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
   * Obter check-ins recentes com nome do aluno para feedback visual no projetor
   */
  getRecentCheckIns: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get total count for change detection
      const allRecords = await db
        .select({ id: attendanceRecords.id })
        .from(attendanceRecords)
        .where(eq(attendanceRecords.qrCodeSessionId, input.sessionId));

      const records = await db
        .select({
          id: attendanceRecords.id,
          memberId: attendanceRecords.memberId,
          checkedInAt: attendanceRecords.checkedInAt,
          memberName: members.name,
        })
        .from(attendanceRecords)
        .leftJoin(members, eq(attendanceRecords.memberId, members.id))
        .where(eq(attendanceRecords.qrCodeSessionId, input.sessionId))
        .orderBy(desc(attendanceRecords.checkedInAt))
        .limit(input.limit);

      const cleanName = (raw: string | null) => {
        if (!raw) return "Aluno";
        const parts = raw.split("\t");
        if (parts.length >= 2) return parts[1].trim();
        return raw.trim();
      };

      return {
        count: allRecords.length, // total count for change detection
        recent: records.map((r) => ({
          id: r.id,
          memberId: r.memberId,
          name: cleanName(r.memberName),
          checkedInAt: r.checkedInAt,
        })),
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

  const sessions = await db
    .select()
    .from(qrCodeSessions)
    .where(eq(qrCodeSessions.classId, classId));

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
