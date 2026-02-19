import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Search, User, Users, Trophy, TrendingUp, Target,
  ArrowLeft, Star, Zap, Medal, ChevronDown, ChevronUp,
  FlaskConical
} from "lucide-react";

// ─── Circular Gauge ───
function CircularGauge({ value, max, color, size = 160 }: { value: number; max: number; color: string; size?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="oklch(0.245 0.03 264.052)" strokeWidth="10"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-3xl" style={{ color }}>{value.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">de {max} PF</span>
      </div>
    </div>
  );
}

// ─── PF Progress Bar ───
function XPBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Rank Badge ───
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-mono font-bold text-sm text-black shadow-lg">1</div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center font-mono font-bold text-sm text-black shadow-lg">2</div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-mono font-bold text-sm text-white shadow-lg">3</div>;
  return <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-mono font-bold text-sm text-muted-foreground">{rank}</div>;
}

export default function StudentProgress() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [showTeammates, setShowTeammates] = useState(false);

  const { data, isLoading } = trpc.leaderboard.getData.useQuery();

  // Flatten all members with team info
  const allMembers = useMemo(() => {
    if (!data) return [];
    return data.teams.flatMap(t =>
      t.members.map(m => ({
        ...m,
        teamId: t.id,
        teamName: t.name,
        teamEmoji: t.emoji,
        teamColor: t.color,
      }))
    );
  }, [data]);

  // Global ranking
  const globalRanking = useMemo(() => {
    return [...allMembers].sort((a, b) => b.xp - a.xp);
  }, [allMembers]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return allMembers.filter(m =>
      m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
    ).slice(0, 8);
  }, [searchQuery, allMembers]);

  // Selected student data
  const selectedStudent = useMemo(() => {
    if (!selectedMemberId) return null;
    return allMembers.find(m => m.id === selectedMemberId) || null;
  }, [selectedMemberId, allMembers]);

  // Student's rank
  const studentRank = useMemo(() => {
    if (!selectedStudent) return 0;
    return globalRanking.findIndex(m => m.id === selectedStudent.id) + 1;
  }, [selectedStudent, globalRanking]);

  // Student's team data
  const studentTeam = useMemo(() => {
    if (!selectedStudent || !data) return null;
    return data.teams.find(t => t.id === selectedStudent.teamId) || null;
  }, [selectedStudent, data]);

  // Team ranking
  const teamRanking = useMemo(() => {
    if (!data) return [];
    return [...data.teams]
      .map(t => ({
        ...t,
        totalXP: t.members.reduce((s, m) => s + m.xp, 0),
        avgXP: t.members.length > 0 ? t.members.reduce((s, m) => s + m.xp, 0) / t.members.length : 0,
      }))
      .sort((a, b) => b.totalXP - a.totalXP);
  }, [data]);

  // Student's team rank
  const teamRank = useMemo(() => {
    if (!studentTeam) return 0;
    return teamRanking.findIndex(t => t.id === studentTeam.id) + 1;
  }, [studentTeam, teamRanking]);

  // Teammates sorted by XP
  const teammates = useMemo(() => {
    if (!studentTeam) return [];
    return [...studentTeam.members].sort((a, b) => b.xp - a.xp);
  }, [studentTeam]);

  // Max XP
  const maxXP = useMemo(() => {
    if (!data?.settings?.maxXPSemester) return 45;
    return parseFloat(data.settings.maxXPSemester);
  }, [data]);

  // Percentile
  const percentile = useMemo(() => {
    if (!studentRank || globalRanking.length === 0) return 0;
    return Math.round(((globalRanking.length - studentRank) / globalRanking.length) * 100);
  }, [studentRank, globalRanking]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <FlaskConical size={40} className="text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border" style={{ backgroundColor: "oklch(0.175 0.03 264.052)" }}>
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/leaderboard">
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={16} />
                Ranking
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <User size={18} className="text-primary" />
            <span className="font-display font-bold text-foreground">Meu Progresso</span>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl mx-auto">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground mb-2 text-center">
            Consulte seu <span className="text-primary">Progresso</span>
          </h1>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Digite seu nome para visualizar seus Pontos Farmacológicos (PF) e o desempenho da sua equipe
          </p>

          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) setSelectedMemberId(null);
              }}
              placeholder="Digite seu nome..."
              className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchQuery.trim() && searchResults.length > 0 && !selectedStudent && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-1 border border-border rounded-lg overflow-hidden z-10 shadow-xl"
                  style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                >
                  {searchResults.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedMemberId(member.id);
                        setSearchQuery(member.name);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/30 last:border-b-0"
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: member.teamColor + "22", border: `1px solid ${member.teamColor}44` }}
                      >
                        {member.teamEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{member.name}</div>
                        <div className="text-[11px] text-muted-foreground">{member.teamName}</div>
                      </div>
                      <div className="font-mono text-sm font-bold" style={{ color: member.teamColor }}>
                        {member.xp.toFixed(1)} PF
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {searchQuery.trim() && searchResults.length === 0 && !selectedStudent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-full left-0 right-0 mt-1 border border-border rounded-lg p-4 text-center text-sm text-muted-foreground"
                style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
              >
                Nenhum aluno encontrado. Verifique a grafia do nome.
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Student Dashboard */}
        <AnimatePresence mode="wait">
          {selectedStudent && studentTeam && (
            <motion.div
              key={selectedStudent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Student Card */}
              <div
                className="border rounded-lg p-6 mb-6"
                style={{
                  backgroundColor: "oklch(0.195 0.03 264.052)",
                  borderColor: selectedStudent.teamColor + "44",
                }}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Gauge */}
                  <CircularGauge
                    value={selectedStudent.xp}
                    max={maxXP}
                    color={selectedStudent.teamColor}
                    size={150}
                  />

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="font-display font-bold text-xl text-foreground mb-1">
                      {selectedStudent.name}
                    </h2>
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-4">
                      <span className="text-lg">{selectedStudent.teamEmoji}</span>
                      <span className="text-sm font-medium" style={{ color: selectedStudent.teamColor }}>
                        Equipe {selectedStudent.teamName}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-md bg-secondary/50">
                        <Trophy size={16} className="mx-auto mb-1 text-amber-400" />
                        <div className="font-mono font-bold text-lg text-foreground">{studentRank}º</div>
                        <div className="text-[10px] text-muted-foreground">Ranking Geral</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-secondary/50">
                        <TrendingUp size={16} className="mx-auto mb-1 text-emerald-400" />
                        <div className="font-mono font-bold text-lg text-foreground">{percentile}%</div>
                        <div className="text-[10px] text-muted-foreground">Percentil</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-secondary/50">
                        <Target size={16} className="mx-auto mb-1 text-cyan-400" />
                        <div className="font-mono font-bold text-lg text-foreground">
                          {((selectedStudent.xp / maxXP) * 100).toFixed(0)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">Progresso</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PF to Grade Conversion */}
                <div className="mt-5 pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Contribuição para Nota Final (25%)</span>
                    <span className="font-mono font-bold" style={{ color: selectedStudent.teamColor }}>
                      {((selectedStudent.xp / maxXP) * 2.5).toFixed(2)} pts
                    </span>
                  </div>
                  <XPBar value={selectedStudent.xp} max={maxXP} color={selectedStudent.teamColor} />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    PF convertido em até 2,5 pontos na média final (de 10,0)
                  </p>
                </div>
              </div>

              {/* Team Card */}
              <div
                className="border rounded-lg overflow-hidden mb-6"
                style={{
                  backgroundColor: "oklch(0.195 0.03 264.052)",
                  borderColor: selectedStudent.teamColor + "33",
                }}
              >
                <button
                  onClick={() => setShowTeammates(!showTeammates)}
                  className="w-full p-5 flex items-center gap-4 text-left"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: selectedStudent.teamColor + "22", border: `1px solid ${selectedStudent.teamColor}44` }}
                  >
                    {selectedStudent.teamEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <span className="font-display font-bold text-foreground">
                        Equipe {selectedStudent.teamName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>
                        <Medal size={12} className="inline mr-1" />
                        {teamRank}º no ranking
                      </span>
                      <span>
                        <Zap size={12} className="inline mr-1" />
                        {studentTeam.members.reduce((s, m) => s + m.xp, 0).toFixed(1)} PF total
                      </span>
                      <span>
                        {studentTeam.members.length} membros
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {showTeammates ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                <AnimatePresence>
                  {showTeammates && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0 border-t border-border/30">
                        <div className="grid gap-2 mt-3">
                          {teammates.map((member, idx) => {
                            const isMe = member.id === selectedStudent.id;
                            return (
                              <div
                                key={member.id}
                                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                                  isMe ? "bg-primary/10 border border-primary/20" : ""
                                }`}
                              >
                                <RankBadge rank={idx + 1} />
                                <div className="flex-1 min-w-0">
                                  <span className={`text-sm truncate block ${isMe ? "font-bold text-primary" : "text-foreground"}`}>
                                    {member.name}
                                    {isMe && <span className="text-[10px] ml-1.5 text-primary">(você)</span>}
                                    {idx === 0 && <Star size={12} className="inline ml-1 text-amber-400" />}
                                  </span>
                                </div>
                                <div className="w-20 sm:w-28">
                                  <XPBar value={member.xp} max={maxXP} color={isMe ? selectedStudent.teamColor : "#6b7280"} />
                                </div>
                                <span
                                  className="font-mono text-sm font-medium w-12 text-right"
                                  style={{ color: isMe ? selectedStudent.teamColor : "#9ca3af" }}
                                >
                                  {member.xp.toFixed(1)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comparison with class */}
              <div
                className="border border-border rounded-lg p-5"
                style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
              >
                <h3 className="font-display font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  Comparação com a Turma
                </h3>

                <div className="space-y-3">
                  {/* Student vs Average */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Seus PF</span>
                      <span className="font-mono font-bold" style={{ color: selectedStudent.teamColor }}>
                        {selectedStudent.xp.toFixed(1)}
                      </span>
                    </div>
                    <XPBar value={selectedStudent.xp} max={maxXP} color={selectedStudent.teamColor} />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Média da Turma</span>
                      <span className="font-mono font-bold text-muted-foreground">
                        {allMembers.length > 0
                          ? (allMembers.reduce((s, m) => s + m.xp, 0) / allMembers.length).toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                    <XPBar
                      value={allMembers.length > 0 ? allMembers.reduce((s, m) => s + m.xp, 0) / allMembers.length : 0}
                      max={maxXP}
                      color="#6b7280"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Maior PF da Turma</span>
                      <span className="font-mono font-bold text-amber-400">
                        {globalRanking.length > 0 ? globalRanking[0].xp.toFixed(1) : "0.0"}
                      </span>
                    </div>
                    <XPBar
                      value={globalRanking.length > 0 ? globalRanking[0].xp : 0}
                      max={maxXP}
                      color="#f59e0b"
                    />
                  </div>
                </div>

                {/* Motivational message */}
                <div className="mt-4 pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground text-center italic">
                    {percentile >= 90
                      ? "🏆 Excelente! Você está entre os melhores da turma!"
                      : percentile >= 70
                      ? "🌟 Ótimo trabalho! Continue assim!"
                      : percentile >= 50
                      ? "💪 Bom progresso! Participe mais das atividades para subir no ranking."
                      : percentile >= 30
                      ? "📚 Você pode melhorar! Aproveite os Kahoots e Jigsaws para ganhar PF."
                      : "🚀 Ainda dá tempo! Participe ativamente das próximas atividades."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!selectedStudent && !searchQuery.trim() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              Busque seu nome acima
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Digite seu nome completo ou parte dele para visualizar seu progresso individual e o desempenho da sua equipe.
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="container text-center">
          <p className="text-[11px] text-muted-foreground/60">
            Conexão em Farmacologia — UNIRIO — 2026.1 • Pontos Farmacológicos
          </p>
        </div>
      </footer>
    </div>
  );
}
