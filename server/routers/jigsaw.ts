import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const jigsawRouter = router({
  // Create a jigsaw group
  create: publicProcedure
    .input(z.object({
      studentSessionToken: z.string().optional(),
      classId: z.number(),
      groupType: z.enum(["seminar", "clinical_case", "kahoot"]),
      name: z.string(),
      description: z.string().optional(),
      maxMembers: z.number().default(5),
    }))
    .mutation(async ({ input }) => {
      const student = await db.getStudentAccountBySessionToken(input.studentSessionToken || "");
      if (!student) throw new Error("Não autorizado");
      
      // Get member info
      const member = await db.getMemberById(student.memberId || 0);
      if (!member) throw new Error("Membro não encontrado");
      
      const groupId = await db.createJigsawGroup({
        classId: input.classId,
        groupType: input.groupType,
        name: input.name,
        description: input.description,
        maxMembers: input.maxMembers,
        currentMembers: 1,
        createdBy: member.id,
        createdByName: member.name,
      });
      
      // Add creator as first member
      await db.addJigsawMember({
        jigsawGroupId: groupId,
        memberId: member.id,
        memberName: member.name,
        role: "coordinator",
      });
      
      return { success: true, groupId };
    }),

  // Get jigsaw groups for a class
  getByClass: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      return db.getJigsawGroupsByClass(input.classId);
    }),

  // Get members of a jigsaw group
  getMembers: publicProcedure
    .input(z.object({ jigsawGroupId: z.number() }))
    .query(async ({ input }) => {
      return db.getJigsawMembers(input.jigsawGroupId);
    }),

  // Join a jigsaw group
  join: publicProcedure
    .input(z.object({
      studentSessionToken: z.string(),
      jigsawGroupId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const student = await db.getStudentAccountBySessionToken(input.studentSessionToken);
      if (!student) throw new Error("Não autorizado");
      
      const member = await db.getMemberById(student.memberId || 0);
      if (!member) throw new Error("Membro não encontrado");
      
      // Check if already in group
      const alreadyIn = await db.isMemberInJigsawGroup(input.jigsawGroupId, member.id);
      if (alreadyIn) throw new Error("Já está no grupo");
      
      // Check group capacity
      const group = await db.getJigsawGroup(input.jigsawGroupId);
      if (!group) throw new Error("Grupo não encontrado");
      if (group.currentMembers >= group.maxMembers) throw new Error("Grupo cheio");
      
      // Add member
      await db.addJigsawMember({
        jigsawGroupId: input.jigsawGroupId,
        memberId: member.id,
        memberName: member.name,
        role: "member",
      });
      
      // Update group member count
      await db.updateJigsawGroup(input.jigsawGroupId, {
        currentMembers: (group.currentMembers || 0) + 1,
      });
      
      return { success: true };
    }),

  // Leave a jigsaw group
  leave: publicProcedure
    .input(z.object({
      studentSessionToken: z.string(),
      jigsawGroupId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const student = await db.getStudentAccountBySessionToken(input.studentSessionToken);
      if (!student) throw new Error("Não autorizado");
      
      const member = await db.getMemberById(student.memberId || 0);
      if (!member) throw new Error("Membro não encontrado");
      
      // Find and remove member
      const members = await db.getJigsawMembers(input.jigsawGroupId);
      const memberRecord = members.find(m => m.memberId === member.id);
      if (!memberRecord) throw new Error("Membro não está no grupo");
      
      await db.removeJigsawMember(memberRecord.id);
      
      // Update group member count
      const group = await db.getJigsawGroup(input.jigsawGroupId);
      if (group) {
        await db.updateJigsawGroup(input.jigsawGroupId, {
          currentMembers: Math.max(0, (group.currentMembers || 1) - 1),
        });
      }
      
      return { success: true };
    }),

  // Get groups a member has joined
  getMemberGroups: publicProcedure
    .input(z.object({ studentSessionToken: z.string() }))
    .query(async ({ input }) => {
      const student = await db.getStudentAccountBySessionToken(input.studentSessionToken);
      if (!student) throw new Error("Não autorizado");
      
      const member = await db.getMemberById(student.memberId || 0);
      if (!member) throw new Error("Membro não encontrado");
      
      return db.getMemberJigsawGroups(member.id);
    }),
});
