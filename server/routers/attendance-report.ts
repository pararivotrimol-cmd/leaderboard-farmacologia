import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { attendance, members, classes } from "../../drizzle/schema";
import { eq, gte, lte, desc, and as drizzleAnd } from "drizzle-orm";

const and = drizzleAnd;

export const attendanceReportRouter = router({
  /**
   * Buscar frequência de todos os alunos de uma turma
   * Retorna: lista de alunos com taxa de frequência, status de risco, etc.
   */
  getClassAttendanceReport: adminProcedure
    .input(
      z.object({
        classId: z.string(),
        startWeek: z.number().optional(),
        endWeek: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const classIdNum = parseInt(input.classId);

      // Buscar todos os membros da turma
      const classMembers = await db
        .select()
        .from(members)
        .where(eq(members.classId, classIdNum));

      if (classMembers.length === 0) {
        return {
          totalStudents: 0,
          attendanceData: [],
          statistics: {
            averageAttendance: 0,
            atRiskCount: 0,
            excellentCount: 0,
          },
        };
      }

      // Buscar registros de presença
      const whereConditions: any[] = [];
      if (input.startWeek !== undefined && input.endWeek !== undefined) {
        whereConditions.push(gte(attendance.week, input.startWeek));
        whereConditions.push(lte(attendance.week, input.endWeek));
      }

      const attendanceRecords = await db
        .select()
        .from(attendance)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      // Agrupar presenças por aluno
      const attendanceByStudent = new Map<
        string,
        { present: number; total: number; status: string[] }
      >();

      classMembers.forEach((member: any) => {
        attendanceByStudent.set(String(member.id), {
          present: 0,
          total: 0,
          status: [],
        });
      });

      // Contar presenças por aluno
      attendanceRecords.forEach((record: any) => {
        const studentId = String(record.studentAccountId);
        const studentData = attendanceByStudent.get(studentId);
        if (studentData) {
          studentData.total++;
          if (record.status === "present" || record.status === "valid") {
            studentData.present++;
          }
          studentData.status.push(record.status || "unknown");
        }
      });

      // Calcular taxa de frequência e preparar dados
      const attendanceData = classMembers.map((member: any) => {
        const data = attendanceByStudent.get(String(member.id)) || {
          present: 0,
          total: 0,
          status: [],
        };

        const attendanceRate =
          data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
        const isAtRisk = attendanceRate < 75;
        const isExcellent = attendanceRate >= 90;

        return {
          memberId: String(member.id),
          studentName: member.name || "Aluno",
          studentEmail: member.email || "N/A",
          attendanceRate,
          presentDays: data.present,
          totalDays: data.total,
          isAtRisk,
          isExcellent,
          lastAttendance: data.status[data.status.length - 1] || "none",
        };
      });

      // Calcular estatísticas
      const atRiskCount = attendanceData.filter((d: any) => d.isAtRisk).length;
      const excellentCount = attendanceData.filter((d: any) => d.isExcellent).length;
      const averageAttendance = Math.round(
        attendanceData.reduce((sum: number, d: any) => sum + d.attendanceRate, 0) /
          attendanceData.length
      );

      return {
        totalStudents: classMembers.length,
        attendanceData: attendanceData.sort((a: any, b: any) =>
          a.attendanceRate === b.attendanceRate
            ? a.studentName.localeCompare(b.studentName)
            : a.attendanceRate - b.attendanceRate
        ),
        statistics: {
          averageAttendance,
          atRiskCount,
          excellentCount,
        },
      };
    }),

  /**
   * Buscar frequência de um aluno específico
   */
  getStudentAttendanceReport: protectedProcedure
    .input(
      z.object({
        studentId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const studentId = input.studentId || String(ctx.user.id);
      const studentIdNum = parseInt(studentId);

      // Buscar registros de presença do aluno
      const records = await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentAccountId, studentIdNum))
        .orderBy(desc(attendance.classDate));

      // Calcular estatísticas
      const totalDays = records.length;
      const presentDays = records.filter(
        (r: any) => r.status === "present" || r.status === "valid"
      ).length;
      const attendanceRate =
        totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      // Agrupar por semana
      const byWeek = new Map<
        number,
        { present: number; total: number; status: string[] }
      >();

      records.forEach((record: any) => {
        const week = record.week || 0;
        if (!byWeek.has(week)) {
          byWeek.set(week, { present: 0, total: 0, status: [] });
        }

        const weekData = byWeek.get(week)!;
        weekData.total++;
        if (record.status === "present" || record.status === "valid") {
          weekData.present++;
        }
        weekData.status.push(record.status || "unknown");
      });

      return {
        studentId,
        totalDays,
        presentDays,
        attendanceRate,
        isAtRisk: attendanceRate < 75,
        isExcellent: attendanceRate >= 90,
        records: records.map((r: any) => ({
          ...r,
          studentAccountId: String(r.studentAccountId),
        })),
        byWeek: Object.fromEntries(byWeek),
      };
    }),
});

