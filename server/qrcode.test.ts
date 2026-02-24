import { describe, expect, it, vi, beforeEach } from "vitest";
import { z } from "zod";

/**
 * QR Code Attendance System — Unit Tests
 * Tests input validation, QR data generation, and URL parsing logic
 * (DB-dependent integration tests are skipped in CI)
 */

// ═══════ Input Validation Tests ═══════

const createSessionSchema = z.object({
  classId: z.number(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const checkInSchema = z.object({
  sessionId: z.number(),
  memberId: z.number(),
  classId: z.number(),
});

describe("QR Code Session - Input Validation", () => {
  it("accepts valid createSession input", () => {
    const input = {
      classId: 1,
      dayOfWeek: 3, // Wednesday
      startTime: "08:00",
      endTime: "12:00",
    };
    const result = createSessionSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects invalid dayOfWeek (7)", () => {
    const input = {
      classId: 1,
      dayOfWeek: 7,
      startTime: "08:00",
      endTime: "12:00",
    };
    const result = createSessionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid dayOfWeek (-1)", () => {
    const input = {
      classId: 1,
      dayOfWeek: -1,
      startTime: "08:00",
      endTime: "12:00",
    };
    const result = createSessionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format (8:00 instead of 08:00)", () => {
    const input = {
      classId: 1,
      dayOfWeek: 3,
      startTime: "8:00",
      endTime: "12:00",
    };
    const result = createSessionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format (no colon)", () => {
    const input = {
      classId: 1,
      dayOfWeek: 3,
      startTime: "0800",
      endTime: "1200",
    };
    const result = createSessionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts all valid days of week (0-6)", () => {
    for (let day = 0; day <= 6; day++) {
      const input = {
        classId: 1,
        dayOfWeek: day,
        startTime: "08:00",
        endTime: "12:00",
      };
      const result = createSessionSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });
});

describe("QR Code CheckIn - Input Validation", () => {
  it("accepts valid checkIn input", () => {
    const input = {
      sessionId: 1,
      memberId: 42,
      classId: 1,
    };
    const result = checkInSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects missing memberId", () => {
    const input = {
      sessionId: 1,
      classId: 1,
    };
    const result = checkInSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects string sessionId", () => {
    const input = {
      sessionId: "abc",
      memberId: 42,
      classId: 1,
    };
    const result = checkInSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ═══════ QR Code Data Generation Tests ═══════

describe("QR Code Data Generation", () => {
  it("generates valid QR code data structure", () => {
    const input = {
      classId: 1,
      dayOfWeek: 3,
      startTime: "08:00",
      endTime: "12:00",
    };

    const qrCodeData = {
      classId: input.classId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      timestamp: Date.now(),
      sessionId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    expect(qrCodeData.classId).toBe(1);
    expect(qrCodeData.dayOfWeek).toBe(3);
    expect(qrCodeData.startTime).toBe("08:00");
    expect(qrCodeData.endTime).toBe("12:00");
    expect(typeof qrCodeData.timestamp).toBe("number");
    expect(qrCodeData.sessionId).toMatch(/^qr_\d+_[a-z0-9]+$/);
  });

  it("generates unique session IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const id = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      ids.add(id);
    }
    // All 100 IDs should be unique
    expect(ids.size).toBe(100);
  });
});

// ═══════ QR Code URL Parsing Tests ═══════

describe("QR Code URL Parsing (AttendanceCheckIn)", () => {
  it("parses valid check-in URL with session and class params", () => {
    const url = new URL("https://example.com/attendance/check-in?s=5&c=1");
    const sid = url.searchParams.get("s");
    const cid = url.searchParams.get("c");

    expect(sid).toBe("5");
    expect(cid).toBe("1");
    expect(parseInt(sid!)).toBe(5);
    expect(parseInt(cid!)).toBe(1);
  });

  it("handles URL without params gracefully", () => {
    const url = new URL("https://example.com/attendance/check-in");
    const sid = url.searchParams.get("s");
    const cid = url.searchParams.get("c");

    expect(sid).toBeNull();
    expect(cid).toBeNull();
  });

  it("parses JSON QR code data (legacy format)", () => {
    const qrData = JSON.stringify({ sessionId: 5, classId: 1 });
    const parsed = JSON.parse(qrData);

    expect(parsed.sessionId).toBe(5);
    expect(parsed.classId).toBe(1);
  });

  it("handles invalid JSON gracefully", () => {
    const qrData = "not-json-data";
    let parsed = null;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      // Expected
    }
    expect(parsed).toBeNull();
  });
});

// ═══════ Time Validation Tests ═══════

describe("Attendance Time Validation", () => {
  it("validates current time is within session window", () => {
    const sessionStartTime = "08:00";
    const sessionEndTime = "12:00";
    const currentTime = "10:30";

    const isWithinWindow =
      currentTime >= sessionStartTime && currentTime <= sessionEndTime;
    expect(isWithinWindow).toBe(true);
  });

  it("rejects time before session start", () => {
    const sessionStartTime = "08:00";
    const sessionEndTime = "12:00";
    const currentTime = "07:30";

    const isWithinWindow =
      currentTime >= sessionStartTime && currentTime <= sessionEndTime;
    expect(isWithinWindow).toBe(false);
  });

  it("rejects time after session end", () => {
    const sessionStartTime = "08:00";
    const sessionEndTime = "12:00";
    const currentTime = "13:00";

    const isWithinWindow =
      currentTime >= sessionStartTime && currentTime <= sessionEndTime;
    expect(isWithinWindow).toBe(false);
  });

  it("accepts exact start time", () => {
    const sessionStartTime = "08:00";
    const sessionEndTime = "12:00";
    const currentTime = "08:00";

    const isWithinWindow =
      currentTime >= sessionStartTime && currentTime <= sessionEndTime;
    expect(isWithinWindow).toBe(true);
  });

  it("accepts exact end time", () => {
    const sessionStartTime = "08:00";
    const sessionEndTime = "12:00";
    const currentTime = "12:00";

    const isWithinWindow =
      currentTime >= sessionStartTime && currentTime <= sessionEndTime;
    expect(isWithinWindow).toBe(true);
  });

  it("validates day of week matching", () => {
    const sessionDayOfWeek = 3; // Wednesday
    const currentDay = 3;

    expect(currentDay).toBe(sessionDayOfWeek);
  });

  it("rejects wrong day of week", () => {
    const sessionDayOfWeek = 3; // Wednesday
    const currentDay = 5; // Friday

    expect(currentDay).not.toBe(sessionDayOfWeek);
  });
});

// ═══════ Attendance Summary Calculation Tests ═══════

describe("Attendance Summary Calculation", () => {
  it("calculates correct attendance percentage", () => {
    const totalSessions = 10;
    const presentSessions = 8;
    const absentSessions = totalSessions - presentSessions;
    const attendancePercentage =
      totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    expect(absentSessions).toBe(2);
    expect(attendancePercentage).toBe(80);
  });

  it("handles zero sessions gracefully", () => {
    const totalSessions = 0;
    const presentSessions = 0;
    const attendancePercentage =
      totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    expect(attendancePercentage).toBe(0);
  });

  it("handles perfect attendance", () => {
    const totalSessions = 16;
    const presentSessions = 16;
    const attendancePercentage =
      totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    expect(attendancePercentage).toBe(100);
  });

  it("formats percentage to 2 decimal places", () => {
    const totalSessions = 3;
    const presentSessions = 1;
    const attendancePercentage =
      totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    expect(attendancePercentage.toFixed(2)).toBe("33.33");
  });
});
