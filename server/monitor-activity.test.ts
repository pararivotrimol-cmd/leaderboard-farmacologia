import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { studentAccounts, monitorActivityLogs } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

const TEST_MONITOR_EMAIL = "monitor.test.activity@edu.unirio.br";
const TEST_MONITOR_SESSION = "test-monitor-activity-session-token-xyz";
let testMonitorId: number;

describe("Monitor Activity Logs", () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Clean up any existing test monitor
    await db
      .delete(studentAccounts)
      .where(eq(studentAccounts.email, TEST_MONITOR_EMAIL));

    // Create a test monitor account
    const passwordHash = await bcrypt.hash("testpassword123", 10);
    await db.insert(studentAccounts).values({
      email: TEST_MONITOR_EMAIL,
      matricula: "999888",
      displayName: "Monitor Teste Atividade",
      passwordHash,
      accountType: "monitor",
      isActive: 1,
      sessionToken: TEST_MONITOR_SESSION,
    });

    const accounts = await db
      .select({ id: studentAccounts.id })
      .from(studentAccounts)
      .where(eq(studentAccounts.email, TEST_MONITOR_EMAIL));
    testMonitorId = accounts[0].id;
  });

  it("should create a monitor account with type 'monitor'", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const monitors = await db
      .select()
      .from(studentAccounts)
      .where(
        and(
          eq(studentAccounts.email, TEST_MONITOR_EMAIL),
          eq(studentAccounts.accountType, "monitor")
        )
      );

    expect(monitors.length).toBe(1);
    expect(monitors[0].displayName).toBe("Monitor Teste Atividade");
    expect(monitors[0].accountType).toBe("monitor");
  });

  it("should insert a monitor activity log", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db.insert(monitorActivityLogs).values({
      monitorId: testMonitorId,
      monitorName: "Monitor Teste Atividade",
      actionType: "attendance_marked",
      actionDescription: "Marcou presença para 5 alunos na semana 3",
      targetEntity: "attendance",
      targetId: 3,
      metadata: JSON.stringify({ week: 3, count: 5 }),
    });

    const logs = await db
      .select()
      .from(monitorActivityLogs)
      .where(eq(monitorActivityLogs.monitorId, testMonitorId));

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].actionType).toBe("attendance_marked");
    expect(logs[0].monitorName).toBe("Monitor Teste Atividade");
  });

  it("should insert multiple activity log types", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db.insert(monitorActivityLogs).values([
      {
        monitorId: testMonitorId,
        monitorName: "Monitor Teste Atividade",
        actionType: "resource_added",
        actionDescription: "Adicionou PDF de Farmacologia Básica",
        targetEntity: "resource",
        targetId: 10,
      },
      {
        monitorId: testMonitorId,
        monitorName: "Monitor Teste Atividade",
        actionType: "login",
        actionDescription: "Login realizado no portal do monitor",
      },
    ]);

    const logs = await db
      .select()
      .from(monitorActivityLogs)
      .where(eq(monitorActivityLogs.monitorId, testMonitorId));

    expect(logs.length).toBeGreaterThanOrEqual(3);
  });

  it("should retrieve activity logs for a specific monitor", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const logs = await db
      .select()
      .from(monitorActivityLogs)
      .where(eq(monitorActivityLogs.monitorId, testMonitorId));

    expect(logs.length).toBeGreaterThan(0);
    logs.forEach((log) => {
      expect(log.monitorId).toBe(testMonitorId);
      expect(log.actionType).toBeTruthy();
      expect(log.actionDescription).toBeTruthy();
      expect(log.createdAt).toBeDefined();
    });
  });

  it("should store optional fields correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const logs = await db
      .select()
      .from(monitorActivityLogs)
      .where(
        and(
          eq(monitorActivityLogs.monitorId, testMonitorId),
          eq(monitorActivityLogs.actionType, "attendance_marked")
        )
      );

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].targetEntity).toBe("attendance");
    expect(logs[0].targetId).toBe(3);
    expect(logs[0].metadata).toBe(JSON.stringify({ week: 3, count: 5 }));
  });

  it("should allow null optional fields", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const logs = await db
      .select()
      .from(monitorActivityLogs)
      .where(
        and(
          eq(monitorActivityLogs.monitorId, testMonitorId),
          eq(monitorActivityLogs.actionType, "login")
        )
      );

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].targetEntity).toBeNull();
    expect(logs[0].targetId).toBeNull();
    expect(logs[0].metadata).toBeNull();
  });

  it("should list monitors by accountType", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const monitors = await db
      .select()
      .from(studentAccounts)
      .where(eq(studentAccounts.accountType, "monitor"));

    expect(monitors.length).toBeGreaterThan(0);
    monitors.forEach((m) => {
      expect(m.accountType).toBe("monitor");
    });
  });

  it("should clean up test data", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Delete activity logs for test monitor
    await db
      .delete(monitorActivityLogs)
      .where(eq(monitorActivityLogs.monitorId, testMonitorId));

    // Delete test monitor account
    await db
      .delete(studentAccounts)
      .where(eq(studentAccounts.email, TEST_MONITOR_EMAIL));

    const remaining = await db
      .select()
      .from(studentAccounts)
      .where(eq(studentAccounts.email, TEST_MONITOR_EMAIL));

    expect(remaining.length).toBe(0);
  });
});
