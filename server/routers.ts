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
});

export type AppRouter = typeof appRouter;
