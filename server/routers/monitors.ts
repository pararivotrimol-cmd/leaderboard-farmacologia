import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb, getTeacherAccountBySessionToken } from "../db";
import { studentAccounts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const monitorsRouter = router({
  // List all monitors (teacher only)
  list: publicProcedure
    .input(z.object({ teacherSessionToken: z.string() }))
    .query(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const monitors = await db
        .select({
          id: studentAccounts.id,
          email: studentAccounts.email,
          matricula: studentAccounts.matricula,
          displayName: studentAccounts.displayName,
          accountType: studentAccounts.accountType,
          isActive: studentAccounts.isActive,
          lastLoginAt: studentAccounts.lastLoginAt,
          createdAt: studentAccounts.createdAt,
        })
        .from(studentAccounts)
        .where(eq(studentAccounts.accountType, "monitor"));

      return monitors;
    }),

  // Register a new monitor (teacher only)
  register: publicProcedure
    .input(
      z.object({
        teacherSessionToken: z.string(),
        email: z.string().email(),
        matricula: z.string().min(3),
        displayName: z.string().min(2),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if email already exists
      const existing = await db
        .select({ id: studentAccounts.id })
        .from(studentAccounts)
        .where(eq(studentAccounts.email, input.email));

      if (existing.length > 0) {
        return { success: false, message: "Email já cadastrado" } as const;
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      await db.insert(studentAccounts).values({
        email: input.email,
        matricula: input.matricula,
        displayName: input.displayName,
        passwordHash,
        accountType: "monitor",
        isActive: 1,
      });

      return { success: true, message: "Monitor cadastrado com sucesso" } as const;
    }),

  // Update monitor info (teacher only)
  update: publicProcedure
    .input(
      z.object({
        teacherSessionToken: z.string(),
        monitorId: z.number(),
        displayName: z.string().min(2).optional(),
        isActive: z.number().optional(),
        newPassword: z.string().min(6).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const updates: Record<string, unknown> = {};
      if (input.displayName !== undefined) updates.displayName = input.displayName;
      if (input.isActive !== undefined) updates.isActive = input.isActive;
      if (input.newPassword) {
        updates.passwordHash = await bcrypt.hash(input.newPassword, 10);
      }

      if (Object.keys(updates).length === 0) {
        return { success: false, message: "Nenhum campo para atualizar" } as const;
      }

      await db
        .update(studentAccounts)
        .set(updates)
        .where(
          and(
            eq(studentAccounts.id, input.monitorId),
            eq(studentAccounts.accountType, "monitor")
          )
        );

      return { success: true, message: "Monitor atualizado com sucesso" } as const;
    }),

  // Remove a monitor (teacher only)
  remove: publicProcedure
    .input(
      z.object({
        teacherSessionToken: z.string(),
        monitorId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .delete(studentAccounts)
        .where(
          and(
            eq(studentAccounts.id, input.monitorId),
            eq(studentAccounts.accountType, "monitor")
          )
        );

      return { success: true, message: "Monitor removido com sucesso" } as const;
    }),

  // Monitor login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const account = await db
        .select()
        .from(studentAccounts)
        .where(
          and(
            eq(studentAccounts.email, input.email),
            eq(studentAccounts.accountType, "monitor")
          )
        )
        .limit(1);

      if (account.length === 0) {
        return { success: false, message: "Monitor não encontrado" } as const;
      }

      const monitor = account[0];

      if (!monitor.isActive) {
        return { success: false, message: "Conta desativada" } as const;
      }

      const passwordMatch = await bcrypt.compare(input.password, monitor.passwordHash);
      if (!passwordMatch) {
        return { success: false, message: "Senha incorreta" } as const;
      }

      // Generate session token
      const sessionToken = `monitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      await db
        .update(studentAccounts)
        .set({ sessionToken, lastLoginAt: new Date() })
        .where(eq(studentAccounts.id, monitor.id));

      return {
        success: true,
        sessionToken,
        monitor: {
          id: monitor.id,
          email: monitor.email,
          displayName: monitor.displayName,
          accountType: monitor.accountType,
        },
      } as const;
    }),

  // Get monitor profile from session token
  me: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .query(async ({ input }) => {
      if (!input.sessionToken) return null;

      const db = await getDb();
      if (!db) return null;

      const account = await db
        .select({
          id: studentAccounts.id,
          email: studentAccounts.email,
          displayName: studentAccounts.displayName,
          accountType: studentAccounts.accountType,
          isActive: studentAccounts.isActive,
        })
        .from(studentAccounts)
        .where(
          and(
            eq(studentAccounts.sessionToken, input.sessionToken),
            eq(studentAccounts.accountType, "monitor")
          )
        )
        .limit(1);

      return account[0] ?? null;
    }),

  // Monitor logout
  logout: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(studentAccounts)
        .set({ sessionToken: null })
        .where(eq(studentAccounts.sessionToken, input.sessionToken));

      return { success: true } as const;
    }),

  // Promote existing external student to monitor (teacher only)
  promoteToMonitor: publicProcedure
    .input(
      z.object({
        teacherSessionToken: z.string(),
        studentAccountId: z.number(),
        displayName: z.string().min(2),
      })
    )
    .mutation(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(studentAccounts)
        .set({
          accountType: "monitor",
          displayName: input.displayName,
        })
        .where(eq(studentAccounts.id, input.studentAccountId));

      return { success: true, message: "Conta promovida a monitor" } as const;
    }),
});
