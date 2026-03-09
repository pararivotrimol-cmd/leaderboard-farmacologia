import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb, getTeacherAccountBySessionToken } from "../db";
import { studentAccounts, monitorActivityLogs, classes, jigsawHomeGroups, jigsawHomeMembers, members, groupActivityGrades } from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
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
      const sessionToken = `monitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await db
        .update(studentAccounts)
        .set({ sessionToken, lastLoginAt: new Date() })
        .where(eq(studentAccounts.id, monitor.id));
      // Auto-log login action
      await db.insert(monitorActivityLogs).values({
        monitorId: monitor.id,
        monitorName: monitor.displayName ?? monitor.email,
        actionType: "login",
        actionDescription: `Login realizado no portal do monitor`,
      }).catch(() => {}); // Non-blocking
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

  // ─── Activity Log Endpoints ───

  // Log a monitor action (called by monitor portal)
  logAction: publicProcedure
    .input(
      z.object({
        monitorSessionToken: z.string(),
        actionType: z.string().min(1),
        actionDescription: z.string().min(1),
        targetEntity: z.string().optional(),
        targetId: z.number().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const accounts = await db
        .select({
          id: studentAccounts.id,
          displayName: studentAccounts.displayName,
          email: studentAccounts.email,
        })
        .from(studentAccounts)
        .where(
          and(
            eq(studentAccounts.sessionToken, input.monitorSessionToken),
            eq(studentAccounts.accountType, "monitor")
          )
        )
        .limit(1);
      const monitor = accounts[0];
      if (!monitor) throw new Error("Monitor não autenticado");
      await db.insert(monitorActivityLogs).values({
        monitorId: monitor.id,
        monitorName: monitor.displayName ?? monitor.email,
        actionType: input.actionType,
        actionDescription: input.actionDescription,
        targetEntity: input.targetEntity ?? null,
        targetId: input.targetId ?? null,
        metadata: input.metadata ?? null,
      });
      return { success: true } as const;
    }),

  // Get activity logs (teacher only)
  getActivityLogs: publicProcedure
    .input(
      z.object({
        teacherSessionToken: z.string(),
        monitorId: z.number().optional(),
        dateFrom: z.string().optional(), // ISO date string e.g. "2026-02-01"
        dateTo: z.string().optional(),   // ISO date string e.g. "2026-02-28"
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const teacher = await getTeacherAccountBySessionToken(input.teacherSessionToken);
      if (!teacher) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Build where conditions
      const conditions = [];
      if (input.monitorId) {
        conditions.push(eq(monitorActivityLogs.monitorId, input.monitorId));
      }
      if (input.dateFrom) {
        conditions.push(gte(monitorActivityLogs.createdAt, new Date(input.dateFrom)));
      }
      if (input.dateTo) {
        // Include the full end day by setting time to end of day
        const endDate = new Date(input.dateTo);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lte(monitorActivityLogs.createdAt, endDate));
      }

      const query = db
        .select()
        .from(monitorActivityLogs)
        .orderBy(desc(monitorActivityLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      if (conditions.length > 0) {
        return await query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
      }
      return await query;
    }),

  // Get activity summary per monitor (teacher only)
  getActivitySummary: publicProcedure
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
          displayName: studentAccounts.displayName,
          isActive: studentAccounts.isActive,
          lastLoginAt: studentAccounts.lastLoginAt,
        })
        .from(studentAccounts)
        .where(eq(studentAccounts.accountType, "monitor"));
      const result = await Promise.all(
        monitors.map(async (monitor) => {
          const recentLogs = await db
            .select()
            .from(monitorActivityLogs)
            .where(eq(monitorActivityLogs.monitorId, monitor.id))
            .orderBy(desc(monitorActivityLogs.createdAt))
            .limit(5);
          const allLogs = await db
            .select({ id: monitorActivityLogs.id })
            .from(monitorActivityLogs)
            .where(eq(monitorActivityLogs.monitorId, monitor.id));
          return {
            monitor,
            recentLogs,
            totalActions: allLogs.length,
          };
        })
      );
      return result;
    }),

  // ============================================================
  // TURMAS E NOTAS DE ATIVIDADES (Kahoot e Casos Clínicos)
  // ============================================================

  // Listar todas as turmas ativas
  listClasses: publicProcedure
    .input(z.object({ monitorSessionToken: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const monitor = await db
        .select({ id: studentAccounts.id, accountType: studentAccounts.accountType })
        .from(studentAccounts)
        .where(and(
          eq(studentAccounts.sessionToken, input.monitorSessionToken),
          eq(studentAccounts.accountType, "monitor"),
          eq(studentAccounts.isActive, 1)
        ))
        .limit(1);
      if (!monitor.length) throw new Error("Acesso negado");
      
      return db
        .select()
        .from(classes)
        .where(eq(classes.isActive, 1))
        .orderBy(classes.name);
    }),

  // Listar grupos mosaico (fase 2 do Jigsaw) de uma turma com seus membros
  listHomeGroups: publicProcedure
    .input(z.object({
      monitorSessionToken: z.string(),
      classId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const monitor = await db
        .select({ id: studentAccounts.id })
        .from(studentAccounts)
        .where(and(
          eq(studentAccounts.sessionToken, input.monitorSessionToken),
          eq(studentAccounts.accountType, "monitor"),
          eq(studentAccounts.isActive, 1)
        ))
        .limit(1);
      if (!monitor.length) throw new Error("Acesso negado");

      const groups = await db
        .select()
        .from(jigsawHomeGroups)
        .where(eq(jigsawHomeGroups.classId, input.classId))
        .orderBy(jigsawHomeGroups.meetingNumber, jigsawHomeGroups.name);

      // Para cada grupo, buscar os membros
      const groupsWithMembers = await Promise.all(
        groups.map(async (group) => {
          const groupMembers = await db
            .select({
              id: jigsawHomeMembers.id,
              memberId: jigsawHomeMembers.memberId,
              memberName: members.name,
            })
            .from(jigsawHomeMembers)
            .leftJoin(members, eq(jigsawHomeMembers.memberId, members.id))
            .where(eq(jigsawHomeMembers.homeGroupId, group.id));
          return { ...group, membersList: groupMembers };
        })
      );

      return groupsWithMembers;
    }),

  // Listar notas de atividades de uma turma
  listActivityGrades: publicProcedure
    .input(z.object({
      monitorSessionToken: z.string(),
      classId: z.number(),
      activityType: z.enum(["kahoot", "clinical_case"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const monitor = await db
        .select({ id: studentAccounts.id })
        .from(studentAccounts)
        .where(and(
          eq(studentAccounts.sessionToken, input.monitorSessionToken),
          eq(studentAccounts.accountType, "monitor"),
          eq(studentAccounts.isActive, 1)
        ))
        .limit(1);
      if (!monitor.length) throw new Error("Acesso negado");

      const conditions = [eq(groupActivityGrades.classId, input.classId)];
      if (input.activityType) {
        conditions.push(eq(groupActivityGrades.activityType, input.activityType));
      }

      return db
        .select()
        .from(groupActivityGrades)
        .where(and(...conditions))
        .orderBy(groupActivityGrades.activityType, groupActivityGrades.activityName, groupActivityGrades.groupName);
    }),

  // Lançar ou atualizar nota de um grupo
  upsertActivityGrade: publicProcedure
    .input(z.object({
      monitorSessionToken: z.string(),
      classId: z.number(),
      activityType: z.enum(["kahoot", "clinical_case"]),
      activityName: z.string().min(1).max(200),
      homeGroupId: z.number().optional(),
      groupName: z.string().min(1).max(200),
      grade: z.number().min(0).max(100),
      maxGrade: z.number().min(0).max(100).default(10),
      notes: z.string().optional(),
      existingId: z.number().optional(), // se fornecido, atualiza; se não, cria
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const monitorAccount = await db
        .select({ id: studentAccounts.id, displayName: studentAccounts.displayName, email: studentAccounts.email })
        .from(studentAccounts)
        .where(and(
          eq(studentAccounts.sessionToken, input.monitorSessionToken),
          eq(studentAccounts.accountType, "monitor"),
          eq(studentAccounts.isActive, 1)
        ))
        .limit(1);
      if (!monitorAccount.length) throw new Error("Acesso negado");

      const monitor = monitorAccount[0];
      const monitorName = monitor.displayName || monitor.email.split("@")[0];

      if (input.existingId) {
        // Atualizar nota existente
        await db
          .update(groupActivityGrades)
          .set({
            grade: String(input.grade),
            maxGrade: String(input.maxGrade),
            notes: input.notes,
            launchedByMonitorId: monitor.id,
            launchedByName: monitorName,
          })
          .where(eq(groupActivityGrades.id, input.existingId));
        return { success: true, action: "updated" };
      } else {
        // Criar nova nota
        await db.insert(groupActivityGrades).values({
          classId: input.classId,
          activityType: input.activityType,
          activityName: input.activityName,
          homeGroupId: input.homeGroupId,
          groupName: input.groupName,
          grade: String(input.grade),
          maxGrade: String(input.maxGrade),
          notes: input.notes,
          launchedByMonitorId: monitor.id,
          launchedByName: monitorName,
        });
        return { success: true, action: "created" };
      }
    }),

  // Deletar nota de atividade
  deleteActivityGrade: publicProcedure
    .input(z.object({
      monitorSessionToken: z.string(),
      gradeId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const monitor = await db
        .select({ id: studentAccounts.id })
        .from(studentAccounts)
        .where(and(
          eq(studentAccounts.sessionToken, input.monitorSessionToken),
          eq(studentAccounts.accountType, "monitor"),
          eq(studentAccounts.isActive, 1)
        ))
        .limit(1);
      if (!monitor.length) throw new Error("Acesso negado");

      await db
        .delete(groupActivityGrades)
        .where(eq(groupActivityGrades.id, input.gradeId));
      return { success: true };
    }),

  // Listar nomes únicos de atividades (para autocomplete)
  listActivityNames: publicProcedure
    .input(z.object({
      monitorSessionToken: z.string(),
      classId: z.number(),
      activityType: z.enum(["kahoot", "clinical_case"]),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const monitor = await db
        .select({ id: studentAccounts.id })
        .from(studentAccounts)
        .where(and(
          eq(studentAccounts.sessionToken, input.monitorSessionToken),
          eq(studentAccounts.accountType, "monitor"),
          eq(studentAccounts.isActive, 1)
        ))
        .limit(1);
      if (!monitor.length) throw new Error("Acesso negado");

      const results = await db
        .selectDistinct({ activityName: groupActivityGrades.activityName })
        .from(groupActivityGrades)
        .where(and(
          eq(groupActivityGrades.classId, input.classId),
          eq(groupActivityGrades.activityType, input.activityType)
        ))
        .orderBy(groupActivityGrades.activityName);
      return results.map(r => r.activityName);
    }),
});
