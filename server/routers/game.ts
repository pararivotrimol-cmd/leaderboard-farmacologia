import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { gameProgress, gameQuests, gameCombats, gameAchievements } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const gameRouter = router({
  /**
   * Get player's game progress
   */
  getProgress: protectedProcedure
    .input(z.object({
      classId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const progress = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, ctx.user.id),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      return progress[0] || null;
    }),

  /**
   * Initialize game progress for a student
   */
  initializeProgress: protectedProcedure
    .input(z.object({
      classId: z.number(),
      memberId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if already exists
      const existing = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, input.memberId),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Create new progress
      const result = await db
        .insert(gameProgress)
        .values({
          memberId: input.memberId,
          classId: input.classId,
          level: 1,
          farmacologiaPoints: 0,
          experience: 0,
          questsCompleted: 0,
          questsTotal: 0,
        });

      // Get the inserted record
      const inserted = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, input.memberId),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      return inserted[0];
    }),

  /**
   * Get available quests for a level
   */
  getQuestsByLevel: protectedProcedure
    .input(z.object({
      classId: z.number(),
      level: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const quests = await db
        .select()
        .from(gameQuests)
        .where(
          and(
            eq(gameQuests.classId, input.classId),
            eq(gameQuests.level, input.level),
            eq(gameQuests.isActive, true)
          )
        )
        .orderBy(gameQuests.order);

      return quests;
    }),

  /**
   * Start a quest (get the question)
   */
  startQuest: protectedProcedure
    .input(z.object({
      questId: z.number(),
      classId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get quest details
      const quest = await db
        .select()
        .from(gameQuests)
        .where(eq(gameQuests.id, input.questId))
        .limit(1);

      if (!quest[0]) {
        throw new Error("Quest not found");
      }

      // Update current quest in progress
      await db
        .update(gameProgress)
        .set({ currentQuestId: input.questId })
        .where(
          and(
            eq(gameProgress.memberId, ctx.user.id),
            eq(gameProgress.classId, input.classId)
          )
        );

      return quest[0];
    }),

  /**
   * Submit answer to quest question
   */
  submitAnswer: protectedProcedure
    .input(z.object({
      questId: z.number(),
      classId: z.number(),
      questionId: z.number(),
      answer: z.string(),
      timeSpent: z.number(), // seconds
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get question to check answer
      const question = await db
        .select()
        .from(gameQuests)
        .where(eq(gameQuests.id, input.questId))
        .limit(1);

      if (!question[0]) {
        throw new Error("Quest not found");
      }

      // For now, assume answer is correct if it matches the first option
      // In real implementation, check against correct answer
      const isCorrect = true; // Placeholder

      const farmacologiaPointsEarned = isCorrect ? question[0].farmacologiaPointsReward : 0;

      // Get game progress ID
      const progressRecord = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, ctx.user.id),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      if (!progressRecord[0]) {
        throw new Error("Game progress not found");
      }

      // Record combat
      const combat = await db
        .insert(gameCombats)
        .values({
          gameProgressId: progressRecord[0].id,
          questId: input.questId,
          questionId: input.questionId,
          playerAnswer: input.answer,
          correctAnswer: "correct_answer", // Placeholder
          isWon: isCorrect,
          farmacologiaPointsEarned,
          timeSpent: input.timeSpent,
          attemptNumber: 1,
        });

      // Update progress with new values
      if (progressRecord[0]) {
        if (isCorrect) {
          await db
            .update(gameProgress)
            .set({
              farmacologiaPoints: progressRecord[0].farmacologiaPoints + farmacologiaPointsEarned,
              questsCompleted: progressRecord[0].questsCompleted + 1,
              combatsWon: progressRecord[0].combatsWon + 1,
              totalCombats: progressRecord[0].totalCombats + 1,
            })
            .where(
              and(
                eq(gameProgress.memberId, ctx.user.id),
                eq(gameProgress.classId, input.classId)
              )
            );
        } else {
          await db
            .update(gameProgress)
            .set({
              combatsLost: progressRecord[0].combatsLost + 1,
              totalCombats: progressRecord[0].totalCombats + 1,
            })
            .where(
              and(
                eq(gameProgress.memberId, ctx.user.id),
                eq(gameProgress.classId, input.classId)
              )
            );
        }
      }

      return {
        isCorrect,
        farmacologiaPointsEarned,
        message: isCorrect ? "Parabéns! Você venceu o combate!" : "Tente novamente!",
      };
    }),

  /**
   * Level up player
   */
  levelUp: protectedProcedure
    .input(z.object({
      classId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const currentProgress = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, ctx.user.id),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      if (!currentProgress[0]) {
        throw new Error("Game progress not found");
      }

      await db
        .update(gameProgress)
        .set({
          level: currentProgress[0].level + 1,
          experience: 0,
        })
        .where(
          and(
            eq(gameProgress.memberId, ctx.user.id),
            eq(gameProgress.classId, input.classId)
          )
        );

      return { success: true, newLevel: currentProgress[0].level + 1 };
    }),

  /**
   * Complete the game (Farmacologia I)
   */
  completeGame: protectedProcedure
    .input(z.object({
      classId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(gameProgress)
        .set({
          isCompleted: true,
        })
        .where(
          and(
            eq(gameProgress.memberId, ctx.user.id),
            eq(gameProgress.classId, input.classId)
          )
        );

      return { success: true, message: "Parabéns! Você completou Farmacologia I!" };
    }),

  /**
   * Get leaderboard (top players by PF)
   */
  getLeaderboard: publicProcedure
    .input(z.object({
      classId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const leaderboard = await db
        .select()
        .from(gameProgress)
        .where(eq(gameProgress.classId, input.classId))
        .limit(input.limit);

      return leaderboard.sort((a: any, b: any) => b.farmacologiaPoints - a.farmacologiaPoints);
    }),
});
