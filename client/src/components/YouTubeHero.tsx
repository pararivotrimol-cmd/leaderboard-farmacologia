import { motion } from "framer-motion";
import { Play, Volume2, Zap, Heart } from "lucide-react";
import { useState } from "react";

interface YouTubeHeroProps {
  channelUrl: string;
  channelName?: string;
}

export default function YouTubeHero({
  channelUrl,
  channelName = "Conexão em Ciência - Farmacológica",
}: YouTubeHeroProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-3xl"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background with gradient and animated glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-orange-600 opacity-95" />

      {/* Animated glow effect following mouse */}
      {isHovered && (
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating play buttons */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`play-${i}`}
            className="absolute w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center"
            animate={{
              x: [0, Math.sin(i) * 100, 0],
              y: [0, Math.cos(i) * 100, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + i * 15}%`,
            }}
          >
            <Play size={12} className="text-white/40 fill-white/40" />
          </motion.div>
        ))}

        {/* Animated sound waves */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute w-1 h-16 bg-gradient-to-b from-white/40 to-transparent rounded-full"
            animate={{
              scaleY: [0.5, 1.5, 0.5],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              right: `${10 + i * 8}%`,
              top: "50%",
              transformOrigin: "center",
            }}
          />
        ))}

        {/* Animated hearts */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            animate={{
              y: [-100, -300],
              opacity: [1, 0],
              x: [0, Math.sin(i) * 50],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
            }}
            style={{
              position: "absolute",
              left: `${20 + i * 20}%`,
              bottom: "-50px",
            }}
          >
            <Heart size={16} className="text-white/40 fill-white/40" />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center min-h-96">
        {/* Top badge */}
        <motion.div
          className="mb-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <Zap size={14} className="text-yellow-300" />
            Conteúdo Exclusivo
          </span>
        </motion.div>

        {/* Main play button - Large and prominent */}
        <motion.div
          className="mb-8 relative"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Outer glow rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{
                scale: [1, 1.5 + i * 0.3],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                width: "120px",
                height: "120px",
                left: "-60px",
                top: "-60px",
              }}
            />
          ))}

          {/* Main play button */}
          <motion.a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center justify-center w-32 h-32 rounded-full bg-white text-red-600 shadow-2xl cursor-pointer group"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ scale: isHovered ? 1.2 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Play size={56} className="fill-current ml-1" />
            </motion.div>

            {/* Hover effect - rotating border */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: "rgba(255,255,255,0.5)",
                borderRightColor: "rgba(255,255,255,0.3)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.a>
        </motion.div>

        {/* Channel name and description */}
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            {channelName}
          </h2>
          <p className="text-base sm:text-lg text-white/90 font-semibold mb-6">
            Aulas interativas, dicas de farmacologia e conteúdo educativo de qualidade
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-6 mb-8">
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-2xl font-black text-white">1.2K</span>
              <span className="text-xs text-white/70 font-semibold">Inscritos</span>
            </motion.div>
            <div className="w-px bg-white/30" />
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-2xl font-black text-white">50+</span>
              <span className="text-xs text-white/70 font-semibold">Vídeos</span>
            </motion.div>
          </div>

          {/* CTA Text */}
          <motion.div
            className="text-sm text-white/80 font-semibold"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ↓ Clique no play para assistir ↓
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom accent bar */}
      <motion.div
        className="h-1 bg-gradient-to-r from-transparent via-white to-transparent"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}
