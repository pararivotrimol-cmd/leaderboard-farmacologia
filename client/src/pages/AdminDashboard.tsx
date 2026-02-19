/**
 * Admin Dashboard — Painel Administrativo Geral
 * Acesso completo para gerenciar turmas, alunos, professores, códigos de convite e configurações
 * Dados reais do banco de dados via tRPC
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Users, GraduationCap, BookOpen, Settings, LogOut,
  BarChart3, CheckCircle, Clock, Shield,
  Plus, Trash2, Eye, RefreshCw, Ticket,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  Copy, ExternalLink, FlaskConical, ArrowLeft, UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";
const ORANGE = "#F7941D";

interface AdminTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ADMIN_TABS: AdminTab[] = [
  { id: "overview", label: "Visão Geral", icon: <BarChart3 size={20} /> },
  { id: "turmas", label: "Turmas", icon: <FlaskConical size={20} /> },
  { id: "students", label: "Alunos", icon: <GraduationCap size={20} /> },
  { id: "teams", label: "Equipes", icon: <Users size={20} /> },
  { id: "professors", label: "Professores", icon: <BookOpen size={20} /> },
  { id: "invites", label: "Códigos de Convite", icon: <Ticket size={20} /> },
  { id: "settings", label: "Configurações", icon: <Settings size={20} /> },
];

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const adminRole = localStorage.getItem("adminRole");
    const adminToken = localStorage.getItem("sessionToken");
    const teacherToken = localStorage.getItem("teacherSessionToken");

    if (adminRole === "super_admin" && adminToken) {
      setSessionToken(adminToken);
    } else if (teacherToken) {
      setSessionToken(teacherToken);
    } else {
      navigate("/");
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("teacherSessionToken");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminLoginTime");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherEmail");
    toast.success("Sessão encerrada com sucesso");
    navigate("/");
  };

  if (!sessionToken) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Header */}
      <div className="border-b border-gray-700 p-4 sm:p-6" style={{ backgroundColor: CARD_BG }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${ORANGE}20` }}>
              <Shield size={28} style={{ color: ORANGE }} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-gray-400 text-sm">Gerenciamento completo da plataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/professor")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 text-sm"
              style={{ backgroundColor: `${ORANGE}30`, color: ORANGE, border: `1px solid ${ORANGE}50` }}
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Painel Professor</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{ backgroundColor: "rgba(255,80,80,0.15)", color: "#FF6B6B", border: "1px solid rgba(255,80,80,0.3)" }}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-700 overflow-x-auto" style={{ backgroundColor: CARD_BG }}>
        <div className="max-w-7xl mx-auto flex gap-1 p-4">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm"
              style={{
                backgroundColor: activeTab === tab.id ? ORANGE : "rgba(255,255,255,0.05)",
                color: activeTab === tab.id ? "#000" : "#fff",
                border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                fontWeight: activeTab === tab.id ? 700 : 400,
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {activeTab === "overview" && <OverviewTab sessionToken={sessionToken} />}
        {activeTab === "turmas" && <TurmasAdminTab sessionToken={sessionToken} />}
        {activeTab === "students" && <StudentsTab sessionToken={sessionToken} />}
        {activeTab === "teams" && <TeamsTab sessionToken={sessionToken} />}
        {activeTab === "professors" && <ProfessorsTab sessionToken={sessionToken} />}
        {activeTab === "invites" && <InviteCodesTab sessionToken={sessionToken} />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ sessionToken }: { sessionToken: string }) {
  const statsQuery = trpc.superAdmin.getStats.useQuery({ sessionToken }, {
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (statsQuery.isLoading) {
    return <LoadingState text="Carregando estatísticas..." />;
  }

  if (statsQuery.error) {
    return <ErrorState text="Erro ao carregar estatísticas. Verifique sua sessão." />;
  }

  const stats = statsQuery.data;
  if (!stats) return null;

  const statCards = [
    { label: "Total de Alunos (Membros)", value: stats.system.totalMembers.toString(), icon: <GraduationCap size={24} />, color: ORANGE },
    { label: "Equipes Ativas", value: stats.system.totalTeams.toString(), icon: <Users size={24} />, color: "#4A90E2" },
    { label: "Professores", value: stats.teachers.total.toString(), icon: <BookOpen size={24} />, color: "#7ED321" },
    { label: "XP Total da Turma", value: stats.system.totalXP, icon: <BarChart3 size={24} />, color: "#50E3C2" },
    { label: "Média XP/Aluno", value: stats.system.avgXPPerMember, icon: <CheckCircle size={24} />, color: "#9B59B6" },
    { label: "Contas de Alunos", value: stats.students.totalAccounts.toString(), icon: <Eye size={24} />, color: "#E74C3C" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Visão Geral da Plataforma</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            className="rounded-lg p-6 border border-gray-700"
            style={{ backgroundColor: CARD_BG }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div style={{ color: stat.color }}>{stat.icon}</div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Teacher breakdown */}
      <div className="rounded-lg p-6 border border-gray-700" style={{ backgroundColor: CARD_BG }}>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen size={20} style={{ color: ORANGE }} />
          Detalhes dos Professores
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{stats.teachers.active}</p>
            <p className="text-xs text-gray-400">Ativos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.teachers.inactive}</p>
            <p className="text-xs text-gray-400">Inativos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.teachers.coordenadores}</p>
            <p className="text-xs text-gray-400">Coordenadores</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.teachers.superAdmins}</p>
            <p className="text-xs text-gray-400">Super Admins</p>
          </div>
        </div>
      </div>

      {/* Student breakdown */}
      <div className="rounded-lg p-6 border border-gray-700" style={{ backgroundColor: CARD_BG }}>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <GraduationCap size={20} style={{ color: ORANGE }} />
          Detalhes dos Alunos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{stats.students.totalMembers}</p>
            <p className="text-xs text-gray-400">Membros (equipes)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.students.totalAccounts}</p>
            <p className="text-xs text-gray-400">Contas criadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.students.activeAccounts}</p>
            <p className="text-xs text-gray-400">Contas ativas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.students.withoutAccount}</p>
            <p className="text-xs text-gray-400">Sem conta</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Turmas Admin Tab ───
function TurmasAdminTab({ sessionToken }: { sessionToken: string }) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  const classesList = trpc.classes.list.useQuery({ sessionToken });
  const classDetail = trpc.classes.getById.useQuery(
    { sessionToken, classId: selectedClass! },
    { enabled: !!selectedClass }
  );

  if (classesList.isLoading) return <LoadingState text="Carregando turmas..." />;

  // Detail view
  if (selectedClass && classDetail.data) {
    const cls = classDetail.data;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedClass(null)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{cls.name}</h2>
            <p className="text-sm text-gray-400">
              {cls.discipline} — {cls.course} — {cls.semester}
              {cls.teacherName && <span> — Prof. {cls.teacherName}</span>}
            </p>
          </div>
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cls.color }} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-lg p-5 border border-gray-700" style={{ backgroundColor: CARD_BG }}>
            <p className="text-xs text-gray-400 uppercase">Equipes</p>
            <p className="text-3xl font-bold text-white mt-1">{cls.teams.length}</p>
          </div>
          <div className="rounded-lg p-5 border border-gray-700" style={{ backgroundColor: CARD_BG }}>
            <p className="text-xs text-gray-400 uppercase">Alunos</p>
            <p className="text-3xl font-bold text-white mt-1">{cls.members.length}</p>
          </div>
          <div className="rounded-lg p-5 border border-gray-700" style={{ backgroundColor: CARD_BG }}>
            <p className="text-xs text-gray-400 uppercase">PF Total</p>
            <p className="text-3xl font-bold mt-1" style={{ color: ORANGE }}>
              {cls.members.reduce((s: number, m: any) => s + parseFloat(m.xp || "0"), 0).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Teams */}
        <div className="rounded-lg border border-gray-700" style={{ backgroundColor: CARD_BG }}>
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={18} style={{ color: ORANGE }} /> Equipes da Turma
            </h3>
          </div>
          {cls.teams.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhuma equipe nesta turma.</div>
          ) : (
            <div>
              {cls.teams.map((team: any) => {
                const teamMembers = cls.members.filter((m: any) => m.teamId === team.id);
                const totalPF = teamMembers.reduce((s: number, m: any) => s + parseFloat(m.xp || "0"), 0);
                return (
                  <div key={team.id} className="border-b border-gray-700/50 last:border-0">
                    <button
                      onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{team.emoji}</span>
                        <span className="font-bold text-white">{team.name}</span>
                        <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                          {teamMembers.length} alunos
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm" style={{ color: team.color || ORANGE }}>{totalPF.toFixed(1)} PF</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color || ORANGE }} />
                        {expandedTeam === team.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedTeam === team.id && teamMembers.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr>
                                  <th className="px-3 py-2 text-left text-gray-500 text-xs">#</th>
                                  <th className="px-3 py-2 text-left text-gray-500 text-xs">Nome</th>
                                  <th className="px-3 py-2 text-right text-gray-500 text-xs">PF</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teamMembers
                                  .sort((a: any, b: any) => parseFloat(b.xp || "0") - parseFloat(a.xp || "0"))
                                  .map((m: any, idx: number) => (
                                    <tr key={m.id} className="border-t border-gray-700/30">
                                      <td className="px-3 py-2 text-gray-500 text-xs">{idx + 1}</td>
                                      <td className="px-3 py-2 text-white">{m.name}</td>
                                      <td className="px-3 py-2 text-right font-mono" style={{ color: team.color || ORANGE }}>
                                        {parseFloat(m.xp || "0").toFixed(1)}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All members list */}
        <div className="rounded-lg border border-gray-700" style={{ backgroundColor: CARD_BG }}>
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap size={18} style={{ color: ORANGE }} /> Todos os Alunos ({cls.members.length})
            </h3>
          </div>
          {cls.members.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhum aluno nesta turma.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-400 text-xs">#</th>
                    <th className="px-4 py-2 text-left text-gray-400 text-xs">Nome</th>
                    <th className="px-4 py-2 text-left text-gray-400 text-xs">Equipe</th>
                    <th className="px-4 py-2 text-right text-gray-400 text-xs">PF</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.members
                    .sort((a: any, b: any) => parseFloat(b.xp || "0") - parseFloat(a.xp || "0"))
                    .map((m: any, idx: number) => {
                      const team = cls.teams.find((t: any) => t.id === m.teamId);
                      return (
                        <tr key={m.id} className="border-t border-gray-700/50">
                          <td className="px-4 py-3 text-gray-500 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3 text-white">{m.name}</td>
                          <td className="px-4 py-3">
                            {team ? (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${team.color}22`, color: team.color }}>
                                {team.emoji} {team.name}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">Sem equipe</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono" style={{ color: ORANGE }}>
                            {parseFloat(m.xp || "0").toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  const classes = classesList.data || [];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Turmas
          <span className="text-sm font-normal text-gray-400 ml-3">({classes.length} turmas)</span>
        </h2>
        <button
          onClick={() => classesList.refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-lg p-8 border border-gray-700 text-center" style={{ backgroundColor: CARD_BG }}>
          <FlaskConical size={48} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">Nenhuma turma cadastrada ainda.</p>
          <p className="text-gray-500 text-sm mt-1">As turmas são criadas pelos professores no painel de administração.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls: any, i: number) => (
            <motion.button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className="rounded-lg p-5 border border-gray-700 text-left hover:border-gray-500 transition-all"
              style={{ backgroundColor: CARD_BG }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color }} />
                <h3 className="text-lg font-bold text-white">{cls.name}</h3>
              </div>
              <div className="space-y-1 text-sm text-gray-400">
                <p>📚 {cls.discipline}</p>
                <p>🏫 {cls.course}</p>
                <p>📅 {cls.semester}</p>
                {cls.teacherName && <p>👨‍🏫 Prof. {cls.teacherName}</p>}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Students Tab ───
function StudentsTab({ sessionToken }: { sessionToken: string }) {
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const teamsQuery = trpc.teams.list.useQuery({ sessionToken });
  const membersQuery = trpc.members.list.useQuery({ sessionToken });
  const deleteMember = trpc.members.delete.useMutation({
    onSuccess: () => {
      toast.success("Aluno removido com sucesso");
      membersQuery.refetch();
      setConfirmDelete(null);
    },
    onError: (err) => toast.error(err.message),
  });

  if (teamsQuery.isLoading || membersQuery.isLoading) {
    return <LoadingState text="Carregando alunos..." />;
  }

  const teams = teamsQuery.data || [];
  const members = membersQuery.data || [];

  const membersByTeam = teams.map(team => ({
    ...team,
    members: members.filter((m: any) => m.teamId === team.id),
  }));

  const unassigned = members.filter((m: any) => !teams.some((t: any) => t.id === m.teamId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Gerenciar Alunos
          <span className="text-sm font-normal text-gray-400 ml-3">({members.length} membros)</span>
        </h2>
        <button
          onClick={() => { teamsQuery.refetch(); membersQuery.refetch(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* Members grouped by team */}
      {membersByTeam.map((team) => (
        <div key={team.id} className="rounded-lg border border-gray-700 overflow-hidden" style={{ backgroundColor: CARD_BG }}>
          <button
            onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{team.emoji}</span>
              <span className="font-bold text-white">{team.name}</span>
              <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                {team.members.length} membros
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono" style={{ color: team.color || ORANGE }}>
                {team.members.reduce((sum: number, m: any) => sum + parseFloat(m.xp || "0"), 0).toFixed(1)} PF
              </span>
              {expandedTeam === team.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
          </button>

          <AnimatePresence>
            {expandedTeam === team.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-700">
                  <table className="w-full text-sm">
                    <thead style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-400 text-xs">#</th>
                        <th className="px-4 py-2 text-left text-gray-400 text-xs">Nome</th>
                        <th className="px-4 py-2 text-left text-gray-400 text-xs">PF</th>
                        <th className="px-4 py-2 text-right text-gray-400 text-xs">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.members
                        .sort((a: any, b: any) => parseFloat(b.xp || "0") - parseFloat(a.xp || "0"))
                        .map((member: any, idx: number) => (
                          <tr key={member.id} className="border-t border-gray-700/50">
                            <td className="px-4 py-3 text-gray-500 text-xs">{idx + 1}</td>
                            <td className="px-4 py-3 text-white">{member.name}</td>
                            <td className="px-4 py-3 font-mono" style={{ color: team.color || ORANGE }}>
                              {parseFloat(member.xp || "0").toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {confirmDelete === member.id ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-xs text-red-400">Confirmar?</span>
                                  <button
                                    onClick={() => deleteMember.mutate({ sessionToken, id: member.id })}
                                    className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700"
                                    disabled={deleteMember.isPending}
                                  >
                                    {deleteMember.isPending ? "..." : "Sim"}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-2 py-1 rounded text-xs bg-gray-600 text-white hover:bg-gray-700"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(member.id)}
                                  className="p-1.5 rounded hover:bg-red-900/30 transition-all"
                                  title="Remover aluno"
                                >
                                  <Trash2 size={14} style={{ color: "#FF6B6B" }} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Unassigned members */}
      {unassigned.length > 0 && (
        <div className="rounded-lg border border-yellow-700/50 overflow-hidden" style={{ backgroundColor: CARD_BG }}>
          <div className="p-4 flex items-center gap-3">
            <span className="text-xl">❓</span>
            <span className="font-bold text-yellow-400">Sem equipe ({unassigned.length})</span>
          </div>
          <div className="border-t border-gray-700">
            {unassigned.map((member: any) => (
              <div key={member.id} className="px-4 py-3 flex items-center justify-between border-b border-gray-700/50 last:border-0">
                <span className="text-white text-sm">{member.name}</span>
                <span className="font-mono text-sm" style={{ color: ORANGE }}>{parseFloat(member.xp || "0").toFixed(1)} PF</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Teams Tab ───
function TeamsTab({ sessionToken }: { sessionToken: string }) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const teamsQuery = trpc.teams.list.useQuery({ sessionToken });
  const membersQuery = trpc.members.list.useQuery({ sessionToken });
  const deleteTeam = trpc.teams.delete.useMutation({
    onSuccess: () => {
      toast.success("Equipe removida com sucesso");
      teamsQuery.refetch();
      setConfirmDelete(null);
    },
    onError: (err) => toast.error(err.message),
  });

  if (teamsQuery.isLoading || membersQuery.isLoading) {
    return <LoadingState text="Carregando equipes..." />;
  }

  const teams = teamsQuery.data || [];
  const members = membersQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Gerenciar Equipes
          <span className="text-sm font-normal text-gray-400 ml-3">({teams.length} equipes)</span>
        </h2>
        <button
          onClick={() => { teamsQuery.refetch(); membersQuery.refetch(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team: any, i: number) => {
          const teamMembers = members.filter((m: any) => m.teamId === team.id);
          const totalPF = teamMembers.reduce((sum: number, m: any) => sum + parseFloat(m.xp || "0"), 0);
          const avgPF = teamMembers.length > 0 ? totalPF / teamMembers.length : 0;

          return (
            <motion.div
              key={team.id}
              className="rounded-lg p-5 border border-gray-700"
              style={{ backgroundColor: CARD_BG }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{team.emoji}</span>
                  <h3 className="text-lg font-bold text-white">{team.name}</h3>
                </div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color || ORANGE }} />
              </div>
              <div className="space-y-1.5 text-sm text-gray-400 mb-4">
                <p>👥 {teamMembers.length} membros</p>
                <p style={{ color: team.color || ORANGE }}>⭐ {totalPF.toFixed(1)} PF total</p>
                <p className="text-xs">📊 Média: {avgPF.toFixed(1)} PF/aluno</p>
              </div>
              <div className="flex gap-2">
                {confirmDelete === team.id ? (
                  <>
                    <button
                      onClick={() => deleteTeam.mutate({ sessionToken, id: team.id })}
                      className="flex-1 px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
                      disabled={deleteTeam.isPending}
                    >
                      {deleteTeam.isPending ? "Removendo..." : "Confirmar"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm bg-gray-600 text-white hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(team.id)}
                    className="flex-1 px-3 py-2 rounded-lg transition-all hover:bg-red-900/30 text-sm text-red-400 border border-red-800/30"
                  >
                    <Trash2 size={14} className="inline mr-1" /> Deletar
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Professors Tab ───
function ProfessorsTab({ sessionToken }: { sessionToken: string }) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const teachersQuery = trpc.teacherManagement.listAll.useQuery({ sessionToken }, {
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const deleteTeacher = trpc.teacherManagement.deleteTeacher.useMutation({
    onSuccess: () => {
      toast.success("Professor removido com sucesso");
      teachersQuery.refetch();
      setConfirmDelete(null);
    },
    onError: (err) => toast.error(err.message),
  });
  const toggleActive = trpc.teacherManagement.toggleActive.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      teachersQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (teachersQuery.isLoading) {
    return <LoadingState text="Carregando professores..." />;
  }

  if (teachersQuery.error) {
    return <ErrorState text="Erro ao carregar professores. Verifique suas permissões." />;
  }

  const teachers = teachersQuery.data || [];

  const roleLabel = (role: string) => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "coordenador": return "Coordenador";
      default: return "Professor";
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "super_admin": return ORANGE;
      case "coordenador": return "#4A90E2";
      default: return "#7ED321";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Gerenciar Professores
          <span className="text-sm font-normal text-gray-400 ml-3">({teachers.length} cadastrados)</span>
        </h2>
        <button
          onClick={() => teachersQuery.refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className="rounded-lg border border-gray-700 overflow-hidden" style={{ backgroundColor: CARD_BG }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 text-xs">Nome</th>
                <th className="px-4 py-3 text-left text-gray-400 text-xs">Email</th>
                <th className="px-4 py-3 text-left text-gray-400 text-xs">Papel</th>
                <th className="px-4 py-3 text-left text-gray-400 text-xs">Status</th>
                <th className="px-4 py-3 text-right text-gray-400 text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((prof: any) => (
                <tr key={prof.id} className="border-t border-gray-700/50">
                  <td className="px-4 py-3 text-white font-medium">{prof.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{prof.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${roleColor(prof.role)}20`, color: roleColor(prof.role) }}
                    >
                      {roleLabel(prof.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive.mutate({
                        sessionToken,
                        teacherId: prof.id,
                        isActive: prof.isActive === 1 ? 0 : 1,
                      })}
                      disabled={prof.role === "super_admin" || toggleActive.isPending}
                      className="flex items-center gap-1 disabled:opacity-30"
                      title={prof.role === "super_admin" ? "Super Admin não pode ser desativado" : "Alternar status"}
                    >
                      {prof.isActive === 1 ? (
                        <ToggleRight size={20} style={{ color: "#7ED321" }} />
                      ) : (
                        <ToggleLeft size={20} style={{ color: "#FF6B6B" }} />
                      )}
                      <span className="text-xs" style={{ color: prof.isActive === 1 ? "#7ED321" : "#FF6B6B" }}>
                        {prof.isActive === 1 ? "Ativo" : "Inativo"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {prof.role === "super_admin" ? (
                      <span className="text-xs text-gray-500">—</span>
                    ) : confirmDelete === prof.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs text-red-400">Confirmar?</span>
                        <button
                          onClick={() => deleteTeacher.mutate({ sessionToken, teacherId: prof.id })}
                          className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700"
                          disabled={deleteTeacher.isPending}
                        >
                          {deleteTeacher.isPending ? "..." : "Sim"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 rounded text-xs bg-gray-600 text-white hover:bg-gray-700"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(prof.id)}
                        className="p-1.5 rounded hover:bg-red-900/30 transition-all"
                        title="Remover professor"
                      >
                        <Trash2 size={14} style={{ color: "#FF6B6B" }} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Invite Codes Tab ───
function InviteCodesTab({ sessionToken }: { sessionToken: string }) {
  const [newDescription, setNewDescription] = useState("");
  const [newMaxUses, setNewMaxUses] = useState(10);
  const [showForm, setShowForm] = useState(false);

  const codesQuery = trpc.inviteCodes.list.useQuery({ sessionToken }, {
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const generateCode = trpc.inviteCodes.generate.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Código gerado: ${data.code}`);
        codesQuery.refetch();
        setShowForm(false);
        setNewDescription("");
        setNewMaxUses(10);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => toast.error(err.message),
  });
  const toggleCode = trpc.inviteCodes.toggle.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado");
      codesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteCode = trpc.inviteCodes.delete.useMutation({
    onSuccess: () => {
      toast.success("Código removido");
      codesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const codes = codesQuery.data || [];

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`Código "${code}" copiado!`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Códigos de Convite
          <span className="text-sm font-normal text-gray-400 ml-3">({codes.length} códigos)</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{ backgroundColor: ORANGE, color: "#000" }}
        >
          <Plus size={18} />
          Gerar Código
        </button>
      </div>

      {/* Info box */}
      <div className="rounded-lg p-4 border border-blue-800/30" style={{ backgroundColor: "rgba(74, 144, 226, 0.1)" }}>
        <p className="text-sm text-blue-300">
          <strong>Como funciona:</strong> Códigos de convite permitem que monitores e alunos externos (sem email @edu.unirio.br) se cadastrem na plataforma.
          Gere um código, compartilhe com o aluno, e ele poderá usá-lo no cadastro.
        </p>
      </div>

      {/* Generate form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg p-6 border border-gray-700" style={{ backgroundColor: CARD_BG }}>
              <h3 className="text-lg font-bold text-white mb-4">Gerar Novo Código</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Descrição (opcional)</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Ex: Monitor João - Semestre 2026.1"
                    className="w-full px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Máximo de usos</label>
                  <input
                    type="number"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(parseInt(e.target.value) || 1)}
                    min={1}
                    max={100}
                    className="w-32 px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => generateCode.mutate({ sessionToken, description: newDescription, maxUses: newMaxUses })}
                    disabled={generateCode.isPending}
                    className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50"
                    style={{ backgroundColor: ORANGE, color: "#000" }}
                  >
                    {generateCode.isPending ? "Gerando..." : "Gerar Código"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 rounded-lg transition-all hover:scale-105"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Codes list */}
      {codesQuery.isLoading ? (
        <LoadingState text="Carregando códigos..." />
      ) : codes.length === 0 ? (
        <div className="rounded-lg p-8 border border-gray-700 text-center" style={{ backgroundColor: CARD_BG }}>
          <Ticket size={48} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">Nenhum código de convite gerado ainda.</p>
          <p className="text-gray-500 text-sm mt-1">Clique em "Gerar Código" para criar o primeiro.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-700 overflow-hidden" style={{ backgroundColor: CARD_BG }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 text-xs">Código</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-xs">Descrição</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-xs">Usos</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-xs">Criado por</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-xs">Status</th>
                  <th className="px-4 py-3 text-right text-gray-400 text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code: any) => (
                  <tr key={code.id} className="border-t border-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-white font-mono font-bold text-sm px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(247,148,29,0.15)" }}>
                          {code.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="p-1 rounded hover:bg-gray-700 transition-all"
                          title="Copiar código"
                        >
                          <Copy size={12} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">
                      {code.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-mono">{code.usedCount}</span>
                      <span className="text-gray-500">/{code.maxUses}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{code.createdBy}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleCode.mutate({ sessionToken, id: code.id, isActive: !code.isActive })}
                        disabled={toggleCode.isPending}
                        className="flex items-center gap-1"
                      >
                        {code.isActive ? (
                          <ToggleRight size={20} style={{ color: "#7ED321" }} />
                        ) : (
                          <ToggleLeft size={20} style={{ color: "#FF6B6B" }} />
                        )}
                        <span className="text-xs" style={{ color: code.isActive ? "#7ED321" : "#FF6B6B" }}>
                          {code.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm("Tem certeza que deseja remover este código?")) {
                            deleteCode.mutate({ sessionToken, id: code.id });
                          }
                        }}
                        className="p-1.5 rounded hover:bg-red-900/30 transition-all"
                        title="Remover código"
                      >
                        <Trash2 size={14} style={{ color: "#FF6B6B" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ───
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configurações do Sistema</h2>

      <div className="space-y-4">
        {[
          { title: "Configurações Gerais", desc: "Nome da turma, semestre, cronograma", action: "Em breve" },
          { title: "Backup de Dados", desc: "Exportar e importar dados da plataforma", action: "Em breve" },
          { title: "Segurança", desc: "Gerenciar senhas, permissões e acesso", action: "Em breve" },
          { title: "Notificações", desc: "Configurar alertas e comunicações", action: "Em breve" },
          { title: "Relatórios", desc: "Gerar relatórios de desempenho", action: "Em breve" },
        ].map((setting, i) => (
          <motion.div
            key={i}
            className="rounded-lg p-6 border border-gray-700 flex items-center justify-between"
            style={{ backgroundColor: CARD_BG }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div>
              <h3 className="font-bold text-white">{setting.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{setting.desc}</p>
            </div>
            <button
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
              className="px-4 py-2 rounded-lg transition-all hover:scale-105 text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {setting.action}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Components ───
function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <RefreshCw size={32} className="mx-auto mb-3 text-gray-500 animate-spin" />
        <p className="text-gray-400">{text}</p>
      </div>
    </div>
  );
}

function ErrorState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-3">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <p className="text-red-400">{text}</p>
      </div>
    </div>
  );
}
