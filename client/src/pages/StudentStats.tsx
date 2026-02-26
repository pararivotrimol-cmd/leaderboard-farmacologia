import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Activity, CheckCircle, Clock, Target, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";
const ORANGE = "#F7941D";

interface StudentStatData {
  totalXP: number;
  weeklyXP: number[];
  activitiesCompleted: number;
  activitiesPending: number;
  attendanceRate: number;
  rank: number;
  totalStudents: number;
}

export default function StudentStats() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "semester">("semester");

  // Fetch real data from tRPC endpoints
  const { data: xpData } = trpc.studentStats.getTotalXP.useQuery();
  const { data: weeklyData } = trpc.studentStats.getWeeklyXP.useQuery({ weeks: 7 });
  const { data: activitiesData } = trpc.studentStats.getActivitiesSummary.useQuery();
  const { data: attendanceData } = trpc.studentStats.getAttendanceRate.useQuery();
  const { data: rankingData } = trpc.studentStats.getStudentRanking.useQuery();
  const { data: teamData } = trpc.studentStats.getTeamInfo.useQuery();

  const statsData: StudentStatData = useMemo(() => ({
    totalXP: xpData?.totalXP ?? 0,
    weeklyXP: weeklyData?.weeklyXP ?? [0, 0, 0, 0, 0, 0, 0],
    activitiesCompleted: activitiesData?.completed ?? 0,
    activitiesPending: activitiesData?.pending ?? 0,
    attendanceRate: attendanceData?.attendanceRate ?? 0,
    rank: rankingData?.rank ?? 0,
    totalStudents: rankingData?.totalStudents ?? 0,
  }), [xpData, weeklyData, activitiesData, attendanceData, rankingData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const isLoading = !xpData || !weeklyData || !activitiesData || !attendanceData || !rankingData;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <div className="text-center">
          <p className="text-white/60">Faça login para visualizar suas estatísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Header */}
      <div className="border-b" style={{ backgroundColor: CARD_BG, borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-3 sm:py-4 2xl:py-6">
          <div className="flex items-center gap-3">
            <Link href="/leaderboard">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-white/60" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl 2xl:text-2xl font-bold text-white">Minhas Estatísticas</h1>
              <p className="text-sm text-white/60">Acompanhe seu progresso na disciplina</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-6 sm:py-8 2xl:py-12">
        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {(["week", "month", "semester"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: timeRange === range ? ORANGE : "rgba(255,255,255,0.05)",
                color: timeRange === range ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              {range === "week" ? "Esta Semana" : range === "month" ? "Este Mês" : "Semestre"}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total XP */}
          <motion.div
            className="rounded-lg p-4 sm:p-5"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${ORANGE}30` }}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Total XP</span>
              <Zap size={18} style={{ color: ORANGE }} />
            </div>
            <div className="font-mono font-bold text-2xl text-white">{statsData.totalXP}</div>
            <div className="text-xs text-white/40 mt-1">de 45 possíveis</div>
            <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(statsData.totalXP / 45) * 100}%`, backgroundColor: ORANGE }}
              />
            </div>
          </motion.div>

          {/* Atividades Completadas */}
          <motion.div
            className="rounded-lg p-4 sm:p-5"
            style={{ backgroundColor: CARD_BG, border: `1px solid rgba(16,185,129,0.3)` }}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Atividades</span>
              <CheckCircle size={18} style={{ color: "#10B981" }} />
            </div>
            <div className="font-mono font-bold text-2xl text-white">{statsData.activitiesCompleted}</div>
            <div className="text-xs text-white/40 mt-1">{statsData.activitiesPending} pendentes</div>
            <div className="mt-3 text-sm text-white/60">
              {Math.round((statsData.activitiesCompleted / (statsData.activitiesCompleted + statsData.activitiesPending)) * 100)}% concluído
            </div>
          </motion.div>

          {/* Taxa de Presença */}
          <motion.div
            className="rounded-lg p-4 sm:p-5"
            style={{ backgroundColor: CARD_BG, border: `1px solid rgba(59,130,246,0.3)` }}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Presença</span>
              <Activity size={18} style={{ color: "#3B82F6" }} />
            </div>
            <div className="font-mono font-bold text-2xl text-white">{statsData.attendanceRate}%</div>
            <div className="text-xs text-white/40 mt-1">Taxa de comparecimento</div>
            <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${statsData.attendanceRate}%`, backgroundColor: "#3B82F6" }}
              />
            </div>
          </motion.div>

          {/* Ranking */}
          <motion.div
            className="rounded-lg p-4 sm:p-5"
            style={{ backgroundColor: CARD_BG, border: `1px solid rgba(168,85,247,0.3)` }}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Ranking</span>
              <TrendingUp size={18} style={{ color: "#A855F7" }} />
            </div>
            <div className="font-mono font-bold text-2xl text-white">#{statsData.rank}</div>
            <div className="text-xs text-white/40 mt-1">de {statsData.totalStudents} alunos</div>
            <div className="mt-3 text-sm text-white/60">
              Percentil: {Math.round(((statsData.totalStudents - statsData.rank) / statsData.totalStudents) * 100)}%
            </div>
          </motion.div>
        </motion.div>

        {/* Weekly Progress Chart */}
        <motion.div
          className="rounded-lg p-4 sm:p-6"
          style={{ backgroundColor: CARD_BG, border: `1px solid rgba(255,255,255,0.1)` }}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-bold text-white mb-4">Progresso Semanal</h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {statsData.weeklyXP.map((xp, idx) => (
              <motion.div
                key={idx}
                className="flex-1 rounded-t-lg transition-all"
                style={{
                  backgroundColor: ORANGE,
                  height: `${(xp / Math.max(...statsData.weeklyXP)) * 100}%`,
                  opacity: 0.8,
                }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                title={`Semana ${idx + 1}: ${xp} XP`}
              >
                <div className="text-xs text-white text-center pt-2 font-mono">{xp}</div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-3">
            <span>Semana 1</span>
            <span>Semana 7</span>
          </div>
        </motion.div>

        {/* Activity Summary */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Próximas Atividades */}
          <motion.div
            className="rounded-lg p-4 sm:p-5"
            style={{ backgroundColor: CARD_BG, border: `1px solid rgba(255,255,255,0.1)` }}
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} style={{ color: ORANGE }} />
              <h3 className="font-bold text-white">Próximas Atividades</h3>
            </div>
            <div className="space-y-2">
              {[
                { name: "Caso Clínico 1", due: "28/02/2026", status: "pending" },
                { name: "Seminário Jigsaw", due: "12/05/2026", status: "pending" },
                { name: "Quiz Interativo", due: "05/03/2026", status: "pending" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <span className="text-sm text-white">{activity.name}</span>
                  <span className="text-xs text-white/40">{activity.due}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Equipe */}
          <motion.div
            className="rounded-lg p-4 sm:p-5"
            style={{ backgroundColor: CARD_BG, border: `1px solid rgba(255,255,255,0.1)` }}
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} style={{ color: ORANGE }} />
              <h3 className="font-bold text-white">Sua Equipe</h3>
            </div>
            <div className="space-y-2">
              {(teamData?.members ?? []).map((member: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <div>
                    <div className="text-sm text-white">{member.name}</div>
                  </div>
                  <div className="font-mono font-bold text-sm" style={{ color: ORANGE }}>
                    {member.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
