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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/leaderboard">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-white/60" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Área da Turma</h1>
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
      <div className="container mx-auto px-4 py-8">
        <div
          className="rounded-lg p-8 text-center"
          style={{
            backgroundColor: CARD_BG,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            {activeTab === "leaderboard" && "Ranking da Turma"}
            {activeTab === "individual" && "Top 10 Individual"}
            {activeTab === "activities" && "Atividades PF"}
            {activeTab === "game" && "Jogo Caverna do Dragão"}
            {activeTab === "materials" && "Materiais da Turma"}
            {activeTab === "calculator" && "Calculadora de Média"}
            {activeTab === "rules" && "Regras da Disciplina"}
          </h2>
          <p className="text-white/60">
            Conteúdo da aba "{activeTab}" será renderizado aqui.
          </p>
          <p className="text-white/40 text-sm mt-4">
            Dados isolados apenas para a turma <strong>{classData.name}</strong>.
          </p>
        </div>

        {/* Class Info Card */}
        <div
          className="mt-8 rounded-lg p-6"
          style={{
            backgroundColor: CARD_BG,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Informações da Turma</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/60 mb-1">Turma</p>
              <p className="text-lg font-bold text-white">{classData.name}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Alunos Matriculados</p>
              <p className="text-lg font-bold text-white">{classData.members?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Status</p>
              <p className="text-lg font-bold" style={{ color: ORANGE }}>Ativo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
