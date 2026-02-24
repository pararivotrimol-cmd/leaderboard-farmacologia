import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import StudentNavBar from "@/components/StudentNavBar";
import { ArrowLeft, AlertCircle, Lock } from "lucide-react";
import { Link } from "wouter";

const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";
const ORANGE = "#F7941D";

export default function StudentArea() {
  const [, params] = useRoute("/aluno/:classId");
  const classId = params?.classId ? Number(params.classId) : null;
  const [activeTab, setActiveTab] = useState("leaderboard");
  
  const { user } = useAuth();
  const { data: classData } = trpc.classes.getById.useQuery(
    { classId: classId || 0, sessionToken: "" },
    { enabled: !!classId }
  );

  // Buscar dados filtrados por turma
  const { data: leaderboardData } = trpc.leaderboard.getDataByClass.useQuery(
    { classId: classId || 0 },
    { enabled: !!classId }
  );

  // Buscar materiais da turma
  const { data: materialsData } = trpc.materials.getByClass.useQuery(
    { classId: classId || 0 },
    { enabled: !!classId }
  );

  // Buscar avisos da turma
  const { data: announcementsData } = trpc.notifications.getByClass.useQuery(
    { classId: classId || 0 },
    { enabled: !!classId }
  );

  // Buscar conquistas da turma
  const { data: badgesData } = trpc.badges.getByClass.useQuery(
    { classId: classId || 0 },
    { enabled: !!classId }
  );

  // Verificar se aluno está matriculado na turma
  const isEnrolled = user && classData && classData.members?.some((m: any) => m.id === user.id);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: ORANGE }} />
          <h1 className="text-2xl font-bold text-white mb-2">Faça Login</h1>
          <p className="text-white/60 mb-6">Você precisa estar autenticado para acessar a área do aluno.</p>
          <Link href="/login-aluno">
            <button
              className="px-6 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: ORANGE }}
            >
              Fazer Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!classId || !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: ORANGE }} />
          <h1 className="text-2xl font-bold text-white mb-2">Turma não encontrada</h1>
          <p className="text-white/60 mb-6">A turma solicitada não existe.</p>
          <Link href="/leaderboard">
            <button
              className="px-6 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: ORANGE }}
            >
              Voltar ao Leaderboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <div className="text-center max-w-md">
          <Lock size={48} className="mx-auto mb-4" style={{ color: ORANGE }} />
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-white/60 mb-6">
            Você não está matriculado na turma <strong>{classData.name}</strong>. Apenas alunos matriculados podem acessar esta área.
          </p>
          <Link href="/leaderboard">
            <button
              className="px-6 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: ORANGE }}
            >
              Voltar ao Leaderboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Header com breadcrumb */}
      <div
        className="border-b"
        style={{
          backgroundColor: CARD_BG,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div className="container mx-auto px-4 2xl:px-8 py-4 2xl:py-6">
          <div className="flex items-center gap-3">
            <Link href="/leaderboard">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-white/60" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl 2xl:text-2xl font-bold text-white">Área da Turma</h1>
              <p className="text-sm text-white/60">{classData.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Navigation */}
      <StudentNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedClassId={classId}
        showClassSelector={false}
      />

      {/* Content */}
      <div className="container mx-auto px-4 2xl:px-8 py-8 2xl:py-12">
        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && leaderboardData && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Ranking da Turma</h2>
            <div className="space-y-4">
              {leaderboardData.teams.map((team: any, idx: number) => (
                <div
                  key={team.id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: CARD_BG,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold" style={{ color: ORANGE }}>#{idx + 1}</span>
                      <div>
                        <h3 className="font-bold text-white">{team.name}</h3>
                        <p className="text-sm text-white/60">{team.members.length} membros</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{team.members.reduce((sum: number, m: any) => sum + parseFloat(m.xp), 0).toFixed(1)} PF</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === "materials" && materialsData && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Materiais da Turma</h2>
            {materialsData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materialsData.map((material: any) => (
                  <div
                    key={material.id}
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: CARD_BG,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <h3 className="font-bold text-white mb-2">{material.title}</h3>
                    <p className="text-sm text-white/60 mb-3">{material.description}</p>
                    {material.fileUrl && (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
                        style={{ backgroundColor: ORANGE }}
                      >
                        Baixar Arquivo
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">Nenhum material disponível para esta turma.</p>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "avisos" && announcementsData && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Avisos da Turma</h2>
            {announcementsData.length > 0 ? (
              <div className="space-y-4">
                {announcementsData.map((announcement: any) => (
                  <div
                    key={announcement.id}
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: CARD_BG,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <h3 className="font-bold text-white mb-2">{announcement.title}</h3>
                    <p className="text-white/80 mb-2">{announcement.content}</p>
                    <p className="text-xs text-white/40">
                      {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">Nenhum aviso para esta turma.</p>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === "conquistas" && badgesData && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Conquistas da Turma</h2>
            {badgesData.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badgesData.map((badge: any) => (
                  <div
                    key={badge.id}
                    className="rounded-lg p-4 text-center"
                    style={{
                      backgroundColor: CARD_BG,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {badge.imageUrl && (
                      <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        className="w-16 h-16 mx-auto mb-2 rounded-lg"
                      />
                    )}
                    <h3 className="font-bold text-white text-sm">{badge.name}</h3>
                    <p className="text-xs text-white/60 mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">Nenhuma conquista disponível ainda.</p>
            )}
          </div>
        )}

        {/* Other Tabs */}
        {["individual", "activities", "game", "calculator", "rules"].includes(activeTab) && (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              backgroundColor: CARD_BG,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              {activeTab === "individual" && "Top 10 Individual"}
              {activeTab === "activities" && "Atividades PF"}
              {activeTab === "game" && "Jogo Caverna do Dragão"}
              {activeTab === "calculator" && "Calculadora de Média"}
              {activeTab === "rules" && "Regras da Disciplina"}
            </h2>
            <p className="text-white/60">
              Conteúdo da aba "{activeTab}" será renderizado aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
