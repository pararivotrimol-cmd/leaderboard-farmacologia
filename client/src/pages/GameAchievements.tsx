/**
 * GameAchievements — RPG Game Achievements page
 * Shows all game badges with unlock animations and progress tracking
 * Dark fantasy theme matching the game portal
 */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, ArrowLeft, Star, Shield, Zap, Flame, Crown,
  Target, Sword, ChevronRight, Sparkles, Lock, CheckCircle2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Achievement categories for filtering
const CATEGORIES = [
  { id: "all", label: "Todas", icon: "🏆" },
  { id: "quests", label: "Missões", icon: "⚔️" },
  { id: "mastery", label: "Maestria", icon: "🧪" },
  { id: "pf", label: "Pontos", icon: "💎" },
  { id: "streak", label: "Combos", icon: "🔥" },
  { id: "boss", label: "Bosses", icon: "🐉" },
  { id: "speed", label: "Velocidade", icon: "⚡" },
];

// Map achievement IDs to categories
function getCategory(id: string): string {
  if (["first_quest", "five_quests", "ten_quests", "all_quests"].includes(id)) return "quests";
  if (["farmacocinetica", "farmacodinamica", "sna_master"].includes(id)) return "mastery";
  if (["pf_100", "pf_500", "pf_1000"].includes(id)) return "pf";
  if (["perfect_streak_3", "perfect_streak_5"].includes(id)) return "streak";
  if (["boss_slayer"].includes(id)) return "boss";
  if (["speed_demon"].includes(id)) return "speed";
  return "quests";
}

// Rarity based on bonus value
function getRarity(bonus: number): { label: string; color: string; glow: string; border: string } {
  if (bonus >= 100) return { label: "Lendário", color: "#FFD700", glow: "shadow-[0_0_20px_rgba(255,215,0,0.4)]", border: "border-yellow-500/50" };
  if (bonus >= 50) return { label: "Épico", color: "#A855F7", glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]", border: "border-purple-500/50" };
  if (bonus >= 25) return { label: "Raro", color: "#3B82F6", glow: "shadow-[0_0_12px_rgba(59,130,246,0.3)]", border: "border-blue-500/50" };
  if (bonus >= 15) return { label: "Incomum", color: "#22C55E", glow: "shadow-[0_0_10px_rgba(34,197,94,0.2)]", border: "border-green-500/50" };
  return { label: "Comum", color: "#9CA3AF", glow: "", border: "border-white/10" };
}

// Progress calculation for each achievement
function getProgress(id: string, progress: any): { current: number; target: number; pct: number } {
  if (!progress) return { current: 0, target: 1, pct: 0 };
  const qc = progress.questsCompleted || 0;
  const pf = progress.totalPf || 0;
  const ws = progress.winStreak || 0;

  switch (id) {
    case "first_quest": return { current: Math.min(qc, 1), target: 1, pct: Math.min(qc / 1 * 100, 100) };
    case "five_quests": return { current: Math.min(qc, 5), target: 5, pct: Math.min(qc / 5 * 100, 100) };
    case "ten_quests": return { current: Math.min(qc, 10), target: 10, pct: Math.min(qc / 10 * 100, 100) };
    case "all_quests": return { current: Math.min(qc, 16), target: 16, pct: Math.min(qc / 16 * 100, 100) };
    case "perfect_streak_3": return { current: Math.min(ws, 3), target: 3, pct: Math.min(ws / 3 * 100, 100) };
    case "perfect_streak_5": return { current: Math.min(ws, 5), target: 5, pct: Math.min(ws / 5 * 100, 100) };
    case "pf_100": return { current: Math.min(pf, 100), target: 100, pct: Math.min(pf / 100 * 100, 100) };
    case "pf_500": return { current: Math.min(pf, 500), target: 500, pct: Math.min(pf / 500 * 100, 100) };
    case "pf_1000": return { current: Math.min(pf, 1000), target: 1000, pct: Math.min(pf / 1000 * 100, 100) };
    default: return { current: 0, target: 1, pct: 0 };
  }
}

