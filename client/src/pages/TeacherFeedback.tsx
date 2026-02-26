import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle, Clock, AlertCircle, Filter } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";
const ORANGE = "#F7941D";

interface Submission {
  id: number;
  studentName: string;
  studentId: number;
  activityName: string;
  activityId: number;
  submittedAt: string;
  content: string;
  status: "pending" | "reviewed";
  feedback?: string;
  pointsAwarded?: number;
}

export default function TeacherFeedback() {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [pointsText, setPointsText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "reviewed">("pending");

  // Mock submissions data
  const submissions: Submission[] = useMemo(() => [
    {
      id: 1,
      studentName: "João Silva",
      studentId: 1,
      activityName: "Caso Clínico 1",
      activityId: 1,
      submittedAt: "2026-02-25T14:30:00",
      content: "Análise detalhada do caso clínico com diagnóstico diferencial...",
      status: "pending",
    },
    {
      id: 2,
      studentName: "Maria Santos",
      studentId: 2,
      activityName: "Seminário Jigsaw",
      activityId: 2,
      submittedAt: "2026-02-24T10:15:00",
      content: "Apresentação sobre farmacocinética de antibióticos...",
      status: "pending",
    },
    {
      id: 3,
      studentName: "Pedro Costa",
      studentId: 3,
      activityName: "Quiz Interativo",
      activityId: 3,
      submittedAt: "2026-02-23T16:45:00",
      content: "Respostas do quiz sobre interações medicamentosas",
      status: "reviewed",
      feedback: "Excelente desempenho! Continue assim.",
      pointsAwarded: 4.5,
    },
  ], []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => filterStatus === "all" || s.status === filterStatus);
  }, [submissions, filterStatus]);

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission || !feedbackText.trim()) {
      toast.error("Preencha o feedback antes de enviar");
      return;
    }

    try {
      const points = pointsText ? parseFloat(pointsText) : 0;
      
      // In production, call tRPC endpoint
      // await trpc.teacherFeedback.submitFeedback.useMutation({
      //   submissionId: selectedSubmission.id,
      //   feedback: feedbackText,
      //   pointsAwarded: points,
      // });

      toast.success("Feedback enviado com sucesso!");
      setSelectedSubmission(null);
      setFeedbackText("");
      setPointsText("");
    } catch (error) {
      toast.error("Erro ao enviar feedback");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK_BG }}>
        <div className="text-center">
          <p className="text-white/60">Acesso restrito a professores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: DARK_BG }}>
      {/* Header */}
      <div className="border-b" style={{ backgroundColor: CARD_BG, borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-3 sm:py-4 2xl:py-6">
          <div className="flex items-center gap-3">
            <Link href="/professor/dashboard">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-white/60" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl 2xl:text-2xl font-bold text-white">Avaliar Atividades</h1>
              <p className="text-sm text-white/60">Revise submissões e forneça feedback</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 2xl:px-8 py-6 sm:py-8 2xl:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1">
            {/* Filter */}
            <div className="mb-4 flex gap-2">
              {(["pending", "reviewed", "all"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: filterStatus === status ? ORANGE : "rgba(255,255,255,0.05)",
                    color: filterStatus === status ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {status === "pending" ? "Pendentes" : status === "reviewed" ? "Revisadas" : "Todas"}
                </button>
              ))}
            </div>

            {/* Submissions */}
            <motion.div
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredSubmissions.map((submission) => (
                <motion.button
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className="w-full text-left p-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: selectedSubmission?.id === submission.id ? ORANGE + "20" : CARD_BG,
                    border: `1px solid ${selectedSubmission?.id === submission.id ? ORANGE + "50" : "rgba(255,255,255,0.1)"}`,
                  }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{submission.studentName}</div>
                      <div className="text-xs text-white/60 truncate">{submission.activityName}</div>
                      <div className="text-xs text-white/40 mt-1">
                        {new Date(submission.submittedAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    {submission.status === "pending" ? (
                      <Clock size={16} className="text-yellow-500 flex-shrink-0 mt-1" />
                    ) : (
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Submission Details */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <motion.div
                className="rounded-lg p-4 sm:p-6"
                style={{ backgroundColor: CARD_BG, border: `1px solid ${ORANGE}30` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white">{selectedSubmission.studentName}</h2>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: selectedSubmission.status === "pending" ? "rgba(234,179,8,0.2)" : "rgba(34,197,94,0.2)",
                        color: selectedSubmission.status === "pending" ? "#FACC15" : "#22C55E",
                      }}
                    >
                      {selectedSubmission.status === "pending" ? "Pendente" : "Revisada"}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">{selectedSubmission.activityName}</p>
                  <p className="text-xs text-white/40 mt-1">
                    Enviado em {new Date(selectedSubmission.submittedAt).toLocaleString("pt-BR")}
                  </p>
                </div>

                {/* Submission Content */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <h3 className="text-sm font-medium text-white/80 mb-2">Resposta do Aluno</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{selectedSubmission.content}</p>
                </div>

                {/* Feedback Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Feedback</label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Escreva seu feedback para o aluno..."
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/40"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)` }}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Pontos (0-5)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={pointsText}
                      onChange={(e) => setPointsText(e.target.value)}
                      placeholder="Ex: 4.5"
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/40"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)` }}
                    />
                  </div>

                  <button
                    onClick={handleSubmitFeedback}
                    className="w-full px-4 py-2 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: ORANGE }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <Send size={16} />
                    Enviar Feedback
                  </button>
                </div>

                {/* Previous Feedback */}
                {selectedSubmission.feedback && (
                  <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)" }}>
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <h4 className="text-sm font-medium text-white">Feedback Anterior</h4>
                    </div>
                    <p className="text-sm text-white/60">{selectedSubmission.feedback}</p>
                    {selectedSubmission.pointsAwarded && (
                      <p className="text-sm text-green-400 mt-2 font-mono">
                        Pontos: {selectedSubmission.pointsAwarded}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="rounded-lg p-8 text-center" style={{ backgroundColor: CARD_BG }}>
                <AlertCircle size={40} className="mx-auto mb-4 text-white/40" />
                <p className="text-white/60">Selecione uma submissão para revisar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
