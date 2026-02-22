import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BarChart3, Users, CheckCircle, AlertCircle, TrendingUp, Calendar, ArrowLeft } from "lucide-react";

interface AttendanceStats {
  totalSessions: number;
  totalRecords: number;
  averageAttendance: number;
  studentsAtRisk: number;
}

export default function AttendanceDashboard() {
  const [classId, setClassId] = useState<number | null>(null);
  const [classInput, setClassInput] = useState<string>("");

  const { data: reportData, isLoading } = trpc.qrcode.getClassAttendanceReport.useQuery(
    { classId: classId || 0 },
    { enabled: classId !== null && classId > 0 }
  );

  const stats = useMemo((): AttendanceStats => {
    if (!reportData) {
      return { totalSessions: 0, totalRecords: 0, averageAttendance: 0, studentsAtRisk: 0 };
    }

    const totalRecords = reportData.length;
    const validRecords = reportData.reduce((sum, r) => sum + r.presentSessions, 0);
    const totalSessions = reportData.reduce((sum, r) => sum + r.totalSessions, 0);
    const averageAttendance = totalSessions > 0 ? (validRecords / totalSessions) * 100 : 0;

    let studentsAtRisk = 0;
    reportData.forEach(({ presentSessions, totalSessions: total }) => {
      const percentage = (presentSessions / total) * 100;
      if (percentage < 75) studentsAtRisk += 1;
    });

    return { 
      totalSessions: reportData.length > 0 ? reportData[0].totalSessions : 0, 
      totalRecords, 
      averageAttendance, 
      studentsAtRisk 
    };
  }, [reportData]);

  const handleSelectClass = () => {
    const id = parseInt(classInput);
    if (id > 0) {
      setClassId(id);
    } else {
      alert("Digite um ID de turma válido");
    }
  };

  const handleReset = () => {
    setClassId(null);
    setClassInput("");
  };

  if (!classId) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={28} className="text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Dashboard de Presença</h1>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">ID da Turma</label>
                <Input 
                  type="number" 
                  value={classInput} 
                  onChange={(e) => setClassInput(e.target.value)} 
                  placeholder="Digite o ID da turma" 
                  className="bg-background text-foreground border-border" 
                />
              </div>
              <Button 
                onClick={handleSelectClass} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Visualizar Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-3">
                <BarChart3 size={28} className="text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dashboard de Presença</h1>
                  <p className="text-sm text-muted-foreground">Turma #{classId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Carregando dados...</p>
          </Card>
        ) : !reportData || reportData.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle size={32} className="mx-auto mb-4 text-yellow-500" />
            <p className="text-foreground font-semibold mb-2">Nenhum registro de presença encontrado</p>
            <p className="text-muted-foreground text-sm">Crie uma sessão de QR Code e registre presenças para visualizar dados</p>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Sessões</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalSessions}</p>
                  </div>
                  <Calendar size={32} className="text-primary opacity-20" />
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Registros</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalRecords}</p>
                  </div>
                  <Users size={32} className="text-primary opacity-20" />
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Média de Presença</p>
                    <p className="text-3xl font-bold text-foreground">{stats.averageAttendance.toFixed(1)}%</p>
                  </div>
                  <TrendingUp size={32} className="text-green-500 opacity-20" />
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Alunos em Risco</p>
                    <p className="text-3xl font-bold text-foreground">{stats.studentsAtRisk}</p>
                  </div>
                  <AlertCircle size={32} className="text-red-500 opacity-20" />
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                <Users size={24} className="text-primary" />
                Presença por Aluno
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Matrícula</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Presenças</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Percentual</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((record) => {
                      const percentage = (record.presentSessions / record.totalSessions) * 100;
                      const isAtRisk = percentage < 75;
                      return (
                        <tr key={record.memberId} className="border-b border-border hover:bg-background/50 transition">
                          <td className="py-3 px-4 text-foreground font-mono">#{record.memberId}</td>
                          <td className="py-3 px-4 text-foreground font-semibold">{record.presentSessions}</td>
                          <td className="py-3 px-4 text-muted-foreground">{record.totalSessions}</td>
                          <td className="py-3 px-4 text-foreground font-semibold">{percentage.toFixed(1)}%</td>
                          <td className="py-3 px-4">
                            {isAtRisk ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                <AlertCircle size={14} /> Em Risco
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                <CheckCircle size={14} /> OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>ℹ️ Informação:</strong> Alunos com menos de 75% de presença são marcados como "Em Risco". Considere entrar em contato com esses alunos para oferecer suporte.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
