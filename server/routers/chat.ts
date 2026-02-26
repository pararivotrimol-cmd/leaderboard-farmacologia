import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createChatConversation,
  getChatConversations,
  getChatMessages,
  sendChatMessage,
  markChatMessagesAsRead,
  getUnreadMessageCount,
} from "../db";

export const chatRouter = router({
  // Get or create a conversation with a teacher
  getOrCreateConversation: protectedProcedure
    .input(z.object({
      teacherId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const studentId = ctx.user?.id;
      if (!studentId) throw new Error("User not authenticated");

      const conversationId = await createChatConversation(studentId, input.teacherId);
      return { conversationId };
    }),

  // Get all conversations for the current user
  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      // TODO: Determine user type (student or teacher) from context
      const userType = "student"; // Placeholder
      return await getChatConversations(userId, userType as "student" | "teacher");
    }),

  // Get messages from a conversation
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      // Mark messages as read
      await markChatMessagesAsRead(input.conversationId, userId);

      return await getChatMessages(input.conversationId, input.limit);
    }),

  // Send a message in a conversation
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1).max(5000),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      // TODO: Determine user type from context
      const userType = "student"; // Placeholder

      const messageId = await sendChatMessage({
        conversationId: input.conversationId,
        senderId: userId,
        senderType: userType as "student" | "teacher",
        content: input.content,
      });

      return { success: true, messageId };
    }),

  // Get unread message count for a conversation
  getUnreadCount: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const count = await getUnreadMessageCount(input.conversationId, userId);
      return { unreadCount: count };
    }),
});
