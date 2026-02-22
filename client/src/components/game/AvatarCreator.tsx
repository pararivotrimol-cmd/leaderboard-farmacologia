import { motion } from "framer-motion";
import { useState } from "react";
import { Palette, Shirt, User, Sparkles } from "lucide-react";

interface AvatarCustomization {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  clothingColor: string;
  accessory: string;
}

interface AvatarCreatorProps {
  onComplete: (avatar: AvatarCustomization) => void;
  onSkip: () => void;
}

const SKIN_TONES = [
  { id: "light", color: "#FFD4B2", name: "Claro" },
  { id: "medium-light", color: "#E8B89A", name: "Médio Claro" },
  { id: "medium", color: "#C68A5F", name: "Médio" },
  { id: "medium-dark", color: "#A0714E", name: "Médio Escuro" },
  { id: "dark", color: "#6B4A3A", name: "Escuro" },
  { id: "very-dark", color: "#4A3228", name: "Muito Escuro" },
];

const HAIR_STYLES = [
  { id: "short", name: "Curto", emoji: "👦" },
  { id: "long", name: "Longo", emoji: "👩" },
  { id: "curly", name: "Cacheado", emoji: "👨‍🦱" },
  { id: "wavy", name: "Ondulado", emoji: "👩‍🦰" },
  { id: "bald", name: "Careca", emoji: "👨‍🦲" },
  { id: "ponytail", name: "Rabo de Cavalo", emoji: "👱‍♀️" },
];

const HAIR_COLORS = [
  { id: "black", color: "#2C2C2C", name: "Preto" },
  { id: "brown", color: "#6B4423", name: "Castanho" },
  { id: "blonde", color: "#F5D76E", name: "Loiro" },
  { id: "red", color: "#C13B2A", name: "Ruivo" },
  { id: "gray", color: "#A8A8A8", name: "Grisalho" },
  { id: "white", color: "#FFFFFF", name: "Branco" },
];

const CLOTHING_COLORS = [
  { id: "red", color: "#DC2626", name: "Vermelho" },
  { id: "blue", color: "#2563EB", name: "Azul" },
  { id: "green", color: "#10B981", name: "Verde" },
  { id: "purple", color: "#9333EA", name: "Roxo" },
  { id: "orange", color: "#F7941D", name: "Laranja" },
  { id: "black", color: "#1F2937", name: "Preto" },
  { id: "white", color: "#F3F4F6", name: "Branco" },
];

const ACCESSORIES = [
  { id: "none", name: "Nenhum", emoji: "❌" },
  { id: "glasses", name: "Óculos", emoji: "👓" },
  { id: "hat", name: "Chapéu", emoji: "🎩" },
  { id: "headband", name: "Bandana", emoji: "🎀" },
  { id: "earrings", name: "Brincos", emoji: "💎" },
  { id: "necklace", name: "Colar", emoji: "📿" },
];

