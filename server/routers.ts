import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { notifyOwner } from "./_core/notification";

// Helper: fire-and-forget notification (never blocks the main operation)
function sendNotificationAsync(title: string, content: string) {
  notifyOwner({ title, content }).catch(err => console.warn("[Notification] Failed:", err));
}

// Helper: create in-app notification for students
async function createStudentNotification(title: string, content: string, priority: "normal" | "important" | "urgent" = "normal") {
  try {
    await db.createNotification({
      title,
      content,
      priority,
      type: "announcement",
      isActive: 1,
    });
  } catch (err) {
    console.warn("[StudentNotification] Failed:", err);
  }
}

// Admin password check middleware (simple password-based, no OAuth needed)
const ADMIN_PASSWORD_KEY = "admin_password";
const DEFAULT_ADMIN_PASSWORD = "farmaco2026"; // Default password, should be changed

async function verifyAdminPassword(password: string): Promise<boolean> {
  const storedPassword = await db.getSetting(ADMIN_PASSWORD_KEY);
  const correctPassword = storedPassword || DEFAULT_ADMIN_PASSWORD;
  return password === correctPassword;
}

// Extract YouTube ID from various URL formats
function extractYoutubeId(url: string, type: string): string | null {
  try {
    // Handle direct ID input (no URL)
    if (!url.includes("http") && !url.includes("www")) {
      // Might be a direct ID
      if (type === "playlist" && url.startsWith("PL")) return url;
      if (type === "video" && /^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    }
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (type === "playlist") {
      // youtube.com/playlist?list=PLxxxxxx
      const listId = urlObj.searchParams.get("list");
      if (listId) return listId;
    }
    if (type === "video") {
      // youtube.com/watch?v=xxxxx
      const videoId = urlObj.searchParams.get("v");
      if (videoId) return videoId;
      // youtu.be/xxxxx
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }
      // youtube.com/embed/xxxxx
      const embedMatch = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      if (embedMatch) return embedMatch[1];
      // youtube.com/shorts/xxxxx
      const shortsMatch = urlObj.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
    // Fallback: try to extract list param for playlists from video URLs
    if (type === "playlist") {
      const listId = urlObj.searchParams.get("list");
      if (listId) return listId;
    }
    return null;
  } catch {
    return null;
  }
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
        // Notification: XP updated
        try {
          const allMembers = await db.getAllMembers();
          const member = allMembers.find(m => m.id === input.id);
          if (member) {
            sendNotificationAsync(
              "📊 Pontuação Atualizada",
              `PF de ${member.name} atualizado para ${input.xp}`
            );
          }
        } catch {}
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
        // Notification: bulk XP update
        const count = input.updates.length;
        createStudentNotification(
          "🎯 Pontuações Atualizadas",
          `Os Pontos Farmacológicos de ${count} aluno(s) foram atualizados. Confira o leaderboard!`,
          "important"
        );
        sendNotificationAsync(
          "📊 Atualização em Massa de PF",
          `${count} aluno(s) tiveram seus PF atualizados`
        );
        return { success: true, count };
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

  // ─── Badges (Conquistas) ───
  badges: router({
    // Public: get active badges with earned counts
    getPublic: publicProcedure.query(async () => {
      const [badgesData, allMemberBadges] = await Promise.all([
        db.getActiveBadges(),
        db.getAllMemberBadges(),
      ]);
      return badgesData.map(b => ({
        ...b,
        earnedCount: allMemberBadges.filter(mb => mb.badgeId === b.id).length,
      }));
    }),

    // Public: get badges earned by a specific member
    getByMember: publicProcedure
      .input(z.object({ memberId: z.number() }))
      .query(async ({ input }) => {
        const [memberBadgesData, allBadges] = await Promise.all([
          db.getMemberBadgesByMember(input.memberId),
          db.getAllBadges(),
        ]);
        return memberBadgesData.map(mb => {
          const badge = allBadges.find(b => b.id === mb.badgeId);
          return { ...mb, badge };
        });
      }),

    // Public: get all badges with member info (for leaderboard display)
    getWithMembers: publicProcedure.query(async () => {
      const [badgesData, allMemberBadges, allMembers] = await Promise.all([
        db.getActiveBadges(),
        db.getAllMemberBadges(),
        db.getAllMembers(),
      ]);
      return badgesData.map(b => {
        const earned = allMemberBadges.filter(mb => mb.badgeId === b.id);
        const membersWithBadge = earned.map(mb => {
          const member = allMembers.find(m => m.id === mb.memberId);
          return { ...mb, memberName: member?.name || "Desconhecido" };
        });
        return { ...b, members: membersWithBadge };
      });
    }),

    // Admin: get all badges
    getAll: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("N\u00e3o autorizado");
        const [allBadges, allMemberBadges] = await Promise.all([
          db.getAllBadges(),
          db.getAllMemberBadges(),
        ]);
        return allBadges.map(b => ({
          ...b,
          earnedCount: allMemberBadges.filter(mb => mb.badgeId === b.id).length,
        }));
      }),

    // Admin: create a badge
    create: publicProcedure
      .input(z.object({
        password: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        iconUrl: z.string().optional(),
        category: z.string().default("Geral"),
        week: z.number().optional(),
        criteria: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("N\u00e3o autorizado");
        const { password, ...data } = input;
        const id = await db.createBadge(data);
        return { id };
      }),

    // Admin: update a badge
    update: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        iconUrl: z.string().optional(),
        category: z.string().optional(),
        week: z.number().nullable().optional(),
        criteria: z.string().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("N\u00e3o autorizado");
        const { password, id, ...data } = input;
        await db.updateBadge(id, data as any);
        return { success: true };
      }),

    // Admin: delete a badge
    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("N\u00e3o autorizado");
        await db.deleteBadge(input.id);
        return { success: true };
      }),

    // Admin: award badge to a member
    award: publicProcedure
      .input(z.object({
        password: z.string(),
        badgeId: z.number(),
        memberId: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const id = await db.awardBadge({
          badgeId: input.badgeId,
          memberId: input.memberId,
          note: input.note,
        });
        // Notification: badge awarded
        try {
          const allBadges = await db.getAllBadges();
          const badge = allBadges.find(b => b.id === input.badgeId);
          const allMembers = await db.getAllMembers();
          const member = allMembers.find(m => m.id === input.memberId);
          if (badge && member) {
            createStudentNotification(
              `🏅 Nova Conquista: ${badge.name}`,
              `${member.name} conquistou o badge "${badge.name}"! ${badge.description || ""}`,
              "important"
            );
            sendNotificationAsync(
              "🏅 Badge Concedido",
              `${member.name} recebeu o badge "${badge.name}"`
            );
          }
        } catch {}
        return { id };
      }),

    // Admin: bulk award badge to multiple members
    bulkAward: publicProcedure
      .input(z.object({
        password: z.string(),
        badgeId: z.number(),
        memberIds: z.array(z.number()),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const awarded = await db.bulkAwardBadge(input.badgeId, input.memberIds, input.note);
        // Notification: bulk badge award
        if (awarded > 0) {
          try {
            const allBadges = await db.getAllBadges();
            const badge = allBadges.find(b => b.id === input.badgeId);
            if (badge) {
              createStudentNotification(
                `🏅 Conquista Desbloqueada: ${badge.name}`,
                `${awarded} aluno(s) conquistaram o badge "${badge.name}"! Confira na página de conquistas.`,
                "important"
              );
              sendNotificationAsync(
                "🏅 Badges em Massa",
                `${awarded} aluno(s) receberam o badge "${badge.name}"`
              );
            }
          } catch {}
        }
        return { success: true, awarded };
      }),

    // Admin: revoke badge from a member
    revoke: publicProcedure
      .input(z.object({
        password: z.string(),
        badgeId: z.number(),
        memberId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("N\u00e3o autorizado");
        await db.revokeBadge(input.memberId, input.badgeId);
        return { success: true };
      }),

    // Admin: get members who earned a specific badge
    getEarners: publicProcedure
      .input(z.object({ password: z.string(), badgeId: z.number() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("N\u00e3o autorizado");
        const [earners, allMembers] = await Promise.all([
          db.getMemberBadgesByBadge(input.badgeId),
          db.getAllMembers(),
        ]);
        return earners.map(e => {
          const member = allMembers.find(m => m.id === e.memberId);
          return { ...e, memberName: member?.name || "Desconhecido" };
        });
      }),
  }),

  // ─── Student Auth (email institucional @edu.unirio.br) ───
  studentAuth: router({
    // Register a new student account
    register: publicProcedure
      .input(z.object({
        email: z.string().email().refine(e => e.endsWith("@edu.unirio.br"), { message: "Email deve ser @edu.unirio.br" }),
        matricula: z.string().min(5, "Matrícula deve ter pelo menos 5 caracteres"),
        password: z.string().length(11, "CPF deve ter exatamente 11 dígitos").regex(/^\d{11}$/, "CPF deve conter apenas números"),
        memberId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Check if email already registered
        const existingEmail = await db.getStudentAccountByEmail(input.email);
        if (existingEmail) return { success: false, message: "Este email já está cadastrado" } as const;
        // Check if matricula already registered
        const existingMatricula = await db.getStudentAccountByMatricula(input.matricula);
        if (existingMatricula) return { success: false, message: "Esta matrícula já está cadastrada" } as const;
        // Check if member already has an account
        const existingMember = await db.getStudentAccountByMemberId(input.memberId);
        if (existingMember) return { success: false, message: "Este aluno já possui uma conta cadastrada" } as const;
        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);
        // Create session token
        const sessionToken = crypto.randomBytes(32).toString("hex");
        const id = await db.createStudentAccount({
          memberId: input.memberId,
          email: input.email,
          matricula: input.matricula,
          passwordHash,
          sessionToken,
        });
        return { success: true, message: "Conta criada com sucesso!", sessionToken, studentId: id } as const;
      }),

    // Login with email + password
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const account = await db.getStudentAccountByEmail(input.email);
        if (!account) return { success: false, message: "Email não encontrado" } as const;
        if (!account.isActive) return { success: false, message: "Conta desativada" } as const;
        const valid = await bcrypt.compare(input.password, account.passwordHash);
        if (!valid) return { success: false, message: "Senha incorreta" } as const;
        // Generate new session token
        const sessionToken = crypto.randomBytes(32).toString("hex");
        await db.updateStudentAccountSession(account.id, sessionToken);
        return { success: true, sessionToken, studentId: account.id, memberId: account.memberId } as const;
      }),

    // Verify session token (for persistent login)
    me: publicProcedure
      .input(z.object({ sessionToken: z.string() }))
      .query(async ({ input }) => {
        const account = await db.getStudentAccountBySessionToken(input.sessionToken);
        if (!account) return null;
        // Get member info
        const allMembers = await db.getAllMembers();
        const member = allMembers.find(m => m.id === account.memberId);
        const allTeams = await db.getAllTeams();
        const team = allTeams.find(t => t.id === member?.teamId);
        return {
          id: account.id,
          memberId: account.memberId,
          email: account.email,
          matricula: account.matricula,
          memberName: member?.name || "Desconhecido",
          teamId: team?.id,
          teamName: team?.name,
          teamEmoji: team?.emoji,
        };
      }),

    // Logout
    logout: publicProcedure
      .input(z.object({ sessionToken: z.string() }))
      .mutation(async ({ input }) => {
        const account = await db.getStudentAccountBySessionToken(input.sessionToken);
        if (account) {
          await db.updateStudentAccountSession(account.id, null);
        }
        return { success: true };
      }),

    // Get available members (not yet registered)
    getAvailableMembers: publicProcedure.query(async () => {
      const [allMembers, allAccounts, allTeams] = await Promise.all([
        db.getAllMembers(),
        db.getAllStudentAccounts(),
        db.getAllTeams(),
      ]);
      const registeredMemberIds = new Set(allAccounts.map(a => a.memberId));
      return allMembers
        .filter(m => !registeredMemberIds.has(m.id))
        .map(m => {
          const team = allTeams.find(t => t.id === m.teamId);
          return { id: m.id, name: m.name, teamName: team?.name || "Sem equipe", teamEmoji: team?.emoji || "🧪" };
        });
    }),

    // Change password
    changePassword: publicProcedure
      .input(z.object({
        sessionToken: z.string(),
        currentPassword: z.string(),
        newPassword: z.string().length(11, "CPF deve ter exatamente 11 dígitos").regex(/^\d{11}$/, "CPF deve conter apenas números"),
      }))
      .mutation(async ({ input }) => {
        const account = await db.getStudentAccountBySessionToken(input.sessionToken);
        if (!account) return { success: false, message: "Sessão inválida" } as const;
        const valid = await bcrypt.compare(input.currentPassword, account.passwordHash);
        if (!valid) return { success: false, message: "Senha atual incorreta" } as const;
        const passwordHash = await bcrypt.hash(input.newPassword, 10);
        await db.updateStudentAccountPassword(account.id, passwordHash);
        return { success: true, message: "Senha alterada com sucesso" } as const;
      }),
  }),

  // ─── Attendance (Presença com Geolocalização) ───
  attendance: router({
    // Student: check in with geolocation
    checkIn: publicProcedure
      .input(z.object({
        sessionToken: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const account = await db.getStudentAccountBySessionToken(input.sessionToken);
        if (!account) return { success: false, message: "Sessão inválida. Faça login novamente." } as const;

        // Check if it's Tuesday (day 2) and within class hours (8h-12h BRT = 11h-15h UTC)
        const now = new Date();
        const brasiliaOffset = -3 * 60; // BRT is UTC-3
        const brasiliaTime = new Date(now.getTime() + (brasiliaOffset + now.getTimezoneOffset()) * 60000);
        const dayOfWeek = brasiliaTime.getDay(); // 0=Sun, 2=Tue
        const hour = brasiliaTime.getHours();

        // Allow check-in on Tuesdays between 7:30 and 12:30 (with 30min buffer)
        if (dayOfWeek !== 2) {
          return { success: false, message: "A presença só pode ser registrada às terças-feiras." } as const;
        }
        if (hour < 7 || hour > 12) {
          return { success: false, message: "A presença só pode ser registrada entre 7:30 e 12:30." } as const;
        }

        // Calculate distance from classroom
        // Frei Caneca 94, Rio de Janeiro (approximate coordinates)
        const CLASSROOM_LAT = -22.9176;
        const CLASSROOM_LNG = -43.1831;
        const MAX_DISTANCE_METERS = 100;

        const distance = calculateDistance(
          input.latitude, input.longitude,
          CLASSROOM_LAT, CLASSROOM_LNG
        );

        const isWithinRange = distance <= MAX_DISTANCE_METERS;

        // Calculate current week (based on semester start)
        const semesterStart = new Date("2026-03-10"); // Adjust to actual semester start
        const weeksSinceStart = Math.floor((brasiliaTime.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const currentWeek = Math.max(1, weeksSinceStart + 1);

        const classDate = brasiliaTime.toISOString().split("T")[0];

        const result = await db.createAttendanceRecord({
          studentAccountId: account.id,
          memberId: account.memberId,
          week: currentWeek,
          classDate,
          latitude: input.latitude.toString(),
          longitude: input.longitude.toString(),
          distanceMeters: distance.toFixed(2),
          status: isWithinRange ? "valid" : "invalid",
          ipAddress: ctx.req.ip || ctx.req.headers["x-forwarded-for"]?.toString() || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });

        if (result.alreadyCheckedIn) {
          return { success: false, message: "Você já registrou presença nesta semana." } as const;
        }

        return {
          success: true,
          message: isWithinRange
            ? `Presença registrada com sucesso! (${distance.toFixed(0)}m da sala)`
            : `Presença registrada, mas você está a ${distance.toFixed(0)}m da sala (máximo: ${MAX_DISTANCE_METERS}m). O professor será notificado.`,
          distance: Math.round(distance),
          isWithinRange,
          week: currentWeek,
        } as const;
      }),

    // Student: get my attendance history
    myAttendance: publicProcedure
      .input(z.object({ sessionToken: z.string() }))
      .query(async ({ input }) => {
        const account = await db.getStudentAccountBySessionToken(input.sessionToken);
        if (!account) return [];
        return db.getAttendanceByStudent(account.id);
      }),

    // Admin: get all attendance for a week
    getByWeek: publicProcedure
      .input(z.object({ password: z.string(), week: z.number() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const [records, allMembers, allTeams, allAccounts] = await Promise.all([
          db.getAttendanceByWeek(input.week),
          db.getAllMembers(),
          db.getAllTeams(),
          db.getAllStudentAccounts(),
        ]);
        return records.map(r => {
          const member = allMembers.find(m => m.id === r.memberId);
          const team = allTeams.find(t => t.id === member?.teamId);
          const account = allAccounts.find(a => a.id === r.studentAccountId);
          return {
            ...r,
            memberName: member?.name || "Desconhecido",
            teamName: team?.name || "Sem equipe",
            teamEmoji: team?.emoji || "🧪",
            email: account?.email,
          };
        });
      }),

    // Admin: get attendance summary (all members, all weeks)
    getSummary: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const [summary, allMembers, allTeams, allAccounts] = await Promise.all([
          db.getAttendanceSummary(),
          db.getAllMembers(),
          db.getAllTeams(),
          db.getAllStudentAccounts(),
        ]);
        return allMembers.map(m => {
          const team = allTeams.find(t => t.id === m.teamId);
          const account = allAccounts.find(a => a.memberId === m.id);
          const stats = summary.find(s => s.memberId === m.id);
          return {
            memberId: m.id,
            memberName: m.name,
            teamName: team?.name || "Sem equipe",
            teamEmoji: team?.emoji || "🧪",
            hasAccount: !!account,
            email: account?.email,
            totalPresent: stats?.totalPresent || 0,
            validPresent: stats?.validPresent || 0,
          };
        });
      }),

    // Admin: update attendance status
    updateStatus: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        status: z.enum(["valid", "invalid", "manual"]),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.updateAttendanceStatus(input.id, input.status, input.note);
        return { success: true };
      }),

    // Admin: manual attendance
    manualCheckIn: publicProcedure
      .input(z.object({
        password: z.string(),
        memberId: z.number(),
        week: z.number(),
        classDate: z.string(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const id = await db.createManualAttendance(input.memberId, input.week, input.classDate, input.note);
        return { id, success: true };
      }),

    // Admin: delete attendance record
    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.deleteAttendanceRecord(input.id);
        return { success: true };
      }),

    // Admin: get all student accounts
    getAccounts: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const [accounts, allMembers, allTeams] = await Promise.all([
          db.getAllStudentAccounts(),
          db.getAllMembers(),
          db.getAllTeams(),
        ]);
        return accounts.map(a => {
          const member = allMembers.find(m => m.id === a.memberId);
          const team = allTeams.find(t => t.id === member?.teamId);
          return {
            ...a,
            passwordHash: undefined, // Don't expose
            sessionToken: undefined, // Don't expose
            memberName: member?.name || "Desconhecido",
            teamName: team?.name || "Sem equipe",
            teamEmoji: team?.emoji || "🧪",
          };
        });
      }),

    // Admin: delete student account
    deleteAccount: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        await db.deleteStudentAccount(input.id);
        return { success: true };
      }),

    // Admin: export attendance report data
    exportReport: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Não autorizado");
        const [allMembers, allTeams, allAccounts, allRecords] = await Promise.all([
          db.getAllMembers(),
          db.getAllTeams(),
          db.getAllStudentAccounts(),
          db.getAllAttendance(),
        ]);

        // Build per-member summary with weekly breakdown
        const weeks = Array.from({ length: 19 }, (_, i) => i + 1);
        const report = allMembers.map(m => {
          const team = allTeams.find(t => t.id === m.teamId);
          const account = allAccounts.find(a => a.memberId === m.id);
          const memberRecords = allRecords.filter(r => r.memberId === m.id);
          const weeklyStatus: Record<number, string> = {};
          for (const w of weeks) {
            const rec = memberRecords.find(r => r.week === w);
            if (rec) {
              weeklyStatus[w] = rec.status === "valid" ? "P" : rec.status === "manual" ? "M" : "I";
            } else {
              weeklyStatus[w] = "-";
            }
          }
          const totalValid = memberRecords.filter(r => r.status === "valid" || r.status === "manual").length;
          const totalInvalid = memberRecords.filter(r => r.status === "invalid").length;
          return {
            nome: m.name,
            equipe: team?.name || "Sem equipe",
            matricula: account?.matricula || "-",
            email: account?.email || "-",
            weeklyStatus,
            totalValid,
            totalInvalid,
            totalAusente: weeks.length - totalValid - totalInvalid,
          };
        });
        return { report, weeks };
      }),
  }),

  // ─── YouTube Playlists ───
  youtubePlaylists: router({
    // Public: get visible playlists for students
    getVisible: publicProcedure.query(async () => {
      return db.getVisibleYoutubePlaylists();
    }),

    // Admin: get all playlists
    getAll: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Senha inválida");
        return db.getAllYoutubePlaylists();
      }),

    // Admin: create a new playlist
    create: publicProcedure
      .input(z.object({
        password: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        youtubeUrl: z.string().min(1),
        videoType: z.enum(["playlist", "video"]).default("playlist"),
        module: z.string().default("Geral"),
        week: z.number().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Senha inválida");
        // Extract YouTube ID from URL
        const youtubeId = extractYoutubeId(input.youtubeUrl, input.videoType);
        if (!youtubeId) throw new Error("URL do YouTube inválida. Use uma URL de playlist ou vídeo válida.");
        const thumbnailUrl = input.videoType === "video"
          ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
          : `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
        const id = await db.createYoutubePlaylist({
          title: input.title,
          description: input.description || null,
          youtubeId,
          videoType: input.videoType,
          module: input.module,
          week: input.week ?? null,
          thumbnailUrl,
          sortOrder: input.sortOrder,
          isVisible: 1,
        });
        return { success: true, id };
      }),

    // Admin: update a playlist
    update: publicProcedure
      .input(z.object({
        password: z.string(),
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        youtubeUrl: z.string().optional(),
        videoType: z.enum(["playlist", "video"]).optional(),
        module: z.string().optional(),
        week: z.number().nullable().optional(),
        sortOrder: z.number().optional(),
        isVisible: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Senha inválida");
        const { password, id, youtubeUrl, ...data } = input;
        const updateData: any = { ...data };
        if (youtubeUrl) {
          const vType = input.videoType || "playlist";
          const youtubeId = extractYoutubeId(youtubeUrl, vType);
          if (!youtubeId) throw new Error("URL do YouTube inválida.");
          updateData.youtubeId = youtubeId;
          updateData.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
        }
        await db.updateYoutubePlaylist(id, updateData);
        return { success: true };
      }),

    // Admin: delete a playlist
    delete: publicProcedure
      .input(z.object({ password: z.string(), id: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Senha inválida");
        await db.deleteYoutubePlaylist(input.id);
        return { success: true };
      }),

    // Admin: toggle visibility
    toggleVisibility: publicProcedure
      .input(z.object({ password: z.string(), id: z.number(), isVisible: z.number() }))
      .mutation(async ({ input }) => {
        const valid = await verifyAdminPassword(input.password);
        if (!valid) throw new Error("Senha inválida");
        await db.updateYoutubePlaylist(input.id, { isVisible: input.isVisible });
        return { success: true };
      }),
  }),
});

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type AppRouter = typeof appRouter;
