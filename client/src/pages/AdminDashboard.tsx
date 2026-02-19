/**
 * Admin Dashboard — Painel Administrativo Geral
 * Acesso completo para gerenciar turmas, alunos, professores e configurações
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Users, GraduationCap, BookOpen, Settings, LogOut,
  BarChart3, AlertCircle, CheckCircle, Clock, Shield,
  Plus, Edit, Trash2, Eye, Download
} from "lucide-react";
import { motion } from "framer-motion";

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
  { id: "students", label: "Alunos", icon: <GraduationCap size={20} /> },
  { id: "teams", label: "Equipes", icon: <Users size={20} /> },
  { id: "professors", label: "Professores", icon: <BookOpen size={20} /> },
  { id: "settings", label: "Configurações", icon: <Settings size={20} /> },
];

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [teacherToken, setTeacherToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("teacherSessionToken");
    if (!token) {
      setLocation("/professor/login");
      return;
    }
    setTeacherToken(token);
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("teacherSessionToken");
    setLocation("/professor/login");
  };

  if (!teacherToken) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Header */}
      <div
        className="border-b border-gray-700 p-4 sm:p-6"
        style={{ backgroundColor: CARD_BG }}
      >
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="border-b border-gray-700 overflow-x-auto"
        style={{ backgroundColor: CARD_BG }}
      >
        <div className="max-w-7xl mx-auto flex gap-1 p-4">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
              style={{
                backgroundColor: activeTab === tab.id ? ORANGE : "rgba(255,255,255,0.05)",
                color: activeTab === tab.id ? "#000" : "#fff",
                border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,0.1)"
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
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "students" && <StudentsTab />}
        {activeTab === "teams" && <TeamsTab />}
        {activeTab === "professors" && <ProfessorsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab() {
  const stats = [
    { label: "Total de Alunos", value: "84", icon: <GraduationCap size={24} />, color: "#F7941D" },
    { label: "Equipes Ativas", value: "12", icon: <Users size={24} />, color: "#4A90E2" },
    { label: "Professores", value: "3", icon: <BookOpen size={24} />, color: "#7ED321" },
    { label: "Taxa de Presença", value: "92%", icon: <CheckCircle size={24} />, color: "#50E3C2" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Visão Geral da Plataforma</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="rounded-lg p-6 border border-gray-700"
            style={{ backgroundColor: "#0D1B2A" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                Ativo
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg p-6 border border-gray-700" style={{ backgroundColor: "#0D1B2A" }}>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock size={20} style={{ color: "#F7941D" }} />
          Atividades Recentes
        </h3>
        <div className="space-y-3">
          {[
            { action: "Aluno registrou presença", time: "há 2 minutos", status: "success" },
            { action: "Professor criou nova equipe", time: "há 15 minutos", status: "success" },
            { action: "Aluno completou atividade", time: "há 1 hora", status: "success" },
            { action: "Tentativa de login falhada", time: "há 2 horas", status: "warning" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3">
                {activity.status === "success" ? (
                  <CheckCircle size={18} style={{ color: "#7ED321" }} />
                ) : (
                  <AlertCircle size={18} style={{ color: "#F5A623" }} />
                )}
                <span className="text-white text-sm">{activity.action}</span>
              </div>
              <span className="text-gray-400 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciar Alunos</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{ backgroundColor: "#F7941D", color: "#000" }}
        >
          <Plus size={18} />
          Adicionar Aluno
        </button>
      </div>

      <div className="rounded-lg border border-gray-700 overflow-hidden" style={{ backgroundColor: "#0D1B2A" }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <tr>
              <th className="px-6 py-3 text-left text-gray-400">Nome</th>
              <th className="px-6 py-3 text-left text-gray-400">Email</th>
              <th className="px-6 py-3 text-left text-gray-400">Equipe</th>
              <th className="px-6 py-3 text-left text-gray-400">PF</th>
              <th className="px-6 py-3 text-left text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {[
              { name: "João Silva", email: "joao@unirio.br", team: "Equipe A", pf: 42 },
              { name: "Maria Santos", email: "maria@unirio.br", team: "Equipe B", pf: 45 },
              { name: "Pedro Costa", email: "pedro@unirio.br", team: "Equipe C", pf: 38 },
            ].map((student, i) => (
              <tr key={i} style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <td className="px-6 py-4 text-white">{student.name}</td>
                <td className="px-6 py-4 text-gray-400">{student.email}</td>
                <td className="px-6 py-4 text-gray-400">{student.team}</td>
                <td className="px-6 py-4 text-white font-semibold">{student.pf}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-1 hover:bg-gray-700 rounded transition-all">
                    <Eye size={16} style={{ color: "#F7941D" }} />
                  </button>
                  <button className="p-1 hover:bg-gray-700 rounded transition-all">
                    <Edit size={16} style={{ color: "#4A90E2" }} />
                  </button>
                  <button className="p-1 hover:bg-gray-700 rounded transition-all">
                    <Trash2 size={16} style={{ color: "#FF6B6B" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciar Equipes</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{ backgroundColor: "#F7941D", color: "#000" }}
        >
          <Plus size={18} />
          Criar Equipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: "Equipe A", members: 7, pf: 285, color: "#F7941D" },
          { name: "Equipe B", members: 7, pf: 298, color: "#4A90E2" },
          { name: "Equipe C", members: 7, pf: 267, color: "#7ED321" },
        ].map((team, i) => (
          <motion.div
            key={i}
            className="rounded-lg p-6 border border-gray-700"
            style={{ backgroundColor: "#0D1B2A" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">{team.name}</h3>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
            </div>
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <p>👥 {team.members} membros</p>
              <p style={{ color: team.color }}>⭐ {team.pf} PF total</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-lg transition-all hover:bg-gray-700 text-sm" style={{ color: team.color }}>
                Editar
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg transition-all hover:bg-gray-700 text-sm text-red-400">
                Deletar
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProfessorsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciar Professores</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{ backgroundColor: "#F7941D", color: "#000" }}
        >
          <Plus size={18} />
          Adicionar Professor
        </button>
      </div>

      <div className="rounded-lg border border-gray-700 overflow-hidden" style={{ backgroundColor: "#0D1B2A" }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <tr>
              <th className="px-6 py-3 text-left text-gray-400">Nome</th>
              <th className="px-6 py-3 text-left text-gray-400">Email</th>
              <th className="px-6 py-3 text-left text-gray-400">Papel</th>
              <th className="px-6 py-3 text-left text-gray-400">Status</th>
              <th className="px-6 py-3 text-left text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {[
              { name: "Prof. João", email: "joao.prof@unirio.br", role: "Professor", status: "Ativo" },
              { name: "Prof. Maria", email: "maria.prof@unirio.br", role: "Professor", status: "Ativo" },
              { name: "Pedro Alessandro", email: "pedro.alessandro@unirio.br", role: "Super Admin", status: "Ativo" },
            ].map((prof, i) => (
              <tr key={i} style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <td className="px-6 py-4 text-white">{prof.name}</td>
                <td className="px-6 py-4 text-gray-400">{prof.email}</td>
                <td className="px-6 py-4 text-gray-400">{prof.role}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: "#7ED32120", color: "#7ED321" }}>
                    {prof.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-1 hover:bg-gray-700 rounded transition-all">
                    <Edit size={16} style={{ color: "#4A90E2" }} />
                  </button>
                  <button className="p-1 hover:bg-gray-700 rounded transition-all">
                    <Trash2 size={16} style={{ color: "#FF6B6B" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configurações do Sistema</h2>

      <div className="space-y-4">
        {[
          { title: "Configurações Gerais", desc: "Nome da turma, semestre, cronograma" },
          { title: "Backup de Dados", desc: "Exportar e importar dados da plataforma" },
          { title: "Segurança", desc: "Gerenciar senhas, permissões e acesso" },
          { title: "Notificações", desc: "Configurar alertas e comunicações" },
          { title: "Relatórios", desc: "Gerar relatórios de desempenho" },
        ].map((setting, i) => (
          <motion.div
            key={i}
            className="rounded-lg p-6 border border-gray-700 flex items-center justify-between"
            style={{ backgroundColor: "#0D1B2A" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div>
              <h3 className="font-bold text-white">{setting.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{setting.desc}</p>
            </div>
            <button
              className="px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{ backgroundColor: "#F7941D", color: "#000", fontWeight: "600" }}
            >
              Configurar
            </button>
          </motion.div>
        ))}
      </div>

      {/* Export Button */}
      <div className="rounded-lg p-6 border border-gray-700" style={{ backgroundColor: "#0D1B2A" }}>
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Download size={20} style={{ color: "#F7941D" }} />
          Exportar Dados
        </h3>
        <p className="text-sm text-gray-400 mb-4">Baixe um backup completo de todos os dados da plataforma</p>
        <button
          className="px-6 py-2 rounded-lg transition-all hover:scale-105"
          style={{ backgroundColor: "rgba(247, 148, 29, 0.2)", color: "#F7941D", border: "1px solid #F7941D", fontWeight: "600" }}
        >
          Baixar Backup
        </button>
      </div>
    </div>
  );
}
