import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangle, Download, BarChart3, Target } from "lucide-react";
import { toast } from "sonner";

export default function ResultsDashboard() {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "fraud">("overview");

  // Fetch results
  const { data: results = [], isLoading: resultsLoading } = trpc.results.getAssessmentResults.useQuery(
    { assessmentId: selectedAssessmentId || 0 },
    { enabled: !!selectedAssessmentId }
  );

  // Fetch class statistics
  const { data: stats } = trpc.results.getClassStatistics.useQuery(
    { assessmentId: selectedAssessmentId || 0 },
    { enabled: !!selectedAssessmentId }
  );

  // Fetch question performance
  const { data: questionPerformance = [] } = trpc.results.getQuestionPerformance.useQuery(
    { assessmentId: selectedAssessmentId || 0 },
    { enabled: !!selectedAssessmentId }
  );

  // Fetch fraud detection
  const { data: fraudData = [] } = trpc.results.getFraudDetectionReport.useQuery(
    { assessmentId: selectedAssessmentId || 0 },
    { enabled: !!selectedAssessmentId }
  );

  const handleExportClick = async () => {
    if (!selectedAssessmentId) {
      toast.error("Selecione uma prova");
      return;
    }
    toast.success("Exportação em desenvolvimento");
  };

  const scoreDistributionData = stats
    ? [
        { name: "Excelente (90+)", value: stats.scoreDistribution.excellent },
        { name: "Bom (80-89)", value: stats.scoreDistribution.good },
        { name: "Médio (70-79)", value: stats.scoreDistribution.average },
        { name: "Fraco (60-69)", value: stats.scoreDistribution.poor },
        { name: "Reprovado (<60)", value: stats.scoreDistribution.failed },
      ]
    : [];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#dc2626"];

  const questionData = (questionPerformance as any[]).map((q: any) => ({
    name: q.questionTitle.substring(0, 20),
    correctRate: parseFloat(q.correctRate),
    difficulty: q.difficulty,
  }));

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">
          Dashboard de Resultados
        </h1>
        <p className="text-muted-foreground">
          Análise detalhada de desempenho, questões e detecção de fraude
        </p>
      </div>

      {/* Selection and Export */}
      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Selecionar Prova
          </label>
          <Select
            value={selectedAssessmentId?.toString() || ""}
            onValueChange={(v) => setSelectedAssessmentId(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma prova..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Prova 1 - Farmacologia I</SelectItem>
              <SelectItem value="2">Prova 2 - Farmacologia I</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExportClick} disabled={!selectedAssessmentId} className="gap-2">
          <Download size={18} />
          Exportar CSV
        </Button>
      </div>

      {!selectedAssessmentId ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Selecione uma prova para visualizar resultados</p>
        </Card>
      ) : resultsLoading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-3">Carregando dados...</p>
        </Card>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="inline mr-2" size={18} />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "questions"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Target className="inline mr-2" size={18} />
              Questões
            </button>
            <button
              onClick={() => setActiveTab("fraud")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "fraud"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangle className="inline mr-2" size={18} />
              Fraude ({fraudData.length})
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && stats && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total de Alunos</div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Média</div>
                  <div className="text-2xl font-bold text-foreground">{stats.averageScore}%</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Maior Nota</div>
                  <div className="text-2xl font-bold text-green-600">{stats.highestScore}%</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Menor Nota</div>
                  <div className="text-2xl font-bold text-red-600">{stats.lowestScore}%</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Mediana</div>
                  <div className="text-2xl font-bold text-foreground">{stats.medianScore}%</div>
                </Card>
              </div>

              {/* Score Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Distribuição de Notas</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={scoreDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {scoreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Estatísticas de Segurança</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Submissões Suspeitas</span>
                        <span className="font-semibold text-foreground">{stats.suspiciousSubmissions}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${
                              stats.totalStudents > 0
                                ? (stats.suspiciousSubmissions / stats.totalStudents) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {stats.suspiciousSubmissions === 0
                          ? "✅ Nenhuma atividade suspeita detectada"
                          : `⚠️ ${stats.suspiciousSubmissions} submissão(ões) com atividade suspeita`}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Results Table */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Resultados por Aluno</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-foreground">Aluno</th>
                        <th className="text-center py-2 px-3 font-semibold text-foreground">Nota</th>
                        <th className="text-center py-2 px-3 font-semibold text-foreground">Acertos</th>
                        <th className="text-center py-2 px-3 font-semibold text-foreground">
                          Eventos Suspeitos
                        </th>
                        <th className="text-center py-2 px-3 font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(results as any[]).map((r: any) => (
                        <tr key={r.submissionId} className="border-b border-border hover:bg-secondary/50">
                          <td className="py-2 px-3 text-foreground">{r.studentName}</td>
                          <td className="py-2 px-3 text-center font-semibold text-foreground">{r.score}%</td>
                          <td className="py-2 px-3 text-center text-muted-foreground">
                            {r.correctAnswers}/{r.totalQuestions}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {r.flaggedEvents > 0 ? (
                              <span className="text-red-600 font-semibold">{r.flaggedEvents}</span>
                            ) : (
                              <span className="text-green-600">0</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {r.suspiciousActivity ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-600">
                                ⚠️ Suspeito
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                                ✓ Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Taxa de Acerto por Questão</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={questionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="correctRate" fill="#10b981" name="Taxa de Acerto (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Questões Difíceis</h3>
                <div className="space-y-2">
                  {(questionPerformance as any[])
                    .filter((q: any) => q.isHard)
                    .map((q: any) => (
                      <div key={q.questionId} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{q.questionTitle}</p>
                            <p className="text-sm text-muted-foreground">Taxa de acerto: {q.correctRate}%</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-600">
                            Difícil
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}

          {/* Fraud Tab */}
          {activeTab === "fraud" && (
            <div className="space-y-4">
              {fraudData.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertTriangle className="mx-auto mb-3 text-green-600" size={32} />
                  <p className="text-muted-foreground">Nenhuma atividade suspeita detectada</p>
                </Card>
              ) : (
                (fraudData as any[]).map((fraud: any) => (
                  <Card key={fraud.submissionId} className="p-6 border-red-500/20 bg-red-500/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{fraud.studentName}</h4>
                        <p className="text-sm text-muted-foreground">ID: {fraud.studentId}</p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          fraud.severity === "critical"
                            ? "bg-red-500/20 text-red-600"
                            : fraud.severity === "warning"
                            ? "bg-yellow-500/20 text-yellow-600"
                            : "bg-blue-500/20 text-blue-600"
                        }`}
                      >
                        {fraud.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Eventos Suspeitos: {fraud.totalFlaggedEvents}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(fraud.eventTypes).map(([event, count]: any) => (
                          <span
                            key={event}
                            className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground"
                          >
                            {event}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
