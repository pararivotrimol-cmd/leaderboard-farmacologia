import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";

interface CombatQuestion {
  id: number;
  text: string;
  alternatives: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId: string;
  npcName: string;
  npcType: string;
}

interface CombatInterfaceProps {
  isOpen: boolean;
  question: CombatQuestion | null;
  timePerQuestion: number; // segundos
  onAnswer: (answerId: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function CombatInterface({
  isOpen,
  question,
  timePerQuestion,
  onAnswer,
  onClose,
  isLoading = false,
}: CombatInterfaceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Timer
  useEffect(() => {
    if (!isOpen || !question || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Tempo acabou - resposta incorreta
          setIsCorrect(false);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, question, showResult]);

  // Reset quando a questão muda
  useEffect(() => {
    if (question) {
      setTimeLeft(timePerQuestion);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  }, [question, timePerQuestion]);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !question) return;

    const correct = selectedAnswer === question.correctAnswerId;
    setIsCorrect(correct);
    setShowResult(true);

    // Aguardar feedback antes de enviar
    setTimeout(() => {
      onAnswer(selectedAnswer);
    }, 2000);
  };

  const timePercentage = (timeLeft / timePerQuestion) * 100;
  const isTimeWarning = timeLeft <= 10;

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Combate com {question.npcName}</span>
            <div className="flex items-center gap-2 text-sm font-normal">
              <Clock size={16} />
              <span className={isTimeWarning ? "text-destructive font-bold" : ""}>
                {timeLeft}s
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barra de tempo */}
          <div className="space-y-2">
            <Progress
              value={timePercentage}
              className="h-2"
              style={{
                backgroundColor: isTimeWarning ? "rgb(239, 68, 68)" : "rgb(34, 197, 94)",
              }}
            />
          </div>

          {/* Questão */}
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-lg font-semibold text-foreground mb-4">{question.text}</p>

            {/* Alternativas */}
            <div className="space-y-3">
              {question.alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => !showResult && setSelectedAnswer(alt.id)}
                  disabled={showResult || isLoading}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAnswer === alt.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  } ${
                    showResult
                      ? alt.id === question.correctAnswerId
                        ? "border-green-500 bg-green-500/10"
                        : alt.id === selectedAnswer && !isCorrect
                        ? "border-destructive bg-destructive/10"
                        : ""
                      : ""
                  } disabled:opacity-50`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedAnswer === alt.id
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {selectedAnswer === alt.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-sm">{alt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resultado */}
          {showResult && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                isCorrect
                  ? "bg-green-500/10 border border-green-500 text-green-700"
                  : "bg-destructive/10 border border-destructive text-destructive"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle size={20} />
                  <div>
                    <p className="font-semibold">Parabéns! Resposta correta!</p>
                    <p className="text-sm">+10 PF ganhos</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={20} />
                  <div>
                    <p className="font-semibold">Resposta incorreta!</p>
                    <p className="text-sm">Tente novamente no próximo combate</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            {!showResult ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Desistir
                </Button>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || isLoading || showResult}
                  className="flex-1 gap-2"
                >
                  <Zap size={16} />
                  Enviar Resposta
                </Button>
              </>
            ) : (
              <Button onClick={onClose} className="w-full">
                {isLoading ? "Processando..." : "Próximo Combate"}
              </Button>
            )}
          </div>

          {/* Dica de PF */}
          <div className="text-xs text-muted-foreground text-center">
            💡 Responda corretamente para ganhar Pontos de Farmacologia (PF)
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
