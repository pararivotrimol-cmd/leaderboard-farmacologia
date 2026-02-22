import { motion } from "framer-motion";
import { Youtube } from "lucide-react";

interface YouTubeButtonProps {
  channelUrl: string;
}

export default function YouTubeButton({ channelUrl }: YouTubeButtonProps) {
  return (
    <motion.a
      href={channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center gap-3 px-6 py-4 rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
        boxShadow: "0 4px 20px rgba(255, 0, 0, 0.3)",
      }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)",
        }}
      />

      {/* YouTube Logo */}
      <motion.div
        className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Youtube size={28} className="text-white" />
      </motion.div>

      {/* Text Content */}
      <div className="relative z-10 flex flex-col">
        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
          Canal Oficial
        </span>
        <span className="text-base font-bold text-white">
          Conexão em Ciência
        </span>
        <span className="text-xs text-white/70">
          4K inscritos • 140+ vídeos
        </span>
      </div>

      {/* Arrow indicator */}
      <motion.div
        className="relative z-10 ml-auto"
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </motion.div>

      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: "2px solid rgba(255,255,255,0.3)",
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.a>
  );
}
