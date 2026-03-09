import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Sparkles, Sword, Shield, Wand2, Eye, Baby, ShieldAlert } from "lucide-react";
import { AVATAR_URLS } from "@shared/avatarUrls";
import { useStudentAuth } from "@/pages/StudentLogin";

interface Avatar {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string;
  color: string;
  abilities: string[];
}

const avatars: Avatar[] = [
  {
    id: 1,
    name: "Hank",
    title: "O Guardião",
    description: "Líder corajoso com arco de energia",
    icon: <Sword size={48} />,
    imageUrl: AVATAR_URLS.hank,
    color: "from-yellow-500 to-orange-600",
    abilities: ["Arco de Energia", "Liderança", "Coragem"],
  },
  {
    id: 2,
    name: "Eric",
    title: "O Cavaleiro",
    description: "Guerreiro com escudo mágico",
    icon: <Shield size={48} />,
    imageUrl: AVATAR_URLS.eric,
    color: "from-red-500 to-pink-600",
    abilities: ["Escudo Mágico", "Defesa", "Proteção"],
  },
  {
    id: 3,
    name: "Diana",
    title: "A Acrobata",
    description: "Ágil e rápida com bastão mágico",
    icon: <Sparkles size={48} />,
    imageUrl: AVATAR_URLS.diana,
    color: "from-purple-500 to-indigo-600",
    abilities: ["Agilidade", "Bastão Mágico", "Velocidade"],
  },
  {
    id: 4,
    name: "Presto",
    title: "O Mago",
    description: "Ilusionista com chapéu mágico",
    icon: <Wand2 size={48} />,
    imageUrl: AVATAR_URLS.presto,
    color: "from-blue-500 to-cyan-600",
    abilities: ["Ilusões", "Magia", "Criatividade"],
  },
  {
    id: 5,
    name: "Sheila",
    title: "A Ladina",
    description: "Invisível com capa mágica",
    icon: <Eye size={48} />,
    imageUrl: AVATAR_URLS.sheila,
    color: "from-green-500 to-emerald-600",
    abilities: ["Invisibilidade", "Furtividade", "Estratégia"],
  },
  {
    id: 6,
    name: "Bobby",
    title: "O Bárbaro",
    description: "Pequeno mas poderoso com clava mágica",
    icon: <Baby size={48} />,
    imageUrl: AVATAR_URLS.bobby,
    color: "from-amber-500 to-yellow-600",
    abilities: ["Força", "Clava Mágica", "Determinação"],
  },
];

export default function GameAvatarSelect() {
  const [, setLocation] = useLocation();
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  // Admin view mode: detect ?adminView=true&memberId=X&classId=Y in URL
  const searchParams = new URLSearchParams(window.location.search);
  const isAdminView = searchParams.get("adminView") === "true";
  const adminMemberId = parseInt(searchParams.get("memberId") || "0");
  const adminClassId = parseInt(searchParams.get("classId") || "0");
  const adminMemberName = decodeURIComponent(searchParams.get("memberName") || "Aluno");

  // Get real memberId and classId from student auth session (or admin override)
  const { student: studentData } = useStudentAuth();
  const memberId = isAdminView ? adminMemberId : (studentData?.memberId || 0);
  const classId = isAdminView ? adminClassId : (studentData?.classId || 0);

  const initializeProgressMutation = trpc.game.initializeProgress.useMutation({
    onSuccess: (data) => {
      const targetClassId = data.classId || classId;
      if (isAdminView) {
        setLocation(`/jogo/${targetClassId}?adminView=true&memberId=${memberId}&memberName=${encodeURIComponent(adminMemberName)}`);
      } else {
        setLocation(`/jogo/${targetClassId}`);
      }
    },
    onError: (error) => {
      alert(`Erro ao iniciar jogo: ${error.message}`);
    },
  });

  const handleStartGame = () => {
    if (!selectedAvatar) {
      alert("Selecione um avatar primeiro!");
      return;
    }
    if (!memberId || !classId) {
      alert("Você precisa estar autenticado como aluno para iniciar o jogo. Acesse pelo portal do aluno.");
      return;
    }

    initializeProgressMutation.mutate({
      classId,
      memberId,
      characterId: selectedAvatar.name.toLowerCase(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">

      {/* Banner de modo admin */}
      {isAdminView && (
        <div className="bg-purple-700/90 border-b border-purple-500 px-4 py-2 flex items-center gap-3">
          <ShieldAlert size={16} className="text-yellow-300 shrink-0" />
          <span className="text-sm text-white font-medium">
            Modo Admin — Visualizando como <strong className="text-yellow-300">{adminMemberName}</strong>
            {" "}(memberId: {adminMemberId})
          </span>
          <button
            onClick={() => window.history.back()}
            className="ml-auto text-xs text-purple-200 underline hover:text-white"
          >
            ← Voltar ao painel
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Gamepad2 size={32} className="text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Caverna do Dragão: Farmacologia I
              </h1>
              <p className="text-purple-200">Escolha seu herói e inicie sua jornada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Selecione Seu Avatar</h2>
          <p className="text-purple-200 text-lg">
            Cada personagem possui habilidades únicas para enfrentar os desafios de farmacologia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {avatars.map((avatar) => (
            <Card
              key={avatar.id}
              className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                selectedAvatar?.id === avatar.id
                  ? "ring-4 ring-yellow-400 scale-105 shadow-2xl"
                  : "hover:scale-102 hover:shadow-xl"
              }`}
              onClick={() => setSelectedAvatar(avatar)}
            >
              <div className={`bg-gradient-to-br ${avatar.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{avatar.name}</h3>
                    <p className="text-sm opacity-90">{avatar.title}</p>
                  </div>
                  <img
                    src={avatar.imageUrl}
                    alt={avatar.name}
                    className="w-24 h-24 object-contain rounded-lg bg-white/10 p-2"
                  />
                </div>
                <p className="text-sm mb-4 opacity-90">{avatar.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide">Habilidades:</p>
                  <div className="flex flex-wrap gap-2">
                    {avatar.abilities.map((ability, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white/20 px-2 py-1 rounded-full"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {selectedAvatar?.id === avatar.id && (
                <div className="bg-yellow-400 text-black text-center py-2 font-bold">
                  ✓ SELECIONADO
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Start Button */}
        {selectedAvatar && (
          <div className="text-center">
            <Card className="inline-block p-8 bg-gradient-to-r from-yellow-400 to-orange-500">
              <div className="mb-4">
                <p className="text-black font-bold text-xl mb-2">
                  Você escolheu: {selectedAvatar.name}
                </p>
                <p className="text-black/80">{selectedAvatar.title}</p>
              </div>
              <Button
                onClick={handleStartGame}
                disabled={initializeProgressMutation.isPending}
                className="bg-black hover:bg-black/90 text-white text-lg px-8 py-6 font-bold"
              >
                {initializeProgressMutation.isPending
                  ? "Iniciando..."
                  : "🎮 INICIAR JORNADA"}
              </Button>
            </Card>
          </div>
        )}

        {/* Info */}
        <Card className="mt-12 p-6 bg-black/40 backdrop-blur-sm border-purple-500/50">
          <p className="text-purple-200 text-center">
            <strong>ℹ️ Informação:</strong> Durante sua jornada, você encontrará o Oráculo
            Professor Pedro que irá guiá-lo através dos conceitos de farmacologia. Use seus
            Pontos de Farmacologia (PF) para desbloquear dicas e completar as missões!
          </p>
        </Card>
      </div>
    </div>
  );
}
