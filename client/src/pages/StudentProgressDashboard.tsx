import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { GAME_MISSIONS } from "@shared/gameMissions";

export default function StudentProgressDashboard() {
  const [, setLocation] = useLocation();
  
  // TODO: Get actual user data from auth context
  const classId = 1;
  
  // Fetch game progress
  const { data: progress, isLoading } = trpc.game.getProgress.useQuery({ classId });
  
  // Fetch transaction history (would need to create this query)
  // const { data: transactions } = trpc.game.getTransactions.useQuery({ classId });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando progresso...</div>
      </div>
    );
  }

  const completedMissions = progress?.questsCompleted || 0;
  const totalMissions = GAME_MISSIONS.length;
  const pfTotal = progress?.farmacologiaPoints || 0;
  const level = progress?.level || 1;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Meu Progresso</h1>
            <p className="text-purple-300">Acompanhe sua jornada em Farmacologia</p>
          </div>
          <Button
            onClick={() => setLocation("/game/hub")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Voltar ao Jogo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-none p-6">
            <div className="text-white/80 text-sm mb-2">Nível</div>
            <div className="text-4xl font-bold text-white">{level}</div>
            <div className="text-white/60 text-xs mt-1">de 10</div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-none p-6">
            <div className="text-white/80 text-sm mb-2">PF Total</div>
            <div className="text-4xl font-bold text-white">{pfTotal}</div>
            <div className="text-white/60 text-xs mt-1">Pontos de Farmacologia</div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-none p-6">
            <div className="text-white/80 text-sm mb-2">Missões</div>
            <div className="text-4xl font-bold text-white">{completedMissions}</div>
            <div className="text-white/60 text-xs mt-1">de {totalMissions} completadas</div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-orange-600 border-none p-6">
            <div className="text-white/80 text-sm mb-2">Progresso</div>
            <div className="text-4xl font-bold text-white">
              {Math.round((completedMissions / totalMissions) * 100)}%
            </div>
            <div className="text-white/60 text-xs mt-1">do curso</div>
          </Card>
        </div>

        {/* Missions Progress */}
        <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Missões por Semana</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {GAME_MISSIONS.map((mission) => {
              const isCompleted = completedMissions >= mission.id;
              return (
                <div
                  key={mission.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? "bg-green-600/20 border-green-400"
                      : "bg-white/5 border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-purple-900/50 text-purple-300"
                      }`}
                    >
                      {isCompleted ? "✓" : mission.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">
                        {mission.title}
                      </div>
                      <div className="text-purple-300 text-xs">Semana {mission.weekNumber}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Histórico de Atividades</h2>
          <div className="text-purple-300 text-center py-8">
            Funcionalidade em desenvolvimento
            <br />
            <span className="text-sm text-purple-400">
              Em breve você poderá ver todas as suas transações de PF
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
