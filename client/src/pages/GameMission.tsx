import { useState } from "react";
import { GAME_MISSIONS } from "@shared/gameMissions";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { 
  Sparkles, ArrowLeft, CheckCircle, XCircle, 
  Lightbulb, User, Activity, AlertCircle 
} from "lucide-react";

interface Decision {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
  pfReward: number;
}

interface ClinicalCase {
  patientName: string;
  symptoms: string[];
  history: string;
  question: string;
}

export default function GameMission() {
  const [, params] = useRoute("/game/mission/:id");
  const [, setLocation] = useLocation();
  // Using sonner toast (imported above)
  const missionId = params?.id ? parseInt(params.id) : 1;
  const [classId] = useState(1); // TODO: Get from context
  
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; pfEarned: number } | null>(null);
  const [showOracle, setShowOracle] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Efeitos sonoros
  const playSound = (type: 'correct' | 'wrong' | 'levelup') => {
    const audio = new Audio(
      type === 'correct' ? 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' :
      type === 'wrong' ? 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3' :
      'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
    );
    audio.volume = 0.3;
    audio.play().catch(() => {/* Ignore autoplay errors */});
  };

  // Buscar missão real do arquivo de missões
  const mission = GAME_MISSIONS.find(m => m.id === missionId) || GAME_MISSIONS[0];

  const oracleMessage = showOracle
    ? mission.oracleMessages.find(m => m.triggerType === "start")?.message || "Bem-vindo, jovem aprendiz!"
    : null;

  const handleDecisionSelect = (decisionId: string) => {
    if (result) return; // Já respondeu
    setSelectedDecision(decisionId);
  };

  const submitAnswerMutation = trpc.game.submitAnswer.useMutation();

  const handleSubmit = async () => {
    if (!selectedDecision) {
      alert("Selecione uma decisão primeiro!");
      return;
    }

    const decision = mission.decisions.find((d) => d.id === selectedDecision);
    if (!decision) return;

    setResult({
      success: decision.isCorrect,
      message: decision.feedback,
      pfEarned: decision.pfReward,
    });

    // Efeitos visuais e sonoros
    if (decision.isCorrect) {
      playSound('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("✅ Resposta Correta!", {
        description: `Você ganhou ${decision.pfReward} PF!`,
      });
    } else {
      playSound('wrong');
      toast.error("❌ Resposta Incorreta", {
        description: "Tente novamente na próxima missão!",
      });
    }

    // Auto-save: Award PF if correct
    if (decision.isCorrect && decision.pfReward > 0) {
      setIsSaving(true);
      try {
        await submitAnswerMutation.mutateAsync({
          classId: 1, // TODO: Get from context
          memberId: 1, // TODO: Get from context
          questId: typeof missionId === 'string' ? parseInt(missionId) : missionId,
          answer: selectedDecision || '',
          timeSpent: 30,
        });
        // Success feedback is already shown in result message
      } catch (error) {
        console.error("Failed to save progress:", error);
        alert("⚠️ Erro ao salvar progresso. Tente novamente.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleContinue = () => {
    setLocation("/game/hub");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game/hub")}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar ao Hub
          </Button>
          
          <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{mission.title}</h1>
                <p className="text-purple-200">{mission.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                    {mission.pharmacologyTopic}
                  </span>
                  <span className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-full">
                    Dificuldade: {mission.difficulty}/5
                  </span>
                </div>
              </div>
              <Sparkles size={48} className="text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Oracle Message */}
        {oracleMessage && (
          <Card className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-yellow-400 border-2 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                <Sparkles size={32} className="text-purple-900" />
              </div>
              <div className="flex-1">
                <p className="text-yellow-100 font-semibold mb-2">🔮 Oráculo Professor Pedro</p>
                <p className="text-white">{oracleMessage}</p>
                <Button
                  onClick={() => setShowOracle(false)}
                  variant="ghost"
                  className="mt-3 text-yellow-200 hover:text-yellow-100 hover:bg-white/10"
                  size="sm"
                >
                  Entendi →
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Clinical Case */}
        <Card className="mb-6 bg-black/60 backdrop-blur-sm border-purple-500/50 p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <User size={24} className="text-purple-400" />
            Caso Clínico
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-purple-300 text-sm font-semibold mb-1">Paciente:</p>
              <p className="text-white">{mission.clinicalCase.patientName}</p>
            </div>

            <div>
              <p className="text-purple-300 text-sm font-semibold mb-1 flex items-center gap-2">
                <Activity size={16} />
                Sintomas:
              </p>
              <ul className="list-disc list-inside text-white space-y-1">
                {mission.clinicalCase.symptoms.map((symptom, idx) => (
                  <li key={idx}>{symptom}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-purple-300 text-sm font-semibold mb-1">Histórico:</p>
              <p className="text-white">{mission.clinicalCase.history}</p>
            </div>

            <div className="pt-4 border-t border-purple-500/30">
              <p className="text-yellow-300 font-bold text-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {mission.clinicalCase.question}
              </p>
            </div>
          </div>
        </Card>

        {/* Decisions */}
        <Card className="mb-6 bg-black/60 backdrop-blur-sm border-purple-500/50 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Escolha sua Conduta</h2>
          
          <div className="space-y-3">
            {mission.decisions.map((decision) => (
              <button
                key={decision.id}
                onClick={() => handleDecisionSelect(decision.id)}
                disabled={!!result}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedDecision === decision.id
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-purple-500/50 bg-white/5 hover:bg-white/10"
                } ${result ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedDecision === decision.id
                        ? "border-yellow-400 bg-yellow-400"
                        : "border-purple-400"
                    }`}
                  >
                    {selectedDecision === decision.id && (
                      <div className="w-3 h-3 rounded-full bg-purple-900" />
                    )}
                  </div>
                  <p className="text-white flex-1">{decision.text}</p>
                </div>
              </button>
            ))}
          </div>

          {!result && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedDecision || isSaving}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
            >
              {isSaving ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Salvando...
                </span>
              ) : (
                "Confirmar Decisão"
              )}
            </Button>
          )}
        </Card>

        {/* Result */}
        {result && (
          <Card
            className={`mb-6 p-6 ${
              result.success
                ? "bg-green-600 border-green-400"
                : "bg-red-600 border-red-400"
            }`}
          >
            <div className="flex items-start gap-4">
              {result.success ? (
                <CheckCircle size={48} className="text-white shrink-0" />
              ) : (
                <XCircle size={48} className="text-white shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {result.success ? "Parabéns!" : "Tente Novamente"}
                </h3>
                <p className="text-white mb-4">{result.message}</p>
                {result.success && (
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg p-3 w-fit">
                    <Sparkles size={20} className="text-yellow-300" />
                    <span className="text-white font-bold">+{result.pfEarned} PF</span>
                  </div>
                )}
                <Button
                  onClick={handleContinue}
                  className="mt-4 bg-white text-purple-900 hover:bg-gray-100"
                >
                  Continuar Jornada →
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Hints */}
        {!result && (
          <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50 p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-400" />
              Dicas Disponíveis
            </h3>
            <div className="space-y-2">
              {mission.hints.map((hint) => (
                <div
                  key={hint.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-purple-500/30"
                >
                  <p className="text-purple-200 text-sm">Dica #{hint.id}</p>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Desbloquear ({hint.pfCost} PF)
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
