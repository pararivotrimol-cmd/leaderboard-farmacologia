import { describe, it, expect } from "vitest";
import * as db from "./db";
import bcrypt from "bcryptjs";

describe("Teacher Authentication", () => {
  it("should create a new teacher account", async () => {
    const passwordHash = await bcrypt.hash("testpassword123", 10);
    
    const teacherId = await db.createTeacherAccount({
      email: "test.professor@unirio.br",
      name: "Professor Teste",
      passwordHash,
      isActive: 1,
    });

    expect(teacherId).toBeGreaterThan(0);
  });

  it("should retrieve teacher account by email", async () => {
    const teacher = await db.getTeacherAccountByEmail("test.professor@unirio.br");
    
    expect(teacher).toBeDefined();
    expect(teacher?.email).toBe("test.professor@unirio.br");
    expect(teacher?.name).toBe("Professor Teste");
    expect(teacher?.isActive).toBe(1);
  });

  it("should update teacher session token", async () => {
    const teacher = await db.getTeacherAccountByEmail("test.professor@unirio.br");
    expect(teacher).toBeDefined();

    const sessionToken = "test-session-token-123";
    await db.updateTeacherSessionToken(teacher!.id, sessionToken);

    const retrieved = await db.getTeacherAccountBySessionToken(sessionToken);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(teacher!.id);
    expect(retrieved?.sessionToken).toBe(sessionToken);
  });

  it("should retrieve teacher account by session token", async () => {
    const teacher = await db.getTeacherAccountBySessionToken("test-session-token-123");
    
    expect(teacher).toBeDefined();
    expect(teacher?.email).toBe("test.professor@unirio.br");
  });

  it("should clear teacher session token", async () => {
    await db.clearTeacherSessionToken("test-session-token-123");
    
    const teacher = await db.getTeacherAccountBySessionToken("test-session-token-123");
    expect(teacher).toBeNull();
  });

  it("should verify password correctly", async () => {
    const teacher = await db.getTeacherAccountByEmail("test.professor@unirio.br");
    expect(teacher).toBeDefined();

    const correctPassword = "testpassword123";
    const wrongPassword = "wrongpassword";

    const validCorrect = await bcrypt.compare(correctPassword, teacher!.passwordHash);
    const validWrong = await bcrypt.compare(wrongPassword, teacher!.passwordHash);

    expect(validCorrect).toBe(true);
    expect(validWrong).toBe(false);
  });

  it("should get all teacher accounts", async () => {
    const teachers = await db.getAllTeacherAccounts();
    
    expect(Array.isArray(teachers)).toBe(true);
    expect(teachers.length).toBeGreaterThan(0);
    expect(teachers.some(t => t.email === "test.professor@unirio.br")).toBe(true);
  });

  it("should update teacher account", async () => {
    const teacher = await db.getTeacherAccountByEmail("test.professor@unirio.br");
    expect(teacher).toBeDefined();

    await db.updateTeacherAccount(teacher!.id, {
      name: "Professor Teste Atualizado",
    });

    const updated = await db.getTeacherAccountByEmail("test.professor@unirio.br");
    expect(updated?.name).toBe("Professor Teste Atualizado");
  });

  it("should delete teacher account", async () => {
    const teacher = await db.getTeacherAccountByEmail("test.professor@unirio.br");
    expect(teacher).toBeDefined();

    await db.deleteTeacherAccount(teacher!.id);

    const deleted = await db.getTeacherAccountByEmail("test.professor@unirio.br");
    expect(deleted).toBeNull();
  });
});
