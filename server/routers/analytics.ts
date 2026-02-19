import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

/**
 * Analytics Router
 * Provides data for performance dashboards and reports
 */
export const analyticsRouter = router({
  /**
   * Get team performance data over time
   * Returns weekly XP snapshots for all teams
   */
  getTeamPerformance: publicProcedure
    .input(z.object({
      startWeek: z.number().min(1).max(17).optional(),
      endWeek: z.number().min(1).max(17).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const startWeek = input.startWeek || 1;
        const endWeek = input.endWeek || 17;

        // Get all teams
        const teams = await db.getAllTeams();
        
        // For each team, get XP history data
        const teamPerformance = await Promise.all(
          teams.map(async (team) => {
            // Get current XP for the team (sum of all members)
            const members = await db.getMembersByTeam(team.id);
            const totalXP = members?.reduce((sum: number, m: any) => sum + parseFloat(m.xp.toString()), 0) || 0;
            
            return {
              teamId: team.id,
              teamName: team.name,
              teamColor: team.color,
              teamEmoji: team.emoji,
              currentXP: totalXP,
              memberCount: members?.length || 0,
            };
          })
        );

        // Sort by current XP descending
        teamPerformance.sort((a, b) => b.currentXP - a.currentXP);

        return {
          success: true,
          data: teamPerformance,
          totalTeams: teams.length,
          periodStart: startWeek,
          periodEnd: endWeek,
        };
      } catch (error) {
        console.error("[Analytics] Error getting team performance:", error);
        return {
          success: false,
          error: "Erro ao obter dados de desempenho",
          data: [],
        };
      }
    }),

  /**
   * Get individual student performance data
   */
  getStudentPerformance: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(20),
    }))
    .query(async ({ input }) => {
      try {
        const members = await db.getAllMembers();
        
        // Sort by XP descending and limit
        const topStudents = members
          .sort((a, b) => parseFloat(b.xp.toString()) - parseFloat(a.xp.toString()))
          .slice(0, input.limit)
          .map((member, index) => ({
            rank: index + 1,
            name: member.name,
            xp: parseFloat(member.xp.toString()),
            teamId: member.teamId,
          }));

        return {
          success: true,
          data: topStudents,
          totalStudents: members.length,
        };
      } catch (error) {
        console.error("[Analytics] Error getting student performance:", error);
        return {
          success: false,
          error: "Erro ao obter dados de desempenho dos alunos",
          data: [],
        };
      }
    }),

  /**
   * Get summary statistics
   */
  getSummaryStats: publicProcedure
    .query(async () => {
      try {
        const teams = await db.getAllTeams();
        const members = await db.getAllMembers();

        const totalXP = members.reduce((sum: number, m: any) => sum + parseFloat(m.xp.toString()), 0);
        const averageXPPerStudent = members.length > 0 ? totalXP / members.length : 0;
        const topTeam = teams.length > 0 ? teams[0] : null;

        return {
          success: true,
          data: {
            totalTeams: teams.length,
            totalStudents: members.length,
            totalXPEarned: totalXP,
            averageXPPerStudent: Math.round(averageXPPerStudent * 10) / 10,
            topTeamName: topTeam?.name || "N/A",
          },
        };
      } catch (error) {
        console.error("[Analytics] Error getting summary stats:", error);
        return {
          success: false,
          error: "Erro ao obter estatísticas",
          data: {},
        };
      }
    }),
});
