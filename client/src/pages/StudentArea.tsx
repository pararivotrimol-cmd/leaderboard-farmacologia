import { useState, useMemo } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import StudentNavBar from "@/components/StudentNavBar";
import StudentNotificationBanner from "@/components/StudentNotificationBanner";
import { useStudentAuth } from "@/pages/StudentLogin";
import {
  ArrowLeft, AlertCircle, Lock, Calendar, QrCode,
  BarChart3, BookOpen, Gamepad2, Target, Users,
  Download, Clock, CheckCircle, XCircle, FileText
} from "lucide-react";

const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";
const ORANGE = "#F7941D";

export default function StudentArea() {
  const [, params] = useRoute("/aluno/:classId");
  const classId = params?.classId ? Number(params.classId) : null;
  const [activeTab, setActiveTab] = useState("cronograma");
  const [, setLocation] = useLocation();

  const { user } = useAuth();
  const { student: studentData } = useStudentAuth();
  const memberId = studentData?.memberId || null;

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

  // Buscar equipes jigsaw da turma
  const { data: jigsawGroups } = trpc.jigsawGroups.getByClass.useQuery(
    { classId: classId || 0 },
    { enabled: !!classId }
  );

  // Verificar se aluno está matriculado na turma
  const isEnrolled = user && classData && classData.members?.some((m: any) => m.id === user.id);

  // Cronograma das semanas (dados estáticos baseados no plano de ensino)
  const cronograma = useMemo(() => [
    { semana: 1, data: "10/03", tema: "Apresentação da disciplina e Introdução à Farmacologia", tipo: "Aula Teórica" },
    { semana: 2, data: "17/03", tema: "Farmacocinética I - Absorção e Distribuição", tipo: "Aula Teórica" },
    { semana: 3, data: "24/03", tema: "Farmacocinética II - Metabolismo e Excreção", tipo: "Aula Teórica" },
    { semana: 4, data: "31/03", tema: "Farmacodinâmica I - Receptores e Mecanismos", tipo: "Aula Teórica" },
    { semana: 5, data: "07/04", tema: "Farmacodinâmica II - Relação Dose-Resposta", tipo: "Aula Teórica" },
    { semana: 6, data: "14/04", tema: "Sistema Nervoso Autônomo - Simpático", tipo: "Aula Teórica" },
    { semana: 7, data: "28/04", tema: "Sistema Nervoso Autônomo - Parassimpático", tipo: "Aula Teórica" },
    { semana: 8, data: "05/05", tema: "Avaliação 1 (AV1)", tipo: "Avaliação" },
    { semana: 9, data: "12/05", tema: "Seminário Jigsaw - Grupo 1 e 2", tipo: "Seminário" },
    { semana: 10, data: "19/05", tema: "Seminário Jigsaw - Grupo 3 e 4", tipo: "Seminário" },
    { semana: 11, data: "26/05", tema: "Seminário Jigsaw - Grupo 5 e 6", tipo: "Seminário" },
    { semana: 12, data: "02/06", tema: "Farmacologia do Trato Gastrointestinal", tipo: "Aula Teórica" },
    { semana: 13, data: "09/06", tema: "Anti-inflamatórios e Analgésicos", tipo: "Aula Teórica" },
    { semana: 14, data: "16/06", tema: "Antibióticos e Antimicrobianos", tipo: "Aula Teórica" },
    { semana: 15, data: "23/06", tema: "Avaliação 2 (AV2)", tipo: "Avaliação" },
    { semana: 16, data: "30/06", tema: "Avaliação Final (AV3) / Recuperação", tipo: "Avaliação" },
  ], []);

  // Cálculo de média
  const [av1, setAv1] = useState("");
  const [av2, setAv2] = useState("");
  const [pf, setPf] = useState("");

  const mediaFinal = useMemo(() => {
    const a1 = parseFloat(av1) || 0;
    const a2 = parseFloat(av2) || 0;
    const pfVal = parseFloat(pf) || 0;
    // Fórmula: (AV1 * 0.3 + AV2 * 0.3 + PF * 0.4)
    if (!av1 && !av2 && !pf) return null;
    return (a1 * 0.3 + a2 * 0.3 + pfVal * 0.4);
  }, [av1, av2, pf]);

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
        <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-3 sm:py-4 2xl:py-6">
          <div className="flex items-center gap-3">
            <Link href="/leaderboard">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-white/60" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl 2xl:text-2xl font-bold text-white">Portal do Aluno</h1>
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
        memberId={memberId}
      />

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-4 sm:py-8 2xl:py-12">

        {/* Notification Banner */}
        {memberId && (
          <StudentNotificationBanner memberId={memberId} classId={classId || undefined} />
        )}

        {/* ═══ CRONOGRAMA ═══ */}
        {activeTab === "cronograma" && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Calendar size={20} className="sm:hidden" style={{ color: ORANGE }} />
              <Calendar size={24} className="hidden sm:block" style={{ color: ORANGE }} />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Cronograma da Disciplina</h2>
            </div>
            <div className="space-y-2">
              {cronograma.map((item) => (
                <div
                  key={item.semana}
                  className="rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                  style={{
                    backgroundColor: CARD_BG,
                    border: item.tipo === "Avaliação"
                      ? `1px solid ${ORANGE}50`
                      : item.tipo === "Seminário"
                        ? "1px solid rgba(16,185,129,0.3)"
                        : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: item.tipo === "Avaliação"
                        ? `${ORANGE}20`
                        : item.tipo === "Seminário"
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <span className="text-sm font-bold" style={{
                      color: item.tipo === "Avaliação" ? ORANGE : item.tipo === "Seminário" ? "#10B981" : "rgba(255,255,255,0.6)"
                    }}>
                      S{item.semana}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm">{item.tema}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{item.data}/2026</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: item.tipo === "Avaliação"
                            ? `${ORANGE}20`
                            : item.tipo === "Seminário"
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(255,255,255,0.05)",
                          color: item.tipo === "Avaliação" ? ORANGE : item.tipo === "Seminário" ? "#10B981" : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {item.tipo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PRESENÇA ═══ */}
        {activeTab === "presenca" && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <QrCode size={20} className="sm:hidden" style={{ color: ORANGE }} />
              <QrCode size={24} className="hidden sm:block" style={{ color: ORANGE }} />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Presença</h2>
            </div>
            <div
              className="rounded-lg p-5 sm:p-8 text-center"
              style={{
                backgroundColor: CARD_BG,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <QrCode size={48} className="sm:hidden mx-auto mb-4" style={{ color: ORANGE }} />
              <QrCode size={64} className="hidden sm:block mx-auto mb-4" style={{ color: ORANGE }} />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Registrar Presença via QR Code</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Escaneie o QR Code projetado pelo professor para registrar sua presença na aula.
              </p>
              <button
                onClick={() => setLocation("/attendance/check-in")}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-white text-base sm:text-lg transition-all hover:scale-105"
                style={{ backgroundColor: ORANGE }}
              >
                Escanear QR Code
              </button>
            </div>
          </div>
        )}

        {/* ═══ CÁLCULO DA MÉDIA ═══ */}
        {activeTab === "media" && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <BarChart3 size={20} className="sm:hidden" style={{ color: ORANGE }} />
              <BarChart3 size={24} className="hidden sm:block" style={{ color: ORANGE }} />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Cálculo da Média</h2>
            </div>
            <div
              className="rounded-lg p-4 sm:p-6 max-w-lg"
              style={{
                backgroundColor: CARD_BG,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <p className="text-white/60 text-sm mb-6">
                Fórmula: <strong className="text-white">Média = AV1 × 0.3 + AV2 × 0.3 + PF × 0.4</strong>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">AV1 (Nota da Prova 1)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={av1}
                    onChange={(e) => setAv1(e.target.value)}
                    placeholder="0.0 - 10.0"
                    className="w-full px-4 py-2.5 rounded-lg text-white"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">AV2 (Nota da Prova 2)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={av2}
                    onChange={(e) => setAv2(e.target.value)}
                    placeholder="0.0 - 10.0"
                    className="w-full px-4 py-2.5 rounded-lg text-white"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">PF (Pontuação Farmacológica)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={pf}
                    onChange={(e) => setPf(e.target.value)}
                    placeholder="0.0 - 10.0"
                    className="w-full px-4 py-2.5 rounded-lg text-white"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  />
                </div>
              </div>

              {mediaFinal !== null && (
                <div className="mt-6 p-4 rounded-lg text-center" style={{
                  backgroundColor: mediaFinal >= 7 ? "rgba(16,185,129,0.15)" : mediaFinal >= 5 ? `${ORANGE}20` : "rgba(255,80,80,0.15)",
                  border: `1px solid ${mediaFinal >= 7 ? "rgba(16,185,129,0.3)" : mediaFinal >= 5 ? `${ORANGE}50` : "rgba(255,80,80,0.3)"}`,
                }}>
                  <p className="text-sm text-white/60 mb-1">Média Final Estimada</p>
                  <p className="text-4xl font-bold" style={{
                    color: mediaFinal >= 7 ? "#10B981" : mediaFinal >= 5 ? ORANGE : "#FF6B6B"
                  }}>
                    {mediaFinal.toFixed(1)}
                  </p>
                  <p className="text-sm mt-1" style={{
                    color: mediaFinal >= 7 ? "#10B981" : mediaFinal >= 5 ? ORANGE : "#FF6B6B"
                  }}>
                    {mediaFinal >= 7 ? "Aprovado" : mediaFinal >= 5 ? "Recuperação" : "Reprovado"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ MATERIAIS ═══ */}
        {activeTab === "materiais" && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <BookOpen size={20} className="sm:hidden" style={{ color: ORANGE }} />
              <BookOpen size={24} className="hidden sm:block" style={{ color: ORANGE }} />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Materiais da Turma</h2>
            </div>
            {materialsData && materialsData.length > 0 ? (
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
                    <div className="flex items-start gap-3">
                      <FileText size={20} className="mt-1 flex-shrink-0" style={{ color: ORANGE }} />
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">{material.title}</h3>
                        <p className="text-sm text-white/60 mb-3">{material.description}</p>
                        {material.fileUrl && (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:scale-105"
                            style={{ backgroundColor: ORANGE }}
                          >
                            <Download size={14} />
                            Baixar Arquivo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg p-8 text-center"
                style={{
                  backgroundColor: CARD_BG,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <BookOpen size={48} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                <p className="text-white/60">Nenhum material disponível para esta turma ainda.</p>
                <p className="text-white/40 text-sm mt-2">Os materiais serão adicionados pelo professor ao longo do semestre.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ JOGO ═══ */}
        {activeTab === "jogo" && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Gamepad2 size={20} className="sm:hidden" style={{ color: ORANGE }} />
              <Gamepad2 size={24} className="hidden sm:block" style={{ color: ORANGE }} />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Jogo — Caverna do Dragão</h2>
            </div>
            <div
              className="rounded-lg p-5 sm:p-8 text-center"
              style={{
                backgroundColor: CARD_BG,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Gamepad2 size={48} className="sm:hidden mx-auto mb-4" style={{ color: ORANGE }} />
              <Gamepad2 size={64} className="hidden sm:block mx-auto mb-4" style={{ color: ORANGE }} />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Caverna do Dragão Farmacológico</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Explore a caverna, responda questões de farmacologia e derrote os bosses para ganhar PF!
              </p>
              <button
                onClick={() => setLocation(`/game-portal/${classId}`)}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-white text-base sm:text-lg transition-all hover:scale-105"
                style={{ backgroundColor: ORANGE }}
              >
                Entrar no Jogo
              </button>
            </div>
          </div>
        )}

        {/* ═══ ATIVIDADES ═══ */}
        {activeTab === "atividades" && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Target size={20} className="sm:hidden" style={{ color: ORANGE }} />
              <Target size={24} className="hidden sm:block" style={{ color: ORANGE }} />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Atividades</h2>
            </div>
            <div className="space-y-3">
              {cronograma.filter(c => c.tipo !== "Aula Teórica").map((item) => (
                <div
                  key={item.semana}
                  className="rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                  style={{
                    backgroundColor: CARD_BG,
                    border: item.tipo === "Avaliação"
                      ? `1px solid ${ORANGE}50`
                      : "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: item.tipo === "Avaliação" ? `${ORANGE}20` : "rgba(16,185,129,0.15)",
                    }}
                  >
                    {item.tipo === "Avaliação" ? (
                      <Target size={18} style={{ color: ORANGE }} />
                    ) : (
                      <Users size={18} style={{ color: "#10B981" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white text-sm">{item.tema}</h3>
                    <p className="text-xs text-white/40 mt-0.5">Semana {item.semana} — {item.data}/2026</p>
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: item.tipo === "Avaliação" ? `${ORANGE}20` : "rgba(16,185,129,0.15)",
                      color: item.tipo === "Avaliação" ? ORANGE : "#10B981",
                    }}
                  >
                    {item.tipo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ EQUIPES ═══ */}
        {activeTab === "equipes" && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Users size={20} className="sm:hidden" style={{ color: ORANGE }} />
              <Users size={24} className="hidden sm:block" style={{ color: ORANGE }} />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Equipes de Seminário</h2>
            </div>
            {jigsawGroups && jigsawGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jigsawGroups.map((group: any) => (
                  <div
                    key={group.id}
                    className="rounded-lg p-4 sm:p-5"
                    style={{
                      backgroundColor: CARD_BG,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${ORANGE}20` }}
                      >
                        <Users size={18} style={{ color: ORANGE }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{group.name}</h3>
                        <p className="text-xs text-white/40">
                          {group.currentMembers}/{group.maxMembers} membros
                        </p>
                      </div>
                    </div>
                    {group.description && (
                      <p className="text-xs text-white/50 mb-3">{group.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(group.currentMembers / group.maxMembers) * 100}%`,
                            backgroundColor: ORANGE,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg p-8 text-center"
                style={{
                  backgroundColor: CARD_BG,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Users size={48} className="mx-auto mb-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                <p className="text-white/60">Nenhuma equipe de seminário criada ainda.</p>
                <p className="text-white/40 text-sm mt-2">As equipes serão organizadas pelo professor.</p>
              </div>
            )}

            {/* Ranking das equipes do leaderboard */}
            {leaderboardData && leaderboardData.teams && leaderboardData.teams.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-4">Ranking das Equipes (PF)</h3>
                <div className="space-y-2">
                  {leaderboardData.teams.map((team: any, idx: number) => (
                    <div
                      key={team.id}
                      className="rounded-lg p-4 flex items-center gap-4"
                      style={{
                        backgroundColor: CARD_BG,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <span className="text-lg font-bold w-8 text-center" style={{ color: ORANGE }}>#{idx + 1}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{team.name}</h4>
                        <p className="text-xs text-white/40">{team.members.length} membros</p>
                      </div>
                      <span className="font-bold text-white">
                        {team.members.reduce((sum: number, m: any) => sum + parseFloat(m.xp || 0), 0).toFixed(1)} PF
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
