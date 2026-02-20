import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => {
  const mockTeams = [
    { id: 1, name: "Acetilcolina", emoji: "💊", color: "#3b82f6" },
    { id: 2, name: "Adrenalina", emoji: "💉", color: "#10b981" },
  ];
  const mockMembers = [
    { id: 1, teamId: 1, name: "Ana Silva", xp: "12.5" },
    { id: 2, teamId: 1, name: "Bruno Costa", xp: "11.0" },
    { id: 3, teamId: 2, name: "Felipe Alves", xp: "15.0" },
  ];
  const mockActivities = [
    { id: 1, name: "Quiz Relâmpago", icon: "⚡", maxXP: "0.5" },
    { id: 2, name: "Jigsaw em Sala", icon: "🧩", maxXP: "2.0" },
  ];
  const mockHighlights = [
    { id: 1, week: 1, date: "10/03/2026", activity: "Aula Inaugural", description: "Apresentação das regras", topTeam: "—", topStudent: "—" },
  ];
  const mockSettings = [
    { settingKey: "currentWeek", settingValue: "5" },
    { settingKey: "maxXPSemester", settingValue: "45" },
    { settingKey: "admin_password", settingValue: "farmaco2026" },
  ];

  return {
    getAllTeams: vi.fn().mockResolvedValue(mockTeams),
    getAllMembers: vi.fn().mockResolvedValue(mockMembers),
    getAllXpActivities: vi.fn().mockResolvedValue(mockActivities),
    getAllHighlights: vi.fn().mockResolvedValue(mockHighlights),
    getAllSettings: vi.fn().mockResolvedValue(mockSettings),
    getSetting: vi.fn().mockImplementation(async (key: string) => {
      const found = mockSettings.find(s => s.settingKey === key);
      return found ? found.settingValue : null;
    }),
    upsertSetting: vi.fn().mockResolvedValue(undefined),
    createTeam: vi.fn().mockResolvedValue(3),
    updateTeam: vi.fn().mockResolvedValue(undefined),
    deleteTeam: vi.fn().mockResolvedValue(undefined),
    createMember: vi.fn().mockResolvedValue(4),
    updateMember: vi.fn().mockResolvedValue(undefined),
    updateMemberXP: vi.fn().mockResolvedValue(undefined),
    bulkUpdateXP: vi.fn().mockResolvedValue(undefined),
    deleteMember: vi.fn().mockResolvedValue(undefined),
    getMembersByTeam: vi.fn().mockImplementation(async (teamId: number) => {
      return mockMembers.filter(m => m.teamId === teamId);
    }),
    createXpActivity: vi.fn().mockResolvedValue(3),
    updateXpActivity: vi.fn().mockResolvedValue(undefined),
    deleteXpActivity: vi.fn().mockResolvedValue(undefined),
    createHighlight: vi.fn().mockResolvedValue(2),
    updateHighlight: vi.fn().mockResolvedValue(undefined),
    deleteHighlight: vi.fn().mockResolvedValue(undefined),
    getActiveNotifications: vi.fn().mockResolvedValue([
      { id: 1, title: "Prova P1", content: "Estudem cap. 1-5", priority: "urgent", type: "banner", isActive: 1, expiresAt: null, createdAt: new Date() },
      { id: 2, title: "Seminário", content: "Grupo 3 apresenta", priority: "normal", type: "announcement", isActive: 1, expiresAt: null, createdAt: new Date() },
    ]),
    getAllNotifications: vi.fn().mockResolvedValue([
      { id: 1, title: "Prova P1", content: "Estudem cap. 1-5", priority: "urgent", type: "banner", isActive: 1, expiresAt: null, createdAt: new Date() },
      { id: 2, title: "Seminário", content: "Grupo 3 apresenta", priority: "normal", type: "announcement", isActive: 1, expiresAt: null, createdAt: new Date() },
      { id: 3, title: "Antigo", content: "Aviso expirado", priority: "normal", type: "reminder", isActive: 0, expiresAt: null, createdAt: new Date() },
    ]),
    createNotification: vi.fn().mockResolvedValue(4),
    updateNotification: vi.fn().mockResolvedValue(undefined),
    deleteNotification: vi.fn().mockResolvedValue(undefined),
    getDb: vi.fn(),
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("leaderboard.getData (public)", () => {
  it("returns teams with members, activities, highlights, and settings", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const data = await caller.leaderboard.getData();

    expect(data.teams).toHaveLength(2);
    expect(data.teams[0].name).toBe("Acetilcolina");
    expect(data.teams[0].members).toHaveLength(2);
    // Members are now sorted alphabetically by name
    // "Ana Silva" comes before "Bruno Costa"
    expect(data.teams[0].members[0].name).toBe("Ana Silva");
    expect(data.teams[0].members[0].xp).toBe(12.5);
    expect(data.teams[0].members[1].name).toBe("Bruno Costa");
    expect(data.teams[0].members[1].xp).toBe(11.0);
    expect(data.teams[1].members).toHaveLength(1);
    expect(data.activities).toHaveLength(2);
    // Activities are now sorted alphabetically by name
    // "Jigsaw em Sala" comes before "Quiz Relâmpago"
    expect(data.activities[0].name).toBe("Jigsaw em Sala");
    expect(data.activities[0].maxXP).toBe(2.0);
    expect(data.activities[1].name).toBe("Quiz Relâmpago");
    expect(data.activities[1].maxXP).toBe(0.5);
    expect(data.highlights).toHaveLength(1);
    expect(data.settings.currentWeek).toBe("5");
    // admin_password should NOT be exposed
    expect(data.settings).not.toHaveProperty("admin_password");
  });
});

describe("admin.login", () => {
  it("succeeds with correct password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.login({ password: "farmaco2026" });
    expect(result.success).toBe(true);
  });

  it("fails with wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.login({ password: "wrong" });
    expect(result.success).toBe(false);
    expect(result.message).toBe("Senha incorreta");
  });
});

