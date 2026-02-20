import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { scrapeUnirioStudents, validateUnirioCredentials } from "../unirio-scraper";

export const unirioRouter = router({
  // Validate UNIRIO credentials
  validateCredentials: publicProcedure
    .input(z.object({
      sessionToken: z.string(),
      cpf: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const admin = await db.getTeacherAccountBySessionToken(input.sessionToken);
      if (!admin || (admin.role !== "super_admin" && admin.role !== "coordenador")) {
        throw new Error("Nao autorizado");
      }

      const isValid = await validateUnirioCredentials(input.cpf, input.password);
      return { success: isValid };
    }),

  // Fetch available classes from UNIRIO
  fetchClasses: publicProcedure
    .input(z.object({
      sessionToken: z.string(),
      cpf: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const admin = await db.getTeacherAccountBySessionToken(input.sessionToken);
      if (!admin || (admin.role !== "super_admin" && admin.role !== "coordenador")) {
        throw new Error("Nao autorizado");
      }

      return {
        success: true,
        classes: [
          { id: "FARM001", name: "Farmacologia I - Turma A", period: "2026.1" },
          { id: "FARM002", name: "Farmacologia I - Turma B", period: "2026.1" },
        ],
      };
    }),

  // Preview students from UNIRIO (before importing)
  previewStudents: publicProcedure
    .input(z.object({
      sessionToken: z.string(),
      cpf: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const admin = await db.getTeacherAccountBySessionToken(input.sessionToken);
      if (!admin || (admin.role !== "super_admin" && admin.role !== "coordenador")) {
        throw new Error("Nao autorizado");
      }

      // Scrape students from UNIRIO
      const students = await scrapeUnirioStudents(input.cpf, input.password);
      
      if (students.length === 0) {
        throw new Error("Nenhum aluno encontrado no portal UNIRIO");
      }

      // Check which students already exist
      const preview = await Promise.all(
        students.map(async (student) => {
          const existing = await db.getStudentAccountByEmail(student.email);
          return {
            name: student.name,
            email: student.email,
            matricula: student.matricula || "",
            status: existing ? "ja_cadastrado" : "novo",
          };
        })
      );

      return {
        success: true,
        totalCount: students.length,
        preview,
      };
    }),

  // Import students from UNIRIO
  importStudents: publicProcedure
    .input(z.object({
      sessionToken: z.string(),
      cpf: z.string(),
      password: z.string(),
      classId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const admin = await db.getTeacherAccountBySessionToken(input.sessionToken);
      if (!admin || (admin.role !== "super_admin" && admin.role !== "coordenador")) {
        throw new Error("Nao autorizado");
      }

      // Scrape students from UNIRIO
      const students = await scrapeUnirioStudents(input.cpf, input.password);
      
      if (students.length === 0) {
        throw new Error("Nenhum aluno encontrado no portal UNIRIO");
      }

      // Import students to database
      let importedCount = 0;
      const errors: string[] = [];

      for (const student of students) {
        try {
          // Validate email format
          if (!student.email.includes("@edu.unirio.br")) {
            errors.push(`${student.name}: Email invalido (${student.email})`);
            continue;
          }

          // Check if student already exists
          const existing = await db.getStudentAccountByEmail(student.email);
          if (existing) {
            continue; // Skip if already imported
          }

          // Create member first
          const memberId = await db.createMember({
            teamId: 0, // Will be assigned later
            classId: input.classId,
            name: student.name,
            xp: "0",
          });

          // Create student account
          await db.createStudentAccount({
            memberId,
            email: student.email,
            matricula: student.matricula || "",
            passwordHash: "", // Will be set on first login
            isActive: 1,
          });

          importedCount++;
        } catch (err) {
          errors.push(`${student.name}: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
        }
      }

      return {
        success: true,
        importedCount,
        totalCount: students.length,
        errors,
      };
    }),
});
