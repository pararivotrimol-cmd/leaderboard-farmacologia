import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { GameScene } from "@/components/GameScene";
import { CombatInterface } from "@/components/CombatInterface";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Pause, Play, RotateCcw, LogOut, Zap, Sword, Target, TrendingUp } from "lucide-react";

interface GameState {
  level: number;
  farmacologiaPoints: number;
  questsCompleted: number;
  questsTotal: number;
  currentQuestId?: number;
  isCompleted: boolean;
}

export default function GamePortal() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentCombatQuestion, setCurrentCombatQuestion] = useState<any>(null);
  const [showCombat, setShowCombat] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const classIdNum = parseInt(classId || "0");

  // Buscar progresso do jogo
  const { data: progress, isLoading: progressLoading } = trpc.game.getProgress.useQuery({
    classId: classIdNum,
  });

  // Buscar quests disponíveis
  const { data: quests } = trpc.game.getQuestsByLevel.useQuery(
    {
      classId: classIdNum,
      level: gameState?.level || 1,
    },
    { enabled: !!gameState }
  );

  // Mutations
  const submitAnswerMutation = trpc.game.submitAnswer.useMutation();
  const levelUpMutation = trpc.game.levelUp.useMutation();
  const completeGameMutation = trpc.game.completeGame.useMutation();

  // Atualizar game state quando progresso carregar
  useEffect(() => {
    if (progress) {
      setGameState({
        level: progress.level,
        farmacologiaPoints: progress.farmacologiaPoints,
        questsCompleted: progress.questsCompleted,
        questsTotal: progress.questsTotal,
        currentQuestId: progress.currentQuestId || undefined,
        isCompleted: progress.isCompleted,
      });
    }
  }, [progress]);

  // Iniciar combate com primeira quest disponível
  const handleStartCombat = () => {
    if (quests && quests.length > 0) {
      const quest = quests[0];
      // Simular questão para combate
      setCurrentCombatQuestion({
        id: quest.id,
        text: `Desafio: ${quest.title}`,
        alternatives: [
          { id: "a", text: "Alternativa A" },
          { id: "b", text: "Alternativa B" },
          { id: "c", text: "Alternativa C" },
          { id: "d", text: "Alternativa D" },
          { id: "e", text: "Alternativa E" },
        ],
        correctAnswerId: "a",
        npcName: quest.npcName,
        npcType: quest.npcType,
      });
      setShowCombat(true);
    }
  };

  // Submeter resposta
  const handleSubmitAnswer = async (answerId: string) => {
    if (!currentCombatQuestion || !gameState) return;

    setIsSubmittingAnswer(true);
    try {
      const result = await submitAnswerMutation.mutateAsync({
        questId: currentCombatQuestion.id,
        classId: classIdNum,
        questionId: currentCombatQuestion.id,
        answer: answerId,
        timeSpent: 30,
      });

      // Atualizar estado local
      setGameState((prev) =>
        prev
          ? {
              ...prev,
              farmacologiaPoints: prev.farmacologiaPoints + result.farmacologiaPointsEarned,
              questsCompleted: result.isCorrect ? prev.questsCompleted + 1 : prev.questsCompleted,
            }
          : null
      );

      // Fechar combate
      setTimeout(() => {
        setShowCombat(false);
        setCurrentCombatQuestion(null);
      }, 2000);
    } catch (error) {
      console.error("Erro ao submeter resposta:", error);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Completar jogo
  const handleCompleteGame = async () => {
    try {
      await completeGameMutation.mutateAsync({ classId: classIdNum });
      setGameState((prev) => (prev ? { ...prev, isCompleted: true } : null));
    } catch (error) {
      console.error("Erro ao completar jogo:", error);
    }
  };

  if (progressLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando jogo...</p>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Erro ao carregar progresso do jogo</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Cena 3D */}
      <div className="w-full h-full">
        <GameScene />
      </div>

      {/* HUD - Cabeçalho */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 text-white">
        <div className="flex justify-between items-start">
          {/* Info do Jogo */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Caverna do Dragão</h1>
            <p className="text-sm text-gray-300">Farmacologia I - Nível {gameState.level}</p>
          </div>

          {/* Botões de Controle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPaused(!isPaused)}
              className="gap-2"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? "Retomar" : "Pausar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMenu(true)}
              className="gap-2"
            >
              Menu
            </Button>
          </div>
        </div>
      </div>

      {/* HUD - Stats */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="grid grid-cols-4 gap-4 max-w-md">
          {/* PF */}
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-blue-400" />
              <span className="text-xs text-gray-300">PF</span>
            </div>
            <p className="text-xl font-bold text-blue-400">{gameState.farmacologiaPoints}</p>
          </div>

          {/* Level */}
          <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-purple-400" />
              <span className="text-xs text-gray-300">Level</span>
            </div>
            <p className="text-xl font-bold text-purple-400">{gameState.level}/10</p>
          </div>

          {/* Quests */}
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-green-400" />
              <span className="text-xs text-gray-300">Quests</span>
            </div>
            <p className="text-xl font-bold text-green-400">
              {gameState.questsCompleted}/{gameState.questsTotal}
            </p>
          </div>

          {/* Botão de Combate */}
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-center justify-center">
            <Button
              size="sm"
              onClick={handleStartCombat}
              className="w-full gap-2 bg-red-600 hover:bg-red-700"
            >
              <Sword size={16} />
              Combater
            </Button>
          </div>
        </div>
      </div>

      {/* Interface de Combate */}
      <CombatInterface
        isOpen={showCombat}
        question={currentCombatQuestion}
        timePerQuestion={30}
        onAnswer={handleSubmitAnswer}
        onClose={() => setShowCombat(false)}
        isLoading={isSubmittingAnswer}
      />

      {/* Menu Pausa */}
      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Nível:</span> {gameState.level}/10
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">PF:</span> {gameState.farmacologiaPoints}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Quests:</span> {gameState.questsCompleted}/
                {gameState.questsTotal}
              </p>
            </div>

            {/* Progresso */}
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Progresso</p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(gameState.questsCompleted / gameState.questsTotal) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {gameState.questsCompleted} de {gameState.questsTotal} quests completas
              </p>
            </div>

            {/* Botões */}
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowMenu(false);
                  setIsPaused(false);
                }}
                className="w-full"
              >
                <Play size={16} className="mr-2" />
                Continuar
              </Button>

              {gameState.level >= 10 && !gameState.isCompleted && (
                <Button
                  onClick={handleCompleteGame}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp size={16} className="mr-2" />
                  Completar Farmacologia I
                </Button>
              )}

              <Button variant="outline" onClick={() => setShowMenu(false)} className="w-full">
                <RotateCcw size={16} className="mr-2" />
                Reiniciar
              </Button>

              <Button variant="destructive" className="w-full">
                <LogOut size={16} className="mr-2" />
                Sair do Jogo
              </Button>
            </div>

            {/* Status Final */}
            {gameState.isCompleted && (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
                <p className="font-bold text-green-400">🎉 Parabéns!</p>
                <p className="text-sm text-green-300 mt-1">
                  Você completou Farmacologia I com sucesso!
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Overlay de Pausa */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-3xl font-bold mb-4">⏸️ Pausado</p>
            <Button onClick={() => setIsPaused(false)} size="lg" className="gap-2">
              <Play size={20} />
              Retomar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
