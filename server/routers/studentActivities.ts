import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getStudentActivities,
  getStudentSubmissions,
  submitActivityResponse,
  updateActivityFeedback,
  createStudentActivity,
  getActivitySubmissions,
} from "../db";

export const studentActivitiesRouter = router({
  // Get all active activities for students
  getAll: publicProcedure
    .query(async () => {
      return await getStudentActivities(true);
    }),

  // Get student's submissions for an activity
  getStudentSubmissions: protectedProcedure
    .input(z.object({
      activityId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const memberId = ctx.user?.id;
      if (!memberId) throw new Error("User not authenticated");
      return await getStudentSubmissions(memberId, input.activityId);
    }),

  // Submit a response to an activity
  submitResponse: protectedProcedure
    .input(z.object({
      activityId: z.number(),
      content: z.string().optional(),
      fileUrl: z.string().optional(),
      linkUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const memberId = ctx.user?.id;
      if (!memberId) throw new Error("User not authenticated");

      if (!input.content && !input.fileUrl && !input.linkUrl) {
        throw new Error("Pelo menos um tipo de resposta deve ser fornecido");
      }

      const submissionId = await submitActivityResponse({
        activityId: input.activityId,
        memberId,
        content: input.content,
        fileUrl: input.fileUrl,
        linkUrl: input.linkUrl,
      });

      return { success: true, submissionId };
    }),

  // Get all submissions for an activity (for teachers)
  getActivitySubmissions: protectedProcedure
    .input(z.object({
      activityId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      // TODO: Verify user is a teacher
      return await getActivitySubmissions(input.activityId);
    }),

  // Provide feedback on a submission (for teachers)
  provideFeedback: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      feedback: z.string(),
      xpAwarded: z.number().min(0),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Verify user is a teacher
      const teacherId = ctx.user?.id;
      if (!teacherId) throw new Error("User not authenticated");

      await updateActivityFeedback(input.submissionId, {
        feedback: input.feedback,
        xpAwarded: input.xpAwarded,
        feedbackBy: teacherId,
      });

      return { success: true };
    }),

  // Create a new activity (for teachers)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.string(),
      maxXP: z.string().default("10"),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Verify user is a teacher
      const teacherId = ctx.user?.id;
      if (!teacherId) throw new Error("User not authenticated");

      const activityId = await createStudentActivity({
        name: input.name,
        description: input.description,
        type: input.type,
        maxXP: input.maxXP,
        dueDate: input.dueDate,
        createdBy: teacherId,
      });

      return { success: true, activityId };
    }),
});
