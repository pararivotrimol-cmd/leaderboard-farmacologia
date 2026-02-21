import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Send,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

export default function TakeAssessment() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [, navigate] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [focusLost, setFocusLost] = useState(false);
  const [lockdownActive, setLockdownActive] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const windowRef = useRef<Window | null>(null);

  // Fetch assessment
  const { data: assessment, isLoading } = trpc.assessments.getAssessment.useQuery(
    { id: parseInt(assessmentId || "0") },
    { enabled: !!assessmentId }
  );

  // Start assessment mutation
  const startMutation = trpc.assessments.startAssessment.useMutation({
    onSuccess: (data) => {
      setLockdownActive(true);
      if (assessment?.assessment.enableLockdown) {
        enableLockdown();
      }
    },
    onError: (error) => {
      toast.error(`Erro ao iniciar: ${error.message}`);
      navigate("/", { replace: true });
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = trpc.assessments.submitAnswer.useMutation({
    onError: (error) => {
      toast.error(`Erro ao enviar resposta: ${error.message}`);
    },
  });

  // Submit assessment mutation
  const submitAssessmentMutation = trpc.assessments.submitAssessment.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.passed
          ? `Aprovado! Pontuação: ${data.percentage.toFixed(1)}%`
          : `Não aprovado. Pontuação: ${data.percentage.toFixed(1)}%`
      );
      disableLockdown();
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    },
  });

  // Log focus loss mutation
  const logFocusLossMutation = trpc.assessments.logFocusLoss.useMutation();

  // Initialize assessment
  useEffect(() => {
    if (assessment && !lockdownActive) {
      const ipAddress = "127.0.0.1"; // In production, get real IP
      const userAgent = navigator.userAgent;
      startMutation.mutate({ assessmentId: parseInt(assessmentId || "0"), ipAddress, userAgent });
    }
  }, [assessment, lockdownActive, assessmentId]);

  // Set timer
  useEffect(() => {
    if (assessment && lockdownActive) {
      setTimeRemaining(assessment.assessment.timePerQuestion);
    }
  }, [assessment, currentQuestion, lockdownActive]);

  // Timer countdown
  useEffect(() => {
    if (lockdownActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        if (timeRemaining === 60) {
          toast.warning("1 minuto restante!");
        }
        if (timeRemaining === 10) {
          setShowWarning(true);
        }
      }, 1000);
    } else if (timeRemaining === 0 && lockdownActive && assessment) {
      // Auto-advance to next question
      if (currentQuestion < (assessment.questions?.length || 0) - 1) {
        handleNextQuestion();
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeRemaining, lockdownActive, currentQuestion, assessment]);

  // Lockdown mode - prevent tab switching, right-click, etc
  const enableLockdown = () => {
    windowRef.current = window;

    // Prevent tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocusLost(true);
        logFocusLossMutation.mutate({
          submissionId: 0, // TODO: get from submission
          eventType: "tab_switched",
          details: "Aluno trocou de aba",
        });
      }
    };

    // Prevent focus loss
    const handleBlur = () => {
      setFocusLost(true);
      logFocusLossMutation.mutate({
        submissionId: 0,
        eventType: "focus_lost",
        details: "Janela perdeu foco",
      });
    };

    const handleFocus = () => {
      if (focusLost) {
        logFocusLossMutation.mutate({
          submissionId: 0,
          eventType: "focus_regained",
          details: "Janela recuperou foco",
        });
      }
      setFocusLost(false);
    };

    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error("Clique direito desabilitado durante a prova");
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+C, etc
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.shiftKey && e.key === "J")
      ) {
        e.preventDefault();
        toast.error("Ferramentas de desenvolvimento desabilitadas");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  };

  const disableLockdown = () => {
    // Cleanup lockdown listeners
  };

  const handleAnswerChange = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (assessment?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowWarning(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0 && assessment?.assessment.allowRetrocess) {
      setCurrentQuestion(currentQuestion - 1);
      setShowWarning(false);
    } else if (currentQuestion > 0 && !assessment?.assessment.allowRetrocess) {
      toast.error("Retrocesso não permitido nesta prova");
    }
  };

  const handleSubmitAssessment = async () => {
    if (Object.keys(answers).length < (assessment?.questions?.length || 0)) {
      toast.error("Responda todas as questões antes de enviar");
      return;
    }
    setShowSubmitConfirm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando atividade...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="mx-auto mb-3 text-destructive" size={32} />
          <p className="text-muted-foreground">Atividade não encontrada</p>
          <Button onClick={() => navigate("/", { replace: true })} className="mt-4">
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  const question = assessment.questions?.[currentQuestion];
  const progress = ((currentQuestion + 1) / (assessment.questions?.length || 1)) * 100;
  const isLastQuestion = currentQuestion === (assessment.questions?.length || 0) - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Lockdown Warning */}
      {focusLost && (
        <div className="fixed top-0 left-0 right-0 bg-destructive/10 border-b border-destructive/50 p-3 flex items-center gap-2 z-50">
          <AlertTriangle size={18} className="text-destructive" />
          <span className="text-sm text-destructive font-medium">
            Você saiu da janela. Atividade será encerrada se continuar.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container max-w-4xl py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              {assessment.assessment.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Questão {currentQuestion + 1} de {assessment.questions?.length}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining <= 10
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-foreground"
              }`}
            >
              <Clock size={18} />
              <span className="font-mono font-bold">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
              </span>
            </div>

            {/* Lockdown Status */}
            {assessment.assessment.enableLockdown && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm">
                {lockdownActive ? (
                  <>
                    <Lock size={16} />
                    Lockdown Ativo
                  </>
                ) : (
                  <>
                    <LockOpen size={16} />
                    Lockdown Inativo
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="container max-w-4xl pb-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl py-8">
        {question ? (
          <Card className="p-8">
            {/* Question */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {question.question}
              </h2>
              <p className="text-sm text-muted-foreground">
                Valor: {question.points} ponto{Number(question.points) !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {question.questionType === "multiple_choice" &&
                question.options &&
                JSON.parse(question.options as string).map((option: string, idx: number) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option}
                      checked={answers[currentQuestion] === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">{option}</span>
                  </label>
                ))}

              {question.questionType === "essay" && (
                <textarea
                  value={answers[currentQuestion] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className="w-full p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={6}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0 || !assessment.assessment.allowRetrocess}
                className="gap-2"
              >
                <ChevronLeft size={18} />
                Anterior
              </Button>

              <div className="flex gap-3">
                {!isLastQuestion ? (
                  <Button
                    onClick={handleNextQuestion}
                    className="gap-2"
                  >
                    Próxima
                    <ChevronRight size={18} />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitAssessment}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Send size={18} />
                    Enviar Prova
                  </Button>
                )}
              </div>
            </div>

            {/* Explanation (if available) */}
            {question.explanation && (
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Dica:</strong> {question.explanation}
                </p>
              </div>
            )}
          </Card>
        ) : null}
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Envio</AlertDialogTitle>
            <AlertDialogDescription>
              Você respondeu {Object.keys(answers).length} de {assessment.questions?.length}{" "}
              questões. Tem certeza que deseja enviar a prova?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                submitAssessmentMutation.mutate({ submissionId: 0 }); // TODO: get real submission ID
              }}
            >
              Enviar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Warning Dialog */}
      {showWarning && (
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                Tempo Acabando
              </AlertDialogTitle>
              <AlertDialogDescription>
                Você tem apenas 10 segundos para responder esta questão.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={() => setShowWarning(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// Icon components
function Lock({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LockOpen({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9 0" />
    </svg>
  );
}
