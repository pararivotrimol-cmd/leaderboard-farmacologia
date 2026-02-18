import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("XP History", () => {
  let testMemberId: number;

  beforeAll(async () => {
    // Create a test team
    const teamId = await db.createTeam({
      name: "Test Team XP History",
      emoji: "🧪",
      color: "#10b981",
    });

    // Create a test member
    testMemberId = await db.createMember({
      teamId,
      name: "Test Student XP History",
      xp: "0",
    });
  });

  it("should record XP history for a member", async () => {
    // Record XP for week 1
    const historyId = await db.recordXpHistory({
      memberId: testMemberId,
      week: 1,
      xpValue: "10.5",
    });

    expect(historyId).toBeGreaterThan(0);
  });

  it("should retrieve XP history for a member", async () => {
    // Record multiple weeks
    await db.recordXpHistory({
      memberId: testMemberId,
      week: 2,
      xpValue: "25.0",
    });

    await db.recordXpHistory({
      memberId: testMemberId,
      week: 3,
      xpValue: "42.5",
    });

    // Retrieve history
    const history = await db.getXpHistoryByMember(testMemberId);

    expect(history.length).toBeGreaterThanOrEqual(3);
    expect(history[0].week).toBe(1);
    expect(Number(history[0].xpValue)).toBe(10.5);
  });

  it("should update existing XP history when recording same week", async () => {
    // Record week 1 again with different value
    await db.recordXpHistory({
      memberId: testMemberId,
      week: 1,
      xpValue: "15.0",
      note: "Updated value",
    });

    // Retrieve history
    const history = await db.getXpHistoryByMember(testMemberId);
    const week1Record = history.find(h => h.week === 1);

    expect(week1Record).toBeDefined();
    expect(Number(week1Record!.xpValue)).toBe(15.0);
    expect(week1Record!.note).toBe("Updated value");
  });

  it("should retrieve XP history for a specific week range", async () => {
    // Record weeks 4-6
    await db.recordXpHistory({ memberId: testMemberId, week: 4, xpValue: "50.0" });
    await db.recordXpHistory({ memberId: testMemberId, week: 5, xpValue: "60.0" });
    await db.recordXpHistory({ memberId: testMemberId, week: 6, xpValue: "70.0" });

    // Get weeks 2-5
    const history = await db.getXpHistoryByMemberAndWeeks(testMemberId, 2, 5);

    expect(history.length).toBe(4); // weeks 2, 3, 4, 5
    expect(history.every(h => h.week >= 2 && h.week <= 5)).toBe(true);
  });

  it("should retrieve XP history for a specific week", async () => {
    const history = await db.getXpHistoryByWeek(3);
    
    expect(Array.isArray(history)).toBe(true);
    expect(history.every(h => h.week === 3)).toBe(true);
  });

  it("should delete XP history when deleting a member", async () => {
    // Create another test member
    const teamId = await db.createTeam({
      name: "Test Team Delete",
      emoji: "🗑️",
      color: "#ef4444",
    });

    const memberId = await db.createMember({
      teamId,
      name: "Test Student Delete",
      xp: "0",
    });

    // Record some history
    await db.recordXpHistory({ memberId, week: 1, xpValue: "10.0" });
    await db.recordXpHistory({ memberId, week: 2, xpValue: "20.0" });

    // Verify history exists
    let history = await db.getXpHistoryByMember(memberId);
    expect(history.length).toBe(2);

    // Delete member's history
    await db.deleteXpHistoryByMember(memberId);

    // Verify history is deleted
    history = await db.getXpHistoryByMember(memberId);
    expect(history.length).toBe(0);
  });
});
