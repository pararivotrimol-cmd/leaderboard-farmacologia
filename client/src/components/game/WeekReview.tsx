import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  boss: "Chefe",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-orange-400",
  boss: "text-red-400",
};

interface WeekReviewProps {
  weekNumber: number;
  weekTitle: string;
  onClose: () => void;
}

export function WeekReview({ weekNumber, weekTitle, onClose }: WeekReviewProps) {
  const [questIndex, setQuestIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const { data: weekQuests, isLoading } = trpc.game.getWeekReviewQuestions.useQuery({ weekNumber });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Carregando revisão...</div>
      </div>
    );
  }

  if (!weekQuests || weekQuests.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="bg-[#1a1f3e] rounded-2xl p-8 max-w-md text-center">
          <p className="text-white mb-4">Nenhuma questão disponível para esta semana.</p>
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    );
  }

  const currentQuest = weekQuests[questIndex];
  const currentQuestion = currentQuest?.questions[questionIndex];
  const totalQuests = weekQuests.length;
  const totalQuestionsInQuest = currentQuest?.questions.length || 1;

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    setShowExplanation(true);
    const isCorrect = answer === currentQuestion?.alternatives.find((a: any) => a.isCorrect)?.id;
    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    setShowExplanation(false);
    // Move to next question within quest, or next quest
    if (questionIndex < totalQuestionsInQuest - 1) {
      setQuestionIndex(prev => prev + 1);
    } else if (questIndex < totalQuests - 1) {
      setQuestIndex(prev => prev + 1);
      setQuestionIndex(0);
    }
  };

  const handlePrev = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    setShowExplanation(false);
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
    } else if (questIndex > 0) {
      setQuestIndex(prev => prev - 1);
      setQuestionIndex(weekQuests[questIndex - 1].questions.length - 1);
    }
  };

  const handleRestart = () => {
    setQuestIndex(0);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
  };

  const isLast = questIndex === totalQuests - 1 && questionIndex === totalQuestionsInQuest - 1;
  const isFirst = questIndex === 0 && questionIndex === 0;

  // Calculate global question number
  const globalQuestionNum = weekQuests
    .slice(0, questIndex)
    .reduce((sum, q) => sum + q.questions.length, 0) + questionIndex + 1;
  const totalGlobalQuestions = weekQuests.reduce((sum, q) => sum + q.questions.length, 0);

  const correctAlt = currentQuestion?.alternatives.find((a: any) => a.isCorrect);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1a1f3e] border border-blue-500/20 rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
              <BookOpen size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">Modo Revisão</p>
              <p className="font-semibold text-white text-sm">Semana {weekNumber} — {weekTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {score.total > 0 && (
              <span className="text-xs text-gray-400">
                {score.correct}/{score.total} corretas
              </span>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="text-gray-400 border-gray-600">
              <ArrowLeft size={14} className="mr-1" /> Sair
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Questão {globalQuestionNum} de {totalGlobalQuestions}</span>
            <span className={DIFFICULTY_COLOR[currentQuest?.difficulty] || "text-gray-400"}>
              {DIFFICULTY_LABEL[currentQuest?.difficulty] || ""} — {currentQuest?.questTitle}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(globalQuestionNum / totalGlobalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-5">
          <p className="text-white text-base leading-relaxed mb-5">{currentQuestion?.description}</p>

          {/* Alternatives */}
          <div className="space-y-2.5">
            {currentQuestion?.alternatives.map((alt: any) => {
              const isSelected = selectedAnswer === alt.id;
              const isCorrectAlt = alt.isCorrect;
              let altClass = "border border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 cursor-pointer";
              if (answered) {
                if (isCorrectAlt) {
                  altClass = "border border-emerald-500 bg-emerald-500/15 text-emerald-300 cursor-default";
                } else if (isSelected && !isCorrectAlt) {
                  altClass = "border border-red-500 bg-red-500/15 text-red-300 cursor-default";
                } else {
                  altClass = "border border-white/10 bg-white/3 text-gray-500 cursor-default";
                }
              }

              return (
                <button
                  key={alt.id}
                  onClick={() => handleAnswer(alt.id)}
                  disabled={answered}
                  className={`w-full text-left rounded-xl p-3.5 text-sm transition-all flex items-start gap-3 ${altClass}`}
                >
                  <span className="shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono mt-0.5">
                    {alt.id}
                  </span>
                  <span className="flex-1">{alt.text}</span>
                  {answered && isCorrectAlt && <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />}
                  {answered && isSelected && !isCorrectAlt && <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className="mt-4">
              <button
                onClick={() => setShowExplanation(v => !v)}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showExplanation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showExplanation ? "Ocultar explicação" : "Ver explicação"}
              </button>
              {showExplanation && (
                <div className="mt-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-400 mb-1">Resposta correta: {correctAlt?.id} — {correctAlt?.text}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{currentQuestion?.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between p-5 border-t border-white/10">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={isFirst}
            className="text-gray-400 border-gray-600 disabled:opacity-30"
          >
            <ArrowLeft size={14} className="mr-1" /> Anterior
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="text-gray-400 border-gray-600"
          >
            <RotateCcw size={14} className="mr-1" /> Reiniciar
          </Button>

          {isLast ? (
            <Button
              size="sm"
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Concluir Revisão ✓
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleNext}
              disabled={!answered}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
            >
              Próxima <ArrowRight size={14} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
