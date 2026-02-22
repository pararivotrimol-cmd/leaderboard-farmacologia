import { useState, useMemo } from 'react';
import { Trophy, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const ORANGE = "#F7941D";
const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #F7941D, #FFD700)" }}>🥇</div>;
  if (rank === 2) return <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #999, #ccc)" }}>🥈</div>;
  if (rank === 3) return <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #8B6914, #B8860B)" }}>🥉</div>;
  return <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm text-white" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>{rank}</div>;
}

export default function StudentRanking() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');

  const { data: classesData } = trpc.classes.list.useQuery(
    { sessionToken: String(user?.id || '') },
    { enabled: !!user?.id }
  );

  const { data: leaderboardData } = trpc.leaderboard.getDataByClass.useQuery(
    { classId: parseInt(selectedClass) || 0 },
    { enabled: !!selectedClass }
  );

  const classes = classesData || [];
  const teams = useMemo(() => {
    if (!leaderboardData?.teams) return [];
    return [...leaderboardData.teams].sort((a, b) => {
      const totalA = a.members.reduce((sum, m) => sum + (m.xp || 0), 0);
      const totalB = b.members.reduce((sum, m) => sum + (m.xp || 0), 0);
      return totalB - totalA;
    });
  }, [leaderboardData?.teams]);

  if (!selectedClass && classes.length > 0) {
    setSelectedClass(String(classes[0]?.id || ''));
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: DARK_BG }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={28} style={{ color: ORANGE }} />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Ranking de Equipes</h1>
          </div>
          <p className="text-gray-400">Acompanhe a pontuação das equipes em tempo real</p>
        </div>

        {/* Class Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Selecione a Turma</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${ORANGE}33` }}
          >
          {classes.map((cls: any) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {/* Ranking List */}
        <div className="space-y-3">
          {teams.map((team, idx) => {
            const totalPF = team.members.reduce((sum, m) => sum + (m.xp || 0), 0);
            const avgPF = team.members.length > 0 ? totalPF / team.members.length : 0;
            return (
              <Card
                key={team.id}
                className="p-4 sm:p-6 flex items-center gap-4"
                style={{
                  backgroundColor: CARD_BG,
                  border: `1px solid ${ORANGE}${idx === 0 ? '44' : '22'}`,
                }}
              >
                <RankBadge rank={idx + 1} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{team.emoji}</span>
                    <h3 className="font-bold text-white text-lg">{team.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{team.members.length} membros</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-xl" style={{ color: ORANGE }}>{totalPF.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">PF Total</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="font-mono font-semibold text-lg text-white">{avgPF.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">Média</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
