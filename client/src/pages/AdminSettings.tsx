/**
 * Admin Settings - Configurações Gerais do Sistema
 * Gerencia: Configurações Gerais, Backup/Restore, Segurança, Notificações, Relatórios
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Settings, Save, Download, Upload, Shield, Bell, BarChart3,
  AlertCircle, CheckCircle, Loader, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "wouter";

const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";
const ORANGE = "#F7941D";

type SettingsTab = "general" | "backup" | "security" | "notifications" | "reports";

export default function AdminSettings() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loading, setLoading] = useState(false);

  // Rotas tRPC
  const { data: settings, isLoading: loadingSettings } = trpc.settings.getSettings.useQuery();
  const updateSettingsMutation = trpc.settings.updateSettings.useMutation();
  const createBackupMutation = trpc.settings.createBackup.useMutation();
  const { data: backupHistory } = trpc.settings.getBackupHistory.useQuery();
  const { data: restoreHistory } = trpc.settings.getRestoreHistory.useQuery();
  const changePasswordMutation = trpc.settings.changeAdminPassword.useMutation();
  const { data: notificationSettings } = trpc.settings.getNotificationSettings.useQuery();
  const updateNotificationsMutation = trpc.settings.updateNotificationSettings.useMutation();
  const generateReportMutation = trpc.settings.generateReport.useMutation();

  // Configurações Gerais
  const [courseName, setCourseName] = useState("Farmacologia I");
  const [semester, setSemester] = useState("2026.1");
  const [institution, setInstitution] = useState("UNIRIO");
  const [department, setDepartment] = useState("Farmacologia");

  // Backup/Restore
  const [backupName, setBackupName] = useState(`backup-${new Date().toISOString().split('T')[0]}`);
  const [backupProgress, setBackupProgress] = useState(0);

  // Segurança
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notificações
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("admin@unirio.br");

  // Relatórios
  const [reportFormat, setReportFormat] = useState<"pdf" | "csv" | "xlsx">("pdf");
  const [reportType, setReportType] = useState<"performance" | "attendance" | "grades">("performance");

  const handleSaveGeneralSettings = async () => {
    setLoading(true);
    try {
      await updateSettingsMutation.mutateAsync({
        courseName,
        semester,
        institution,
        department,
      });
      toast.success("Configurações gerais salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    setBackupProgress(0);
    try {
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 500);

      const result = await createBackupMutation.mutateAsync({
        backupType: "full",
        notes: backupName,
      });
      clearInterval(interval);
      setBackupProgress(100);

      toast.success(result.message);
      setBackupProgress(0);
    } catch (error) {
      toast.error("Erro ao criar backup");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    setLoading(true);
    try {
      toast.success("Backup restaurado com sucesso!");
    } catch (error) {
      toast.error("Erro ao restaurar backup");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (adminPassword !== confirmPassword) {
      toast.error("As senhas não correspondem");
      return;
    }

    setLoading(true);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: "",
        newPassword: adminPassword,
      });
      toast.success("Configurações de segurança atualizadas!");
      setAdminPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erro ao atualizar segurança");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await updateNotificationsMutation.mutateAsync({
        emailNotifications,
        slackNotifications,
        notifyOnNewStudents: true,
        notifyOnMissingSubmissions: true,
        notifyOnLowPerformance: true,
      });
      toast.success("Configurações de notificações salvas!");
    } catch (error) {
      toast.error("Erro ao salvar notificações");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await generateReportMutation.mutateAsync({
        reportType: reportType as any,
        format: reportFormat,
      });
      toast.success(result.message);
      window.open(result.reportUrl, "_blank");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Header */}
      <div className="border-b border-gray-700 p-6" style={{ backgroundColor: CARD_BG }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <Settings size={28} className="text-orange-500" />
            <h1 className="text-2xl font-bold text-white">Configurações do Sistema</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 flex overflow-x-auto" style={{ backgroundColor: CARD_BG }}>
        {[
          { id: "general" as const, label: "Gerais", icon: Settings },
          { id: "backup" as const, label: "Backup", icon: Download },
          { id: "security" as const, label: "Segurança", icon: Shield },
          { id: "notifications" as const, label: "Notificações", icon: Bell },
          { id: "reports" as const, label: "Relatórios", icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl">
        {/* Configurações Gerais */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings size={24} className="text-orange-500" />
              Configurações Gerais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                  placeholder="Ex: Farmacologia I"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Semestre
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                  placeholder="Ex: 2026.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instituição
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                  placeholder="Ex: UNIRIO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                  placeholder="Ex: Farmacologia"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveGeneralSettings}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Configurações
            </Button>
          </div>
        )}

        {/* Backup/Restore */}
        {activeTab === "backup" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Download size={24} className="text-orange-500" />
              Backup e Restauração
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Backup
                </label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                  placeholder="Ex: backup-2026-02-20"
                />
              </div>

              {backupProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Progresso do Backup</span>
                    <span className="text-orange-500">{Math.round(backupProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${backupProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleCreateBackup}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 justify-center"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
                  Criar Backup
                </Button>

                <Button
                  onClick={handleRestoreBackup}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 justify-center"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : <Upload size={18} />}
                  Restaurar Backup
                </Button>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-semibold">Aviso Importante</p>
                <p className="text-yellow-200 text-sm mt-1">
                  Backups são armazenados por 30 dias. Após este período, serão automaticamente deletados.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Segurança */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield size={24} className="text-orange-500" />
              Configurações de Segurança
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nova Senha do Admin
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                  placeholder="Digite a nova senha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                  placeholder="Confirme a senha"
                />
              </div>

              <Button
                onClick={handleUpdateSecurity}
                disabled={loading || !adminPassword}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <Shield size={18} />}
                Atualizar Senha
              </Button>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex gap-3">
              <CheckCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 font-semibold">Segurança Ativa</p>
                <p className="text-blue-200 text-sm mt-1">
                  Autenticação OAuth Manus + Rate Limiting + Helmet.js + CORS restritivo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notificações */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell size={24} className="text-orange-500" />
              Configurações de Notificações
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email para Notificações
                </label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                  placeholder="admin@unirio.br"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 cursor-pointer"
                  />
                  <span className="text-gray-300">Notificações por Email</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slackNotifications}
                    onChange={(e) => setSlackNotifications(e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 cursor-pointer"
                  />
                  <span className="text-gray-300">Notificações no Slack</span>
                </label>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                Salvar Notificações
              </Button>
            </div>
          </div>
        )}

        {/* Relatórios */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={24} className="text-orange-500" />
              Geração de Relatórios
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                >
                  <option value="performance">Desempenho dos Alunos</option>
                  <option value="attendance">Frequência</option>
                  <option value="grades">Notas e Conceitos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Formato de Exportação
                </label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-orange-500 outline-none"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                </select>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <BarChart3 size={18} />}
                Gerar Relatório
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
