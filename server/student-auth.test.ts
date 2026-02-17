import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("studentAuth", () => {
  const caller = appRouter.createCaller(createPublicContext());

  describe("getAvailableMembers", () => {
    it("returns a list of members without accounts", async () => {
      const members = await caller.studentAuth.getAvailableMembers();
      expect(Array.isArray(members)).toBe(true);
      // Each member should have id, name, teamName, teamEmoji
      if (members.length > 0) {
        const m = members[0];
        expect(m).toHaveProperty("id");
        expect(m).toHaveProperty("name");
        expect(m).toHaveProperty("teamName");
        expect(m).toHaveProperty("teamEmoji");
      }
    });
  });

  describe("register", () => {
    it("rejects non-institutional email", async () => {
      await expect(
        caller.studentAuth.register({
          email: "test@gmail.com",
          matricula: "12345",
          password: "password123",
          memberId: 1,
        })
      ).rejects.toThrow();
    });

    it("rejects short password", async () => {
      await expect(
        caller.studentAuth.register({
          email: "test@edu.unirio.br",
          matricula: "12345",
          password: "12",
          memberId: 1,
        })
      ).rejects.toThrow();
    });

    it("rejects short matricula", async () => {
      await expect(
        caller.studentAuth.register({
          email: "test@edu.unirio.br",
          matricula: "12",
          password: "password123",
          memberId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("returns error for non-existent email", async () => {
      const result = await caller.studentAuth.login({
        email: "nonexistent@edu.unirio.br",
        password: "password123",
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain("não encontrado");
    });
  });

  describe("me", () => {
    it("returns null for invalid session token", async () => {
      const result = await caller.studentAuth.me({
        sessionToken: "invalid-token-12345",
      });
      expect(result).toBeNull();
    });
  });

  describe("logout", () => {
    it("succeeds even with invalid token", async () => {
      const result = await caller.studentAuth.logout({
        sessionToken: "invalid-token-12345",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("changePassword", () => {
    it("returns error for invalid session", async () => {
      const result = await caller.studentAuth.changePassword({
        sessionToken: "invalid-token",
        currentPassword: "old",
        newPassword: "newpassword",
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain("inválida");
    });
  });
});

describe("attendance", () => {
  const caller = appRouter.createCaller(createPublicContext());

  describe("checkIn", () => {
    it("rejects invalid session token", async () => {
      const result = await caller.attendance.checkIn({
        sessionToken: "invalid-token",
        latitude: -22.9176,
        longitude: -43.1831,
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain("inválida");
    });
  });

  describe("myAttendance", () => {
    it("returns empty array for invalid session", async () => {
      const result = await caller.attendance.myAttendance({
        sessionToken: "invalid-token",
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("getByWeek (admin)", () => {
    it("rejects invalid admin password", async () => {
      await expect(
        caller.attendance.getByWeek({ password: "wrong-password", week: 1 })
      ).rejects.toThrow();
    });
  });

  describe("getSummary (admin)", () => {
    it("rejects invalid admin password", async () => {
      await expect(
        caller.attendance.getSummary({ password: "wrong-password" })
      ).rejects.toThrow();
    });
  });

  describe("manualCheckIn (admin)", () => {
    it("rejects invalid admin password", async () => {
      await expect(
        caller.attendance.manualCheckIn({
          password: "wrong-password",
          memberId: 1,
          week: 1,
          classDate: "2026-03-10",
        })
      ).rejects.toThrow();
    });
  });

  describe("delete (admin)", () => {
    it("rejects invalid admin password", async () => {
      await expect(
        caller.attendance.delete({ password: "wrong-password", id: 1 })
      ).rejects.toThrow();
    });
  });

  describe("getAccounts (admin)", () => {
    it("rejects invalid admin password", async () => {
      await expect(
        caller.attendance.getAccounts({ password: "wrong-password" })
      ).rejects.toThrow();
    });
  });

  describe("deleteAccount (admin)", () => {
    it("rejects invalid admin password", async () => {
      await expect(
        caller.attendance.deleteAccount({ password: "wrong-password", id: 1 })
      ).rejects.toThrow();
    });
  });
});
