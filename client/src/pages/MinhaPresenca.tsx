import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar, CheckCircle, AlertCircle, Loader2, ArrowLeft, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function MinhaPresenca() {
  const [, setLocation] = useLocation();
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Get session token from localStorage
  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      toast.error("Você precisa estar logado");
      setLocation("/");
      return;
    }
    setSessionToken(token);
  }, [setLocation]);

  // Get attendance history
  const { data: attendanceData, isLoading: historyLoading } = trpc.attendance.getMyAttendance.useQuery(
    undefined,
    { enabled: !!sessionToken }
  );

  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const attendance = attendanceData?.attendance || [];
  const total = attendanceData?.total || 0;
  const valid = attendance.filter(a => a.status === "valid").length;
  const invalid = attendance.filter(a => a.status === "invalid").length;
  const manual = attendance.filter(a => a.status === "manual").length;
  const frequency = total > 0 ? ((valid / total) * 100).toFixed(1) : "0";

  // Group attendance by week
  const attendanceByWeek = attendance.reduce((acc: any, record: any) => {
    const week = record.week || 1;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(record);
    return acc;
  }, {});

  // Get weeks array
  const weeks = Object.keys(attendanceByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/leaderboard")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <h1 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Minha Presença
          </h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Frequency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Frequência</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{frequency}%</div>
            <p className="text-xs text-muted-foreground mt-1">{valid} de {total} aulas</p>
          </motion.div>

          {/* Total Attended */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Presentes</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{valid}</div>
            <p className="text-xs text-muted-foreground mt-1">Aulas confirmadas</p>
          </motion.div>

          {/* Absences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Faltas</span>
            </div>
            <div className="text-2xl font-bold text-red-500">{invalid}</div>
            <p className="text-xs text-muted-foreground mt-1">Aulas não confirmadas</p>
          </motion.div>

          {/* Manual Check-in */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Manual</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{manual}</div>
            <p className="text-xs text-muted-foreground mt-1">Registradas pelo professor</p>
          </motion.div>
        </div>

        {/* Frequency Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 rounded-lg border border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Taxa de Frequência</h3>
            <span className="text-sm font-bold text-primary">{frequency}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${frequency}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {frequency === "100" ? "✓ Frequência perfeita!" : `Você precisa de ${Math.ceil(total * 0.75) - valid} mais presenças para atingir 75%`}
          </p>
        </motion.div>

        {/* Attendance by Week */}
        {historyLoading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} />
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        ) : attendance.length > 0 ? (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg text-foreground">Histórico por Semana</h2>
            {weeks.map((week, weekIdx) => (
              <motion.div
                key={week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + weekIdx * 0.05 }}
                className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">Semana {week}</h3>
                  <div className="flex items-center gap-2">
                    {attendanceByWeek[week].map((record: any, idx: number) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          record.status === "valid"
                            ? "bg-green-500"
                            : record.status === "manual"
                            ? "bg-blue-500"
                            : "bg-red-500"
                        }`}
                        title={record.status}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {attendanceByWeek[week].map((record: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {record.status === "valid" && (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                        {record.status === "manual" && (
                          <Calendar size={16} className="text-blue-500" />
                        )}
                        {record.status === "invalid" && (
                          <AlertCircle size={16} className="text-red-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium">
                            {new Date(record.classDate).toLocaleDateString("pt-BR", {
                              weekday: "long",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.checkedInAt).toLocaleTimeString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground capitalize">
                          {record.status === "valid"
                            ? "Confirmada"
                            : record.status === "manual"
                            ? "Manual"
                            : "Falta"}
                        </p>
                        {record.distanceMeters && (
                          <p className="text-xs text-muted-foreground">
                            {record.distanceMeters}m
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle size={32} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum registro de presença encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
