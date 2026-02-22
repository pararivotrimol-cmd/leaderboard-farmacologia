import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Pause, Play, RotateCcw, LogOut, Zap, Sword, Target, TrendingUp,
  Map, Trophy, ArrowLeft, Clock, Shield, Star, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, MessageCircle
} from "lucide-react";
import { toast } from "sonner";

// Character images
const CHARACTER_IMAGES: Record<string, string> = {
  hank: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/Oe7dYzwqJdkuFxFz.png",
  eric: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/BxlQZJNGVgXfRqKS.png",
  diana: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/bwPTtxWJMdFJjRGy.png",
  presto: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/HdJKKcUJlYCxVdSp.png",
  sheila: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/fHkVTuSmLcECPtYo.png",
  bobby: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/kkCZvfJJCqGLqXqe.png",
  uni: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/kkCZvfJJCqGLqXqe.png",
};

const MAP_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/BxRpnDQgavBgFKVD.png";

// Quest positions on map (relative %)
const QUEST_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 12, y: 82 }, 2: { x: 22, y: 70 },
  3: { x: 15, y: 55 }, 4: { x: 28, y: 48 },
  5: { x: 40, y: 60 }, 6: { x: 50, y: 50 },
  7: { x: 35, y: 35 }, 8: { x: 48, y: 30 },
  9: { x: 60, y: 40 }, 10: { x: 55, y: 22 },
  11: { x: 70, y: 35 }, 12: { x: 65, y: 20 },
  13: { x: 78, y: 30 }, 14: { x: 75, y: 15 },
  15: { x: 85, y: 25 }, 16: { x: 88, y: 10 },
};

type GameView = "map" | "quest" | "result" | "report";

