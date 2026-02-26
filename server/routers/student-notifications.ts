import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const studentNotificationsRouter = router({
  // Get all notifications for a student (by memberId)
  getMyNotifications: publicProcedure
    .input(z.object({
      memberId: z.number(),
      classId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const notifications = await db.getStudentNotifications(input.memberId, input.classId);
      return notifications;
    }),

  // Get unread count for badge display
  getUnreadCount: publicProcedure
    .input(z.object({
      memberId: z.number(),
    }))
    .query(async ({ input }) => {
      const count = await db.getUnreadStudentNotificationCount(input.memberId);
      return { count };
    }),

  // Mark a single notification as read
  markAsRead: publicProcedure
    .input(z.object({
      notificationId: z.number(),
      memberId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.markStudentNotificationRead(input.notificationId, input.memberId);
      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: publicProcedure
    .input(z.object({
      memberId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.markAllStudentNotificationsRead(input.memberId);
      return { success: true };
    }),

  // Dismiss a notification (hide it)
  dismiss: publicProcedure
    .input(z.object({
      notificationId: z.number(),
      memberId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.dismissStudentNotification(input.notificationId, input.memberId);
      return { success: true };
    }),

  // Create a team allocation notification (called by admin when assigning teams)
  notifyTeamAllocation: publicProcedure
    .input(z.object({
      memberId: z.number(),
      classId: z.number(),
      teamName: z.string(),
      teamType: z.string(), // "seminar", "clinical_case", etc.
      groupId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const typeLabel = input.teamType === "seminar" ? "Seminário" :
                        input.teamType === "clinical_case" ? "Caso Clínico" :
                        input.teamType === "kahoot" ? "Kahoot" : "Equipe";

      const id = await db.createStudentNotification({
        memberId: input.memberId,
        classId: input.classId,
        title: `Você foi alocado(a) em uma equipe de ${typeLabel}!`,
        message: `Você foi designado(a) para a equipe "${input.teamName}". Acesse a aba Equipes no seu portal para ver mais detalhes sobre seus colegas e o tema do seminário.`,
        type: "team_allocation",
        priority: "high",
        relatedEntityType: "jigsaw_group",
        relatedEntityId: input.groupId,
      });

      return { success: true, notificationId: id };
    }),

  // Bulk notify all members of a group (used when admin creates/updates teams)
  notifyGroupMembers: publicProcedure
    .input(z.object({
      groupId: z.number(),
      classId: z.number(),
      teamName: z.string(),
      teamType: z.string(),
      memberIds: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const typeLabel = input.teamType === "seminar" ? "Seminário" :
                        input.teamType === "clinical_case" ? "Caso Clínico" :
                        input.teamType === "kahoot" ? "Kahoot" : "Equipe";

      const results = [];
      for (const memberId of input.memberIds) {
        try {
          const id = await db.createStudentNotification({
            memberId,
            classId: input.classId,
            title: `Você foi alocado(a) em uma equipe de ${typeLabel}!`,
            message: `Você foi designado(a) para a equipe "${input.teamName}". Acesse a aba Equipes no seu portal para ver mais detalhes sobre seus colegas e o tema do seminário.`,
            type: "team_allocation",
            priority: "high",
            relatedEntityType: "jigsaw_group",
            relatedEntityId: input.groupId,
          });
          results.push({ memberId, success: true, notificationId: id });
        } catch (err) {
          results.push({ memberId, success: false, error: String(err) });
        }
      }

      return { results, totalSent: results.filter(r => r.success).length };
    }),

  // Get notification preferences for a student
  getPreferences: publicProcedure
    .input(z.object({
      memberId: z.number(),
    }))
    .query(async ({ input }) => {
      const prefs = await db.getNotificationPreferences(input.memberId);
      if (!prefs) {
        return {
          memberId: input.memberId,
          enabled: true,
          enabledTypes: ["team_allocation", "grade_update", "announcement", "reminder", "attendance"],
          quietHoursStart: 22,
          quietHoursEnd: 8,
        };
      }
      return prefs;
    }),

  // Update notification preferences
  updatePreferences: publicProcedure
    .input(z.object({
      memberId: z.number(),
      enabled: z.boolean(),
      enabledTypes: z.array(z.string()),
      quietHoursStart: z.number().min(0).max(23),
      quietHoursEnd: z.number().min(0).max(23),
    }))
    .mutation(async ({ input }) => {
      await db.updateNotificationPreferences(input.memberId, {
        enabled: input.enabled,
        enabledTypes: input.enabledTypes,
        quietHoursStart: input.quietHoursStart,
        quietHoursEnd: input.quietHoursEnd,
      });
      return { success: true };
    }),
});