export default function GameAchievements() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);

  const memberId = 1; // Will be dynamic with auth
  const classIdNum = 1;

  // Queries
  const { data: allAchievements } = trpc.game.getAchievements.useQuery();
  const { data: progress } = trpc.game.getProgress.useQuery({
    classId: classIdNum,
    memberId,
  });

  // Parse player's earned achievements
  const earnedIds = useMemo(() => {
    if (!progress?.achievements) return [];
    try {
      return JSON.parse(progress.achievements) as string[];
    } catch {
      return [];
    }
  }, [progress]);

  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    if (!allAchievements) return [];
    if (activeCategory === "all") return allAchievements;
    return allAchievements.filter(a => getCategory(a.id) === activeCategory);
  }, [allAchievements, activeCategory]);

  // Stats
  const totalAchievements = allAchievements?.length || 0;
  const unlockedCount = earnedIds.length;
  const totalBonusPf = useMemo(() => {
    if (!allAchievements) return 0;
    return allAchievements
      .filter(a => earnedIds.includes(a.id))
      .reduce((sum, a) => sum + a.bonus, 0);
  }, [allAchievements, earnedIds]);
  const completionPct = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  // Trigger unlock animation for newly earned achievements
  const handleAchievementClick = (id: string) => {
    if (earnedIds.includes(id)) {
      setShowUnlockAnimation(id);
      setTimeout(() => setShowUnlockAnimation(null), 2000);
    }
    setSelectedAchievement(selectedAchievement === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1040] to-[#0a0e27] text-white">
      {/* Header */}
      <div className="bg-[#0a0e27]/90 backdrop-blur-md border-b border-purple-500/20 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/jogo/1">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft size={18} className="mr-1" /> Voltar ao Jogo
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            <span className="font-bold text-lg">Conquistas</span>
          </div>
          <div className="text-sm font-mono text-amber-400">
            {unlockedCount}/{totalAchievements}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Overall Progress Card */}
        <motion.div
          className="bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-purple-900/30 border border-purple-500/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            {/* Circular Progress */}
            <div className="relative w-28 h-28 shrink-0">
              <svg width="112" height="112" className="-rotate-90">
                <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                  cx="56" cy="56" r="48"
                  fill="none" stroke="#A855F7" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 48}
                  initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - completionPct / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-2xl text-purple-300">{completionPct}%</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <h2 className="text-xl font-bold">Progresso Geral</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-mono font-bold text-amber-400">{unlockedCount}</div>
                  <div className="text-[11px] text-gray-400">Desbloqueadas</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-mono font-bold text-purple-400">{totalAchievements - unlockedCount}</div>
                  <div className="text-[11px] text-gray-400">Restantes</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-mono font-bold text-emerald-400">+{totalBonusPf}</div>
                  <div className="text-[11px] text-gray-400">PF Bônus</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${activeCategory === cat.id
                  ? "bg-purple-500/30 border border-purple-500/50 text-purple-300"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:border-purple-500/30"
                }
              `}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((ach, idx) => {
              const isUnlocked = earnedIds.includes(ach.id);
              const rarity = getRarity(ach.bonus);
              const prog = getProgress(ach.id, progress);
              const isSelected = selectedAchievement === ach.id;
              const isAnimating = showUnlockAnimation === ach.id;

              return (
                <motion.div
                  key={ach.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => handleAchievementClick(ach.id)}
                  className={`
                    relative cursor-pointer rounded-xl border overflow-hidden transition-all
                    ${isUnlocked
                      ? `${rarity.border} ${rarity.glow} bg-white/5`
                      : "border-white/5 bg-white/[0.02] opacity-60"
                    }
                    ${isSelected ? "ring-2 ring-purple-500/50" : ""}
                  `}
                >
                  {/* Unlock animation overlay */}
                  {isAnimating && (
                    <motion.div
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="text-center"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 0.6, repeat: 2 }}
                          className="text-5xl mb-2"
                        >
                          {ach.icon}
                        </motion.div>
                        <Sparkles size={24} className="text-amber-400 mx-auto" />
                        <p className="text-sm font-bold text-amber-400 mt-1">Desbloqueada!</p>
                      </motion.div>
                    </motion.div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0
                        ${isUnlocked
                          ? "bg-gradient-to-br from-white/10 to-white/5"
                          : "bg-white/5"
                        }
                      `}
                        style={isUnlocked ? { borderColor: rarity.color + "44", borderWidth: 2 } : {}}
                      >
                        {isUnlocked ? (
                          <span>{ach.icon}</span>
                        ) : (
                          <Lock size={24} className="text-gray-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${isUnlocked ? "text-white" : "text-gray-500"}`}>
                            {ach.title}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium"
                            style={{
                              backgroundColor: rarity.color + "15",
                              color: rarity.color,
                            }}
                          >
                            {rarity.label}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isUnlocked ? "text-gray-400" : "text-gray-600"}`}>
                          {ach.description}
                        </p>

                        {/* Progress bar */}
                        {!isUnlocked && (
                          <div className="mt-2">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                              <span>{prog.current}/{prog.target}</span>
                              <span>{Math.round(prog.pct)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: rarity.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${prog.pct}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Bonus PF */}
                        <div className="flex items-center gap-1 mt-2">
                          {isUnlocked ? (
                            <CheckCircle2 size={12} className="text-emerald-400" />
                          ) : (
                            <Zap size={12} className="text-gray-600" />
                          )}
                          <span className={`text-xs font-mono ${isUnlocked ? "text-emerald-400" : "text-gray-600"}`}>
                            +{ach.bonus} PF
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-white/5">
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Target size={12} />
                              <span>Condição: {ach.condition.replace(/_/g, " ")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Star size={12} />
                              <span>Categoria: {CATEGORIES.find(c => c.id === getCategory(ach.id))?.label || "Geral"}</span>
                            </div>
                            {isUnlocked && (
                              <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <CheckCircle2 size={12} />
                                <span>Conquista desbloqueada!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Lock size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma conquista nesta categoria</p>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
