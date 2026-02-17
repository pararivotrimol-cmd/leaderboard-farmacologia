import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

// Admin password check middleware (simple password-based, no OAuth needed)
const ADMIN_PASSWORD_KEY = "admin_password";
const DEFAULT_ADMIN_PASSWORD = "farmaco2026"; // Default password, should be changed

async function verifyAdminPassword(password: string): Promise<boolean> {
  const storedPassword = await db.getSetting(ADMIN_PASSWORD_KEY);
  const correctPassword = storedPassword || DEFAULT_ADMIN_PASSWORD;
  return password === correctPassword;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Admin Auth ───
  admin: router({
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) return { success: false, message: "Senha incorreta" } as const;
        return { success: true, message: "Autenticado com sucesso" } as const;
      }),

    changePassword: publicProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.currentPassword);
        if (!valid) return { success: false, message: "Senha atual incorreta" } as const;
        await db.upsertSetting(ADMIN_PASSWORD_KEY, input.newPassword);
        return { success: true, message: "Senha alterada com sucesso" } as const;
      }),
  }),

  // ─── Public Leaderboard Data ───
  leaderboard: router({
    getData: publicProcedure.query(async () => {
      const [teamsData, membersData, activitiesData, highlightsData, settings] = await Promise.all([
        db.getAllTeams(),
        db.getAllMembers(),
        db.getAllXpActivities(),
        db.getAllHighlights(),
        db.getAllSettings(),
      ]);

      const settingsMap: Record<string, string> = {};
      for (const s of settings) {
        if (s.settingKey !== ADMIN_PASSWORD_KEY) {
          settingsMap[s.settingKey] = s.settingValue;
        }
      }

      return {
        teams: teamsData.map(t => ({
          ...t,
          members: membersData
            .filter(m => m.teamId === t.id)
            .map(m => ({ ...m, xp: parseFloat(m.xp) })),
        })),
        activities: activitiesData.map(a => ({ ...a, maxXP: parseFloat(a.maxXP) })),
        highlights: highlightsData,
        settings: settingsMap,
      };
    }),
  }),

  // ─── Admin CRUD (password-protected) ───
  teams: router({
    list: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        return db.getAllTeams();
      }),

    create: publicProcedure
      .input(z.object({
        password: z.string(),
        name: z.string().min(1),
        emoji: z.string().default("🧪"),
        color: z.string().default("#10b981"),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, ...data } = input;
        const id = await db.createTeam(data);
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        name: z.string().optional(),
        emoji: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, id, ...data } = input;
        await db.updateTeam(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.deleteTeam(input.id);
        return { success: true };
      }),
  }),

  members: router({
    list: publicProcedure
      .input(z.object({ password: z.string(), teamId: z.number().optional() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        if (input.teamId) return db.getMembersByTeam(input.teamId);
        return db.getAllMembers();
      }),

    create: publicProcedure
      .input(z.object({
        password: z.string(),
        teamId: z.number(),
        name: z.string().min(1),
        xp: z.string().default("0"),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, ...data } = input;
        const id = await db.createMember(data);
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        name: z.string().optional(),
        teamId: z.number().optional(),
        xp: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, id, ...data } = input;
        await db.updateMember(id, data);
        return { success: true };
      }),

    updateXP: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        xp: z.string(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.updateMemberXP(input.id, input.xp);
        return { success: true };
      }),

    bulkUpdateXP: publicProcedure
      .input(z.object({
        password: z.string(),
        updates: z.array(z.object({ id: z.number(), xp: z.string() })),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.bulkUpdateXP(input.updates);
        return { success: true, count: input.updates.length };
      }),

    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.deleteMember(input.id);
        return { success: true };
      }),
  }),

  activities: router({
    create: publicProcedure
      .input(z.object({
        password: z.string(),
        name: z.string().min(1),
        icon: z.string().default("🎯"),
        maxXP: z.string().default("1"),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, ...data } = input;
        const id = await db.createXpActivity(data);
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        name: z.string().optional(),
        icon: z.string().optional(),
        maxXP: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, id, ...data } = input;
        await db.updateXpActivity(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.deleteXpActivity(input.id);
        return { success: true };
      }),
  }),

  highlights: router({
    create: publicProcedure
      .input(z.object({
        password: z.string(),
        week: z.number(),
        date: z.string(),
        activity: z.string(),
        description: z.string(),
        topTeam: z.string().default("—"),
        topStudent: z.string().default("—"),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, ...data } = input;
        const id = await db.createHighlight(data);
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        week: z.number().optional(),
        date: z.string().optional(),
        activity: z.string().optional(),
        description: z.string().optional(),
        topTeam: z.string().optional(),
        topStudent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, id, ...data } = input;
        await db.updateHighlight(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.deleteHighlight(input.id);
        return { success: true };
      }),
  }),

  settings: router({
    update: publicProcedure
      .input(z.object({
        password: z.string(),
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.upsertSetting(input.key, input.value);
        return { success: true };
      }),
  }),

  // ─── Notifications ───
  notifications: router({
    getActive: publicProcedure.query(async () => {
      return db.getActiveNotifications();
    }),

    getAll: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        return db.getAllNotifications();
      }),

    create: publicProcedure
      .input(z.object({
        password: z.string(),
        title: z.string().min(1),
        content: z.string().optional(),
        priority: z.enum(["normal", "important", "urgent"]).default("normal"),
        type: z.enum(["banner", "announcement", "reminder"]).default("announcement"),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, expiresAt, ...data } = input;
        const id = await db.createNotification({
          ...data,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        });
        return { id };
      }),

    update: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        priority: z.enum(["normal", "important", "urgent"]).optional(),
        type: z.enum(["banner", "announcement", "reminder"]).optional(),
        isActive: z.number().optional(),
        expiresAt: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, id, expiresAt, ...data } = input;
        const updateData: Record<string, unknown> = { ...data };
        if (expiresAt !== undefined) {
          updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
        }
        await db.updateNotification(id, updateData as any);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.deleteNotification(input.id);
        return { success: true };
      }),
  }),

  // ─── Materials (files, links, comments) ───
  materials: router({
    // Public: get visible materials for students
    getVisible: publicProcedure.query(async () => {
      return db.getVisibleMaterials();
    }),

    // Admin: get all materials
    getAll: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        return db.getAllMaterials();
      }),

    // Admin: create a material (file upload handled separately)
    create: publicProcedure
      .input(z.object({
        password: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(["file", "link", "comment"]),
        url: z.string().optional(),
        fileKey: z.string().optional(),
        fileName: z.string().optional(),
        mimeType: z.string().optional(),
        module: z.string().default("Geral"),
        week: z.number().optional(),
        isVisible: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, ...data } = input;
        const id = await db.createMaterial(data);
        return { id };
      }),

    // Admin: update a material
    update: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        module: z.string().optional(),
        week: z.number().nullable().optional(),
        isVisible: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const { password, id, ...data } = input;
        await db.updateMaterial(id, data as any);
        return { success: true };
      }),

    // Admin: delete a material
    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.deleteMaterial(input.id);
        return { success: true };
      }),

    // Admin: upload file to S3 and create material
    upload: publicProcedure
      .input(z.object({
        password: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        module: z.string().default("Geral"),
        week: z.number().optional(),
        fileName: z.string(),
        mimeType: z.string(),
        fileBase64: z.string(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.fileBase64, "base64");
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const fileKey = `materials/${Date.now()}-${randomSuffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        const id = await db.createMaterial({
          title: input.title,
          description: input.description,
          type: "file",
          url,
          fileKey,
          fileName: input.fileName,
          mimeType: input.mimeType,
          module: input.module,
          week: input.week,
        });
        return { id, url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
