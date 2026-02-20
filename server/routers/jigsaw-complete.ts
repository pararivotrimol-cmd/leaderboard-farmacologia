/**
 * Complete Jigsaw Method Router
 * Implements expert groups, home groups, and scoring
 */

import { router, adminProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import {
  jigsawTopics,
  jigsawExpertGroups,
  jigsawExpertMembers,
  jigsawHomeGroups,
  jigsawHomeMembers,
  jigsawScores,
  members,
} from "../../drizzle/schema";

/**
 * Input validation schemas
 */
const createTopicInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  articleUrl: z.string().url().optional(),
  articleTitle: z.string().optional(),
  articleAuthors: z.string().optional(),
  articleYear: z.number().optional(),
  keyPoints: z.array(z.string()).optional(),
  studyDuration: z.number().default(5),
});

const createExpertGroupInput = z.object({
  classId: z.number(),
  topicId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  maxMembers: z.number().default(14),
  presentationDate: z.date().optional(),
});

const addExpertMemberInput = z.object({
  expertGroupId: z.number(),
  memberId: z.number(),
  role: z.enum(["member", "coordinator", "presenter"]).default("member"),
});

const scoreExpertGroupInput = z.object({
  expertGroupId: z.number(),
  scores: z.array(z.object({
    memberId: z.number(),
    presentationScore: z.number().min(0).max(5),
    participationScore: z.number().min(0).max(2),
  })),
});

const createHomeGroupInput = z.object({
  classId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  meetingNumber: z.number(),
  meetingDate: z.date().optional(),
});

const addHomeMemberInput = z.object({
  homeGroupId: z.number(),
  memberId: z.number(),
  topicId: z.number(),
});

const scoreHomeGroupInput = z.object({
  homeGroupId: z.number(),
  scores: z.array(z.object({
    memberId: z.number(),
    presentationScore: z.number().min(0).max(5),
    participationScore: z.number().min(0).max(2),
    peerRating: z.number().min(0).max(5),
  })),
});

