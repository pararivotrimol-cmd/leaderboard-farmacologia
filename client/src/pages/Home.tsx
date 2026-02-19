/**
 * Leaderboard — Conexão em Farmacologia
 * Padronizado: Laranja (#F7941D) + Cinza (#4A4A4A) + Branco
 * Typography: Outfit (display), JetBrains Mono (data), DM Sans (body)
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Users, Zap, TrendingUp, ChevronDown, ChevronUp,
  Award, Target, Star, FlaskConical, Activity, Settings, Youtube, Bell,
  ArrowLeft, BookOpen, ClipboardList, LogOut, MapPin, BarChart3
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/TYglakFwBNwpBXzT.png";
const YOUTUBE_URL = "https://www.youtube.com/@Conex%C3%A3oemCi%C3%AAncia-Farmacol%C3%B3gica";

// Brand colors
const ORANGE = "#F7941D";
const GRAY = "#4A4A4A";
const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";

const MAX_PF_SEMESTER = 45;

interface TeamMember { id: number; name: string; xp: number; teamId: number; }
interface TeamData { id: number; name: string; emoji: string; color: string; members: TeamMember[]; }

function getTeamPF(team: TeamData) { return team.members.reduce((sum, m) => sum + m.xp, 0); }
function getTeamAvg(team: TeamData) { return team.members.length > 0 ? getTeamPF(team) / team.members.length : 0; }

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm text-white shadow-lg" style={{ background: "linear-gradient(135deg, #F7941D, #FFD700)" }}>1</div>;
  if (rank === 2) return <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm text-white shadow-lg" style={{ background: "linear-gradient(135deg, #999, #ccc)" }}>2</div>;
  if (rank === 3) return <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm text-white shadow-lg" style={{ background: "linear-gradient(135deg, #8B6914, #B8860B)" }}>3</div>;
  return <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>{rank}</div>;
}

function PFBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
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
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-lg" style={{ color }}>{value.toFixed(1)}</span>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>/ {max}</span>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, rank }: { team: TeamData; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const totalPF = getTeamPF(team);
  const avgPF = getTeamAvg(team);
  const maxMemberPF = Math.max(...team.members.map(m => m.xp), 0);
  return (
    <motion.div
      layout
      className="rounded-lg overflow-hidden transition-all"
      style={{
        backgroundColor: CARD_BG,
        border: `1px solid rgba(247,148,29,0.12)`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.05 }}
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 sm:p-5 flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 text-left hover:bg-white/[0.02] transition-colors min-h-[72px]">
        <RankBadge rank={rank} />
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: ORANGE + "15", border: `1px solid ${ORANGE}33` }}>{team.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-white truncate">{team.name}</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>#{team.id}</span>
          </div>
          <div className="mt-1.5"><PFBar value={totalPF} max={MAX_PF_SEMESTER * team.members.length} color={ORANGE} /></div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="font-mono font-bold text-lg" style={{ color: ORANGE }}>{totalPF.toFixed(1)}</div>
          <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>PF total</div>
        </div>
        <div className="text-right shrink-0 ml-2 hidden sm:block">
          <div className="font-mono font-semibold text-sm text-white">{avgPF.toFixed(1)}</div>
          <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>média</div>
        </div>
        <div className="shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0" style={{ borderTop: "1px solid rgba(247,148,29,0.08)" }}>
              <div className="grid gap-2 mt-3">
                {[...team.members].sort((a, b) => b.xp - a.xp).map((member, idx) => (
                  <div key={member.id} className="flex items-center gap-3 py-1.5">
                    <span className="w-5 text-center text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-white truncate block">
                        {member.name}
                        {member.xp === maxMemberPF && <Star size={12} className="inline ml-1" style={{ color: ORANGE }} />}
                      </span>
                    </div>
                    <div className="w-24 sm:w-32"><PFBar value={member.xp} max={MAX_PF_SEMESTER} color={ORANGE} /></div>
                    <span className="font-mono text-sm font-medium w-12 text-right" style={{ color: ORANGE }}>{member.xp.toFixed(1)}</span>
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

// ─── Grade Calculator Component ───
function GradeCalculator() {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [sem, setSem] = useState("");
  const [cs, setCs] = useState("");
  const [kahoot, setKahoot] = useState("");

  const p1Val = parseFloat(p1) || 0;
  const p2Val = parseFloat(p2) || 0;
  const semVal = parseFloat(sem) || 0;
  const csVal = parseFloat(cs) || 0;
  const kahootVal = parseFloat(kahoot) || 0;

  const nt = (semVal + csVal + kahootVal) / 3;
  const mf = ((p1Val + p2Val) / 2) * 0.75 + nt * 0.25;
  const isApproved = mf >= 5.0;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display font-bold text-xl text-white mb-2 flex items-center gap-2">
        <BarChart3 size={22} style={{ color: ORANGE }} />
        Calculadora de Média Final
      </h2>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
        Simule sua Média Final (MF) com base nas notas das provas e atividades.
      </p>

      {/* Formula Explanation */}
      <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: CARD_BG, border: `1px solid ${ORANGE}25` }}>
        <h3 className="font-semibold text-sm text-white mb-2">Fórmula da Média Final</h3>
        <div className="font-mono text-xs sm:text-sm mb-3 p-3 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: ORANGE }}>
          MF = (P1 + P2) / 2 × 0,75 + NT × 0,25
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          Onde <strong style={{ color: ORANGE }}>NT</strong> (Nota de Trabalho) = (SEM + CS + Kahoot) / 3
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
          <strong style={{ color: ORANGE }}>SEM</strong>: Seminários Jigsaw | <strong style={{ color: ORANGE }}>CS</strong>: Casos Clínicos | <strong style={{ color: ORANGE }}>Kahoot</strong>: Atividades Kahoot
        </p>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-white block mb-1.5">Prova 1 (P1)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2.5 rounded-lg text-sm font-mono text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)` }}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-white block mb-1.5">Prova 2 (P2)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2.5 rounded-lg text-sm font-mono text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)` }}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-white block mb-1.5">Seminários (SEM)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={sem}
            onChange={(e) => setSem(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2.5 rounded-lg text-sm font-mono text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)` }}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-white block mb-1.5">Casos Clínicos (CS)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={cs}
            onChange={(e) => setCs(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2.5 rounded-lg text-sm font-mono text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)` }}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-white block mb-1.5">Kahoot</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={kahoot}
            onChange={(e) => setKahoot(e.target.value)}
            placeholder="0.0"
            className="w-full px-3 py-2.5 rounded-lg text-sm font-mono text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.1)` }}
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: CARD_BG, border: `1px solid rgba(255,255,255,0.1)` }}>
          <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Nota de Trabalho (NT)</p>
          <p className="text-3xl font-mono font-bold" style={{ color: ORANGE }}>{nt.toFixed(2)}</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>(SEM + CS + Kahoot) / 3</p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: isApproved ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${isApproved ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
          <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Média Final (MF)</p>
          <p className="text-3xl font-mono font-bold" style={{ color: isApproved ? "#22c55e" : "#ef4444" }}>{mf.toFixed(2)}</p>
          <p className="text-xs mt-1 font-medium" style={{ color: isApproved ? "#22c55e" : "#ef4444" }}>
            {isApproved ? "✓ Aprovado" : "✗ Reprovado"} (mínimo 5.0)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"teams" | "individual" | "activities" | "rules" | "calculator">("teams");
  const { data: leaderboard, isLoading } = trpc.leaderboard.getData.useQuery();
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
    window.location.href = "/";
  }, [logout]);

  const teamsData: TeamData[] = useMemo(() => leaderboard?.teams ?? [], [leaderboard]);
  const rankedTeams = useMemo(() => [...teamsData].sort((a, b) => getTeamPF(b) - getTeamPF(a)), [teamsData]);

  const topStudents = useMemo(() => {
    const all = teamsData.flatMap(t => t.members.map(m => ({ ...m, teamName: t.name, teamColor: t.color, teamEmoji: t.emoji })));
    return all.sort((a, b) => b.xp - a.xp).slice(0, 10);
  }, [teamsData]);

  const totalStudents = teamsData.reduce((s, t) => s + t.members.length, 0);
  const totalPFEarned = useMemo(() => teamsData.reduce((s, t) => s + getTeamPF(t), 0), [teamsData]);
  const avgPFPerStudent = totalStudents > 0 ? totalPFEarned / totalStudents : 0;
  const topTeam = rankedTeams[0];
  const topTeamPF = topTeam ? getTeamPF(topTeam) : 0;

  const currentWeek = parseInt(leaderboard?.settings?.currentWeek || "1");
  const highlights = leaderboard?.highlights ?? [];
  const latestHighlight = highlights[highlights.length - 1];
  const activities = leaderboard?.activities ?? [];

  const universityName = leaderboard?.settings?.universityName || "UNIRIO";
  const courseName = leaderboard?.settings?.courseName || "Farmacologia I";
  const semester = leaderboard?.settings?.semester || "2026.1";

  const { data: notifications } = trpc.notifications.getActive.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <FlaskConical size={40} className="mx-auto mb-4 animate-pulse" style={{ color: ORANGE }} />
          <p className="font-display" style={{ color: "rgba(255,255,255,0.5)" }}>Carregando Conexão em Farmacologia...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Notification Banners */}
      {notifications && notifications.length > 0 && (
        <div className="w-full">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2"
              style={{
                backgroundColor: notif.priority === "urgent" ? "rgba(239,68,68,0.9)" : notif.priority === "important" ? "rgba(247,148,29,0.9)" : "rgba(247,148,29,0.15)",
                color: notif.priority === "urgent" || notif.priority === "important" ? "#fff" : ORANGE,
              }}
            >
              <Bell size={14} />
              <span className="font-display font-semibold">{notif.title}</span>
              {notif.content && <span className="hidden sm:inline">— {notif.content}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: CARD_BG }}>
        {/* Orange accent line at top */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${ORANGE}, transparent 50%, ${ORANGE})` }} />

        <div className="relative container pt-6 pb-10 sm:pt-10 sm:pb-14">
          {/* Top Nav */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-sm font-display font-semibold text-white block">Conexão em Farmacologia</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{universityName} — {courseName} — {semester}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ color: ORANGE, backgroundColor: ORANGE + "12", border: `1px solid ${ORANGE}25` }}>
                  <ArrowLeft size={14} />
                  Início
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight">
                Quadro Geral de<span className="text-gradient-orange"> Pontuação</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base max-w-xl font-body" style={{ color: "rgba(255,255,255,0.5)" }}>
                Acompanhe os Pontos Farmacológicos (PF) das equipes e dos alunos em tempo real. Semana {currentWeek} de 16 do semestre.
              </p>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Link href="/meu-progresso">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]" style={{ backgroundColor: ORANGE, color: "#fff" }}>
                    <Users size={15} />
                    Meu Progresso
                  </span>
                </Link>
                <Link href="/avisos">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: ORANGE, backgroundColor: ORANGE + "10", border: `1px solid ${ORANGE}30` }}>
                    <Bell size={15} />
                    Avisos
                  </span>
                </Link>
                <Link href="/presenca">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: ORANGE, backgroundColor: ORANGE + "10", border: `1px solid ${ORANGE}30` }}>
                    <MapPin size={15} />
                    Presença
                  </span>
                </Link>
                <Link href="/dashboard">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: ORANGE, backgroundColor: ORANGE + "10", border: `1px solid ${ORANGE}30` }}>
                    <BarChart3 size={15} />
                    Dashboard
                  </span>
                </Link>
                <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Youtube size={15} />
                  YouTube
                </a>
              </div>
            </div>
            <img src={LOGO_URL} alt="Conexão em Farmacologia" className="w-40 h-40 sm:w-52 sm:h-52 object-contain shrink-0 drop-shadow-lg hidden sm:block" />
          </div>

          {/* Stats Row */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {[
              { icon: <Users size={18} />, label: "Equipes", value: teamsData.length.toString(), sub: `${totalStudents} alunos` },
              { icon: <Zap size={18} />, label: "PF Total Turma", value: totalPFEarned.toFixed(0), sub: `de ${MAX_PF_SEMESTER * totalStudents}` },
              { icon: <TrendingUp size={18} />, label: "Média por Aluno", value: avgPFPerStudent.toFixed(1), sub: `de ${MAX_PF_SEMESTER} possíveis` },
              { icon: <Trophy size={18} />, label: "Líder", value: topTeamPF > 0 ? (topTeam?.name ?? "—") : "—", sub: topTeamPF > 0 ? `${topTeamPF.toFixed(1)} PF` : "Sem pontuação" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rounded-lg p-3 sm:p-4"
                style={{ backgroundColor: "rgba(247,148,29,0.05)", border: `1px solid rgba(247,148,29,0.12)` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: ORANGE }}>{stat.icon}</span>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</span>
                </div>
                <div className="font-mono font-bold text-lg sm:text-xl text-white truncate">{stat.value}</div>
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Highlight Banner */}
      {latestHighlight && totalPFEarned > 0 && (
        <div className="container -mt-2 mb-6">
          <motion.div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{ backgroundColor: ORANGE + "0A", border: `1px solid ${ORANGE}25` }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Activity size={20} className="mt-0.5 shrink-0" style={{ color: ORANGE }} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-medium" style={{ color: ORANGE }}>SEMANA {latestHighlight.week}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{latestHighlight.date}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: ORANGE + "15", color: ORANGE }}>{latestHighlight.activity}</span>
              </div>
              <p className="text-sm text-white mt-1">{latestHighlight.description}</p>
              <div className="flex gap-4 mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span>Equipe destaque: <strong className="text-white">{latestHighlight.topTeam}</strong></span>
                <span>Aluno(a) destaque: <strong className="text-white">{latestHighlight.topStudent}</strong></span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="container mb-6">
        <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
          {[
            { key: "teams" as const, label: "Ranking Equipes", icon: <Users size={15} /> },
            { key: "individual" as const, label: "Top 10 Individual", icon: <Award size={15} /> },
            { key: "activities" as const, label: "Atividades PF", icon: <Target size={15} /> },
            { key: "calculator" as const, label: "Calcular Média", icon: <BarChart3 size={15} /> },
            { key: "rules" as const, label: "Regras", icon: <ClipboardList size={15} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? ORANGE : "transparent",
                color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            >
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
              {rankedTeams.length >= 3 && totalPFEarned > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-8">
                  {[rankedTeams[1], rankedTeams[0], rankedTeams[2]].map((team, idx) => {
                    const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                    const isFirst = actualRank === 1;
                    return (
                      <motion.div
                        key={team.id}
                        className="rounded-lg p-3 sm:p-5 text-center"
                        style={{
                          backgroundColor: isFirst ? ORANGE + "0A" : CARD_BG,
                          border: `1px solid ${isFirst ? ORANGE + "40" : "rgba(255,255,255,0.08)"}`,
                          marginTop: isFirst ? 0 : "1.5rem",
                          boxShadow: isFirst ? `0 0 30px ${ORANGE}15` : "none",
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + idx * 0.15 }}
                      >
                        <div className="text-2xl sm:text-3xl mb-2">{team.emoji}</div>
                        <div className="text-xs font-mono font-bold mb-1" style={{ color: isFirst ? ORANGE : actualRank === 2 ? "#999" : "#8B6914" }}>#{actualRank}</div>
                        <div className="font-display font-bold text-sm sm:text-base text-white truncate">{team.name}</div>
                        <div className="font-mono font-bold text-xl sm:text-2xl mt-1" style={{ color: ORANGE }}>{getTeamPF(team).toFixed(1)}</div>
                        <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>PF total</div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Trophy size={20} style={{ color: ORANGE }} />
                Ranking Completo das Equipes
              </h2>
              <div className="grid gap-2">{rankedTeams.map((team, idx) => <TeamCard key={team.id} team={team} rank={idx + 1} />)}</div>
            </motion.div>
          )}

          {activeTab === "individual" && (
            <motion.div key="individual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Award size={20} style={{ color: ORANGE }} />
                Top 10 — Alunos com Maior PF
              </h2>
              {totalPFEarned === 0 ? (
                <motion.div
                  className="rounded-lg p-12 text-center"
                  style={{ backgroundColor: CARD_BG, border: `1px solid rgba(247,148,29,0.12)` }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Award size={48} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <h3 className="font-display font-bold text-lg text-white mb-2">Aguardando Início do Semestre</h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    O ranking individual será exibido assim que as pontuações começarem a ser registradas.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex justify-center gap-6 sm:gap-10 mb-8">
                    {topStudents.slice(0, 3).map((student, idx) => (
                      <motion.div key={student.name} className="flex flex-col items-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: idx * 0.15 }}>
                        <CircularGauge value={student.xp} max={MAX_PF_SEMESTER} color={ORANGE} size={idx === 0 ? 110 : 90} />
                        <div className="mt-2 text-center">
                          <div className="font-display font-semibold text-sm text-white truncate max-w-[100px]">{student.name}</div>
                          <div className="text-[11px] flex items-center gap-1 justify-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                            <span>{student.teamEmoji}</span><span>{student.teamName}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid rgba(247,148,29,0.12)` }}>
                    {topStudents.map((student, idx) => (
                      <motion.div
                        key={student.name}
                        className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 p-3 sm:p-4"
                        style={{ borderBottom: idx < topStudents.length - 1 ? "1px solid rgba(247,148,29,0.08)" : "none" }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <RankBadge rank={idx + 1} />
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: ORANGE + "15", border: `1px solid ${ORANGE}33` }}>{student.teamEmoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-white truncate">{student.name}</div>
                          <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{student.teamName}</div>
                        </div>
                        <div className="w-20 sm:w-32"><PFBar value={student.xp} max={MAX_PF_SEMESTER} color={ORANGE} /></div>
                        <div className="font-mono font-bold text-sm w-12 text-right" style={{ color: ORANGE }}>{student.xp.toFixed(1)}</div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === "activities" && (
            <motion.div key="activities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Target size={20} style={{ color: ORANGE }} />
                Atividades que Geram PF
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                {activities.map((act, idx) => (
                  <motion.div
                    key={act.id}
                    className="rounded-lg p-4 flex items-center gap-4"
                    style={{ backgroundColor: CARD_BG, border: `1px solid rgba(247,148,29,0.12)` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                  >
                    <div className="text-2xl">{act.icon}</div>
                    <div className="flex-1">
                      <div className="font-display font-semibold text-sm text-white">{act.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Até {act.maxXP} PF por sessão</div>
                    </div>
                    <div className="font-mono font-bold text-lg" style={{ color: ORANGE }}>+{act.maxXP}</div>
                  </motion.div>
                ))}
              </div>
              <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Activity size={20} style={{ color: ORANGE }} />
                Histórico Semanal
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px" style={{ backgroundColor: ORANGE + "25" }} />
                <div className="grid gap-4">
                  {highlights.map((highlight, idx) => (
                    <motion.div key={highlight.id} className="relative pl-10" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.08 }}>
                      <div
                        className="absolute left-2.5 top-3 w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: idx === highlights.length - 1 ? ORANGE : "rgba(255,255,255,0.1)",
                          border: `2px solid ${idx === highlights.length - 1 ? ORANGE : "rgba(255,255,255,0.15)"}`,
                        }}
                      />
                      <div className="rounded-lg p-4" style={{ backgroundColor: CARD_BG, border: `1px solid rgba(247,148,29,0.12)` }}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold" style={{ color: ORANGE }}>SEM {highlight.week}</span>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{highlight.date}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: ORANGE + "15", color: ORANGE }}>{highlight.activity}</span>
                        </div>
                        <p className="text-sm text-white">{highlight.description}</p>
                        {highlight.topTeam !== "—" && (
                          <div className="flex gap-4 mt-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
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
          {activeTab === "calculator" && (
            <motion.div key="calculator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <GradeCalculator />
            </motion.div>
          )}
          {activeTab === "rules" && (
            <motion.div key="rules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
                <ClipboardList size={20} style={{ color: ORANGE }} />
                Regras das Atividades
              </h2>
              <div className="grid gap-4">
                {[
                  {
                    title: "TBL (Team-Based Learning)",
                    icon: "🧠",
                    rules: [
                      "Prova individual (iRAT) seguida de prova em equipe (tRAT)",
                      "Pontuação individual + pontuação da equipe",
                      "Recurso com argumentação baseada em evidências",
                      "Aplicação de conceitos em casos clínicos",
                    ],
                    pf: "Até 3.0 PF por sessão",
                  },
                  {
                    title: "Seminário Jigsaw",
                    icon: "🧩",
                    rules: [
                      "Cada membro da equipe estuda um tópico específico",
                      "Formação de grupos de especialistas para discussão",
                      "Retorno à equipe original para ensinar o conteúdo",
                      "Avaliação individual e coletiva do aprendizado",
                    ],
                    pf: "Até 2.0 PF por sessão",
                  },
                  {
                    title: "Casos Clínicos",
                    icon: "🏥",
                    rules: [
                      "Análise de caso clínico real integrado com Semiologia, Patologia e Microbiologia",
                      "Discussão em equipe com identificação de fármacos e mecanismos",
                      "Apresentação da resolução para a turma",
                      "Avaliação por rubrica: raciocínio clínico + farmacologia",
                    ],
                    pf: "Até 2.5 PF por caso",
                  },
                  {
                    title: "Escape Room Farmacológico",
                    icon: "🔓",
                    rules: [
                      "Desafios em equipe com enigmas farmacológicos",
                      "Tempo limitado para resolver todos os desafios",
                      "Pontuação baseada em acertos e tempo",
                      "Bônus para equipes que completarem todos os desafios",
                    ],
                    pf: "Até 2.0 PF por sessão",
                  },
                  {
                    title: "BYOD (Bring Your Own Device)",
                    icon: "📱",
                    rules: [
                      "Atividades interativas usando dispositivos pessoais",
                      "Quiz em tempo real com plataformas digitais",
                      "Pontuação individual por acerto e velocidade",
                      "Ranking ao vivo durante a atividade",
                    ],
                    pf: "Até 1.5 PF por sessão",
                  },
                  {
                    title: "Participação em Aula",
                    icon: "✨",
                    rules: [
                      "Contribuições relevantes durante discussões",
                      "Perguntas pertinentes ao conteúdo",
                      "Colaboração ativa com colegas",
                      "Avaliada pelo professor a cada aula",
                    ],
                    pf: "Até 0.5 PF por aula",
                  },
                  {
                    title: "Provas (P1 e P2)",
                    icon: "📝",
                    rules: [
                      "P1: Conteúdo até Colinérgicos, Bloqueadores Neuromusculares e 3 primeiros Jigsaw",
                      "P2: Conteúdo restante do semestre",
                      "Questões objetivas e discursivas",
                      "Pontuação individual convertida em PF",
                    ],
                    pf: "Até 10.0 PF por prova",
                  },
                ].map((rule, idx) => (
                  <motion.div
                    key={rule.title}
                    className="rounded-lg p-5"
                    style={{ backgroundColor: CARD_BG, border: `1px solid rgba(247,148,29,0.12)` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{rule.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-base text-white">{rule.title}</h3>
                      </div>
                      <span className="font-mono font-bold text-sm px-3 py-1 rounded-full" style={{ backgroundColor: ORANGE + "15", color: ORANGE }}>{rule.pf}</span>
                    </div>
                    <ul className="space-y-1.5 ml-10">
                      {rule.rules.map((r, i) => (
                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                          <span style={{ color: ORANGE }} className="mt-1.5 shrink-0">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="mt-6 rounded-lg p-5 text-center"
                style={{ backgroundColor: ORANGE + "08", border: `1px solid ${ORANGE}20` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <strong className="text-white">PF Máximo por Aluno no Semestre:</strong> {MAX_PF_SEMESTER} PF
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  A pontuação é acumulativa. Cada atividade contribui para o total individual e da equipe.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4" style={{ borderTop: `1px solid rgba(247,148,29,0.1)`, backgroundColor: CARD_BG }}>
        <div className="container text-center">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Logo" className="w-6 h-6 object-contain" />
              <span className="text-xs text-white/60">Conexão em Farmacologia</span>
            </div>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>•</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{universityName} — {courseName} — {semester}</span>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
              <Youtube size={10} /> YouTube
            </a>
            <Link href="/admin">
              <span className="text-xs flex items-center gap-1 transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}>
                <Settings size={10} /> Admin
              </span>
            </Link>
          </div>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
            Conexão em Farmacologia • Semana {currentWeek} • Prof. Pedro Braga • Sistema de Gamificação
          </p>
        </div>
      </footer>
    </div>
  );
}
