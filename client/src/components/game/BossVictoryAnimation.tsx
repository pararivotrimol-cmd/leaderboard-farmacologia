import { useEffect, useState } from "react";

interface BossVictoryAnimationProps {
  isVictory: boolean;
  characterEmoji: string;
  bossEmoji: string;
  bossName: string;
  pfEarned: number;
  pfPenalty: number;
  onAnimationEnd: () => void;
}

export function BossVictoryAnimation({
  isVictory,
  characterEmoji,
  bossEmoji,
  bossName,
  pfEarned,
  pfPenalty,
  onAnimationEnd,
}: BossVictoryAnimationProps) {
  const [phase, setPhase] = useState<"clash" | "result" | "done">("clash");

  useEffect(() => {
    // Phase 1: clash animation (1.2s)
    const t1 = setTimeout(() => setPhase("result"), 1200);
    // Phase 2: show result (2.5s)
    const t2 = setTimeout(() => {
      setPhase("done");
      onAnimationEnd();
    }, 3700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center max-w-sm w-full px-6">
        {/* Battle arena */}
        <div className="relative flex items-center justify-center gap-8 mb-8 h-40">
          {/* Character (hero) */}
          <div
            className={`
              text-7xl transition-all duration-500 select-none
              ${phase === "clash"
                ? isVictory
                  ? "translate-x-4 scale-110"
                  : "translate-x-2 scale-90 opacity-70"
                : isVictory
                  ? "translate-x-0 scale-125"
                  : "-translate-x-4 scale-75 opacity-50"
              }
            `}
            style={{
              filter: isVictory && phase === "result"
                ? "drop-shadow(0 0 20px rgba(52, 211, 153, 0.8))"
                : undefined,
            }}
          >
            {characterEmoji}
          </div>

          {/* VS / clash effect */}
          <div className="relative">
            {phase === "clash" && (
              <div className="text-4xl font-black animate-bounce text-yellow-400">
                ⚡
              </div>
            )}
            {phase === "result" && (
              <div
                className={`
                  text-3xl font-black animate-pulse
                  ${isVictory ? "text-emerald-400" : "text-red-400"}
                `}
              >
                {isVictory ? "✨" : "💀"}
              </div>
            )}
          </div>

          {/* Boss */}
          <div
            className={`
              text-7xl transition-all duration-500 select-none
              ${phase === "clash"
                ? isVictory
                  ? "-translate-x-2 scale-90 opacity-80"
                  : "-translate-x-4 scale-110"
                : isVictory
                  ? "translate-x-4 scale-75 opacity-40"
                  : "translate-x-0 scale-125"
              }
            `}
            style={{
              filter: !isVictory && phase === "result"
                ? "drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))"
                : undefined,
            }}
          >
            {bossEmoji}
          </div>
        </div>

        {/* Clash sparks */}
        {phase === "clash" && (
          <div className="flex justify-center gap-2 mb-4">
            {["⚔️", "💥", "✨", "💥", "⚔️"].map((s, i) => (
              <span
                key={i}
                className="text-xl animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Result message */}
        {phase === "result" && (
          <div
            className={`
              rounded-2xl p-6 border-2 animate-in fade-in zoom-in duration-300
              ${isVictory
                ? "bg-emerald-500/20 border-emerald-500/60"
                : "bg-red-500/20 border-red-500/60"
              }
            `}
          >
            <h2
              className={`
                text-3xl font-black mb-2
                ${isVictory ? "text-emerald-300" : "text-red-300"}
              `}
            >
              {isVictory ? "VITÓRIA!" : "DERROTA!"}
            </h2>
            <p className="text-white text-lg font-semibold mb-1">
              {isVictory
                ? `Você derrotou ${bossName}!`
                : `${bossName} venceu esta batalha!`}
            </p>
            {isVictory && pfEarned > 0 && (
              <p className="text-emerald-400 font-bold text-xl mt-2">
                +{pfEarned} PF
              </p>
            )}
            {!isVictory && pfPenalty > 0 && (
              <p className="text-red-400 font-bold text-xl mt-2">
                -{pfPenalty} PF
              </p>
            )}
            <p className="text-gray-400 text-sm mt-3">
              {isVictory
                ? "Excelente! Continue avançando!"
                : "Estude a explicação e tente novamente!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
