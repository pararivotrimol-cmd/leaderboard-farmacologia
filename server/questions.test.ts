import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@test.com",
    name: "Test User",
    loginMethod: "email",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Questions Router", () => {
  let createdQuestionId: number;
  const ctx = createAuthContext();

  describe("create", () => {
    it("should create a multiple choice question with 5 alternatives", async () => {
      const result = await appRouter.createCaller(ctx).questions.create({
        title: "Questão de Farmacocinética",
        description: "Teste de absorção",
        category: "Farmacocinética",
        tags: ["absorção", "biodisponibilidade"],
        questionText: "O que é biodisponibilidade?",
        questionType: "multiple_choice",
        alternatives: [
          { text: "Percentual de droga absorvida", isCorrect: true },
          { text: "Velocidade de eliminação", isCorrect: false },
          { text: "Tempo de meia-vida", isCorrect: false },
          { text: "Volume de distribuição", isCorrect: false },
          { text: "Clearance renal", isCorrect: false },
        ],
        difficulty: "medium",
        points: 1,
        estimatedTime: 120,
      });

      expect(result).toBeDefined();
      expect(result.title).toBe("Questão de Farmacocinética");
      expect(result.category).toBe("Farmacocinética");
      expect(result.isPublished).toBe(false);
      createdQuestionId = result.id;
    });

    it("should reject question without 5 alternatives", async () => {
      try {
        await appRouter.createCaller(ctx).questions.create({
          title: "Questão Inválida",
          category: "SNA",
          questionText: "Teste",
          questionType: "multiple_choice",
          alternatives: [
            { text: "Alt 1", isCorrect: true },
            { text: "Alt 2", isCorrect: false },
          ],
          difficulty: "easy",
          points: 1,
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("5 alternativas");
      }
    });

    it("should create essay question", async () => {
      const result = await appRouter.createCaller(ctx).questions.create({
        title: "Questão Dissertativa",
        category: "Colinérgicos",
        questionText: "Explique o mecanismo de ação dos colinérgicos",
        questionType: "essay",
        correctAnswer: "Inibem acetilcolinesterase",
        difficulty: "hard",
        points: 5,
      });

      expect(result).toBeDefined();
      expect(result.questionType).toBe("essay");
      expect(result.points).toBe(5);
    });
  });

  describe("getById", () => {
    it("should retrieve question by id", async () => {
      const result = await appRouter.createCaller(ctx).questions.getById({ id: createdQuestionId });

      expect(result).toBeDefined();
      expect(result.id).toBe(createdQuestionId);
      expect(result.title).toBe("Questão de Farmacocinética");
    });

    it("should throw error for non-existent question", async () => {
      try {
        await appRouter.createCaller(ctx).questions.getById({ id: 99999 });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("não encontrada");
      }
    });
  });

  describe("list", () => {
    it("should list all questions", async () => {
      const result = await appRouter.createCaller(ctx).questions.list({
        limit: 100,
        offset: 0,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should filter by category", async () => {
      const result = await appRouter.createCaller(ctx).questions.list({
        category: "Farmacocinética",
        limit: 100,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((q: any) => {
        expect(q.category).toBe("Farmacocinética");
      });
    });

    it("should filter by difficulty", async () => {
      const result = await appRouter.createCaller(ctx).questions.list({
        difficulty: "medium",
        limit: 100,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((q: any) => {
        expect(q.difficulty).toBe("medium");
      });
    });

    it("should search by title", async () => {
      const result = await appRouter.createCaller(ctx).questions.list({
        search: "Farmacocinética",
        limit: 100,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should paginate results", async () => {
      const page1 = await appRouter.createCaller(ctx).questions.list({
        limit: 1,
        offset: 0,
      });

      const page2 = await appRouter.createCaller(ctx).questions.list({
        limit: 1,
        offset: 1,
      });

      expect(page1).toBeDefined();
      expect(page2).toBeDefined();
    });
  });

  describe("getByCategory", () => {
    it("should get published questions by category", async () => {
      // First publish a question
      await appRouter.createCaller(ctx).questions.publish({ id: createdQuestionId });

      const result = await appRouter.createCaller(ctx).questions.getByCategory({
        category: "Farmacocinética",
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((q: any) => {
        expect(q.category).toBe("Farmacocinética");
        expect(q.isPublished).toBe(true);
      });
    });
  });

  describe("update", () => {
    it("should update question", async () => {
      const result = await appRouter.createCaller(ctx).questions.update({
        id: createdQuestionId,
        title: "Questão Atualizada",
        difficulty: "hard",
        points: 2,
      });

      expect(result).toBeDefined();
      expect(result.title).toBe("Questão Atualizada");
      expect(result.difficulty).toBe("hard");
      expect(result.points).toBe(2);
    });
  });

  describe("publish", () => {
    it("should publish a question", async () => {
      const newQuestion = await appRouter.createCaller(ctx).questions.create({
        title: "Questao para Publicar",
        category: "SNA",
        questionText: "Teste de publicacao",
        questionType: "multiple_choice",
        alternatives: [
          { text: "Alt 1", isCorrect: true },
          { text: "Alt 2", isCorrect: false },
          { text: "Alt 3", isCorrect: false },
          { text: "Alt 4", isCorrect: false },
          { text: "Alt 5", isCorrect: false },
        ],
        difficulty: "easy",
        points: 1,
      });

      expect(newQuestion.isPublished).toBe(false);

      await appRouter.createCaller(ctx).questions.publish({ id: newQuestion.id });

      const afterPublish = await appRouter.createCaller(ctx).questions.getById({ id: newQuestion.id });
      expect(afterPublish.isPublished).toBe(true);
    });
  });

  describe("duplicate", () => {
    it("should duplicate a question", async () => {
      const result = await appRouter.createCaller(ctx).questions.duplicate({ id: createdQuestionId });

      expect(result).toBeDefined();
      expect(result.title).toContain("Cópia");
      expect(result.id).not.toBe(createdQuestionId);
      expect(result.isPublished).toBe(false);
    });
  });

  describe("getCategories", () => {
    it("should return list of categories", async () => {
      const result = await appRouter.createCaller(ctx).questions.getCategories();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getPerformance", () => {
    it("should return performance metrics", async () => {
      const result = await appRouter.createCaller(ctx).questions.getPerformance({ id: createdQuestionId });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalAttempts");
      expect(result).toHaveProperty("correctAnswers");
      expect(result).toHaveProperty("correctRate");
      expect(result).toHaveProperty("averageTime");
    });
  });

  describe("delete", () => {
    it("should delete a question", async () => {
      const duplicated = await appRouter.createCaller(ctx).questions.duplicate({ id: createdQuestionId });
      const duplicateId = duplicated.id;

      await appRouter.createCaller(ctx).questions.delete({ id: duplicateId });

      try {
        await appRouter.createCaller(ctx).questions.getById({ id: duplicateId });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("não encontrada");
      }
    });
  });
});
