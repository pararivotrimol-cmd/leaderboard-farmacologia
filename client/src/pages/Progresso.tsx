import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useStudentAuth } from "./StudentLogin";
import {
  CheckCircle2, Circle, Lock, Trophy, Target, Zap,
  GraduationCap, Pill, Brain, Activity, FlaskConical
} from "lucide-react";
import { Link } from "wouter";

/**
 * Timeline interativa de progresso visual para alunos
 * Mostra as 17 semanas do cronograma com status de conclusão
 */

const TIMELINE_DATA = [
  { week: 1, title: "Apresentação + Farmacocinética I", icon: GraduationCap, color: "#10b981" },
  { week: 2, title: "Farmacocinética II", icon: Pill, color: "#3b82f6" },
  { week: 3, title: "Farmacodinâmica", icon: Brain, color: "#8b5cf6" },
  { week: 4, title: "Boas Práticas Prescritivas", icon: Brain, color: "#ec4899" },
  { week: 5, title: "SNA — Transmissão Colinérgica", icon: Activity, color: "#f59e0b" },
  { week: 6, title: "SNA — Bloqueadores Neuromusculares", icon: Activity, color: "#ef4444" },
  { week: 7, title: "JIGSAW 1 — Seminários", icon: Target, color: "#14b8a6", highlight: true },
  { week: 8, title: "Prova P1 + Escape Room", icon: Zap, color: "#f97316", highlight: true },
  { week: 9, title: "SNA — Transmissão Adrenérgica", icon: FlaskConical, color: "#06b6d4" },
  { week: 10, title: "SNA — Anti-adrenérgicos", icon: FlaskConical, color: "#0ea5e9" },
  { week: 11, title: "Anti-inflamatórios + Antitérmicos + Corticoides", icon: Brain, color: "#8b5cf6" },
  { week: 12, title: "Anestésicos Locais", icon: Pill, color: "#3b82f6" },
  { week: 13, title: "Anti-histamínicos", icon: Pill, color: "#10b981" },
  { week: 14, title: "JIGSAW 2 — Seminários", icon: Target, color: "#14b8a6", highlight: true },
  { week: 15, title: "Prova P2", icon: Zap, color: "#f97316", highlight: true },
  { week: 16, title: "Segunda Chamada P2", icon: Zap, color: "#ef4444" },
  { week: 17, title: "Prova Final + Premiação", icon: Trophy, color: "#facc15", highlight: true },
];

export default function Progresso() {
  const { student: studentAuth, isLoading: authLoading } = useStudentAuth();
  const [currentWeek] = useState(7); // TODO: Calcular semana atual baseada na data

  // TODO: Implementar queries para badges e presença do aluno
  // Por enquanto, usando dados mockados
  const studentBadges: Array<{ week: number }> = [];
  const attendanceData: Array<{ week: number }> = [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando progresso...</p>
        </div>
      </div>
    );
  }

  if (!studentAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-display font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">
            Você precisa estar logado como aluno para visualizar seu progresso.
          </p>
          <Link href="/login-aluno">
            <a className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition">
              Fazer Login
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const completedWeeks = new Set(studentBadges.map((b: { week: number }) => b.week));
  const attendedWeeks = new Set(attendanceData.map((a: { week: number }) => a.week));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} className="text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Meu Progresso
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground">
            Jornada Farmacológica
          </h1>
          <p className="mt-2 text-muted-foreground">
            Acompanhe seu progresso ao longo das 17 semanas do semestre
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            className="border border-border rounded-lg p-4 bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{completedWeeks.size}</div>
                <div className="text-sm text-muted-foreground">Semanas Concluídas</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="border border-border rounded-lg p-4 bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy size={24} className="text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{studentBadges?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Badges Conquistados</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="border border-border rounded-lg p-4 bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{attendedWeeks.size}</div>
                <div className="text-sm text-muted-foreground">Presenças Registradas</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Timeline */}
      <div className="container pb-12">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          {/* Timeline items */}
          <div className="space-y-8">
            {TIMELINE_DATA.map((item, index) => {
              const isCompleted = completedWeeks.has(item.week);
              const isCurrent = item.week === currentWeek;
              const isLocked = item.week > currentWeek;
              const hasAttendance = attendedWeeks.has(item.week);
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.week}
                  className="relative pl-20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  {/* Icon circle */}
                  <div
                    className={`absolute left-0 w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                      isCompleted
                        ? "bg-primary border-primary"
                        : isCurrent
                        ? "bg-background border-primary animate-pulse"
                        : isLocked
                        ? "bg-muted border-border"
                        : "bg-background border-border"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={28} className="text-primary-foreground" />
                    ) : isLocked ? (
                      <Lock size={28} className="text-muted-foreground" />
                    ) : (
                      <Icon size={28} className={isCurrent ? "text-primary" : "text-muted-foreground"} />
                    )}
                  </div>

                  {/* Content card */}
                  <div
                    className={`border rounded-lg p-4 transition-all ${
                      isCompleted
                        ? "border-primary/30 bg-primary/5"
                        : isCurrent
                        ? "border-primary bg-card shadow-lg"
                        : isLocked
                        ? "border-border bg-muted/30"
                        : "border-border bg-card"
                    } ${item.highlight ? "ring-2 ring-primary/20" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-medium text-muted-foreground">
                            SEMANA {item.week}
                          </span>
                          {isCurrent && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                              ATUAL
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                              CONCLUÍDA
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {hasAttendance && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                              <span>Presença confirmada</span>
                            </div>
                          )}
                          {isCompleted && (
                            <div className="flex items-center gap-1">
                              <Trophy size={14} className="text-amber-600 dark:text-amber-400" />
                              <span>Badge conquistado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
