import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import { 
  assessments, 
  assessmentQuestions, 
  assessmentSubmissions, 
  assessmentAnswers,
  assessmentLogs,
  assessmentIPBlocks,
  members 
} from "../../drizzle/schema";

/**
 * Assessment Router - Manage theoretical evaluations with lockdown
 */
export const assessmentRouter = router({
  // ─── Teacher: Create Assessment ───
  create: protectedProcedure
    .input(z.object({
      classId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(["multiple_choice", "essay", "mixed"]),
      timePerQuestion: z.number().default(120),
      allowRetrocess: z.boolean().default(false),
      enableLockdown: z.boolean().default(true),
      passingScore: z.number().default(60),
      maxAttempts: z.number().default(1),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(assessments).values({
        classId: input.classId,
        title: input.title,
        description: input.description,
        type: input.type,
        timePerQuestion: input.timePerQuestion,
        allowRetrocess: input.allowRetrocess,
        enableLockdown: input.enableLockdown,
        passingScore: input.passingScore as any,
        maxAttempts: input.maxAttempts,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "draft",
        createdBy: ctx.user.id,
      });

      // Get the last inserted ID
      const insertedAssessment = await db.select().from(assessments).where(eq(assessments.createdBy, ctx.user.id)).orderBy(assessments.id).limit(1);
      const assessmentId = insertedAssessment.length > 0 ? insertedAssessment[0].id : 0;

      return { id: assessmentId, success: true };
    }),

  // ─── Teacher: Add Questions ───
  addQuestion: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      questionNumber: z.number(),
      question: z.string().min(1),
      questionType: z.enum(["multiple_choice", "essay", "true_false"]),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string(),
      points: z.number().default(1),
      explanation: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(assessmentQuestions).values({
        assessmentId: input.assessmentId,
        questionNumber: input.questionNumber,
        question: input.question,
        questionType: input.questionType,
        options: input.options ? JSON.stringify(input.options) : null,
        correctAnswer: input.correctAnswer,
        points: input.points as any,
        explanation: input.explanation,
      });

      // Get the last inserted ID
      const insertedQuestion = await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, input.assessmentId)).orderBy(assessmentQuestions.id).limit(1);
      const questionId = insertedQuestion.length > 0 ? insertedQuestion[0].id : 0;

      return { id: questionId, success: true };
    }),

  // ─── Student: Start Assessment ───
  startAssessment: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      ipAddress: z.string(),
      userAgent: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get member info
      const member = await db.select().from(members).where(eq(members.id, ctx.user.id)).limit(1);
      if (!member.length) throw new Error("Member not found");

      // Check IP block
      const existingBlock = await db.select().from(assessmentIPBlocks).where(
        and(
          eq(assessmentIPBlocks.assessmentId, input.assessmentId),
          eq(assessmentIPBlocks.ipAddress, input.ipAddress),
        )
      ).limit(1);

      if (existingBlock.length && new Date() < new Date(existingBlock[0].expiresAt)) {
        throw new Error("IP address is blocked");
      }

      // Get assessment
      const assessment = await db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1);
      if (!assessment.length) throw new Error("Assessment not found");

      // Create submission
      const submission = await db.insert(assessmentSubmissions).values({
        assessmentId: input.assessmentId,
        memberId: member[0].id,
        attemptNumber: 1,
        startedAt: new Date(),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: "in_progress",
      });

      // Get the last inserted submission ID
      const insertedSubmission = await db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.memberId, member[0].id)).orderBy(assessmentSubmissions.id).limit(1);
      const submissionId = insertedSubmission.length > 0 ? insertedSubmission[0].id : 0;

      // Create IP block
      const expiresAt = new Date(assessment[0].endsAt || new Date().getTime() + 4 * 60 * 60 * 1000);
      await db.insert(assessmentIPBlocks).values({
        assessmentId: input.assessmentId,
        ipAddress: input.ipAddress,
        memberId: member[0].id,
        expiresAt,
      });

      // Log event
      await db.insert(assessmentLogs).values({
        submissionId: submissionId,
        eventType: "submission_started",
        severity: "info",
      });

      return { submissionId: submissionId, success: true };
    }),

  // ─── Student: Submit Answer ───
  submitAnswer: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      questionId: z.number(),
      answer: z.string(),
      timeSpent: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const question = await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.id, input.questionId)).limit(1);
      if (!question.length) throw new Error("Question not found");

      const isCorrect = input.answer === question[0].correctAnswer;
      const pointsEarned = isCorrect ? question[0].points : 0;

      const result = await db.insert(assessmentAnswers).values({
        submissionId: input.submissionId,
        questionId: input.questionId,
        answer: input.answer,
        isCorrect,
        pointsEarned: pointsEarned as any,
        answeredAt: new Date(),
        timeSpent: input.timeSpent,
      });

      // Get the last inserted answer ID
      const insertedAnswer = await db.select().from(assessmentAnswers).where(eq(assessmentAnswers.submissionId, input.submissionId)).orderBy(assessmentAnswers.id).limit(1);
      const answerId = insertedAnswer.length > 0 ? insertedAnswer[0].id : 0;

      return { id: answerId, isCorrect, pointsEarned, success: true };
    }),

  // ─── Student: Submit Assessment ───
  submitAssessment: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const answers = await db.select().from(assessmentAnswers).where(eq(assessmentAnswers.submissionId, input.submissionId));
      const totalPoints = answers.reduce((sum: number, a: any) => sum + Number(a.pointsEarned || 0), 0);
      const maxPoints = answers.length;
      const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

      const submission = await db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.id, input.submissionId)).limit(1);
      if (!submission.length) throw new Error("Submission not found");

      const assessment = await db.select().from(assessments).where(eq(assessments.id, submission[0].assessmentId)).limit(1);
      if (!assessment.length) throw new Error("Assessment not found");

      const passed = percentage >= Number(assessment[0].passingScore);

      await db.update(assessmentSubmissions).set({
        submittedAt: new Date(),
        score: totalPoints as any,
        percentage: percentage as any,
        passed,
        status: "submitted",
      }).where(eq(assessmentSubmissions.id, input.submissionId));

      await db.insert(assessmentLogs).values({
        submissionId: input.submissionId,
        eventType: "submission_completed",
        severity: "info",
      });

      return { score: totalPoints, percentage, passed, success: true };
    }),

  // ─── Student: Log Focus Loss ───
  logFocusLoss: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      eventType: z.enum(["focus_lost", "focus_regained", "tab_switched", "suspicious_activity"]),
      details: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const flagged = input.eventType !== "focus_regained";

      await db.insert(assessmentLogs).values({
        submissionId: input.submissionId,
        eventType: input.eventType,
        details: input.details,
        severity: flagged ? "warning" : "info",
        flagged,
      });

      return { logged: true };
    }),

  // ─── Get Assessment ───
  getAssessment: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const assessment = await db.select().from(assessments).where(eq(assessments.id, input.id)).limit(1);
      if (!assessment.length) throw new Error("Assessment not found");

      const questions = await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, input.id));

      return { assessment: assessment[0], questions };
    }),

  // ─── Get Submissions ───
  getSubmissions: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const submissions = await db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.assessmentId, input.assessmentId));
      return submissions;
    }),

  // ─── Get Logs ───
  getSubmissionLogs: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const logs = await db.select().from(assessmentLogs).where(eq(assessmentLogs.submissionId, input.submissionId));
      return logs;
    }),

   // ─── Publish Assessment ───
  publish: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(assessments).set({ status: "published" }).where(eq(assessments.id, input.assessmentId));
      return { success: true };
    }),

  // ─── Get Assessments by Class ───
  getAssessmentsByClass: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const result = await db.select().from(assessments).where(eq(assessments.classId, input.classId));
      return result;
    }),

  // ─── Delete Assessment ───
  delete: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(assessments).where(eq(assessments.id, input.assessmentId));
      return { success: true };
    }),
});
