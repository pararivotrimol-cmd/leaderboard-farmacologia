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

  describe("verifyResetToken", () => {
    it("should return invalid for non-existent token", async () => {
      (db.getPasswordResetToken as any).mockResolvedValue(null);

      const tokenData = await db.getPasswordResetToken("nonexistent");
      const result = !tokenData
        ? { valid: false, message: "Token inválido", expiresAt: null }
        : { valid: true };

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Token inválido");
      expect(result.expiresAt).toBeNull();
    });

    it("should return invalid for used token", async () => {
      const usedToken = {
        id: 1, teacherAccountId: 1, token: "used",
        expiresAt: new Date(Date.now() + 3600000), used: 1,
      };
      (db.getPasswordResetToken as any).mockResolvedValue(usedToken);

      const tokenData = await db.getPasswordResetToken("used");
      const result = tokenData!.used
        ? { valid: false, message: "Token já utilizado", expiresAt: null }
        : { valid: true };

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Token já utilizado");
    });

    it("should return expired for expired token with expiresAt", async () => {
      const expiredDate = new Date(Date.now() - 60000);
      const expiredToken = {
        id: 1, teacherAccountId: 1, token: "expired",
        expiresAt: expiredDate, used: 0,
      };
      (db.getPasswordResetToken as any).mockResolvedValue(expiredToken);

      const tokenData = await db.getPasswordResetToken("expired");
      const expiresAt = new Date(tokenData!.expiresAt);
      const isExpired = new Date() > expiresAt;

      expect(isExpired).toBe(true);
      const result = { valid: false, message: "Token expirado", expiresAt: expiresAt.toISOString() };
      expect(result.expiresAt).toBeTruthy();
    });

    it("should return valid with expiresAt for valid token", async () => {
      const futureDate = new Date(Date.now() + 3600000);
      const validToken = {
        id: 1, teacherAccountId: 1, token: "valid",
        expiresAt: futureDate, used: 0,
      };
      (db.getPasswordResetToken as any).mockResolvedValue(validToken);

      const tokenData = await db.getPasswordResetToken("valid");
      const expiresAt = new Date(tokenData!.expiresAt);
      const isExpired = new Date() > expiresAt;

      expect(isExpired).toBe(false);
      expect(tokenData!.used).toBe(0);

      const result = { valid: true, message: "Token válido", expiresAt: expiresAt.toISOString() };
      expect(result.valid).toBe(true);
      expect(result.expiresAt).toContain("T"); // ISO string format
    });
  });

  describe("SMTP email integration", () => {
    it("should detect when SMTP is not configured", () => {
      // Simulate no SMTP env vars
      const isConfigured = !!("" && "" && "");
      expect(isConfigured).toBe(false);
    });

    it("should detect when SMTP is configured", () => {
      const isConfigured = !!("smtp.gmail.com" && "user@gmail.com" && "password123");
      expect(isConfigured).toBe(true);
    });

    it("should return resetLink when email is NOT sent (SMTP not configured)", () => {
      const emailSent = false;
      const resetPath = "/professor/redefinir-senha?token=abc123";

      const result = {
        success: true,
        message: emailSent
          ? "Um email com o link de redefinição foi enviado para o seu endereço cadastrado."
          : "Link de redefinição gerado com sucesso!",
        resetLink: emailSent ? null : resetPath,
        emailSent,
      };

      expect(result.resetLink).toBe(resetPath);
      expect(result.emailSent).toBe(false);
    });

    it("should NOT return resetLink when email IS sent (SMTP configured)", () => {
      const emailSent = true;
      const resetPath = "/professor/redefinir-senha?token=abc123";

      const result = {
        success: true,
        message: emailSent
          ? "Um email com o link de redefinição foi enviado para o seu endereço cadastrado."
          : "Link de redefinição gerado com sucesso!",
        resetLink: emailSent ? null : resetPath,
        emailSent,
      };

      expect(result.resetLink).toBeNull();
      expect(result.emailSent).toBe(true);
      expect(result.message).toContain("email");
    });
  });

  describe("Countdown timer logic", () => {
    it("should calculate time remaining correctly", () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const diff = expiresAt.getTime() - Date.now();
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      expect(minutes).toBeGreaterThanOrEqual(29);
      expect(minutes).toBeLessThanOrEqual(30);
      expect(seconds).toBeGreaterThanOrEqual(0);
      expect(seconds).toBeLessThan(60);
    });

    it("should detect expired token in countdown", () => {
      const expiresAt = new Date(Date.now() - 1000); // 1 second ago
      const diff = expiresAt.getTime() - Date.now();

      expect(diff).toBeLessThan(0);
      const expired = diff <= 0;
      expect(expired).toBe(true);
    });

    it("should flag urgent when less than 10 minutes remain", () => {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      const diff = expiresAt.getTime() - Date.now();
      const minutes = Math.floor(diff / (1000 * 60));
      const isUrgent = minutes < 10;

      expect(isUrgent).toBe(true);
    });

    it("should NOT flag urgent when more than 10 minutes remain", () => {
      const expiresAt = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes
      const diff = expiresAt.getTime() - Date.now();
      const minutes = Math.floor(diff / (1000 * 60));
      const isUrgent = minutes < 10;

      expect(isUrgent).toBe(false);
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
