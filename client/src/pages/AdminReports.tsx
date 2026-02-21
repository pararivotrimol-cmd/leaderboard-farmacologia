import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Calendar, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminReports() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const leaderboardQuery = trpc.leaderboard.getData.useQuery();

  useEffect(() => {
    if (leaderboardQuery.data) {
      // Processar dados para gráficos
      const teams = leaderboardQuery.data.teams || [];
      const activities = leaderboardQuery.data.activities || [];

      // Dados para gráfico de barras (PF por equipe)
      const teamChartData = teams.map(team => ({
        name: team.name,
        pf: team.members.reduce((sum, m) => sum + m.xp, 0),
        members: team.members.length,
      }));

      // Dados para gráfico de linha (evolução por atividade)
      const activityChartData = activities.map(activity => ({
        name: activity.name,
        pontos: activity.maxXP,
      }));

      // Dados para gráfico de pizza (distribuição de membros)
      const memberDistribution = teams.map(team => ({
        name: team.name,
        value: team.members.length,
      }));

      setReportData({
        teams: teamChartData,
        activities: activityChartData,
        distribution: memberDistribution,
        totalTeams: teams.length,
        totalStudents: teams.reduce((sum, t) => sum + t.members.length, 0),
        totalActivities: activities.length,
      });
      setIsLoading(false);
    }
  }, [leaderboardQuery.data]);

  const handleExportPDF = () => {
    // Criar conteúdo HTML para impressão/PDF
    const printContent = document.createElement("div");
    printContent.innerHTML = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; color: #333; }
          h1 { color: #0A1628; font-size: 24px; border-bottom: 2px solid #F7941D; padding-bottom: 8px; }
          h2 { color: #1A1A2E; font-size: 18px; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #0A1628; color: white; }
          .stat { display: inline-block; margin: 10px 20px 10px 0; }
          .stat-value { font-size: 24px; font-weight: bold; color: #F7941D; }
          .stat-label { font-size: 11px; color: #666; }
        }
      </style>
      <h1>Relatório de Desempenho — Conexão em Farmacologia</h1>
      <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
      <div>
        <span class="stat"><span class="stat-value">${reportData.totalTeams}</span><br/><span class="stat-label">Equipes</span></span>
        <span class="stat"><span class="stat-value">${reportData.totalStudents}</span><br/><span class="stat-label">Alunos</span></span>
        <span class="stat"><span class="stat-value">${reportData.totalActivities}</span><br/><span class="stat-label">Atividades</span></span>
      </div>
      <h2>Desempenho por Equipe</h2>
      <table>
        <thead><tr><th>Equipe</th><th>Membros</th><th>PF Total</th><th>PF Médio</th></tr></thead>
        <tbody>
          ${reportData.teams.map((t: any) => `<tr><td>${t.name}</td><td>${t.members}</td><td>${t.pf.toFixed(1)}</td><td>${(t.pf / (t.members || 1)).toFixed(1)}</td></tr>`).join("")}
        </tbody>
      </table>
      <h2>Atividades Avaliativas</h2>
      <table>
        <thead><tr><th>Atividade</th><th>Pontuação Máxima</th></tr></thead>
        <tbody>
          ${reportData.activities.map((a: any) => `<tr><td>${a.name}</td><td>${a.pontos}</td></tr>`).join("")}
        </tbody>
      </table>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        toast.success("Relatório gerado! Use 'Salvar como PDF' na janela de impressão.");
      }, 500);
    } else {
      toast.error("Permita pop-ups para gerar o relatório em PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const COLORS = ["#FF9500", "#1A1A2E", "#00D4FF", "#FFD700", "#FF6B6B", "#4ECDC4"];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Relatórios de Desempenho
            </h1>
            <p className="text-muted-foreground mt-1">Análise completa do desempenho das equipes e alunos</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-secondary border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Equipes</p>
                <p className="text-3xl font-bold text-foreground">{reportData.totalTeams}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl text-primary">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Alunos</p>
                <p className="text-3xl font-bold text-foreground">{reportData.totalStudents}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl text-primary">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Atividades</p>
                <p className="text-3xl font-bold text-foreground">{reportData.totalActivities}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl text-primary">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Barras - PF por Equipe */}
          <div className="bg-secondary border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Pontos por Equipe</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.teams}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "#1A1A2E", border: "1px solid #333" }} />
                <Legend />
                <Bar dataKey="pf" fill="#FF9500" name="Pontos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição de Membros */}
          <div className="bg-secondary border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Distribuição de Alunos por Equipe</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Linha - Atividades */}
        <div className="bg-secondary border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Pontos por Atividade</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.activities}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: "#1A1A2E", border: "1px solid #333" }} />
              <Legend />
              <Line type="monotone" dataKey="pontos" stroke="#FF9500" strokeWidth={2} name="Pontos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
