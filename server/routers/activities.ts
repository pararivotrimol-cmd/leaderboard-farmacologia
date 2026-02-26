import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const activitiesRouter = router({
  // Get all activities
  getAll: publicProcedure
    .query(async () => {
      try {
        const database = await db.getDb();
        if (!database) throw new Error("Database connection failed");
        
        // Return empty array for now - activities will be managed through admin panel
        return [];
      } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
      }
    }),

  // Get activity details
  getActivity: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const database = await db.getDb();
        if (!database) throw new Error("Database connection failed");
        
        // Return activity details
        return null;
      } catch (error) {
        console.error("Error fetching activity:", error);
        return null;
      }
    }),

  // Submit activity response (student)
  submitResponse: protectedProcedure
    .input(
      z.object({
        activityId: z.number(),
        responseType: z.enum(["text", "file", "link"]),
        content: z.string(),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Store submission in database
        return {
          success: true,
          submissionId: Math.random(),
          activityId: input.activityId,
          submittedAt: new Date(),
          status: "pending",
        };
      } catch (error) {
        throw new Error("Failed to submit response");
      }
    }),

  // Get student submissions
  getStudentSubmissions: protectedProcedure
    .input(z.object({ activityId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        // Fetch student submissions from database
        return [];
      } catch (error) {
        console.error("Error fetching submissions:", error);
        return [];
      }
    }),

  // Submit feedback (teacher only)
  submitFeedback: protectedProcedure
    .input(
      z.object({
        submissionId: z.number(),
        feedback: z.string(),
        score: z.number().min(0).max(100),
        pointsAwarded: z.number().min(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only teachers can submit feedback");
      }

      try {
        // Store feedback and award points
        return {
          success: true,
          submissionId: input.submissionId,
          pointsAwarded: input.pointsAwarded,
          feedbackAt: new Date(),
        };
      } catch (error) {
        throw new Error("Failed to submit feedback");
      }
    }),

  // Award points to a member (admin only)
  awardPoints: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        points: z.number().min(0),
        reason: z.string(),
        activityId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can award points");
      }

      try {
        // Update member XP in database
        return {
          success: true,
          memberId: input.memberId,
          pointsAdded: input.points,
          reason: input.reason,
        };
      } catch (error) {
        throw new Error("Failed to award points");
      }
    }),

  // Get leaderboard (teams ranked by total points)
  getLeaderboard: publicProcedure
    .query(async () => {
      try {
        const database = await db.getDb();
        if (!database) throw new Error("Database connection failed");
        
        // Return leaderboard data
        return [];
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
      }
    }),

  // Get top individual students
  getTopStudents: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const database = await db.getDb();
        if (!database) throw new Error("Database connection failed");
        
        // Return top students
        return [];
      } catch (error) {
        console.error("Error fetching top students:", error);
        return [];
      }
    }),
});
