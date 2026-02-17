/*
 * DESIGN: Pharma Lab Dashboard
 * Dark navy background, emerald/cyan accents, scientific data visualization
 * Typography: Outfit (display), JetBrains Mono (data), DM Sans (body)
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Users, Zap, TrendingUp, ChevronDown, ChevronUp,
  Award, Target, Star, FlaskConical, Activity, Settings
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const HERO_BANNER = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/PxxmnrVLfupqXVFw.png";
const TROPHY_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/fHkVTuSmLcECPtYo.png";

const MAX_XP_SEMESTER = 45;

interface TeamMember { id: number; name: string; xp: number; teamId: number; }
interface TeamData { id: number; name: string; emoji: string; color: string; members: TeamMember[]; }

function getTeamXP(team: TeamData) { return team.members.reduce((sum, m) => sum + m.xp, 0); }
function getTeamAvg(team: TeamData) { return team.members.length > 0 ? getTeamXP(team) / team.members.length : 0; }

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-mono font-bold text-sm text-black shadow-lg">1</div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center font-mono font-bold text-sm text-black shadow-lg">2</div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-mono font-bold text-sm text-white shadow-lg">3</div>;
  return <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-mono font-bold text-sm text-muted-foreground">{rank}</div>;
}

function XPBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
    </div>
  );
}

function CircularGauge({ value, max, color, size = 120 }: { value: number; max: number; color: string; size?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="oklch(0.245 0.03 264.052)" strokeWidth="8" />
          <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-lg" style={{ color }}>{value.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground">/ {max}</span>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, rank }: { team: TeamData; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const totalXP = getTeamXP(team);
  const avgXP = getTeamAvg(team);
  const maxMemberXP = Math.max(...team.members.map(m => m.xp), 0);
  return (
    <motion.div layout className="border border-border rounded-lg overflow-hidden transition-colors hover:border-primary/30" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: rank * 0.05 }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 flex items-center gap-4 text-left">
        <RankBadge rank={rank} />
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: team.color + "22", border: `1px solid ${team.color}44` }}>{team.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-foreground truncate">{team.name}</span>
            <span className="text-xs text-muted-foreground">#{team.id}</span>
          </div>
          <div className="mt-1.5"><XPBar value={totalXP} max={MAX_XP_SEMESTER * team.members.length} color={team.color} /></div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="font-mono font-bold text-lg" style={{ color: team.color }}>{totalXP.toFixed(1)}</div>
          <div className="text-[11px] text-muted-foreground">XP total</div>
        </div>
        <div className="text-right shrink-0 ml-2 hidden sm:block">
          <div className="font-mono font-semibold text-sm text-foreground">{avgXP.toFixed(1)}</div>
          <div className="text-[11px] text-muted-foreground">média</div>
        </div>
        <div className="shrink-0 text-muted-foreground">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-border/50">
              <div className="grid gap-2 mt-3">
                {[...team.members].sort((a, b) => b.xp - a.xp).map((member, idx) => (
                  <div key={member.id} className="flex items-center gap-3 py-1.5">
                    <span className="w-5 text-center text-xs text-muted-foreground font-mono">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground truncate block">
                        {member.name}
                        {member.xp === maxMemberXP && <Star size={12} className="inline ml-1 text-amber-400" />}
                      </span>
                    </div>
                    <div className="w-24 sm:w-32"><XPBar value={member.xp} max={MAX_XP_SEMESTER} color={team.color} /></div>
                    <span className="font-mono text-sm font-medium w-12 text-right" style={{ color: team.color }}>{member.xp.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"teams" | "individual" | "activities">("teams");
  const { data: leaderboard, isLoading } = trpc.leaderboard.getData.useQuery();

  const teamsData: TeamData[] = useMemo(() => leaderboard?.teams ?? [], [leaderboard]);
  const rankedTeams = useMemo(() => [...teamsData].sort((a, b) => getTeamXP(b) - getTeamXP(a)), [teamsData]);

  const topStudents = useMemo(() => {
    const all = teamsData.flatMap(t => t.members.map(m => ({ ...m, teamName: t.name, teamColor: t.color, teamEmoji: t.emoji })));
    return all.sort((a, b) => b.xp - a.xp).slice(0, 10);
  }, [teamsData]);

  const totalStudents = teamsData.reduce((s, t) => s + t.members.length, 0);
  const totalXPEarned = useMemo(() => teamsData.reduce((s, t) => s + getTeamXP(t), 0), [teamsData]);
  const avgXPPerStudent = totalStudents > 0 ? totalXPEarned / totalStudents : 0;
  const topTeam = rankedTeams[0];
  const topTeamXP = topTeam ? getTeamXP(topTeam) : 0;

  const currentWeek = parseInt(leaderboard?.settings?.currentWeek || "1");
  const highlights = leaderboard?.highlights ?? [];
  const latestHighlight = highlights[highlights.length - 1];
  const activities = leaderboard?.activities ?? [];

  const universityName = leaderboard?.settings?.universityName || "UNIRIO";
  const courseName = leaderboard?.settings?.courseName || "Farmacologia I";
  const semester = leaderboard?.settings?.semester || "2026.1";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <FlaskConical size={40} className="text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground font-display">Carregando Leaderboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${HERO_BANNER})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="relative container pt-8 pb-12 sm:pt-12 sm:pb-16">
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical size={20} className="text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide uppercase font-display">{universityName} — {courseName} — {semester}</span>
          </div>
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-foreground leading-tight">
                Leaderboard<span className="text-gradient-emerald"> XP</span>
              </h1>
              <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl font-body">
                Acompanhe a pontuação das equipes e dos alunos em tempo real. Semana {currentWeek} de 16 do semestre.
              </p>
            </div>
            <img src={TROPHY_ICON} alt="Troféu" className="w-16 h-16 sm:w-24 sm:h-24 object-contain shrink-0 drop-shadow-lg hidden sm:block" />
          </div>
          {/* Stats Row */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <Users size={18} />, label: "Equipes", value: teamsData.length.toString(), sub: `${totalStudents} alunos` },
              { icon: <Zap size={18} />, label: "XP Total Turma", value: totalXPEarned.toFixed(0), sub: `de ${MAX_XP_SEMESTER * totalStudents}` },
              { icon: <TrendingUp size={18} />, label: "Média por Aluno", value: avgXPPerStudent.toFixed(1), sub: `de ${MAX_XP_SEMESTER} possíveis` },
              { icon: <Trophy size={18} />, label: "Líder", value: topTeam?.name ?? "—", sub: `${topTeamXP.toFixed(1)} XP` },
            ].map((stat, i) => (
              <motion.div key={stat.label} className="border border-border rounded-lg p-3 sm:p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052 / 0.8)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}>
                <div className="flex items-center gap-2 text-primary mb-1">{stat.icon}<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span></div>
                <div className="font-mono font-bold text-lg sm:text-xl text-foreground truncate">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Highlight Banner */}
      {latestHighlight && (
        <div className="container -mt-2 mb-6">
          <motion.div className="border border-primary/20 rounded-lg p-4 flex items-start gap-3 glow-emerald" style={{ backgroundColor: "oklch(0.696 0.17 162.48 / 0.06)" }} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <Activity size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-primary font-medium">SEMANA {latestHighlight.week}</span>
                <span className="text-xs text-muted-foreground">{latestHighlight.date}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{latestHighlight.activity}</span>
              </div>
              <p className="text-sm text-foreground mt-1">{latestHighlight.description}</p>
              <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
                <span>Equipe destaque: <strong className="text-foreground">{latestHighlight.topTeam}</strong></span>
                <span>Aluno(a) destaque: <strong className="text-foreground">{latestHighlight.topStudent}</strong></span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="container mb-6">
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/50 w-fit">
          {[
            { key: "teams" as const, label: "Ranking Equipes", icon: <Users size={15} /> },
            { key: "individual" as const, label: "Top 10 Individual", icon: <Award size={15} /> },
            { key: "activities" as const, label: "Atividades XP", icon: <Target size={15} /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {tab.icon}<span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container pb-16">
        <AnimatePresence mode="wait">
          {activeTab === "teams" && (
            <motion.div key="teams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              {rankedTeams.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                  {[rankedTeams[1], rankedTeams[0], rankedTeams[2]].map((team, idx) => {
                    const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                    const isFirst = actualRank === 1;
                    return (
                      <motion.div key={team.id} className={`border rounded-lg p-3 sm:p-5 text-center ${isFirst ? "border-amber-500/30 glow-amber" : "border-border"}`} style={{ backgroundColor: isFirst ? "oklch(0.795 0.16 86.047 / 0.06)" : "oklch(0.195 0.03 264.052)", marginTop: isFirst ? 0 : "1.5rem" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + idx * 0.15 }}>
                        <div className="text-2xl sm:text-3xl mb-2">{team.emoji}</div>
                        <div className={`text-xs font-mono font-bold mb-1 ${actualRank === 1 ? "text-amber-400" : actualRank === 2 ? "text-gray-400" : "text-amber-700"}`}>#{actualRank}</div>
                        <div className="font-display font-bold text-sm sm:text-base text-foreground truncate">{team.name}</div>
                        <div className="font-mono font-bold text-xl sm:text-2xl mt-1" style={{ color: team.color }}>{getTeamXP(team).toFixed(1)}</div>
                        <div className="text-[11px] text-muted-foreground">XP total</div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2"><Trophy size={20} className="text-primary" />Ranking Completo das Equipes</h2>
              <div className="grid gap-2">{rankedTeams.map((team, idx) => <TeamCard key={team.id} team={team} rank={idx + 1} />)}</div>
            </motion.div>
          )}

          {activeTab === "individual" && (
            <motion.div key="individual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2"><Award size={20} className="text-primary" />Top 10 — Alunos com Maior XP</h2>
              <div className="flex justify-center gap-6 sm:gap-10 mb-8">
                {topStudents.slice(0, 3).map((student, idx) => (
                  <motion.div key={student.name} className="flex flex-col items-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: idx * 0.15 }}>
                    <CircularGauge value={student.xp} max={MAX_XP_SEMESTER} color={student.teamColor} size={idx === 0 ? 110 : 90} />
                    <div className="mt-2 text-center">
                      <div className="font-display font-semibold text-sm text-foreground truncate max-w-[100px]">{student.name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 justify-center"><span>{student.teamEmoji}</span><span>{student.teamName}</span></div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="border border-border rounded-lg overflow-hidden" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
                {topStudents.map((student, idx) => (
                  <motion.div key={student.name} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 ${idx < topStudents.length - 1 ? "border-b border-border/50" : ""}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                    <RankBadge rank={idx + 1} />
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: student.teamColor + "22", border: `1px solid ${student.teamColor}44` }}>{student.teamEmoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{student.name}</div>
                      <div className="text-[11px] text-muted-foreground">{student.teamName}</div>
                    </div>
                    <div className="w-20 sm:w-32"><XPBar value={student.xp} max={MAX_XP_SEMESTER} color={student.teamColor} /></div>
                    <div className="font-mono font-bold text-sm w-12 text-right" style={{ color: student.teamColor }}>{student.xp.toFixed(1)}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "activities" && (
            <motion.div key="activities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2"><Target size={20} className="text-primary" />Atividades que Geram XP</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                {activities.map((act, idx) => (
                  <motion.div key={act.id} className="border border-border rounded-lg p-4 flex items-center gap-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.06 }}>
                    <div className="text-2xl">{act.icon}</div>
                    <div className="flex-1"><div className="font-display font-semibold text-sm text-foreground">{act.name}</div><div className="text-xs text-muted-foreground mt-0.5">Até {act.maxXP} XP por sessão</div></div>
                    <div className="font-mono font-bold text-lg text-primary">+{act.maxXP}</div>
                  </motion.div>
                ))}
              </div>
              <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2"><Activity size={20} className="text-primary" />Histórico Semanal</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="grid gap-4">
                  {highlights.map((highlight, idx) => (
                    <motion.div key={highlight.id} className="relative pl-10" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.08 }}>
                      <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${idx === highlights.length - 1 ? "bg-primary border-primary" : "bg-secondary border-border"}`} />
                      <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold text-primary">SEM {highlight.week}</span>
                          <span className="text-xs text-muted-foreground">{highlight.date}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{highlight.activity}</span>
                        </div>
                        <p className="text-sm text-foreground">{highlight.description}</p>
                        {highlight.topTeam !== "—" && (
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>🏆 {highlight.topTeam}</span>
                            <span>⭐ {highlight.topStudent}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-4">
            <p className="text-xs text-muted-foreground">{universityName} — {courseName} — Semestre {semester}</p>
            <a href="/admin" className="text-xs text-muted-foreground/40 hover:text-primary flex items-center gap-1 transition-colors"><Settings size={10} /> Admin</a>
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-1">Atualizado em Semana {currentWeek} • Sistema de Gamificação com Metodologias Ativas</p>
        </div>
      </footer>
    </div>
  );
}
