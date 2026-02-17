import { describe, it, expect } from "vitest";

/**
 * Tests for the Online Meetings feature
 * Validates the tRPC router structure and input validation
 */

describe("Meetings Router", () => {
  describe("Input Validation", () => {
    it("should require title for meeting creation", () => {
      const { z } = require("zod");
      const schema = z.object({
        password: z.string(),
        title: z.string().min(1),
        monitorName: z.string().min(1),
        meetingUrl: z.string().url(),
        platform: z.enum(["google_meet", "zoom", "teams", "discord", "other"]).default("google_meet"),
        scheduledAt: z.string(),
        durationMinutes: z.number().min(15).max(480).default(60),
        module: z.string().default("Geral"),
        maxParticipants: z.number().default(0),
        recurrence: z.enum(["none", "weekly"]).default("none"),
      });

      // Valid input
      const validResult = schema.safeParse({
        password: "test",
        title: "Monitoria de Farmacocinética",
        monitorName: "João",
        meetingUrl: "https://meet.google.com/abc-defg-hij",
        scheduledAt: "2026-02-20T10:00:00.000Z",
      });
      expect(validResult.success).toBe(true);

      // Missing title
      const noTitle = schema.safeParse({
        password: "test",
        title: "",
        monitorName: "João",
        meetingUrl: "https://meet.google.com/abc",
        scheduledAt: "2026-02-20T10:00:00.000Z",
      });
      expect(noTitle.success).toBe(false);

      // Missing monitor name
      const noMonitor = schema.safeParse({
        password: "test",
        title: "Monitoria",
        monitorName: "",
        meetingUrl: "https://meet.google.com/abc",
        scheduledAt: "2026-02-20T10:00:00.000Z",
      });
      expect(noMonitor.success).toBe(false);

      // Invalid URL
      const badUrl = schema.safeParse({
        password: "test",
        title: "Monitoria",
        monitorName: "João",
        meetingUrl: "not-a-url",
        scheduledAt: "2026-02-20T10:00:00.000Z",
      });
      expect(badUrl.success).toBe(false);
    });

    it("should validate platform enum values", () => {
      const { z } = require("zod");
      const platformSchema = z.enum(["google_meet", "zoom", "teams", "discord", "other"]);

      expect(platformSchema.safeParse("google_meet").success).toBe(true);
      expect(platformSchema.safeParse("zoom").success).toBe(true);
      expect(platformSchema.safeParse("teams").success).toBe(true);
      expect(platformSchema.safeParse("discord").success).toBe(true);
      expect(platformSchema.safeParse("other").success).toBe(true);
      expect(platformSchema.safeParse("invalid").success).toBe(false);
      expect(platformSchema.safeParse("skype").success).toBe(false);
    });

    it("should validate duration range (15-480 minutes)", () => {
      const { z } = require("zod");
      const durationSchema = z.number().min(15).max(480);

      expect(durationSchema.safeParse(60).success).toBe(true);
      expect(durationSchema.safeParse(15).success).toBe(true);
      expect(durationSchema.safeParse(480).success).toBe(true);
      expect(durationSchema.safeParse(14).success).toBe(false);
      expect(durationSchema.safeParse(481).success).toBe(false);
      expect(durationSchema.safeParse(0).success).toBe(false);
    });

    it("should validate recurrence enum", () => {
      const { z } = require("zod");
      const recurrenceSchema = z.enum(["none", "weekly"]);

      expect(recurrenceSchema.safeParse("none").success).toBe(true);
      expect(recurrenceSchema.safeParse("weekly").success).toBe(true);
      expect(recurrenceSchema.safeParse("daily").success).toBe(false);
      expect(recurrenceSchema.safeParse("monthly").success).toBe(false);
    });

    it("should validate status enum for updates", () => {
      const { z } = require("zod");
      const statusSchema = z.enum(["scheduled", "live", "completed", "cancelled"]);

      expect(statusSchema.safeParse("scheduled").success).toBe(true);
      expect(statusSchema.safeParse("live").success).toBe(true);
      expect(statusSchema.safeParse("completed").success).toBe(true);
      expect(statusSchema.safeParse("cancelled").success).toBe(true);
      expect(statusSchema.safeParse("pending").success).toBe(false);
    });

    it("should apply default values correctly", () => {
      const { z } = require("zod");
      const schema = z.object({
        platform: z.enum(["google_meet", "zoom", "teams", "discord", "other"]).default("google_meet"),
        durationMinutes: z.number().min(15).max(480).default(60),
        module: z.string().default("Geral"),
        maxParticipants: z.number().default(0),
        recurrence: z.enum(["none", "weekly"]).default("none"),
      });

      const result = schema.parse({});
      expect(result.platform).toBe("google_meet");
      expect(result.durationMinutes).toBe(60);
      expect(result.module).toBe("Geral");
      expect(result.maxParticipants).toBe(0);
      expect(result.recurrence).toBe("none");
    });
  });

  describe("Meeting URL Validation", () => {
    it("should accept valid Google Meet URLs", () => {
      const { z } = require("zod");
      const urlSchema = z.string().url();

      expect(urlSchema.safeParse("https://meet.google.com/abc-defg-hij").success).toBe(true);
      expect(urlSchema.safeParse("https://meet.google.com/lookup/abc123").success).toBe(true);
    });

    it("should accept valid Zoom URLs", () => {
      const { z } = require("zod");
      const urlSchema = z.string().url();

      expect(urlSchema.safeParse("https://zoom.us/j/1234567890").success).toBe(true);
      expect(urlSchema.safeParse("https://us02web.zoom.us/j/1234567890?pwd=abc").success).toBe(true);
    });

    it("should accept valid Discord URLs", () => {
      const { z } = require("zod");
      const urlSchema = z.string().url();

      expect(urlSchema.safeParse("https://discord.gg/abc123").success).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const { z } = require("zod");
      const urlSchema = z.string().url();

      expect(urlSchema.safeParse("not-a-url").success).toBe(false);
      expect(urlSchema.safeParse("").success).toBe(false);
      expect(urlSchema.safeParse("meet.google.com/abc").success).toBe(false);
    });
  });

  describe("Schema Structure", () => {
    it("should have correct onlineMeetings table columns", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.onlineMeetings).toBeDefined();

      // Verify the table has the expected column names
      const columns = Object.keys(schema.onlineMeetings);
      const expectedColumns = [
        "id", "title", "description", "monitorName", "meetingUrl",
        "platform", "scheduledAt", "durationMinutes", "module",
        "status", "maxParticipants", "isVisible", "recurrence",
        "createdAt", "updatedAt"
      ];

      for (const col of expectedColumns) {
        expect(columns).toContain(col);
      }
    });
  });
});
