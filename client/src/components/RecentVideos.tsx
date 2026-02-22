import { motion } from "framer-motion";
import { Play, Clock, Eye } from "lucide-react";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  url: string;
}

const RECENT_VIDEOS: Video[] = [
  {
    id: "1",
    title: "Farmacologia Trato Gastrointestinal - parte 12",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg", // Placeholder, será substituído
    duration: "15:17",
    views: "302",
    url: "https://www.youtube.com/@ConexãoemCiência-Farmacológica/videos"
  },
  {
    id: "2",
    title: "Farmacologia Trato Gastrointestinal - parte 11",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    duration: "12:24",
    views: "189",
    url: "https://www.youtube.com/@ConexãoemCiência-Farmacológica/videos"
  },
  {
    id: "3",
    title: "Farmacologia Trato Gastrointestinal - Parte 10",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    duration: "6:46",
    views: "166",
    url: "https://www.youtube.com/@ConexãoemCiência-Farmacológica/videos"
  }
];

export default function RecentVideos() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Section Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Últimos Vídeos
        </h2>
        <p className="text-base text-white/60">
          Confira os conteúdos mais recentes do canal
        </p>
      </motion.div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RECENT_VIDEOS.map((video, index) => (
          <motion.a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: "rgba(74,74,74,0.15)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            {/* Thumbnail Container */}
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
              {/* Placeholder gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
              
              {/* Play overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#F7941D" }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Play size={28} className="text-white fill-white ml-1" />
                </motion.div>
              </motion.div>

              {/* Duration badge */}
              <div
                className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1"
                style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
              >
                <Clock size={12} />
                {video.duration}
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="text-white font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                {video.title}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Eye size={14} />
                <span>{video.views} visualizações</span>
              </div>
            </div>

            {/* Hover border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                border: "2px solid rgba(247,148,29,0.5)",
                boxShadow: "0 0 20px rgba(247,148,29,0.3)"
              }}
            />
          </motion.a>
        ))}
      </div>

      {/* View All Button */}
      <motion.div
        className="flex justify-center mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <a
          href="https://www.youtube.com/@ConexãoemCiência-Farmacológica/videos"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: "rgba(247,148,29,0.15)",
            color: "#F7941D",
            border: "1px solid rgba(247,148,29,0.3)"
          }}
        >
          Ver Todos os Vídeos
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </a>
      </motion.div>
    </div>
  );
}
