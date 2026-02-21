import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import StudentNavBar from "@/components/StudentNavBar";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";
const ORANGE = "#F7941D";

export default function AdminStudentView() {
  const [, params] = useRoute("/admin/alunos/:classId");
  const classId = params?.classId ? Number(params.classId) : null;
  const [activeTab, setActiveTab] = useState("leaderboard");
  
  const { user } = useAuth();
  const { data: classData } = trpc.classes.getById.useQuery(
    { classId: classId || 0, sessionToken: "" },
    { enabled: !!classId }
  );

  // Verificar se é admin geral
  if (!user || (user.role !== "admin" && user.role !== "user")) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: ORANGE }} />
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-white/60 mb-6">Apenas administradores gerais podem acessar esta área.</p>
          <Link href="/admin">
            <button
              className="px-6 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: ORANGE }}
            >
              Voltar ao Admin
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
          <Link href="/admin">
            <button
              className="px-6 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: ORANGE }}
            >
              Voltar ao Admin
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
          <div className="flex items-center gap-3 mb-3">
            <Link href="/admin">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-white/60" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Visualização de Aluno</h1>
              <p className="text-sm text-white/60">Turma: {classData.name}</p>
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-500/80">
              Você está visualizando a área de aluno desta turma. Todas as ações aqui são apenas para visualização.
            </p>
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
            Esta é uma visualização de como os alunos veem a plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