export default function GamePortal() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const classIdNum = parseInt(classId || "1");

  // State
  const [view, setView] = useState<GameView>("map");
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState<"error" | "doubt" | "suggestion">("doubt");

  // Hardcoded memberId=1 for now (will be dynamic with auth)
  const memberId = 1;

  // Queries
  const { data: progress, refetch: refetchProgress } = trpc.game.getProgress.useQuery({
    classId: classIdNum,
    memberId,
  });

  const { data: availableQuests } = trpc.game.getAvailableQuests.useQuery({
    classId: classIdNum,
  });

  const { data: completedQuestIds } = trpc.game.getCompletedQuests.useQuery({
    classId: classIdNum,
    memberId,
  });

  const { data: leaderboard } = trpc.game.getLeaderboard.useQuery({
    classId: classIdNum,
    limit: 5,
  });

  // Mutations
  const submitMutation = trpc.game.submitAnswer.useMutation();
  const initMutation = trpc.game.initializeProgress.useMutation();
  const reportMutation = trpc.game.reportError.useMutation();

  // Initialize progress if needed
  useEffect(() => {
    if (progress === null) {
      initMutation.mutate({
        classId: classIdNum,
        memberId,
      }, {
        onSuccess: () => refetchProgress(),
      });
    }
  }, [progress]);

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleTimeUp = () => {
    if (selectedQuest && !showResult) {
      handleSubmit("timeout");
    }
  };

  const handleQuestClick = (quest: any) => {
    if (completedQuestIds?.includes(quest.id)) {
      toast.info("Missão já completada! ✅");
      return;
    }
    setSelectedQuest(quest);
    setSelectedAnswer(null);
    setTimeLeft(60);
    setTimerActive(true);
    setShowResult(false);
    setResultData(null);
    setView("quest");
  };

  const handleSubmit = async (answer: string) => {
    if (!selectedQuest) return;
    setTimerActive(false);

    try {
      const result = await submitMutation.mutateAsync({
        questId: selectedQuest.id,
        classId: classIdNum,
        memberId,
        answer: answer === "timeout" ? "" : answer,
        timeSpent: 60 - timeLeft,
      });

      setResultData(result);
      setShowResult(true);
      refetchProgress();
    } catch (error) {
      toast.error("Erro ao enviar resposta");
    }
  };

  const handleReport = async () => {
    try {
      await reportMutation.mutateAsync({
        memberId,
        classId: classIdNum,
        questId: selectedQuest?.id,
        reportType,
        description: reportText,
      });
      toast.success("Relatório enviado!");
      setShowReport(false);
      setReportText("");
    } catch {
      toast.error("Erro ao enviar relatório");
    }
  };

  const completedSet = useMemo(() => new Set(completedQuestIds || []), [completedQuestIds]);

  // ═══════════════════════════════════════
  // RENDER: MAP VIEW
  // ═══════════════════════════════════════
  if (view === "map") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#111638] to-[#0a0e27] text-white">
        {/* Top HUD */}
        <div className="sticky top-0 z-50 bg-[#0a0e27]/90 backdrop-blur-md border-b border-emerald-500/20 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(`/aluno/${classIdNum}`)}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft size={18} />
              </Button>
              <div>
                <h1 className="font-bold text-lg text-emerald-400">⚔️ Caverna do Dragão</h1>
                <p className="text-xs text-gray-400">Farmacologia I</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-1.5">
                <Zap size={14} className="text-blue-400" />
                <span className="font-mono text-sm font-bold text-blue-400">{progress?.farmacologiaPoints || 0}</span>
                <span className="text-xs text-gray-400">PF</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-1.5">
                <Star size={14} className="text-purple-400" />
                <span className="font-mono text-sm font-bold text-purple-400">Nv.{progress?.level || 1}</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5">
                <Target size={14} className="text-emerald-400" />
                <span className="font-mono text-sm font-bold text-emerald-400">{progress?.questsCompleted || 0}/16</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowMenu(true)} className="text-gray-400">
                <Trophy size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="max-w-6xl mx-auto p-4">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
            <img
              src={MAP_IMAGE}
              alt="Mapa do Jogo"
              className="w-full h-full object-cover"
            />

            {/* Quest markers */}
            {(availableQuests || []).map((quest: any) => {
              const pos = QUEST_POSITIONS[quest.id] || { x: 50, y: 50 };
              const isCompleted = completedSet.has(quest.id);
              const isBoss = quest.npcType === "boss";

              return (
                <button
                  key={quest.id}
                  onClick={() => handleQuestClick(quest)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 hover:scale-125
                    ${isCompleted
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                      : isBoss
                        ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"
                        : "bg-amber-500 shadow-lg shadow-amber-500/50"
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-white" />
                    ) : isBoss ? (
                      <Shield size={20} className="text-white" />
                    ) : (
                      <span className="font-bold text-sm text-white">{quest.id}</span>
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/90 rounded-lg px-3 py-2 whitespace-nowrap text-center">
                      <p className="text-xs font-bold text-white">{quest.title}</p>
                      <p className="text-[10px] text-gray-400">{quest.npcName} • +{quest.farmacologiaPointsReward} PF</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quest list below map */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(availableQuests || []).map((quest: any) => {
              const isCompleted = completedSet.has(quest.id);
              return (
                <button
                  key={quest.id}
                  onClick={() => handleQuestClick(quest)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                    ${isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/20 opacity-70"
                      : "bg-white/5 border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5"
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${isCompleted ? "bg-emerald-500/20" : "bg-amber-500/20"}
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <Sword size={18} className="text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{quest.title}</p>
                    <p className="text-xs text-gray-400">{quest.npcName} • Nível {quest.level} • {quest.difficulty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-bold text-amber-400">+{quest.farmacologiaPointsReward} PF</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-500 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Dialog */}
        <Dialog open={showMenu} onOpenChange={setShowMenu}>
          <DialogContent className="bg-[#111638] border-emerald-500/20 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-emerald-400 flex items-center gap-2">
                <Trophy size={20} /> Ranking do Jogo
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-2">
              {(leaderboard || []).map((entry: any, idx: number) => (
                <div key={entry.memberId} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${idx === 0 ? "bg-yellow-500 text-black" : idx === 1 ? "bg-gray-400 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-gray-400"}
                  `}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.memberName}</p>
                    <p className="text-xs text-gray-400">Nível {entry.level} • {entry.questsCompleted} missões</p>
                  </div>
                  <span className="font-mono font-bold text-amber-400">{entry.farmacologiaPoints} PF</span>
                </div>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <p className="text-center text-gray-400 py-4">Nenhum jogador ainda</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: QUEST VIEW (Combat/Quiz)
  // ═══════════════════════════════════════
  if (view === "quest" && selectedQuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1040] to-[#0a0e27] text-white flex flex-col">
        {/* Quest Header */}
        <div className="bg-[#0a0e27]/90 backdrop-blur-md border-b border-purple-500/20 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setView("map")} className="text-gray-400">
              <ArrowLeft size={18} className="mr-1" /> Mapa
            </Button>
            <div className="text-center">
              <p className="text-xs text-purple-400 font-medium">Missão {selectedQuest.id}</p>
              <p className="text-sm font-bold">{selectedQuest.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Timer */}
              <div className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono font-bold text-sm
                ${timeLeft <= 10 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/10 text-white"}
              `}>
                <Clock size={14} />
                {timeLeft}s
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReport(true)}
                className="text-gray-400"
              >
                <AlertTriangle size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Quest Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            {/* NPC */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500/40 mx-auto flex items-center justify-center mb-3">
                <span className="text-3xl">
                  {selectedQuest.npcType === "boss" ? "🐉" : selectedQuest.npcType === "mage" ? "🧙" : "⚔️"}
                </span>
              </div>
              <p className="text-sm text-purple-400 font-medium">{selectedQuest.npcName}</p>
            </div>

            {/* Question */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-lg font-medium text-center leading-relaxed">{selectedQuest.description}</p>
            </div>

            {/* Alternatives */}
            {!showResult ? (
              <div className="space-y-3">
                {selectedQuest.alternatives.map((alt: any) => (
                  <button
                    key={alt.id}
                    onClick={() => {
                      setSelectedAnswer(alt.id);
                      handleSubmit(alt.id);
                    }}
                    disabled={submitMutation.isPending}
                    className={`
                      w-full p-4 rounded-xl border text-left transition-all
                      ${selectedAnswer === alt.id
                        ? "bg-amber-500/20 border-amber-500/50"
                        : "bg-white/5 border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5"
                      }
                      ${submitMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm uppercase">
                        {alt.id}
                      </span>
                      <span className="text-sm">{alt.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Result */
              <div className="space-y-4">
                <div className={`
                  p-6 rounded-2xl border text-center
                  ${resultData?.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30"
                  }
                `}>
                  {resultData?.isCorrect ? (
                    <>
                      <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-emerald-400">Correto! 🎉</h3>
                      <p className="text-sm text-gray-300 mt-2">+{resultData.pfEarned} PF • +{resultData.xpEarned} XP</p>
                    </>
                  ) : (
                    <>
                      <XCircle size={48} className="text-red-400 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-red-400">Incorreto 😔</h3>
                      <p className="text-sm text-gray-300 mt-2">
                        Resposta correta: <strong className="text-emerald-400">{resultData?.correctAnswerText}</strong>
                      </p>
                    </>
                  )}
                  {resultData?.explanation && (
                    <p className="text-sm text-gray-400 mt-3 bg-white/5 rounded-lg p-3">
                      💡 {resultData.explanation}
                    </p>
                  )}
                </div>

                {/* New achievements */}
                {resultData?.newAchievements?.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-sm font-bold text-yellow-400 mb-2">🏆 Nova Conquista!</p>
                    {resultData.newAchievements.map((ach: any) => (
                      <div key={ach.id} className="flex items-center gap-2">
                        <span className="text-xl">{ach.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{ach.title}</p>
                          <p className="text-xs text-gray-400">{ach.description} (+{ach.bonus} PF)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => {
                    setView("map");
                    setSelectedQuest(null);
                    setShowResult(false);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Map size={16} className="mr-2" /> Voltar ao Mapa
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Report Dialog */}
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogContent className="bg-[#111638] border-purple-500/20 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle size={18} /> Reportar Problema
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                {(["doubt", "error", "suggestion"] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${reportType === type ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"}
                    `}
                  >
                    {type === "doubt" ? "Dúvida" : type === "error" ? "Erro" : "Sugestão"}
                  </button>
                ))}
              </div>
              <textarea
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                placeholder="Descreva o problema ou dúvida..."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50"
              />
              <Button
                onClick={handleReport}
                disabled={!reportText.trim() || reportMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Enviar Relatório
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Carregando jogo...</p>
      </div>
    </div>
  );
}
