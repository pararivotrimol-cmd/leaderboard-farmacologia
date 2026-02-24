import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db module
vi.mock("./db", () => ({
  getStudentNotifications: vi.fn(),
  getUnreadStudentNotificationCount: vi.fn(),
  createStudentNotification: vi.fn(),
  markStudentNotificationRead: vi.fn(),
  markAllStudentNotificationsRead: vi.fn(),
  dismissStudentNotification: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const createCaller = () => {
  const ctx: TrpcContext = { user: null };
  return appRouter.createCaller(ctx);
};

describe("Student Notifications Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMyNotifications", () => {
    it("should return notifications for a member", async () => {
      const mockNotifications = [
        {
          id: 1,
          memberId: 42,
          classId: 1,
          title: "Você foi alocado(a) na equipe de Seminário!",
          message: "Equipe Alpha",
          type: "team_allocation",
          priority: "high",
          isRead: false,
          isDismissed: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          memberId: 42,
          classId: 1,
          title: "Nota atualizada",
          message: "Sua nota da AV1 foi lançada.",
          type: "grade_update",
          priority: "normal",
          isRead: true,
          isDismissed: false,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getStudentNotifications).mockResolvedValue(mockNotifications as any);

      const caller = createCaller();
      const result = await caller.studentNotifications.getMyNotifications({
        memberId: 42,
        classId: 1,
      });

      expect(result).toHaveLength(2);
      expect(result[0].title).toContain("Seminário");
      expect(db.getStudentNotifications).toHaveBeenCalledWith(42, 1);
    });

    it("should return empty array when no notifications", async () => {
      vi.mocked(db.getStudentNotifications).mockResolvedValue([]);

      const caller = createCaller();
      const result = await caller.studentNotifications.getMyNotifications({
        memberId: 99,
      });

      expect(result).toHaveLength(0);
      expect(db.getStudentNotifications).toHaveBeenCalledWith(99, undefined);
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      vi.mocked(db.getUnreadStudentNotificationCount).mockResolvedValue(3);

      const caller = createCaller();
      const result = await caller.studentNotifications.getUnreadCount({
        memberId: 42,
      });

      expect(result).toEqual({ count: 3 });
      expect(db.getUnreadStudentNotificationCount).toHaveBeenCalledWith(42);
    });

    it("should return 0 when no unread notifications", async () => {
      vi.mocked(db.getUnreadStudentNotificationCount).mockResolvedValue(0);

      const caller = createCaller();
      const result = await caller.studentNotifications.getUnreadCount({
        memberId: 42,
      });

      expect(result).toEqual({ count: 0 });
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      vi.mocked(db.markStudentNotificationRead).mockResolvedValue(undefined);

      const caller = createCaller();
      const result = await caller.studentNotifications.markAsRead({
        notificationId: 1,
        memberId: 42,
      });

      expect(result).toEqual({ success: true });
      expect(db.markStudentNotificationRead).toHaveBeenCalledWith(1, 42);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read for a member", async () => {
      vi.mocked(db.markAllStudentNotificationsRead).mockResolvedValue(undefined);

      const caller = createCaller();
      const result = await caller.studentNotifications.markAllAsRead({
        memberId: 42,
      });

      expect(result).toEqual({ success: true });
      expect(db.markAllStudentNotificationsRead).toHaveBeenCalledWith(42);
    });
  });

  describe("dismiss", () => {
    it("should dismiss a notification", async () => {
      vi.mocked(db.dismissStudentNotification).mockResolvedValue(undefined);

      const caller = createCaller();
      const result = await caller.studentNotifications.dismiss({
        notificationId: 1,
        memberId: 42,
      });

      expect(result).toEqual({ success: true });
      expect(db.dismissStudentNotification).toHaveBeenCalledWith(1, 42);
    });
  });

  describe("notifyTeamAllocation", () => {
    it("should create a team allocation notification", async () => {
      vi.mocked(db.createStudentNotification).mockResolvedValue(10);

      const caller = createCaller();
      const result = await caller.studentNotifications.notifyTeamAllocation({
        memberId: 42,
        classId: 1,
        teamName: "Equipe Alpha",
        teamType: "seminar",
        groupId: 5,
      });

      expect(result).toEqual({ success: true, notificationId: 10 });
      expect(db.createStudentNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          memberId: 42,
          classId: 1,
          type: "team_allocation",
          priority: "high",
          relatedEntityType: "jigsaw_group",
          relatedEntityId: 5,
        })
      );
    });

    it("should use correct label for clinical_case type", async () => {
      vi.mocked(db.createStudentNotification).mockResolvedValue(11);

      const caller = createCaller();
      await caller.studentNotifications.notifyTeamAllocation({
        memberId: 42,
        classId: 1,
        teamName: "Caso Clínico Beta",
        teamType: "clinical_case",
        groupId: 6,
      });

      expect(db.createStudentNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("Caso Clínico"),
        })
      );
    });
  });

  describe("notifyGroupMembers", () => {
    it("should notify all members of a group", async () => {
      vi.mocked(db.createStudentNotification)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(11)
        .mockResolvedValueOnce(12);

      const caller = createCaller();
      const result = await caller.studentNotifications.notifyGroupMembers({
        groupId: 5,
        classId: 1,
        teamName: "Equipe Alpha",
        teamType: "seminar",
        memberIds: [42, 43, 44],
      });

      expect(result.totalSent).toBe(3);
      expect(result.results).toHaveLength(3);
      expect(result.results.every((r: any) => r.success)).toBe(true);
      expect(db.createStudentNotification).toHaveBeenCalledTimes(3);
    });

    it("should handle partial failures gracefully", async () => {
      vi.mocked(db.createStudentNotification)
        .mockResolvedValueOnce(10)
        .mockRejectedValueOnce(new Error("DB error"))
        .mockResolvedValueOnce(12);

      const caller = createCaller();
      const result = await caller.studentNotifications.notifyGroupMembers({
        groupId: 5,
        classId: 1,
        teamName: "Equipe Alpha",
        teamType: "seminar",
        memberIds: [42, 43, 44],
      });

      expect(result.totalSent).toBe(2);
      expect(result.results[1].success).toBe(false);
    });

    it("should handle empty memberIds array", async () => {
      const caller = createCaller();
      const result = await caller.studentNotifications.notifyGroupMembers({
        groupId: 5,
        classId: 1,
        teamName: "Equipe Alpha",
        teamType: "seminar",
        memberIds: [],
      });

      expect(result.totalSent).toBe(0);
      expect(result.results).toHaveLength(0);
      expect(db.createStudentNotification).not.toHaveBeenCalled();
    });
  });
});
