import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock getDb to return a mock database
const mockBossBattleRows: any[] = [];
const mockGameProgressRows: any[] = [];
const mockInsertedValues: any[] = [];
const mockUpdatedValues: any[] = [];

let selectCallCount = 0;

vi.mock("./db", () => {
  return {
    getDb: vi.fn().mockImplementation(async () => {
      selectCallCount = 0;
      return {
        select: vi.fn().mockImplementation((...args: any[]) => {
          const currentCall = ++selectCallCount;
          return {
            from: vi.fn().mockImplementation((table: any) => {
              return {
                where: vi.fn().mockImplementation(() => {
                  return {
                    limit: vi.fn().mockImplementation((n: number) => {
                      // First select is always gameProgress lookup
                      if (currentCall === 1 && mockGameProgressRows.length > 0) {
                        return Promise.resolve(mockGameProgressRows.slice(0, n));
                      }
                      // For completeBossBattle: count query returns count
                      if (currentCall === 1) {
                        return Promise.resolve([{ count: mockBossBattleRows.length }]);
                      }
                      // alreadyDefeated check
                      if (currentCall === 2) {
                        const victories = mockBossBattleRows.filter((b: any) => b.isVictory);
                        return Promise.resolve(victories.slice(0, n));
                      }
                      return Promise.resolve([]);
                    }),
                    orderBy: vi.fn().mockImplementation(() => {
                      return Promise.resolve(mockBossBattleRows);
                    }),
                    then: (resolve: any) => resolve(mockBossBattleRows),
                  };
                }),
                limit: vi.fn().mockImplementation((n: number) => {
                  return Promise.resolve([]);
                }),
                orderBy: vi.fn().mockImplementation(() => {
                  return Promise.resolve([]);
                }),
                then: (resolve: any) => resolve([]),
              };
            }),
          };
        }),
        insert: vi.fn().mockImplementation(() => ({
          values: vi.fn().mockImplementation((vals: any) => {
            mockInsertedValues.push(vals);
            return Promise.resolve({ insertId: 1 });
          }),
        })),
        update: vi.fn().mockImplementation(() => ({
          set: vi.fn().mockImplementation((vals: any) => {
            mockUpdatedValues.push(vals);
            return {
              where: vi.fn().mockResolvedValue(undefined),
            };
          }),
        })),
      };
    }),
    getAllTeams: vi.fn().mockResolvedValue([]),
    getAllMembers: vi.fn().mockResolvedValue([]),
    getAllXpActivities: vi.fn().mockResolvedValue([]),
    getAllHighlights: vi.fn().mockResolvedValue([]),
    getAllSettings: vi.fn().mockResolvedValue([
      { settingKey: "currentWeek", settingValue: "5" },
      { settingKey: "maxXPSemester", settingValue: "45" },
    ]),
    getSetting: vi.fn().mockResolvedValue(null),
    upsertSetting: vi.fn().mockResolvedValue(undefined),
    createTeam: vi.fn().mockResolvedValue(1),
    createMember: vi.fn().mockResolvedValue(1),
    createActivity: vi.fn().mockResolvedValue(1),
    updateMemberXP: vi.fn().mockResolvedValue(undefined),
    deleteMember: vi.fn().mockResolvedValue(undefined),
    deleteTeam: vi.fn().mockResolvedValue(undefined),
    deleteActivity: vi.fn().mockResolvedValue(undefined),
    createHighlight: vi.fn().mockResolvedValue(1),
    deleteHighlight: vi.fn().mockResolvedValue(undefined),
    updateHighlight: vi.fn().mockResolvedValue(undefined),
    getAllClasses: vi.fn().mockResolvedValue([]),
    getClassById: vi.fn().mockResolvedValue(null),
    createClass: vi.fn().mockResolvedValue(1),
    updateClass: vi.fn().mockResolvedValue(undefined),
    deleteClass: vi.fn().mockResolvedValue(undefined),
  };
});

const createCaller = () => {
  const ctx: TrpcContext = { user: null };
  return appRouter.createCaller(ctx);
};

