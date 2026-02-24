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

function createAuthenticatedContext(userId: number, email: string): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "test-open-id",
      email,
      name: "Test User",
      avatarUrl: null,
      role: "user",
      createdAt: new Date(),
    },
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
          password: "12345678901",
          memberId: 1,
        })
      ).rejects.toThrow();
    });

    it("rejects CPF with wrong length (too short)", async () => {
      await expect(
        caller.studentAuth.register({
          email: "test@edu.unirio.br",
          matricula: "12345",
          password: "12345",
          memberId: 1,
        })
      ).rejects.toThrow();
    });

    it("rejects CPF with wrong length (too long)", async () => {
      await expect(
        caller.studentAuth.register({
          email: "test@edu.unirio.br",
          matricula: "12345",
          password: "123456789012",
          memberId: 1,
        })
      ).rejects.toThrow();
    });

    it("rejects CPF with non-numeric characters", async () => {
      await expect(
        caller.studentAuth.register({
          email: "test@edu.unirio.br",
          matricula: "12345",
          password: "1234567890a",
          memberId: 1,
        })
      ).rejects.toThrow();
    });

    it("rejects short matricula", async () => {
      await expect(
        caller.studentAuth.register({
          email: "test@edu.unirio.br",
          matricula: "12",
          password: "12345678901",
          memberId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("returns error for non-existent email", async () => {
      const result = await caller.studentAuth.login({
        email: "nonexistent@edu.unirio.br",
        password: "12345678901",
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
        currentPassword: "12345678901",
        newPassword: "10987654321",
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain("inválida");
    });

    it("rejects non-11-digit new CPF", async () => {
      await expect(
        caller.studentAuth.changePassword({
          sessionToken: "some-token",
          currentPassword: "12345678901",
          newPassword: "short",
        })
      ).rejects.toThrow();
    });
  });
});

describe("attendance (QR Code system)", () => {
  describe("checkInWithQRCode", () => {
    it("rejects unauthenticated users", async () => {
      const publicCaller = appRouter.createCaller(createPublicContext());
      await expect(
        publicCaller.attendance.checkInWithQRCode({
          token: "fake-token",
          classDate: "2026-03-10",
        })
      ).rejects.toThrow();
    });

    it("rejects invalid QR token for authenticated user", async () => {
      const authCaller = appRouter.createCaller(
        createAuthenticatedContext(999, "test@edu.unirio.br")
      );
      await expect(
        authCaller.attendance.checkInWithQRCode({
          token: "invalid-token-that-does-not-exist",
          classDate: "2026-03-10",
        })
      ).rejects.toThrow("QR code não encontrado ou inválido");
    });
  });

  describe("getMyAttendance", () => {
    it("rejects unauthenticated users", async () => {
      const publicCaller = appRouter.createCaller(createPublicContext());
      await expect(
        publicCaller.attendance.getMyAttendance()
      ).rejects.toThrow();
    });

    it("returns attendance data for authenticated user", async () => {
      const authCaller = appRouter.createCaller(
        createAuthenticatedContext(999, "test@edu.unirio.br")
      );
      const result = await authCaller.attendance.getMyAttendance();
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("attendance");
      expect(Array.isArray(result.attendance)).toBe(true);
    });
  });

  describe("getClassAttendance", () => {
    it("rejects non-admin users", async () => {
      const authCaller = appRouter.createCaller(
        createAuthenticatedContext(999, "test@edu.unirio.br")
      );
      await expect(
        authCaller.attendance.getClassAttendance({
          classDate: "2026-03-10",
          classId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("manualCheckIn", () => {
    it("rejects non-admin users", async () => {
      const authCaller = appRouter.createCaller(
        createAuthenticatedContext(999, "test@edu.unirio.br")
      );
      await expect(
        authCaller.attendance.manualCheckIn({
          studentAccountId: 1,
          classDate: "2026-03-10",
        })
      ).rejects.toThrow();
    });
  });

  describe("generateQRCode", () => {
    it("rejects non-admin users", async () => {
      const authCaller = appRouter.createCaller(
        createAuthenticatedContext(999, "test@edu.unirio.br")
      );
      await expect(
        authCaller.attendance.generateQRCode({
          classId: 1,
          classDate: "2026-03-10",
        })
      ).rejects.toThrow();
    });
  });
});
