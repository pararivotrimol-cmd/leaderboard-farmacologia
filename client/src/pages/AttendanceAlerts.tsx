import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useAttendanceWebSocket } from "@/hooks/useAttendanceWebSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageSquare, CheckCircle2, Clock, Search, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AttendanceAlerts() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  // WebSocket for real-time notifications
  const { isConnected } = useAttendanceWebSocket(selectedClass, !!user && !authLoading, (notification) => {
    setRecentNotifications((prev) => [notification, ...prev.slice(0, 9)]);
  });

  // Fetch at-risk students
  const { data: attendanceSummary, isLoading: summaryLoading } = trpc.attendanceReportsDetailed.getClassAttendanceSummary.useQuery(
    { classId: selectedClass },
    { enabled: !!user && !authLoading }
  );

  // Filter at-risk students
  const atRiskStudents = useMemo(() => {
    if (!attendanceSummary?.attendanceData) return [];

    return attendanceSummary.attendanceData
      .filter((s: any) => s.isAtRisk)
      .filter((s: any) => s.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a: any, b: any) => a.attendanceRate - b.attendanceRate);
  }, [attendanceSummary?.attendanceData, searchTerm]);

  const handleSendMessage = (studentName: string) => {
    toast.info(`Abrindo chat com ${studentName}...`);
    // TODO: Implement direct messaging
  };

  const handleJustify = (studentName: string) => {
    toast.info(`Abrindo justificativa para ${studentName}...`);
    // TODO: Implement justification workflow
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Alertas de Presença
              </h1>
              <p className="text-muted-foreground">
                Alunos em risco de reprovação por falta
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-green-600 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Desconectado
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Notifications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Últimas Presenças</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma presença registrada
                    </p>
                  ) : (
                    recentNotifications.map((notif, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 bg-secondary/50 rounded-lg border border-border"
                      >
                        <div className="flex items-start gap-2">
                          {notif.status === "present" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notif.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notif.timestamp).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* At-Risk Students */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg mb-4">
                  Alunos em Risco ({atRiskStudents.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : atRiskStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Nenhum aluno em risco no momento
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {atRiskStudents.map((student: any, idx: number) => (
                      <motion.div
                        key={student.memberId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                              <h3 className="font-semibold text-foreground truncate">
                                {student.studentName}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {student.studentEmail}
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium">Taxa de Presença</span>
                                <span className="text-sm font-bold text-red-600">
                                  {student.attendanceRate}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-red-200 dark:bg-red-900/30 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-600 transition-all"
                                  style={{ width: `${student.attendanceRate}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                <span>{student.presentDays} presentes</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-yellow-600" />
                                <span>{student.totalDays} total</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendMessage(student.studentName)}
                              className="whitespace-nowrap"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Mensagem
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleJustify(student.studentName)}
                              className="whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Justificar
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Statistics */}
        {attendanceSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Média de Presença
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {attendanceSummary.statistics.averageAttendance}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Em Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {attendanceSummary.statistics.atRiskCount}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Excelente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {attendanceSummary.statistics.excellentCount}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
