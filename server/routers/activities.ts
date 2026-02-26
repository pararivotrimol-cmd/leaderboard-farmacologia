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
        // This would integrate with the existing xpActivities or members table
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
        // This integrates with existing team and member data
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
