/**
 * tRPC Router para Presença com QR Code
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { attendance } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notifyAttendanceCheckIn } from "../_core/attendanceNotifications";
import {
  generateQRCodeToken,
  validateQRCodeToken,
  isWithinClassroomRadius,
  isWithinClassHours,
  generateQRCodeImageUrl,
  QRCodeData,
} from "../_core/attendanceQRCode";

// Armazenar tokens de QR code em memória (em produção, usar Redis ou DB)
const activeQRCodes = new Map<string, QRCodeData>();

export const attendanceRouter = router({
  /**
   * Professor: Gerar QR code para a aula de hoje
   */
  generateQRCode: publicProcedure
    .input(
      z.object({
        classId: z.number(),
        classDate: z.string(), // "YYYY-MM-DD"
        sessionToken: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Gerar token único
        const qrData = generateQRCodeToken(input.classId, input.classDate);

        // Armazenar token
        activeQRCodes.set(qrData.token, qrData);

        // Gerar URL da imagem QR code
        const qrImageUrl = generateQRCodeImageUrl(qrData.token, input.classDate);

        return {
          success: true,
          token: qrData.token,
          qrImageUrl,
          expiresAt: new Date(qrData.expiresAt),
          message: "QR code gerado com sucesso",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar QR code",
        });
      }
    }),

  /**
   * Aluno: Registrar presença via QR code
   */
  checkInWithQRCode: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        classDate: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Validar token
        const storedQRData = activeQRCodes.get(input.token);
        if (!storedQRData) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "QR code não encontrado ou inválido",
          });
        }

        const validation = validateQRCodeToken(input.token, storedQRData);
        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.error || "QR code inválido",
          });
        }

        // Validar horário de aula
        const now = new Date();
        const hourValidation = isWithinClassHours(now);
        if (!hourValidation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: hourValidation.error || "Fora do horário de aula",
          });
        }

        // Validar localização (se fornecida)
        let distanceMeters: number | null = null;
        let status: "valid" | "invalid" | "manual" = "valid";

        if (input.latitude !== undefined && input.longitude !== undefined) {
          const locationCheck = isWithinClassroomRadius(
            input.latitude,
            input.longitude
          );
          distanceMeters = locationCheck.distanceMeters;
          status = locationCheck.valid ? "valid" : "invalid";
        }

        // Verificar se já tem presença registrada hoje
        const existingAttendance = await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.studentAccountId, ctx.user.id),
              eq(attendance.classDate, input.classDate)
            )
          )
          .limit(1);

        if (existingAttendance.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Presença já registrada para este dia",
          });
        }

        // Registrar presença
        const week = getWeekNumber(new Date(input.classDate));
        const result = await db.insert(attendance).values({
          studentAccountId: ctx.user.id,
          memberId: 0,
          week,
          classDate: input.classDate,
          latitude: input.latitude ? String(input.latitude) : null,
          longitude: input.longitude ? String(input.longitude) : null,
          distanceMeters: distanceMeters ? String(distanceMeters) : null,
          status,
          note: status === "invalid" ? "Fora da sala de aula" : null,
        });

        // Enviar notificação
        try {
          await notifyAttendanceCheckIn(
            ctx.user.email || "Aluno",
            "Farmacologia 1",
            input.classDate,
            status
          );
        } catch (notificationError) {
          console.error("Erro ao enviar notificação:", notificationError);
        }

        return {
          success: true,
          status,
          message:
            status === "valid"
              ? "Presença registrada com sucesso!"
              : "Presença registrada, mas você estava fora da sala",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao registrar presença",
        });
      }
    }),

  /**
   * Aluno: Listar histórico de presenças
   */
  getMyAttendance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const records = await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentAccountId, ctx.user.id))
        .orderBy(attendance.classDate);

      return {
        success: true,
        total: records.length,
        attendance: records.map((record) => ({
          id: record.id,
          classDate: record.classDate,
          week: record.week,
          checkedInAt: record.checkedInAt,
          status: record.status,
          distanceMeters: record.distanceMeters
            ? parseFloat(String(record.distanceMeters))
            : null,
          note: record.note,
        })),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao buscar histórico de presença",
      });
    }
  }),

  /**
   * Professor: Listar presenças de uma turma em um dia
   */
  getClassAttendance: publicProcedure
    .input(
      z.object({
        classDate: z.string(),
        classId: z.number(),
        sessionToken: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const records = await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.classDate, input.classDate)
            )
          );

        const validCount = records.filter((r) => r.status === "valid").length;
        const invalidCount = records.filter((r) => r.status === "invalid").length;

        return {
          success: true,
          total: records.length,
          validCount,
          invalidCount,
          attendance: records,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar presença da turma",
        });
      }
    }),

  /**
   * Professor: Registrar presença manualmente
   */
  manualCheckIn: publicProcedure
    .input(
      z.object({
        studentAccountId: z.number(),
        classDate: z.string(),
        note: z.string().optional(),
        sessionToken: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verificar se já tem presença registrada
        const existing = await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.studentAccountId, input.studentAccountId),
              eq(attendance.classDate, input.classDate)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Presença já registrada para este aluno neste dia",
          });
        }

        const week = getWeekNumber(new Date(input.classDate));
        await db.insert(attendance).values({
          studentAccountId: input.studentAccountId,
          memberId: 0,
          week,
          classDate: input.classDate,
          status: "manual",
          note: input.note || "Registrado manualmente pelo professor",
        });

        return {
          success: true,
          message: "Presença registrada manualmente",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao registrar presença manualmente",
        });
      }
    }),
});

/**
 * Calcular número da semana do ano
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
