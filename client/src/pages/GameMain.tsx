import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CharacterSelect from "@/components/game/CharacterSelect";
import AvatarCreator from "@/components/game/AvatarCreator";
import QuestMap from "@/components/game/QuestMap";
import CombatQuiz from "@/components/game/CombatQuiz";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

type GameState = "loading" | "character-select" | "avatar-creator" | "map" | "combat";

interface AvatarCustomization {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  clothingColor: string;
  accessory: string;
}

interface Quest {
  id: number;
  title: string;
  character: string;
  level: number;
  isLocked: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  pfReward: number;
  xpReward: number;
}

// Mock questions for now (will be loaded from database later)
const MOCK_QUESTIONS: Record<number, QuizQuestion> = {
  1: {
    id: 1,
    question: "Para atravessar o portal, responda: Qual é a ordem correta dos processos farmacocinéticos?",
    options: [
      "Absorção → Distribuição → Metabolismo → Excreção",
      "Distribuição → Absorção → Excreção → Metabolismo",
      "Metabolismo → Absorção → Distribuição → Excreção",
      "Excreção → Metabolismo → Distribuição → Absorção",
    ],
    correctAnswer: 0,
    explanation: "A ordem correta é ADME: Absorção → Distribuição → Metabolismo → Excreção. Este é o caminho que um fármaco percorre no organismo.",
    pfReward: 50,
    xpReward: 100,
  },
  2: {
    id: 2,
    question: "Meu escudo me protege como a barreira hematoencefálica protege o cérebro. Que característica um fármaco DEVE ter para atravessá-la?",
    options: [
      "Alta polaridade e hidrofilicidade",
      "Lipofilicidade e baixo peso molecular",
      "Grande tamanho molecular",
      "Carga elétrica positiva",
    ],
    correctAnswer: 1,
    explanation: "Fármacos lipofilicos (solúveis em gordura) e com baixo peso molecular conseguem atravessar a barreira hematoencefálica mais facilmente.",
    pfReward: 75,
    xpReward: 150,
  },
  // Add more questions as needed
};

export default function GameMain() {
  const [gameState, setGameState] = useState<GameState>("loading");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<AvatarCustomization | null>(null);
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [playerProgress, setPlayerProgress] = useState({
    level: 1,
    pf: 0,
    xp: 0,
    questsCompleted: 0,
  });

  // Check if user has existing game progress
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      // Check if player has saved progress
      const hasProgress = false; // TODO: Check from database

      if (hasProgress) {
        setGameState("map");
      } else {
        setGameState("character-select");
      }
    }, 1500);
  }, []);

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
    setGameState("avatar-creator");
  };

  const handleAvatarComplete = (avatar: AvatarCustomization) => {
    setCustomAvatar(avatar);
    // TODO: Save to database
    setGameState("map");
  };

  const handleAvatarSkip = () => {
    setGameState("map");
  };

  const handleQuestStart = (questId: number) => {
    // Load quest data
    const quest: Quest = {
      id: questId,
      title: `Missão ${questId}`,
      character: "Mestre dos Magos",
      level: Math.ceil(questId / 2),
      isLocked: false,
    };
    setCurrentQuest(quest);
    setGameState("combat");
  };

  const handleCombatComplete = (result: {
    isCorrect: boolean;
    timeSpent: number;
    pfEarned: number;
    xpEarned: number;
  }) => {
    // Update player progress
    setPlayerProgress((prev) => ({
      ...prev,
      pf: prev.pf + result.pfEarned,
      xp: prev.xp + result.xpEarned,
      questsCompleted: result.isCorrect ? prev.questsCompleted + 1 : prev.questsCompleted,
    }));

    // TODO: Save to database

    // Return to map
    setCurrentQuest(null);
    setGameState("map");
  };

  const handleQuitCombat = () => {
    setCurrentQuest(null);
    setGameState("map");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      <AnimatePresence mode="wait">
        {gameState === "loading" && (
          <motion.div
            key="loading"
            className="min-h-screen flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 size={64} className="text-[#F7941D] animate-spin mb-4" />
            <p className="text-white text-xl">Carregando aventura...</p>
          </motion.div>
        )}

        {gameState === "character-select" && (
          <motion.div
            key="character-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CharacterSelect onSelect={handleCharacterSelect} />
          </motion.div>
        )}

        {gameState === "avatar-creator" && (
          <motion.div
            key="avatar-creator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AvatarCreator
              onComplete={handleAvatarComplete}
              onSkip={handleAvatarSkip}
            />
          </motion.div>
        )}

        {gameState === "map" && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuestMap
              onQuestClick={handleQuestStart}
              completedQuests={[]}
              currentLevel={playerProgress.level}
            />
          </motion.div>
        )}

        {gameState === "combat" && currentQuest && (
          <motion.div
            key="combat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CombatQuiz
              quest={currentQuest}
              question={MOCK_QUESTIONS[currentQuest.id] || MOCK_QUESTIONS[1]}
              onComplete={handleCombatComplete}
              onQuit={handleQuitCombat}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
