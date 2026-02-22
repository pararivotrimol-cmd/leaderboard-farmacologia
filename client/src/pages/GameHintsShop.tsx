import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ShoppingCart, ArrowLeft, Lightbulb, Star, 
  CheckCircle, Lock, Sparkles 
} from "lucide-react";

interface Hint {
  id: number;
  title: string;
  description: string;
  pfCost: number;
  category: string;
  isUnlocked: boolean;
}

export default function GameHintsShop() {
  const [, setLocation] = useLocation();
  const [classId] = useState(1); // TODO: Get from context
  
  const { data: progress } = trpc.game.getProgress.useQuery({ classId });
  const currentPF = progress?.farmacologiaPoints || 0;

  // Mock hints - em produção viria do backend
  const [hints, setHints] = useState<Hint[]>([
    {
      id: 1,
      title: "Farmacocinética Básica",
      description: "Entenda os 4 processos fundamentais: Absorção, Distribuição, Metabolismo e Excreção",
      pfCost: 5,
      category: "Conceitos",
      isUnlocked: false,
    },
    {
      id: 2,
      title: "Meia-vida de Fármacos",
      description: "Aprenda a calcular e interpretar a meia-vida de eliminação",
      pfCost: 8,
      category: "Cálculos",
      isUnlocked: false,
    },
    {
      id: 3,
      title: "Interações Medicamentosas",
      description: "Identifique as principais interações e como evitá-las",
      pfCost: 10,
      category: "Segurança",
      isUnlocked: false,
    },
    {
      id: 4,
      title: "Vias de Administração",
      description: "Compare vantagens e desvantagens de cada via",
      pfCost: 6,
      category: "Conceitos",
      isUnlocked: false,
    },
    {
      id: 5,
      title: "Farmacodinâmica",
      description: "Compreenda mecanismos de ação e relação dose-resposta",
      pfCost: 12,
      category: "Avançado",
      isUnlocked: false,
    },
    {
      id: 6,
      title: "Efeitos Adversos",
      description: "Reconheça e maneje reações adversas comuns",
      pfCost: 7,
      category: "Segurança",
      isUnlocked: false,
    },
  ]);

  const handleUnlock = (hintId: number) => {
    const hint = hints.find((h) => h.id === hintId);
    if (!hint) return;

    if (currentPF < hint.pfCost) {
      alert("PF insuficiente! Complete mais missões para ganhar pontos.");
      return;
    }

    // TODO: Chamar mutation do backend
    // unlockHintMutation.mutate({ hintId, pfCost: hint.pfCost });

    // Atualizar localmente
    setHints(hints.map((h) => 
      h.id === hintId ? { ...h, isUnlocked: true } : h
    ));

    alert(`✅ Dica "${hint.title}" desbloqueada!`);
  };

  const categories = Array.from(new Set(hints.map((h) => h.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
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
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <ShoppingCart size={32} className="text-yellow-400" />
                  Loja de Dicas
                </h1>
                <p className="text-purple-200">
                  Use seus Pontos de Farmacologia (PF) para desbloquear dicas valiosas
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-300 text-sm mb-1">Seus PF:</p>
                <div className="flex items-center gap-2 bg-yellow-400/20 rounded-lg px-4 py-2">
                  <Star size={24} className="text-yellow-400" />
                  <span className="text-white font-bold text-2xl">{currentPF}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Categories */}
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={24} className="text-purple-400" />
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hints
                .filter((h) => h.category === category)
                .map((hint) => (
                  <Card
                    key={hint.id}
                    className={`p-6 transition-all ${
                      hint.isUnlocked
                        ? "bg-green-900/40 border-green-500/50"
                        : "bg-black/60 border-purple-500/50 hover:border-purple-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {hint.isUnlocked ? (
                          <CheckCircle size={24} className="text-green-400" />
                        ) : (
                          <Lock size={24} className="text-purple-400" />
                        )}
                        <h3 className="text-lg font-bold text-white">{hint.title}</h3>
                      </div>
                    </div>

                    <p className="text-purple-200 text-sm mb-4">{hint.description}</p>

                    {hint.isUnlocked ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                        <CheckCircle size={16} />
                        Desbloqueada
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleUnlock(hint.id)}
                        disabled={currentPF < hint.pfCost}
                        className={`w-full ${
                          currentPF >= hint.pfCost
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            : "bg-gray-600 cursor-not-allowed"
                        } text-white`}
                      >
                        <Star size={16} className="mr-2" />
                        Desbloquear ({hint.pfCost} PF)
                      </Button>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        ))}

        {/* Info */}
        <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50 p-6">
          <div className="flex items-start gap-4">
            <Lightbulb size={32} className="text-yellow-400 shrink-0" />
            <div>
              <p className="text-white font-semibold mb-2">💡 Como ganhar mais PF?</p>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>• Complete missões corretamente para ganhar pontos</li>
                <li>• Missões mais difíceis concedem mais PF</li>
                <li>• Use as dicas desbloqueadas para facilitar missões futuras</li>
                <li>• Revise os conceitos de farmacologia regularmente</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
