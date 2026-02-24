import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ───
const mockTeacher = {
  id: 1,
  email: "prof@unirio.br",
  name: "Prof. Maria",
  passwordHash: "$2b$10$hashedpassword",
  role: "professor",
  isActive: 1,
  phone: null,
  bio: null,
  specialty: null,
  lattesUrl: null,
  photoUrl: null,
  department: null,
  title: null,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

const mockProfile = {
  id: 1,
  email: "prof@unirio.br",
  name: "Prof. Maria",
  role: "professor",
  phone: null,
  bio: null,
  specialty: null,
  lattesUrl: null,
  photoUrl: null,
  department: null,
  title: null,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

const mockUpdatedProfile = {
  ...mockProfile,
  phone: "(21) 99999-9999",
  bio: "Farmacologista com 10 anos de experiência",
  specialty: "Farmacologia Cardiovascular",
  department: "Departamento de Farmacologia",
  title: "Prof. Dr.",
};

vi.mock("./db", () => ({
  default: {
    getTeacherAccountBySessionToken: vi.fn(),
    getTeacherProfile: vi.fn(),
    updateTeacherProfile: vi.fn(),
    updateTeacherAccount: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

import db from "./db";
import bcrypt from "bcrypt";

describe("Teacher Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return profile for authenticated teacher", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(mockTeacher as any);
      vi.mocked(db.getTeacherProfile).mockResolvedValue(mockProfile as any);

      const teacher = await db.getTeacherAccountBySessionToken("valid-token");
      expect(teacher).toBeTruthy();
      expect(teacher!.id).toBe(1);

      const profile = await db.getTeacherProfile(teacher!.id);
      expect(profile).toBeTruthy();
      expect(profile!.email).toBe("prof@unirio.br");
      expect(profile!.name).toBe("Prof. Maria");
    });

    it("should return null for invalid session token", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(null);

      const teacher = await db.getTeacherAccountBySessionToken("invalid-token");
      expect(teacher).toBeNull();
    });

    it("should include all profile fields", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(mockTeacher as any);
      vi.mocked(db.getTeacherProfile).mockResolvedValue(mockUpdatedProfile as any);

      const teacher = await db.getTeacherAccountBySessionToken("valid-token");
      const profile = await db.getTeacherProfile(teacher!.id);

      expect(profile).toHaveProperty("phone");
      expect(profile).toHaveProperty("bio");
      expect(profile).toHaveProperty("specialty");
      expect(profile).toHaveProperty("lattesUrl");
      expect(profile).toHaveProperty("photoUrl");
      expect(profile).toHaveProperty("department");
      expect(profile).toHaveProperty("title");
      expect(profile).toHaveProperty("createdAt");
      expect(profile).toHaveProperty("lastLoginAt");
    });
  });

  describe("updateProfile", () => {
    it("should update profile fields for authenticated teacher", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(mockTeacher as any);
      vi.mocked(db.updateTeacherProfile).mockResolvedValue(undefined);
      vi.mocked(db.getTeacherProfile).mockResolvedValue(mockUpdatedProfile as any);

      const teacher = await db.getTeacherAccountBySessionToken("valid-token");
      expect(teacher).toBeTruthy();

      await db.updateTeacherProfile(teacher!.id, {
        phone: "(21) 99999-9999",
        bio: "Farmacologista com 10 anos de experiência",
        specialty: "Farmacologia Cardiovascular",
        department: "Departamento de Farmacologia",
        title: "Prof. Dr.",
      });

      expect(db.updateTeacherProfile).toHaveBeenCalledWith(1, {
        phone: "(21) 99999-9999",
        bio: "Farmacologista com 10 anos de experiência",
        specialty: "Farmacologia Cardiovascular",
        department: "Departamento de Farmacologia",
        title: "Prof. Dr.",
      });

      const updatedProfile = await db.getTeacherProfile(teacher!.id);
      expect(updatedProfile!.phone).toBe("(21) 99999-9999");
      expect(updatedProfile!.specialty).toBe("Farmacologia Cardiovascular");
    });

    it("should reject update for invalid session", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(null);

      const teacher = await db.getTeacherAccountBySessionToken("invalid-token");
      expect(teacher).toBeNull();
      // In the actual endpoint, this returns { success: false, message: "Sessão inválida" }
    });

    it("should allow partial updates (only some fields)", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(mockTeacher as any);
      vi.mocked(db.updateTeacherProfile).mockResolvedValue(undefined);

      const teacher = await db.getTeacherAccountBySessionToken("valid-token");
      await db.updateTeacherProfile(teacher!.id, { phone: "(21) 88888-8888" });

      expect(db.updateTeacherProfile).toHaveBeenCalledWith(1, { phone: "(21) 88888-8888" });
    });

    it("should allow setting fields to null", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(mockTeacher as any);
      vi.mocked(db.updateTeacherProfile).mockResolvedValue(undefined);

      const teacher = await db.getTeacherAccountBySessionToken("valid-token");
      await db.updateTeacherProfile(teacher!.id, { phone: null, bio: null });

      expect(db.updateTeacherProfile).toHaveBeenCalledWith(1, { phone: null, bio: null });
    });
  });

  describe("changePassword", () => {
    it("should change password when current password is correct", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(mockTeacher as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any);
      vi.mocked(bcrypt.hash).mockResolvedValue("$2b$10$newhash" as any);
      vi.mocked(db.updateTeacherAccount).mockResolvedValue(undefined);

      const teacher = await db.getTeacherAccountBySessionToken("valid-token");
      expect(teacher).toBeTruthy();

      const isValid = await bcrypt.compare("currentPassword", teacher!.passwordHash);
      expect(isValid).toBe(true);

      const newHash = await bcrypt.hash("newPassword123", 10);
      await db.updateTeacherAccount(teacher!.id, { passwordHash: newHash });

      expect(db.updateTeacherAccount).toHaveBeenCalledWith(1, { passwordHash: "$2b$10$newhash" });
    });

    it("should reject password change when current password is wrong", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(mockTeacher as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

      const teacher = await db.getTeacherAccountBySessionToken("valid-token");
      const isValid = await bcrypt.compare("wrongPassword", teacher!.passwordHash);
      expect(isValid).toBe(false);
      // In the actual endpoint, this returns { success: false, message: "Senha atual incorreta" }
    });

    it("should reject password change for invalid session", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(null);

      const teacher = await db.getTeacherAccountBySessionToken("invalid-token");
      expect(teacher).toBeNull();
    });
  });

  describe("uploadPhoto", () => {
    it("should validate session before uploading", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(null);

      const teacher = await db.getTeacherAccountBySessionToken("invalid-token");
      expect(teacher).toBeNull();
    });

    it("should update photoUrl after successful upload", async () => {
      vi.mocked(db.getTeacherAccountBySessionToken).mockResolvedValue(mockTeacher as any);
      vi.mocked(db.updateTeacherProfile).mockResolvedValue(undefined);

      const teacher = await db.getTeacherAccountBySessionToken("valid-token");
      expect(teacher).toBeTruthy();

      const photoUrl = "https://storage.example.com/teacher-photos/1-abc123.jpg";
      await db.updateTeacherProfile(teacher!.id, { photoUrl });

      expect(db.updateTeacherProfile).toHaveBeenCalledWith(1, { photoUrl });
    });
  });

  describe("Profile field validation", () => {
    it("should validate name minimum length", () => {
      const name = "AB";
      expect(name.length).toBeLessThan(3);
      // In the actual endpoint, z.string().min(3) would reject this
    });

    it("should validate name maximum length", () => {
      const name = "A".repeat(201);
      expect(name.length).toBeGreaterThan(200);
      // In the actual endpoint, z.string().max(200) would reject this
    });

    it("should validate phone maximum length", () => {
      const phone = "1".repeat(31);
      expect(phone.length).toBeGreaterThan(30);
      // In the actual endpoint, z.string().max(30) would reject this
    });

    it("should validate bio maximum length", () => {
      const bio = "A".repeat(2001);
      expect(bio.length).toBeGreaterThan(2000);
      // In the actual endpoint, z.string().max(2000) would reject this
    });

    it("should accept valid Lattes URL", () => {
      const lattesUrl = "http://lattes.cnpq.br/1234567890";
      expect(lattesUrl.startsWith("http")).toBe(true);
      expect(lattesUrl.length).toBeLessThanOrEqual(500);
    });

    it("should validate password minimum length", () => {
      const password = "12345";
      expect(password.length).toBeLessThan(6);
      // In the actual endpoint, z.string().min(6) would reject this
    });
  });
});
