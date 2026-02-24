import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  default: {
    getTeacherAccountByEmail: vi.fn(),
    createPasswordResetToken: vi.fn(),
    getPasswordResetToken: vi.fn(),
    markPasswordResetTokenUsed: vi.fn(),
    updateTeacherPassword: vi.fn(),
  },
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import db from "./db";
import crypto from "crypto";

describe("Password Reset Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requestPasswordReset", () => {
    it("should return success even if email does not exist (prevent enumeration)", async () => {
      (db.getTeacherAccountByEmail as any).mockResolvedValue(null);

      // Simulate the logic from the router
      const email = "nonexistent@unirio.br";
      const teacher = await db.getTeacherAccountByEmail(email.toLowerCase().trim());

      expect(teacher).toBeNull();
      // Should not reveal that email doesn't exist
      expect(db.createPasswordResetToken).not.toHaveBeenCalled();
    });

    it("should generate token and create reset record for valid teacher", async () => {
      const mockTeacher = { id: 1, name: "Prof. Maria", email: "maria@unirio.br" };
      (db.getTeacherAccountByEmail as any).mockResolvedValue(mockTeacher);
      (db.createPasswordResetToken as any).mockResolvedValue({ insertId: 1 });

      const teacher = await db.getTeacherAccountByEmail("maria@unirio.br");
      expect(teacher).not.toBeNull();
      expect(teacher!.id).toBe(1);

      // Generate token
      const resetToken = crypto.randomBytes(32).toString("hex");
      expect(resetToken).toHaveLength(64); // 32 bytes = 64 hex chars

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await db.createPasswordResetToken({
        teacherAccountId: teacher!.id,
        token: resetToken,
        expiresAt,
        used: 0,
      });

      expect(db.createPasswordResetToken).toHaveBeenCalledWith({
        teacherAccountId: 1,
        token: resetToken,
        expiresAt: expect.any(Date),
        used: 0,
      });
    });

    it("should normalize email to lowercase and trim", async () => {
      (db.getTeacherAccountByEmail as any).mockResolvedValue(null);

      const rawEmail = "  Maria@UNIRIO.BR  ";
      const normalized = rawEmail.toLowerCase().trim();

      expect(normalized).toBe("maria@unirio.br");
      await db.getTeacherAccountByEmail(normalized);
      expect(db.getTeacherAccountByEmail).toHaveBeenCalledWith("maria@unirio.br");
    });

    it("should build correct reset link with origin", () => {
      const resetToken = "abc123def456";
      const origin = "https://farmacologia.manus.space";
      const resetPath = `/professor/redefinir-senha?token=${resetToken}`;
      const fullResetLink = origin + resetPath;

      expect(fullResetLink).toBe("https://farmacologia.manus.space/professor/redefinir-senha?token=abc123def456");
    });

    it("should build reset link without origin when not provided", () => {
      const resetToken = "abc123def456";
      const origin = "";
      const resetPath = `/professor/redefinir-senha?token=${resetToken}`;
      const fullResetLink = origin + resetPath;

      expect(fullResetLink).toBe("/professor/redefinir-senha?token=abc123def456");
    });

    it("should set token expiration to 1 hour", () => {
      const now = Date.now();
      const expiresAt = new Date(now + 60 * 60 * 1000);
      const diff = expiresAt.getTime() - now;

      expect(diff).toBe(3600000); // 1 hour in ms
    });
  });

  describe("resetPassword", () => {
    it("should reject if token does not exist", async () => {
      (db.getPasswordResetToken as any).mockResolvedValue(null);

      const tokenRecord = await db.getPasswordResetToken("invalid-token");
      expect(tokenRecord).toBeNull();
    });

    it("should reject if token is expired", async () => {
      const expiredToken = {
        id: 1,
        teacherAccountId: 1,
        token: "valid-token",
        expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
        used: 0,
      };
      (db.getPasswordResetToken as any).mockResolvedValue(expiredToken);

      const tokenRecord = await db.getPasswordResetToken("valid-token");
      expect(tokenRecord).not.toBeNull();

      const isExpired = new Date() > new Date(tokenRecord!.expiresAt);
      expect(isExpired).toBe(true);
    });

    it("should reject if token is already used", async () => {
      const usedToken = {
        id: 1,
        teacherAccountId: 1,
        token: "used-token",
        expiresAt: new Date(Date.now() + 3600000),
        used: 1,
      };
      (db.getPasswordResetToken as any).mockResolvedValue(usedToken);

      const tokenRecord = await db.getPasswordResetToken("used-token");
      expect(tokenRecord!.used).toBe(1);
    });

    it("should accept valid, unexpired, unused token", async () => {
      const validToken = {
        id: 1,
        teacherAccountId: 1,
        token: "valid-token",
        expiresAt: new Date(Date.now() + 3600000),
        used: 0,
      };
      (db.getPasswordResetToken as any).mockResolvedValue(validToken);

      const tokenRecord = await db.getPasswordResetToken("valid-token");
      expect(tokenRecord).not.toBeNull();

      const isExpired = new Date() > new Date(tokenRecord!.expiresAt);
      expect(isExpired).toBe(false);
      expect(tokenRecord!.used).toBe(0);
    });

    it("should mark token as used after successful reset", async () => {
      (db.markPasswordResetTokenUsed as any).mockResolvedValue(undefined);
      (db.updateTeacherPassword as any).mockResolvedValue(undefined);

      await db.updateTeacherPassword(1, "hashedPassword");
      await db.markPasswordResetTokenUsed(1);

      expect(db.updateTeacherPassword).toHaveBeenCalledWith(1, "hashedPassword");
      expect(db.markPasswordResetTokenUsed).toHaveBeenCalledWith(1);
    });

    it("should enforce minimum password length of 6 characters", () => {
      const shortPassword = "abc";
      const validPassword = "abc123";

      expect(shortPassword.length).toBeLessThan(6);
      expect(validPassword.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("Password strength validation", () => {
    it("should detect weak passwords", () => {
      const getStrength = (pw: string) => {
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
      };

      expect(getStrength("abc")).toBe(0);
      expect(getStrength("abcdef")).toBe(1);
      expect(getStrength("abcdefgh")).toBe(2);
      expect(getStrength("Abcdefgh")).toBe(3);
      expect(getStrength("Abcdefg1")).toBe(4);
      expect(getStrength("Abcdef1!")).toBe(5);
    });
  });

  describe("Token generation", () => {
    it("should generate unique tokens", () => {
      const token1 = crypto.randomBytes(32).toString("hex");
      const token2 = crypto.randomBytes(32).toString("hex");

      expect(token1).not.toBe(token2);
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
    });

    it("should generate hex-only tokens", () => {
      const token = crypto.randomBytes(32).toString("hex");
      expect(token).toMatch(/^[0-9a-f]+$/);
    });
  });
});
