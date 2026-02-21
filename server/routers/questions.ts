import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { questionBank, questionPerformance } from "../../drizzle/schema";
import { eq, and, like, inArray } from "drizzle-orm";

// Validation schemas
const alternativeSchema = z.object({
  text: z.string().min(1, "Texto da alternativa é obrigatório"),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

const createQuestionSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  tags: z.array(z.string()).optional(),
  questionText: z.string().min(1, "Texto da questão é obrigatório"),
  questionType: z.enum(["multiple_choice", "essay", "true_false"]).default("multiple_choice"),
  alternatives: z.array(alternativeSchema).optional(),
  correctAnswer: z.string().optional(),
  imageUrl: z.string().url().optional(),
  formulaLatex: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  points: z.number().int().min(1).default(1),
  estimatedTime: z.number().int().optional(),
});

export const questionsRouter = router({
  // ─── Create Question ───
  create: protectedProcedure
    .input(createQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Validate alternatives for multiple choice
      if (input.questionType === "multiple_choice") {
        if (!input.alternatives || input.alternatives.length !== 5) {
          throw new Error("Questões de múltipla escolha devem ter exatamente 5 alternativas");
        }
        const hasCorrect = input.alternatives.some(alt => alt.isCorrect);
        if (!hasCorrect) {
          throw new Error("Pelo menos uma alternativa deve ser marcada como correta");
        }
      }

      const result = await db.insert(questionBank).values({
        createdBy: ctx.user?.id || 1,
        title: input.title,
        description: input.description,
        category: input.category,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        questionText: input.questionText,
        questionType: input.questionType,
        alternatives: input.alternatives ? JSON.stringify(input.alternatives) : null,
        correctAnswer: input.correctAnswer,
        imageUrl: input.imageUrl,
        formulaLatex: input.formulaLatex,
        difficulty: input.difficulty,
        points: input.points,
        estimatedTime: input.estimatedTime,
        isActive: true,
        isPublished: false,
      });

      // Fetch the created question
      const created = await db.select().from(questionBank).where(eq(questionBank.id, result[0].insertId as number)).limit(1);
      return created[0];
    }),

  // ─── Get Question by ID ───
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const question = await db.select().from(questionBank).where(eq(questionBank.id, input.id)).limit(1);
      if (!question.length) throw new Error("Questão não encontrada");

      // Parse JSON fields
      const q = question[0];
      return {
        ...q,
        alternatives: q.alternatives ? JSON.parse(q.alternatives) : null,
        tags: q.tags ? JSON.parse(q.tags) : [],
      };
    }),

  // ─── List Questions with Filters ───
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      search: z.string().optional(),
      isPublished: z.boolean().optional(),
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const conditions = [];

      if (input.category) {
        conditions.push(eq(questionBank.category, input.category));
      }

      if (input.difficulty) {
        conditions.push(eq(questionBank.difficulty, input.difficulty));
      }

      if (input.isPublished !== undefined) {
        conditions.push(eq(questionBank.isPublished, input.isPublished));
      }

      if (input.search) {
        conditions.push(
          like(questionBank.title, `%${input.search}%`)
        );
      }

      let query = db.select().from(questionBank);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const questions = await (query as any).limit(input.limit).offset(input.offset);

      // Parse JSON fields
      return questions.map((q: any) => ({
        ...q,
        alternatives: q.alternatives ? JSON.parse(q.alternatives) : null,
        tags: q.tags ? JSON.parse(q.tags) : [],
      }));
    }),

  // ─── Get Questions by Category ───
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const questions = await db.select().from(questionBank)
        .where(and(
          eq(questionBank.category, input.category),
          eq(questionBank.isPublished, true)
        ));

      return questions.map((q: any) => ({
        ...q,
        alternatives: q.alternatives ? JSON.parse(q.alternatives) : null,
        tags: q.tags ? JSON.parse(q.tags) : [],
      }));
    }),

  // ─── Update Question ───
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      ...createQuestionSchema.partial().shape,
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { id, ...updateData } = input;

      // Validate alternatives if provided
      if (updateData.questionType === "multiple_choice" && updateData.alternatives) {
        if (updateData.alternatives.length !== 5) {
          throw new Error("Questões de múltipla escolha devem ter exatamente 5 alternativas");
        }
        const hasCorrect = updateData.alternatives.some(alt => alt.isCorrect);
        if (!hasCorrect) {
          throw new Error("Pelo menos uma alternativa deve ser marcada como correta");
        }
      }

      const updatePayload: any = {};
      if (updateData.title) updatePayload.title = updateData.title;
      if (updateData.description) updatePayload.description = updateData.description;
      if (updateData.category) updatePayload.category = updateData.category;
      if (updateData.tags) updatePayload.tags = JSON.stringify(updateData.tags);
      if (updateData.questionText) updatePayload.questionText = updateData.questionText;
      if (updateData.questionType) updatePayload.questionType = updateData.questionType;
      if (updateData.alternatives) updatePayload.alternatives = JSON.stringify(updateData.alternatives);
      if (updateData.correctAnswer) updatePayload.correctAnswer = updateData.correctAnswer;
      if (updateData.imageUrl) updatePayload.imageUrl = updateData.imageUrl;
      if (updateData.formulaLatex) updatePayload.formulaLatex = updateData.formulaLatex;
      if (updateData.difficulty) updatePayload.difficulty = updateData.difficulty;
      if (updateData.points) updatePayload.points = updateData.points;
      if (updateData.estimatedTime) updatePayload.estimatedTime = updateData.estimatedTime;

      await db.update(questionBank).set(updatePayload).where(eq(questionBank.id, id));

      const updated = await db.select().from(questionBank).where(eq(questionBank.id, id)).limit(1);
      const q = updated[0];
      return {
        ...q,
        alternatives: q.alternatives ? JSON.parse(q.alternatives) : null,
        tags: q.tags ? JSON.parse(q.tags) : [],
      };
    }),

  // ─── Publish Question ───
  publish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(questionBank).set({ isPublished: true }).where(eq(questionBank.id, input.id));
      return { success: true };
    }),

  // ─── Delete Question ───
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(questionBank).where(eq(questionBank.id, input.id));
      return { success: true };
    }),

  // ─── Get Categories ───
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const questions = await db.select({ category: questionBank.category }).from(questionBank).groupBy(questionBank.category);
    return questions.map((q: any) => q.category);
  }),

  // ─── Get Question Performance ───
  getPerformance: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const performance = await db.select().from(questionPerformance)
        .where(eq(questionPerformance.questionId, input.id));

      const total = performance.length;
      const correct = performance.filter((p: any) => p.isCorrect).length;
      const correctRate = total > 0 ? (correct / total) * 100 : 0;
      const avgTime = total > 0
        ? performance.reduce((sum: number, p: any) => sum + (p.timeSpent || 0), 0) / total
        : 0;

      return {
        totalAttempts: total,
        correctAnswers: correct,
        correctRate: correctRate.toFixed(2),
        averageTime: Math.round(avgTime),
      };
    }),

  // ─── Duplicate Question ───
  duplicate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const original = await db.select().from(questionBank).where(eq(questionBank.id, input.id)).limit(1);
      if (!original.length) throw new Error("Questão não encontrada");

      const q = original[0] as any;
      const result = await db.insert(questionBank).values({
        createdBy: ctx.user?.id || 1,
        title: `${q.title} (Cópia)`,
        description: q.description,
        category: q.category,
        tags: q.tags,
        questionText: q.questionText,
        questionType: q.questionType,
        alternatives: q.alternatives,
        correctAnswer: q.correctAnswer,
        imageUrl: q.imageUrl,
        formulaLatex: q.formulaLatex,
        difficulty: q.difficulty,
        points: q.points,
        estimatedTime: q.estimatedTime,
        isActive: true,
        isPublished: false,
      });

      const created = await db.select().from(questionBank).where(eq(questionBank.id, result[0].insertId as number)).limit(1);
      return created[0];
    }),
});
