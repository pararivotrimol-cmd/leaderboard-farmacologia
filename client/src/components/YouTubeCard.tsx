import { motion } from "framer-motion";
import { Youtube, Play, Sparkles } from "lucide-react";

interface YouTubeCardProps {
  channelUrl: string;
  channelName?: string;
  description?: string;
  subscriberCount?: string;
  videoCount?: string;
}

export default function YouTubeCard({
  channelUrl,
  channelName = "Conexão em Ciência - Farmacológica",
  description = "Aulas interativas, dicas de farmacologia e conteúdo educativo",
  subscriberCount = "1.2K",
  videoCount = "50+",
}: YouTubeCardProps) {
  return (
    <motion.a
      href={channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full max-w-md overflow-hidden rounded-2xl transition-all duration-300"
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-red-700 opacity-90" />

      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Content container */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full justify-between">
        {/* Top section with YouTube icon and badge */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="flex items-center gap-3"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all">
              <Youtube size={24} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
                Canal Oficial
              </div>
              <div className="text-sm font-semibold text-white/90">YouTube</div>
            </div>
          </motion.div>

          {/* Sparkles badge */}
          <motion.div
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-semibold text-white">Novo</span>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
            {channelName}
          </h3>
          <p className="text-sm text-white/80 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex flex-col items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <span className="text-lg font-bold text-white">{subscriberCount}</span>
            <span className="text-xs text-white/70 font-medium">Inscritos</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <span className="text-lg font-bold text-white">{videoCount}</span>
            <span className="text-xs text-white/70 font-medium">Vídeos</span>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-red-600 font-bold text-base group-hover:shadow-lg transition-all"
          whileHover={{ x: 4 }}
        >
          <Play size={18} className="fill-current" />
          <span>Assistir Agora</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </motion.div>
      </div>

      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: "2px solid transparent",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)), linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.a>
  );
}