describe("admin.changePassword", () => {
  it("succeeds with correct current password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.changePassword({
      currentPassword: "farmaco2026",
      newPassword: "newpass123",
    });
    expect(result.success).toBe(true);
  });

  it("fails with wrong current password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.changePassword({
      currentPassword: "wrong",
      newPassword: "newpass123",
    });
    expect(result.success).toBe(false);
  });
});

describe("teams CRUD (admin-protected)", () => {
  it("lists teams with correct password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const teams = await caller.teams.list({ password: "farmaco2026" });
    expect(teams).toHaveLength(2);
  });

  it("rejects listing with wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.teams.list({ password: "wrong" })).rejects.toThrow("Não autorizado");
  });

  it("creates a team", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.teams.create({
      password: "farmaco2026",
      name: "Nova Equipe",
      emoji: "🧪",
      color: "#ff0000",
    });
    expect(result.id).toBe(3);
  });

  it("deletes a team", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.teams.delete({ password: "farmaco2026", id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("members CRUD (admin-protected)", () => {
  it("creates a member", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.members.create({
      password: "farmaco2026",
      teamId: 1,
      name: "Novo Aluno",
      xp: "0",
    });
    expect(result.id).toBe(4);
  });

  it("bulk updates XP", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.members.bulkUpdateXP({
      password: "farmaco2026",
      updates: [
        { id: 1, xp: "15.0" },
        { id: 2, xp: "12.5" },
      ],
    });
    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
  });

  it("rejects bulk update with wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.members.bulkUpdateXP({
        password: "wrong",
        updates: [{ id: 1, xp: "15.0" }],
      })
    ).rejects.toThrow("Não autorizado");
  });
});

describe("activities CRUD (admin-protected)", () => {
  it("creates an activity", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.activities.create({
      password: "farmaco2026",
      name: "Nova Atividade",
      icon: "🎯",
      maxXP: "3.0",
    });
    expect(result.id).toBe(3);
  });
});

describe("highlights CRUD (admin-protected)", () => {
  it("creates a highlight", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.highlights.create({
      password: "farmaco2026",
      week: 6,
      date: "14/04/2026",
      activity: "Kahoot 2",
      description: "Segundo Kahoot do semestre",
    });
    expect(result.id).toBe(2);
  });
});

describe("settings (admin-protected)", () => {
  it("placeholder for settings router", async () => {
    // Testes para settingsRouter serão implementados quando as rotas forem criadas
    expect(true).toBe(true);
  });
});

describe("notifications (public + admin)", () => {
  it("returns active notifications publicly", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const notifs = await caller.notifications.getActive();
    expect(notifs).toHaveLength(2);
    expect(notifs[0].title).toBe("Prova P1");
    expect(notifs[1].type).toBe("announcement");
  });

  it("returns all notifications for admin", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const notifs = await caller.notifications.getAll({ password: "farmaco2026" });
    expect(notifs).toHaveLength(3);
  });

  it("rejects getAll with wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.notifications.getAll({ password: "wrong" })
    ).rejects.toThrow("Não autorizado");
  });

  it("creates a notification", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.create({
      password: "farmaco2026",
      title: "Novo Aviso",
      content: "Conteúdo do aviso",
      priority: "important",
      type: "banner",
    });
    expect(result.id).toBe(4);
  });

  it("rejects create with wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.notifications.create({
        password: "wrong",
        title: "Teste",
      })
    ).rejects.toThrow("Não autorizado");
  });

  it("updates a notification", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.update({
      password: "farmaco2026",
      id: 1,
      title: "Prova P1 Atualizada",
      isActive: 0,
    });
    expect(result.success).toBe(true);
  });

  it("deletes a notification", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.delete({
      password: "farmaco2026",
      id: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects delete with wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.notifications.delete({ password: "wrong", id: 1 })
    ).rejects.toThrow("Não autorizado");
  });
});