export default function AvatarCreator({ onComplete, onSkip }: AvatarCreatorProps) {
  const [avatar, setAvatar] = useState<AvatarCustomization>({
    skinTone: SKIN_TONES[2].id,
    hairStyle: HAIR_STYLES[0].id,
    hairColor: HAIR_COLORS[1].id,
    clothingColor: CLOTHING_COLORS[4].id,
    accessory: ACCESSORIES[0].id,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: "skin", title: "Tom de Pele", icon: <User size={24} /> },
    { id: "hair", title: "Cabelo", icon: <Sparkles size={24} /> },
    { id: "clothing", title: "Roupa", icon: <Shirt size={24} /> },
    { id: "accessory", title: "Acessório", icon: <Palette size={24} /> },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(avatar);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSkinColor = () => {
    return SKIN_TONES.find((s) => s.id === avatar.skinTone)?.color || SKIN_TONES[2].color;
  };

  const getHairColor = () => {
    return HAIR_COLORS.find((h) => h.id === avatar.hairColor)?.color || HAIR_COLORS[1].color;
  };

  const getClothingColor = () => {
    return CLOTHING_COLORS.find((c) => c.id === avatar.clothingColor)?.color || CLOTHING_COLORS[4].color;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "#0A1628" }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bold text-white mb-3">Crie Seu Avatar</h1>
        <p className="text-white/70 text-lg">
          Personalize seu personagem antes de começar a aventura
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                index === currentStep
                  ? "border-[#F7941D] bg-[#F7941D]/20"
                  : index < currentStep
                  ? "border-green-500 bg-green-500/20"
                  : "border-gray-600 bg-gray-800"
              }`}
              animate={{
                scale: index === currentStep ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 1, repeat: index === currentStep ? Infinity : 0 }}
            >
              <div
                className={`${
                  index === currentStep
                    ? "text-[#F7941D]"
                    : index < currentStep
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`font-semibold ${
                  index === currentStep
                    ? "text-white"
                    : index < currentStep
                    ? "text-green-400"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </motion.div>
            {index < steps.length - 1 && (
              <div className="w-12 h-0.5 bg-gray-600 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Avatar Preview */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative w-64 h-64 rounded-full overflow-hidden border-8 border-[#F7941D]">
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          />

          {/* Avatar Representation (Simplified) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {/* Head */}
              <div
                className="w-32 h-32 rounded-full mx-auto mb-2"
                style={{ backgroundColor: getSkinColor() }}
              />
              {/* Hair */}
              <div
                className="w-36 h-12 rounded-t-full mx-auto -mt-14"
                style={{ backgroundColor: avatar.hairStyle !== "bald" ? getHairColor() : "transparent" }}
              />
              {/* Body/Clothing */}
              <div
                className="w-40 h-20 rounded-t-3xl mx-auto mt-2"
                style={{ backgroundColor: getClothingColor() }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Customization Options */}
      <motion.div
        className="w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-4 mb-6"
        style={{ borderColor: "#F7941D" }}
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
      >
        {/* Step 0: Skin Tone */}
        {currentStep === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Escolha o Tom de Pele</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setAvatar({ ...avatar, skinTone: tone.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-3 transition-all hover:scale-105 ${
                    avatar.skinTone === tone.id
                      ? "border-[#F7941D] bg-[#F7941D]/20"
                      : "border-gray-600 bg-gray-800"
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-full border-2 border-white"
                    style={{ backgroundColor: tone.color }}
                  />
                  <span className="text-white text-sm font-medium">{tone.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Hair */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Escolha o Cabelo</h2>
            
            {/* Hair Style */}
            <h3 className="text-lg font-semibold text-white/80 mb-3">Estilo</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              {HAIR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setAvatar({ ...avatar, hairStyle: style.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-3 transition-all hover:scale-105 ${
                    avatar.hairStyle === style.id
                      ? "border-[#F7941D] bg-[#F7941D]/20"
                      : "border-gray-600 bg-gray-800"
                  }`}
                >
                  <span className="text-4xl">{style.emoji}</span>
                  <span className="text-white text-sm font-medium">{style.name}</span>
                </button>
              ))}
            </div>

            {/* Hair Color */}
            {avatar.hairStyle !== "bald" && (
              <>
                <h3 className="text-lg font-semibold text-white/80 mb-3">Cor</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {HAIR_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setAvatar({ ...avatar, hairColor: color.id })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-3 transition-all hover:scale-105 ${
                        avatar.hairColor === color.id
                          ? "border-[#F7941D] bg-[#F7941D]/20"
                          : "border-gray-600 bg-gray-800"
                      }`}
                    >
                      <div
                        className="w-16 h-16 rounded-full border-2 border-white"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-white text-sm font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Clothing */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Escolha a Cor da Roupa</h2>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              {CLOTHING_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setAvatar({ ...avatar, clothingColor: color.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-3 transition-all hover:scale-105 ${
                    avatar.clothingColor === color.id
                      ? "border-[#F7941D] bg-[#F7941D]/20"
                      : "border-gray-600 bg-gray-800"
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-xl border-2 border-white"
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-white text-sm font-medium">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Accessory */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Escolha um Acessório</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAvatar({ ...avatar, accessory: acc.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-3 transition-all hover:scale-105 ${
                    avatar.accessory === acc.id
                      ? "border-[#F7941D] bg-[#F7941D]/20"
                      : "border-gray-600 bg-gray-800"
                  }`}
                >
                  <span className="text-4xl">{acc.emoji}</span>
                  <span className="text-white text-sm font-medium">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: "#374151" }}
            >
              ← Voltar
            </button>
          )}
          <button
            onClick={onSkip}
            className="px-6 py-3 rounded-xl font-semibold text-white/70 hover:text-white transition-all hover:scale-105"
            style={{ backgroundColor: "#374151" }}
          >
            Pular Customização
          </button>
        </div>

        <button
          onClick={handleNext}
          className="px-8 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-105"
          style={{ backgroundColor: "#F7941D" }}
        >
          {currentStep === steps.length - 1 ? "Finalizar →" : "Próximo →"}
        </button>
      </div>
    </div>
  );
}
