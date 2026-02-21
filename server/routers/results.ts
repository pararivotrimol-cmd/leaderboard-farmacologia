import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  assessmentSubmissions,
  assessmentAnswers,
  assessmentLogs,
  members,
  assessments,
  questionBank,
  questionPerformance,
} from "../../drizzle/schema";
import { eq, and, gte, lte, count, avg, sum } from "drizzle-orm";

export const resultsRouter = router({
  // ─── Get Assessment Results ───
  getAssessmentResults: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const submissions = await db
        .select()
        .from(assessmentSubmissions)
        .where(eq(assessmentSubmissions.assessmentId, input.assessmentId));

      const results = await Promise.all(
        submissions.map(async (sub) => {
          const answers = await db
            .select()
            .from(assessmentAnswers)
            .where(eq(assessmentAnswers.submissionId, sub.id));

          const logs = await db
            .select()
            .from(assessmentLogs)
            .where(eq(assessmentLogs.submissionId, sub.id));

          const member = await db
            .select()
            .from(members)
            .where(eq(members.id, sub.memberId))
            .limit(1);

          const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
          const totalQuestions = answers.length;
          const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

          const flaggedLogs = logs.filter((l: any) => l.flagged);

          return {
            submissionId: sub.id,
            studentName: member[0]?.name || "Unknown",
            studentId: sub.memberId,
            score: score.toFixed(2),
            correctAnswers,
            totalQuestions,
            timeSpent: 0, // Calculated from answers
            submittedAt: sub.submittedAt || new Date(),
            flaggedEvents: flaggedLogs.length,
            suspiciousActivity: flaggedLogs.length > 0,
          };
        })
      );

      return results;
    }),

  // ─── Get Question Performance ───
  getQuestionPerformance: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const assessment = await db
        .select()
        .from(assessments)
        .where(eq(assessments.id, input.assessmentId))
        .limit(1);

      if (!assessment.length) throw new Error("Assessment not found");

      const performance = await db
        .select()
        .from(questionPerformance)
        .where(eq(questionPerformance.assessmentId, input.assessmentId));

      const groupedByQuestion = performance.reduce((acc: any, p: any) => {
        if (!acc[p.questionId]) {
          acc[p.questionId] = [];
        }
        acc[p.questionId].push(p);
        return acc;
      }, {});

      const results = await Promise.all(
        Object.entries(groupedByQuestion).map(async ([questionId, attempts]: any) => {
          const question = await db
            .select()
            .from(questionBank)
            .where(eq(questionBank.id, parseInt(questionId)))
            .limit(1);

          const correct = attempts.filter((a: any) => a.isCorrect).length;
          const total = attempts.length;
          const correctRate = total > 0 ? (correct / total) * 100 : 0;
          const avgTime =
            total > 0
              ? attempts.reduce((sum: number, a: any) => sum + (a.timeSpent || 0), 0) / total
              : 0;

          return {
            questionId: parseInt(questionId),
            questionTitle: question[0]?.title || "Unknown",
            difficulty: question[0]?.difficulty || "medium",
            totalAttempts: total,
            correctAnswers: correct,
            correctRate: correctRate.toFixed(2),
            averageTime: Math.round(avgTime),
            isHard: correctRate < 50, // Flag as hard if less than 50% correct
          };
        })
      );

      return results.sort((a: any, b: any) => parseFloat(a.correctRate) - parseFloat(b.correctRate));
    }),

  // ─── Get Class Statistics ───
  getClassStatistics: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const submissions = await db
        .select()
        .from(assessmentSubmissions)
        .where(eq(assessmentSubmissions.assessmentId, input.assessmentId));

      if (submissions.length === 0) {
        return {
          totalStudents: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          medianScore: 0,
          scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0, failed: 0 },
          suspiciousSubmissions: 0,
        };
      }

      const scores = await Promise.all(
        submissions.map(async (sub) => {
          const answers = await db
            .select()
            .from(assessmentAnswers)
            .where(eq(assessmentAnswers.submissionId, sub.id));

          const logs = await db
            .select()
            .from(assessmentLogs)
            .where(eq(assessmentLogs.submissionId, sub.id));

          const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
          const totalQuestions = answers.length;
          const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
          const flaggedLogs = logs.filter((l: any) => l.flagged).length;

          return { score, flaggedLogs };
        })
      );

      const scoreValues = scores.map((s: any) => s.score);
      const sortedScores = scoreValues.sort((a: number, b: number) => a - b);
      const medianScore =
        sortedScores.length % 2 === 0
          ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
          : sortedScores[Math.floor(sortedScores.length / 2)];

      const distribution = {
        excellent: scoreValues.filter((s: number) => s >= 90).length,
        good: scoreValues.filter((s: number) => s >= 80 && s < 90).length,
        average: scoreValues.filter((s: number) => s >= 70 && s < 80).length,
        poor: scoreValues.filter((s: number) => s >= 60 && s < 70).length,
        failed: scoreValues.filter((s: number) => s < 60).length,
      };

      const suspiciousSubmissions = scores.filter((s: any) => s.flaggedLogs > 0).length;

      return {
        totalStudents: submissions.length,
        averageScore: (scoreValues.reduce((a: number, b: number) => a + b, 0) / scoreValues.length).toFixed(2),
        highestScore: Math.max(...scoreValues).toFixed(2),
        lowestScore: Math.min(...scoreValues).toFixed(2),
        medianScore: medianScore.toFixed(2),
        scoreDistribution: distribution,
        suspiciousSubmissions,
      };
    }),

  // ─── Get Fraud Detection Report ───
  getFraudDetectionReport: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const submissions = await db
        .select()
        .from(assessmentSubmissions)
        .where(eq(assessmentSubmissions.assessmentId, input.assessmentId));

      const flaggedSubmissions = await Promise.all(
        submissions.map(async (sub) => {
          const logs = await db
            .select()
            .from(assessmentLogs)
            .where(and(eq(assessmentLogs.submissionId, sub.id), eq(assessmentLogs.flagged, true)));

          if (logs.length === 0) return null;

          const member = await db
            .select()
            .from(members)
            .where(eq(members.id, sub.memberId))
            .limit(1);

          const eventCounts = logs.reduce((acc: any, log: any) => {
            acc[log.eventType] = (acc[log.eventType] || 0) + 1;
            return acc;
          }, {});

          return {
            submissionId: sub.id,
            studentName: member[0]?.name || "Unknown",
            studentId: sub.memberId,
            totalFlaggedEvents: logs.length,
            eventTypes: eventCounts,
            severity: logs.some((l: any) => l.severity === "critical")
              ? "critical"
              : logs.some((l: any) => l.severity === "warning")
              ? "warning"
              : "info",
            logs: logs.map((l: any) => ({
              eventType: l.eventType,
              severity: l.severity,
              timestamp: l.timestamp || new Date(),
              details: l.details ? JSON.parse(l.details) : null,
            })),
          };
        })
      );

      return flaggedSubmissions.filter((s: any) => s !== null);
    }),

  // ─── Get Time Analysis ───
  getTimeAnalysis: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const submissions = await db
        .select()
        .from(assessmentSubmissions)
        .where(eq(assessmentSubmissions.assessmentId, input.assessmentId));

      const timeData = submissions.map((sub: any) => ({
        studentId: sub.memberId,
        timeSpent: sub.timeSpent || 0,
        submittedAt: sub.submittedAt,
      }));

      const totalTime = timeData.reduce((sum: number, t: any) => sum + t.timeSpent, 0);
      const avgTime = timeData.length > 0 ? totalTime / timeData.length : 0;
      const maxTime = Math.max(...timeData.map((t: any) => t.timeSpent));
      const minTime = Math.min(...timeData.map((t: any) => t.timeSpent));

      return {
        totalSubmissions: timeData.length,
        averageTime: Math.round(avgTime),
        maxTime,
        minTime,
        timeDistribution: timeData.sort((a: any, b: any) => a.timeSpent - b.timeSpent),
      };
    }),

  // ─── Export Results to CSV ───
  exportResultsCSV: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const submissions = await db
        .select()
        .from(assessmentSubmissions)
        .where(eq(assessmentSubmissions.assessmentId, input.assessmentId));

      const rows = await Promise.all(
        submissions.map(async (sub) => {
          const answers = await db
            .select()
            .from(assessmentAnswers)
            .where(eq(assessmentAnswers.submissionId, sub.id));

          const member = await db
            .select()
            .from(members)
            .where(eq(members.id, sub.memberId))
            .limit(1);

          const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
          const totalQuestions = answers.length;
          const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

          return {
            studentName: member[0]?.name || "Unknown",
            studentId: sub.memberId,
            score: score.toFixed(2),
            correctAnswers,
            totalQuestions,
            timeSpent: 0, // Calculated from answers
            submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A",
          };
        })
      );

      // Generate CSV
      const headers = ["Student Name", "Student ID", "Score (%)", "Correct Answers", "Total Questions", "Time Spent (s)", "Submitted At"];
      const csvContent = [
        headers.join(","),
        ...rows.map((r: any) =>
          [r.studentName, r.studentId, r.score, r.correctAnswers, r.totalQuestions, r.timeSpent, r.submittedAt].join(",")
        ),
      ].join("\n");

      return csvContent;
    }),
});