describe("Boss Battle System", () => {
  beforeEach(() => {
    mockBossBattleRows.length = 0;
    mockGameProgressRows.length = 0;
    mockInsertedValues.length = 0;
    mockUpdatedValues.length = 0;
    selectCallCount = 0;
    vi.clearAllMocks();
  });

  describe("game.getBossStatus", () => {
    it("should return boss status for a specific week", async () => {
      const caller = createCaller();
      const result = await caller.game.getBossStatus({
        classId: 1,
        memberId: 1,
        weekNumber: 1,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("available");
      expect(result).toHaveProperty("defeated");
      expect(result).toHaveProperty("attempts");
    });

    it("should indicate boss is not defeated when no victories exist", async () => {
      const caller = createCaller();
      const result = await caller.game.getBossStatus({
        classId: 1,
        memberId: 1,
        weekNumber: 1,
      });

      expect(result.defeated).toBe(false);
      expect(result.attempts).toBe(0);
    });

    it("should indicate boss is defeated when a victory exists", async () => {
      mockBossBattleRows.push({
        id: 1,
        memberId: 1,
        classId: 1,
        weekNumber: 1,
        isVictory: true,
        bossName: "Guardião do Portal",
        totalDamageDealt: 300,
        playerHpRemaining: 50,
        phasesCompleted: 3,
        totalPhases: 3,
        comboMax: 4,
        pfEarned: 25,
        xpEarned: 200,
        totalTimeSpent: 120,
        attemptNumber: 1,
        createdAt: new Date(),
      });

      const caller = createCaller();
      const result = await caller.game.getBossStatus({
        classId: 1,
        memberId: 1,
        weekNumber: 1,
      });

      expect(result.defeated).toBe(true);
      expect(result.attempts).toBe(1);
    });
  });

  describe("game.getAllBossStatuses", () => {
    it("should return empty array when no progress exists", async () => {
      const caller = createCaller();
      const result = await caller.game.getAllBossStatuses({
        classId: 1,
        memberId: 1,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("game.completeBossBattle", () => {
    it("should record a boss battle victory", async () => {
      mockGameProgressRows.push({
        id: 1,
        memberId: 1,
        classId: 1,
        farmacologiaPoints: 100,
        experience: 500,
        combatsWon: 5,
        totalCombats: 8,
        level: 3,
        questsCompleted: 6,
        achievements: "[]",
        lastPlayedAt: new Date(),
      });

      const caller = createCaller();
      const result = await caller.game.completeBossBattle({
        classId: 1,
        memberId: 1,
        weekNumber: 1,
        isVictory: true,
        bossName: "Guardião do Portal",
        totalDamageDealt: 300,
        playerHpRemaining: 50,
        phasesCompleted: 3,
        totalPhases: 3,
        comboMax: 4,
        pfEarned: 25,
        xpEarned: 200,
        totalTimeSpent: 120,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.isFirstVictory).toBe(true);
      expect(result.pfEarned).toBe(25);
      expect(result.xpEarned).toBe(200);
      expect(result.attemptNumber).toBe(1);
    });

    it("should record a boss battle defeat", async () => {
      const caller = createCaller();
      const result = await caller.game.completeBossBattle({
        classId: 1,
        memberId: 1,
        weekNumber: 1,
        isVictory: false,
        bossName: "Guardião do Portal",
        totalDamageDealt: 150,
        playerHpRemaining: 0,
        phasesCompleted: 1,
        totalPhases: 3,
        comboMax: 2,
        pfEarned: 5,
        xpEarned: 40,
        totalTimeSpent: 90,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.isFirstVictory).toBe(false);
    });

    it("should not give rewards for repeated victories", async () => {
      mockBossBattleRows.push({
        id: 1,
        memberId: 1,
        classId: 1,
        weekNumber: 1,
        isVictory: true,
      });

      mockGameProgressRows.push({
        id: 1,
        memberId: 1,
        classId: 1,
        farmacologiaPoints: 125,
        experience: 700,
        combatsWon: 6,
        totalCombats: 9,
        level: 4,
        questsCompleted: 8,
        achievements: "[]",
        lastPlayedAt: new Date(),
      });

      const caller = createCaller();
      const result = await caller.game.completeBossBattle({
        classId: 1,
        memberId: 1,
        weekNumber: 1,
        isVictory: true,
        bossName: "Guardião do Portal",
        totalDamageDealt: 300,
        playerHpRemaining: 80,
        phasesCompleted: 3,
        totalPhases: 3,
        comboMax: 5,
        pfEarned: 25,
        xpEarned: 200,
        totalTimeSpent: 100,
      });

      expect(result.success).toBe(true);
      expect(result.isFirstVictory).toBe(false);
      expect(result.pfEarned).toBe(0);
      expect(result.xpEarned).toBe(0);
    });
  });

  describe("game.getBossBattleHistory", () => {
    it("should return empty array when no battles exist", async () => {
      const caller = createCaller();
      const result = await caller.game.getBossBattleHistory({
        classId: 1,
        memberId: 1,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should return battle history when battles exist", async () => {
      mockBossBattleRows.push(
        {
          id: 1,
          memberId: 1,
          classId: 1,
          weekNumber: 1,
          isVictory: false,
          bossName: "Guardião do Portal",
          totalDamageDealt: 150,
          attemptNumber: 1,
          createdAt: new Date(),
        },
        {
          id: 2,
          memberId: 1,
          classId: 1,
          weekNumber: 1,
          isVictory: true,
          bossName: "Guardião do Portal",
          totalDamageDealt: 300,
          attemptNumber: 2,
          createdAt: new Date(),
        }
      );

      const caller = createCaller();
      const result = await caller.game.getBossBattleHistory({
        classId: 1,
        memberId: 1,
      });

      expect(result.length).toBe(2);
    });
  });
});
