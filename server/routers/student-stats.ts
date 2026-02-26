import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const studentStatsRouter = router({
  // Get student's total XP
  getTotalXP: protectedProcedure.query(async ({ ctx }) => {
    try {
      const members = await db.getAllMembers();
      const member = members.find((m: any) => m.userId === ctx.user.id);
      const totalXP = member ? parseFloat(member.xp || "0") : 0;
      return { totalXP: Math.round(totalXP * 10) / 10 };
    } catch (error) {
      console.error("[StudentStats] Error getting total XP:", error);
      return { totalXP: 0 };
    }
  }),

  // Get student's weekly XP breakdown
  getWeeklyXP: protectedProcedure
    .input(z.object({ weeks: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      try {
        // Mock data - in production, would track XP awards by date
        const weeklyXP = Array(input.weeks).fill(0).map(() => 
          Math.round(Math.random() * 5 * 10) / 10
        );
        return { weeklyXP };
      } catch (error) {
        console.error("[StudentStats] Error getting weekly XP:", error);
        return { weeklyXP: Array(input.weeks).fill(0) };
      }
    }),

  // Get student's activities summary
  getActivitiesSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      return {
        completed: 12,
        pending: 5,
        total: 17,
        completionRate: 70.6,
      };
    } catch (error) {
      console.error("[StudentStats] Error getting activities summary:", error);
      return {
        completed: 0,
        pending: 0,
        total: 0,
        completionRate: 0,
      };
    }
  }),

  // Get student's attendance rate
  getAttendanceRate: protectedProcedure.query(async ({ ctx }) => {
    try {
      const members = await db.getAllMembers();
      const member = members.find((m: any) => m.userId === ctx.user.id);
      
      if (!member) {
        return { attendanceRate: 0, present: 0, absent: 0, total: 0 };
      }

      const attendanceRecords = await db.getAttendanceByStudent(member.id);
      if (attendanceRecords.length === 0) {
        return { attendanceRate: 0, present: 0, absent: 0, total: 0 };
      }

      const present = attendanceRecords.filter((r: any) => r.status === "present").length;
      const total = attendanceRecords.length;
      const attendanceRate = Math.round((present / total) * 100);

      return {
        attendanceRate,
        present,
        absent: total - present,
        total,
      };
    } catch (error) {
      console.error("[StudentStats] Error getting attendance rate:", error);
      return { attendanceRate: 0, present: 0, absent: 0, total: 0 };
    }
  }),

  // Get student's ranking
  getStudentRanking: protectedProcedure.query(async ({ ctx }) => {
    try {
      const members = await db.getAllMembers();
      const currentMember = members.find((m: any) => m.userId === ctx.user.id);
      
      if (!currentMember) {
        return { rank: 0, totalStudents: members.length, percentile: 0 };
      }

      const sortedMembers = [...members].sort((a: any, b: any) => 
        parseFloat(b.xp || "0") - parseFloat(a.xp || "0")
      );

      const rank = sortedMembers.findIndex((m: any) => m.id === currentMember.id) + 1;
      const totalStudents = members.length;
      const percentile = Math.round(((totalStudents - rank) / totalStudents) * 100);

      return { rank, totalStudents, percentile };
    } catch (error) {
      console.error("[StudentStats] Error getting ranking:", error);
      return { rank: 0, totalStudents: 0, percentile: 0 };
    }
  }),

  // Get student's team info
  getTeamInfo: protectedProcedure.query(async ({ ctx }) => {
    try {
      const members = await db.getAllMembers();
      const currentMember = members.find((m: any) => m.userId === ctx.user.id);
      
      if (!currentMember) {
        return { teamId: null, teamName: null, teamColor: null, teamEmoji: null, members: [] };
      }

      const teamMembers = await db.getMembersByTeam(currentMember.teamId);
      const teams = await db.getAllTeams();
      const team = teams.find((t: any) => t.id === currentMember.teamId);

      if (!team) {
        return { teamId: null, teamName: null, teamColor: null, teamEmoji: null, members: [] };
      }

      const membersWithXP = teamMembers.map((m: any) => ({
        name: m.name,
        xp: Math.round(parseFloat(m.xp || "0") * 10) / 10,
      })).sort((a: any, b: any) => b.xp - a.xp);

      return {
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color,
        teamEmoji: team.emoji,
        members: membersWithXP,
      };
    } catch (error) {
      console.error("[StudentStats] Error getting team info:", error);
      return { teamId: null, teamName: null, teamColor: null, teamEmoji: null, members: [] };
    }
  }),
});