export const jigsawCompleteRouter = router({
  /**
   * ========================================
   * JIGSAW TOPICS MANAGEMENT
   * ========================================
   */
  topics: {
    /**
     * Get all Jigsaw topics
     */
    getAll: protectedProcedure.query(async () => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const topics = await db.select().from(jigsawTopics);
        return topics;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar tópicos Jigsaw",
        });
      }
    }),

    /**
     * Get topic by ID
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const result = await db
            .select()
            .from(jigsawTopics)
            .where(eq(jigsawTopics.id, input.id))
            .limit(1);
          
          if (result.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Tópico não encontrado",
            });
          }
          return result[0];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar tópico",
          });
        }
      }),

    /**
     * Create new Jigsaw topic (admin only)
     */
    create: adminProcedure
      .input(createTopicInput)
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          await db.insert(jigsawTopics).values({
            name: input.name,
            description: input.description || undefined,
            articleUrl: input.articleUrl || undefined,
            articleTitle: input.articleTitle || undefined,
            articleAuthors: input.articleAuthors || undefined,
            articleYear: input.articleYear || undefined,
            keyPoints: input.keyPoints ? JSON.stringify(input.keyPoints) : undefined,
            studyDuration: input.studyDuration,
          });
          
          return { success: true, topicId: input.name.length };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar tópico",
          });
        }
      }),

    /**
     * Update Jigsaw topic (admin only)
     */
    update: adminProcedure
      .input(z.object({ id: z.number(), ...createTopicInput.shape }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          await db.update(jigsawTopics).set({
            name: input.name,
            description: input.description || undefined,
            articleUrl: input.articleUrl || undefined,
            articleTitle: input.articleTitle || undefined,
            articleAuthors: input.articleAuthors || undefined,
            articleYear: input.articleYear || undefined,
            keyPoints: input.keyPoints ? JSON.stringify(input.keyPoints) : undefined,
            studyDuration: input.studyDuration,
          }).where(eq(jigsawTopics.id, input.id));
          
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao atualizar tópico",
          });
        }
      }),
  },

  /**
   * ========================================
   * EXPERT GROUPS MANAGEMENT
   * ========================================
   */
  expertGroups: {
    /**
     * Create expert group (admin only)
     */
    create: adminProcedure
      .input(createExpertGroupInput)
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          await db.insert(jigsawExpertGroups).values({
            classId: input.classId,
            topicId: input.topicId,
            name: input.name,
            description: input.description || undefined,
            maxMembers: input.maxMembers,
            status: "forming",
            presentationDate: input.presentationDate,
          });
          
          return { success: true, groupId: input.classId };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar grupo de especialistas",
          });
        }
      }),

    /**
     * Get expert groups by class
     */
    getByClass: protectedProcedure
      .input(z.object({ classId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const groups = await db
            .select()
            .from(jigsawExpertGroups)
            .where(eq(jigsawExpertGroups.classId, input.classId));
          
          return groups;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar grupos de especialistas",
          });
        }
      }),

    /**
     * Get expert group by ID with members
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const result = await db
            .select()
            .from(jigsawExpertGroups)
            .where(eq(jigsawExpertGroups.id, input.id))
            .limit(1);
          
          if (result.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Grupo de especialistas não encontrado",
            });
          }
          
          return result[0];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar grupo",
          });
        }
      }),

    /**
     * Add member to expert group
     */
    addMember: protectedProcedure
      .input(addExpertMemberInput)
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // Check if member already in group
          const existing = await db
            .select()
            .from(jigsawExpertMembers)
            .where(
              and(
                eq(jigsawExpertMembers.expertGroupId, input.expertGroupId),
                eq(jigsawExpertMembers.memberId, input.memberId)
              )
            )
            .limit(1);

          if (existing.length > 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Membro já está no grupo",
            });
          }

          await db.insert(jigsawExpertMembers).values({
            expertGroupId: input.expertGroupId,
            memberId: input.memberId,
            role: input.role,
          });
          
          return { success: true, memberId: input.memberId };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao adicionar membro",
          });
        }
      }),

    /**
     * Remove member from expert group
     */
    removeMember: protectedProcedure
      .input(z.object({ expertGroupId: z.number(), memberId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          await db
            .delete(jigsawExpertMembers)
            .where(
              and(
                eq(jigsawExpertMembers.expertGroupId, input.expertGroupId),
                eq(jigsawExpertMembers.memberId, input.memberId)
              )
            );
          
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao remover membro",
          });
        }
      }),

    /**
     * Score expert group presentation (admin only)
     */
    scorePresentation: adminProcedure
      .input(scoreExpertGroupInput)
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          for (const score of input.scores) {
            await db
              .update(jigsawExpertMembers)
              .set({
                presentationScore: String(score.presentationScore),
                participationScore: String(score.participationScore),
              })
              .where(
                and(
                  eq(jigsawExpertMembers.expertGroupId, input.expertGroupId),
                  eq(jigsawExpertMembers.memberId, score.memberId)
                )
              );
          }

          // Update expert group status
          await db
            .update(jigsawExpertGroups)
            .set({ status: "completed" })
            .where(eq(jigsawExpertGroups.id, input.expertGroupId));

          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao registrar notas",
          });
        }
      }),

    /**
     * Get scores for expert group
     */
    getScores: protectedProcedure
      .input(z.object({ expertGroupId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const memberScores = await db
            .select()
            .from(jigsawExpertMembers)
            .where(eq(jigsawExpertMembers.expertGroupId, input.expertGroupId));

          return memberScores.map((m: any) => ({
            memberId: m.memberId,
            presentationScore: m.presentationScore,
            participationScore: m.participationScore,
            totalScore: (Number(m.presentationScore) || 0) + (Number(m.participationScore) || 0),
          }));
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar notas",
          });
        }
      }),
  },

  /**
   * ========================================
   * HOME GROUPS (JIGSAW GROUPS) MANAGEMENT
   * ========================================
   */
  homeGroups: {
    /**
     * Create home group (Jigsaw group)
     */
    create: adminProcedure
      .input(createHomeGroupInput)
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          await db.insert(jigsawHomeGroups).values({
            classId: input.classId,
            name: input.name,
            description: input.description || undefined,
            meetingNumber: input.meetingNumber,
            meetingDate: input.meetingDate,
            status: "forming",
          });
          
          return { success: true, groupId: input.classId };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar grupo Jigsaw",
          });
        }
      }),

    /**
     * Get home groups by class
     */
    getByClass: protectedProcedure
      .input(z.object({ classId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const groups = await db
            .select()
            .from(jigsawHomeGroups)
            .where(eq(jigsawHomeGroups.classId, input.classId));
          
          return groups;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar grupos Jigsaw",
          });
        }
      }),

    /**
     * Get home group by ID with members
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const result = await db
            .select()
            .from(jigsawHomeGroups)
            .where(eq(jigsawHomeGroups.id, input.id))
            .limit(1);
          
          if (result.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Grupo Jigsaw não encontrado",
            });
          }
          
          return result[0];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar grupo",
          });
        }
      }),

    /**
     * Add member to home group
     */
    addMember: protectedProcedure
      .input(addHomeMemberInput)
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // Check if member already in group
          const existing = await db
            .select()
            .from(jigsawHomeMembers)
            .where(
              and(
                eq(jigsawHomeMembers.homeGroupId, input.homeGroupId),
                eq(jigsawHomeMembers.memberId, input.memberId)
              )
            )
            .limit(1);

          if (existing.length > 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Membro já está no grupo",
            });
          }

          await db.insert(jigsawHomeMembers).values({
            homeGroupId: input.homeGroupId,
            memberId: input.memberId,
            topicId: input.topicId,
          });

          return { success: true, memberId: input.memberId };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao adicionar membro",
          });
        }
      }),

    /**
     * Remove member from home group
     */
    removeMember: protectedProcedure
      .input(z.object({ homeGroupId: z.number(), memberId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          await db
            .delete(jigsawHomeMembers)
            .where(
              and(
                eq(jigsawHomeMembers.homeGroupId, input.homeGroupId),
                eq(jigsawHomeMembers.memberId, input.memberId)
              )
            );
          
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao remover membro",
          });
        }
      }),

    /**
     * Score home group participation (admin only)
     */
    scoreParticipation: adminProcedure
      .input(scoreHomeGroupInput)
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          for (const score of input.scores) {
            await db
              .update(jigsawHomeMembers)
              .set({
                presentationScore: String(score.presentationScore),
                participationScore: String(score.participationScore),
                peerRating: String(score.peerRating),
              })
              .where(
                and(
                  eq(jigsawHomeMembers.homeGroupId, input.homeGroupId),
                  eq(jigsawHomeMembers.memberId, score.memberId)
                )
              );
          }

          // Update home group status
          await db
            .update(jigsawHomeGroups)
            .set({ status: "completed" })
            .where(eq(jigsawHomeGroups.id, input.homeGroupId));

          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao registrar notas",
          });
        }
      }),

    /**
     * Get scores for home group
     */
    getScores: protectedProcedure
      .input(z.object({ homeGroupId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const memberScores = await db
            .select()
            .from(jigsawHomeMembers)
            .where(eq(jigsawHomeMembers.homeGroupId, input.homeGroupId));

          return memberScores.map((m: any) => ({
            memberId: m.memberId,
            presentationScore: m.presentationScore,
            participationScore: m.participationScore,
            peerRating: m.peerRating,
            totalScore:
              (Number(m.presentationScore) || 0) +
              (Number(m.participationScore) || 0) +
              (Number(m.peerRating) || 0),
          }));
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar notas",
          });
        }
      }),
  },

  /**
   * ========================================
   * JIGSAW SCORES & REPORTS
   * ========================================
   */
  scores: {
    /**
     * Get Jigsaw scores for a member
     */
    getByMember: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const result = await db
            .select()
            .from(jigsawScores)
            .where(eq(jigsawScores.memberId, input.memberId))
            .limit(1);

          return result.length > 0 ? result[0] : {
            memberId: input.memberId,
            totalPresentationScore: 0,
            totalParticipationScore: 0,
            totalPeerRating: 0,
            totalJigsawPF: 0,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar notas",
          });
        }
      }),

    /**
     * Get Jigsaw scores for all members in a class
     */
    getByClass: adminProcedure
      .input(z.object({ classId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const scores = await db
            .select()
            .from(jigsawScores)
            .where(eq(jigsawScores.classId, input.classId));

          return scores;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar notas da turma",
          });
        }
      }),

    /**
     * Calculate and update total Jigsaw PF for a member
     */
    calculateTotal: adminProcedure
      .input(z.object({ memberId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          // Get all expert group scores
          const expertScores = await db
            .select()
            .from(jigsawExpertMembers)
            .where(eq(jigsawExpertMembers.memberId, input.memberId));

          // Get all home group scores
          const homeScores = await db
            .select()
            .from(jigsawHomeMembers)
            .where(eq(jigsawHomeMembers.memberId, input.memberId));

          const totalPresentation = [
            ...expertScores.map((s: any) => Number(s.presentationScore) || 0),
            ...homeScores.map((s: any) => Number(s.presentationScore) || 0),
          ].reduce((a: number, b: number) => a + b, 0);

          const totalParticipation = [
            ...expertScores.map((s: any) => Number(s.participationScore) || 0),
            ...homeScores.map((s: any) => Number(s.participationScore) || 0),
          ].reduce((a: number, b: number) => a + b, 0);

          const totalPeerRating = homeScores
            .map((s: any) => Number(s.peerRating) || 0)
            .reduce((a: number, b: number) => a + b, 0);

          const totalJigsawPF =
            totalPresentation + totalParticipation + totalPeerRating;

          // Update or create score record
          const existing = await db
            .select()
            .from(jigsawScores)
            .where(eq(jigsawScores.memberId, input.memberId))
            .limit(1);

          if (existing.length > 0) {
            await db
              .update(jigsawScores)
              .set({
                totalPresentationScore: String(totalPresentation),
                totalParticipationScore: String(totalParticipation),
                totalPeerRating: String(totalPeerRating),
                totalJigsawPF: String(totalJigsawPF),
              })
              .where(eq(jigsawScores.memberId, input.memberId));
          } else {
            await db.insert(jigsawScores).values({
              classId: 0,
              memberId: input.memberId,
              totalPresentationScore: String(totalPresentation),
              totalParticipationScore: String(totalParticipation),
              totalPeerRating: String(totalPeerRating),
              totalJigsawPF: String(totalJigsawPF),
            });
          }

          return { success: true, totalJigsawPF };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao calcular notas",
          });
        }
      }),

    /**
     * Generate Jigsaw report for a class
     */
    generateReport: adminProcedure
      .input(z.object({ classId: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const scores = await db
            .select()
            .from(jigsawScores)
            .where(eq(jigsawScores.classId, input.classId));

          const report = {
            classId: input.classId,
            totalMembers: scores.length,
            averageJigsawPF:
              scores.length > 0
                ? scores.reduce((sum: number, s: any) => sum + (Number(s.totalJigsawPF) || 0), 0) /
                  scores.length
                : 0,
            topPerformers: scores
              .sort((a: any, b: any) => (Number(b.totalJigsawPF) || 0) - (Number(a.totalJigsawPF) || 0))
              .slice(0, 10)
              .map((s: any) => ({
                memberId: s.memberId,
                totalJigsawPF: s.totalJigsawPF,
              })),
            scores: scores,
          };

          return report;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao gerar relatório",
          });
        }
      }),
  },
});
