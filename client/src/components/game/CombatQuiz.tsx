import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, X, Clock, Zap, Star, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-3)
  explanation?: string;
  pfReward: number;
  xpReward: number;
}

interface CombatQuizProps {
  quest: {
    id: number;
    title: string;
    character: string;
    level: number;
  };
  question: QuizQuestion;
  onComplete: (result: { isCorrect: boolean; timeSpent: number; pfEarned: number; xpEarned: number }) => void;
  onQuit: () => void;
}

export default function CombatQuiz({ quest, question, onComplete, onQuit }: CombatQuizProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (showResult || isTimeout) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeout(true);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, isTimeout]);

  const handleTimeout = () => {
    setShowResult(true);
    setIsCorrect(false);
    // Auto-complete after 3 seconds
    setTimeout(() => {
      onComplete({
        isCorrect: false,
        timeSpent: 60,
        pfEarned: 0,
        xpEarned: 0,
      });
    }, 3000);
  };

  const handleSelectOption = (index: number) => {
    if (showResult || isTimeout) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null || showResult) return;

    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F7941D", "#FFD700", "#FFA500"],
      });

      // Auto-complete after 3 seconds
      setTimeout(() => {
        onComplete({
          isCorrect: true,
          timeSpent,
          pfEarned: question.pfReward,
          xpEarned: question.xpReward,
        });
      }, 3000);
    } else {
      // Auto-complete after 3 seconds
      setTimeout(() => {
        onComplete({
          isCorrect: false,
          timeSpent,
          pfEarned: 0,
          xpEarned: 0,
        });
      }, 3000);
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 40) return "#10b981"; // Green
    if (timeLeft > 20) return "#F7941D"; // Orange
    return "#ef4444"; // Red
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "#0A1628" }}
    >
      {/* Header */}
      <motion.div
        className="w-full max-w-4xl mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{quest.title}</h1>
            <p className="text-white/70">
              {quest.character} • Nível {quest.level}
            </p>
          </div>

          {/* Timer */}
          <motion.div
            className="flex items-center gap-3 px-6 py-3 rounded-xl border-4"
            style={{
              backgroundColor: "#0A1628",
              borderColor: getTimerColor(),
            }}
            animate={{
              scale: timeLeft <= 10 ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
          >
            <Clock size={28} style={{ color: getTimerColor() }} />
            <div className="text-center">
              <div
                className="text-4xl font-bold font-mono"
                style={{ color: getTimerColor() }}
              >
                {timeLeft}s
              </div>
              <div className="text-xs text-white/60">tempo restante</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Question Card */}
      <motion.div
        className="w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-4 mb-6"
        style={{ borderColor: "#F7941D" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#F7941D" }}
          >
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white leading-relaxed">
              {question.question}
            </h2>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-4">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrectOption = index === question.correctAnswer;
            const showCorrect = showResult && isCorrectOption;
            const showWrong = showResult && isSelected && !isCorrectOption;

            return (
              <motion.button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={showResult}
                className={`p-4 rounded-xl border-3 text-left transition-all ${
                  showResult ? "cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"
                }`}
                style={{
                  backgroundColor: showCorrect
                    ? "#10b98120"
                    : showWrong
                    ? "#ef444420"
                    : isSelected
                    ? "#F7941D20"
                    : "#1f2937",
                  borderColor: showCorrect
                    ? "#10b981"
                    : showWrong
                    ? "#ef4444"
                    : isSelected
                    ? "#F7941D"
                    : "#374151",
                  borderWidth: "3px",
                }}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-4">
                  {/* Option Letter */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                    style={{
                      backgroundColor: showCorrect
                        ? "#10b981"
                        : showWrong
                        ? "#ef4444"
                        : isSelected
                        ? "#F7941D"
                        : "#374151",
                      color: "white",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>

                  {/* Option Text */}
                  <span className="text-white text-lg flex-1">{option}</span>

                  {/* Result Icon */}
                  {showCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Check size={32} className="text-green-500" />
                    </motion.div>
                  )}
                  {showWrong && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <X size={32} className="text-red-500" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation (after answer) */}
        <AnimatePresence>
          {showResult && question.explanation && (
            <motion.div
              className="mt-6 p-4 rounded-xl border-2"
              style={{
                backgroundColor: isCorrect ? "#10b98110" : "#ef444410",
                borderColor: isCorrect ? "#10b981" : "#ef4444",
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isCorrect ? "#10b981" : "#ef4444",
                  }}
                >
                  <Star size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Explicação:</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <button
          onClick={onQuit}
          className="px-6 py-3 rounded-xl font-semibold text-white/70 hover:text-white transition-all hover:scale-105"
          style={{ backgroundColor: "#374151" }}
        >
          ← Voltar ao Mapa
        </button>

        {!showResult && (
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null}
            className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-all ${
              selectedOption === null
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105"
            }`}
            style={{
              backgroundColor: selectedOption === null ? "#6b7280" : "#F7941D",
            }}
          >
            Confirmar Resposta →
          </button>
        )}
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "#0A1628cc" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border-4 text-center max-w-lg"
              style={{
                borderColor: isCorrect ? "#10b981" : "#ef4444",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* Result Icon */}
              <motion.div
                className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  backgroundColor: isCorrect ? "#10b981" : "#ef4444",
                }}
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.6 }}
              >
                {isCorrect ? (
                  <Trophy size={64} className="text-white" />
                ) : (
                  <X size={64} className="text-white" />
                )}
              </motion.div>

              {/* Result Text */}
              <h2 className="text-4xl font-bold text-white mb-3">
                {isCorrect ? "Vitória!" : isTimeout ? "Tempo Esgotado!" : "Derrota!"}
              </h2>
              <p className="text-white/70 text-lg mb-6">
                {isCorrect
                  ? "Você dominou este desafio de farmacologia!"
                  : isTimeout
                  ? "O tempo acabou antes de você responder."
                  : "Estude mais e tente novamente!"}
              </p>

              {/* Rewards */}
              {isCorrect && (
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div>
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <Zap size={24} className="text-orange-400" />
                      <span className="text-3xl font-bold text-white">
                        +{question.pfReward}
                      </span>
                    </div>
                    <div className="text-white/60 text-sm">PF</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <Star size={24} className="text-yellow-400" />
                      <span className="text-3xl font-bold text-white">
                        +{question.xpReward}
                      </span>
                    </div>
                    <div className="text-white/60 text-sm">XP</div>
                  </div>
                </div>
              )}

              {/* Time */}
              <div className="text-white/50 text-sm">
                Tempo: {timeSpent}s
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
