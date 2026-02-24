import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Eye, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface Video {
  id: string;
  title: string;
  duration: string;
  views: string;
}

interface VideoSeries {
  name: string;
  emoji: string;
  color: string;
  videos: Video[];
}

const VIDEO_SERIES: VideoSeries[] = [
  {
    name: "Farmacologia Trato Gastrointestinal",
    emoji: "🧬",
    color: "#10b981",
    videos: [
      { id: "4KHO8EsFk-E", title: "Parte 1", duration: "6:11", views: "334" },
      { id: "5Y7vcH2HjuI", title: "Parte 2", duration: "11:31", views: "182" },
      { id: "KacIk0CXvNA", title: "Parte 3", duration: "4:22", views: "211" },
      { id: "WpnvgJ6Aj9Q", title: "Parte 4", duration: "17:39", views: "170" },
      { id: "KOa8uhqy2X8", title: "Parte 5", duration: "9:37", views: "168" },
      { id: "6cF7Fn9WsuA", title: "Parte 6", duration: "7:58", views: "169" },
      { id: "y_UaK2brQck", title: "Parte 7", duration: "8:12", views: "157" },
      { id: "etledNu-rCo", title: "Parte 8", duration: "7:45", views: "128" },
      { id: "68ebecQMQ9s", title: "Parte 9", duration: "7:26", views: "166" },
      { id: "9QMjUXbj_QI", title: "Parte 10", duration: "6:46", views: "166" },
      { id: "vFvSHExqJzE", title: "Parte 11", duration: "12:24", views: "189" },
      { id: "w673Tttxvao", title: "Parte 12", duration: "15:17", views: "305" },
      { id: "gn-a3FZj6gM", title: "Parte 13", duration: "1:44", views: "148" },
    ],
  },
  {
    name: "Farmacodinâmica",
    emoji: "⚡",
    color: "#F7941D",
    videos: [
      { id: "aEd4B1iRPsU", title: "Parte 1", duration: "20:10", views: "978" },
      { id: "Q9ZmQd4eRLg", title: "Parte 2", duration: "15:30", views: "531" },
      { id: "_gCb82nubAU", title: "Parte 3", duration: "12:45", views: "702" },
      { id: "a5Ts13m_6a8", title: "Parte 4", duration: "10:20", views: "528" },
      { id: "SyrhVXdH8R8", title: "Parte 5", duration: "9:15", views: "473" },
      { id: "Mq5UzO35Gh0", title: "Parte 6", duration: "8:58", views: "596" },
      { id: "QP-cdjxDuAY", title: "Parte 7", duration: "2:58", views: "415" },
      { id: "6eusAr-HL6I", title: "Parte 8", duration: "20:10", views: "921" },
    ],
  },
  {
    name: "Farmacocinética",
    emoji: "💊",
    color: "#8b5cf6",
    videos: [
      { id: "Szi-LlBQDME", title: "Parte 6", duration: "10:00", views: "334" },
      { id: "FF0mDS7o7OA", title: "Parte 7", duration: "11:20", views: "343" },
      { id: "7KEQeg2bxLI", title: "Parte 8", duration: "9:45", views: "238" },
      { id: "Nt351egDYwE", title: "Parte 9", duration: "8:30", views: "283" },
      { id: "CsnEvHPkogY", title: "Parte 10", duration: "12:15", views: "339" },
      { id: "hVpEVBrZLO0", title: "Parte 11", duration: "7:40", views: "236" },
      { id: "JEizDwTGnFA", title: "Parte 12", duration: "14:50", views: "353" },
    ],
  },
];

function VideoCard({ video, seriesName, color, index }: { video: Video; seriesName: string; color: string; index: number }) {
  const thumbnailUrl = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <motion.a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: "rgba(74,74,74,0.15)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={`${seriesName} - ${video.title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.1 }}
          >
            <Play size={22} className="text-white fill-white ml-0.5" />
          </motion.div>
        </div>

        {/* Duration badge */}
        <div
          className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
        >
          <Clock size={10} />
          {video.duration}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-3">
        <h3
          className="font-semibold text-sm leading-snug mb-1 transition-colors line-clamp-2"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          <span className="group-hover:underline" style={{ color }}>{video.title}</span>
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Eye size={12} />
          <span>{video.views} visualizações</span>
        </div>
      </div>

      {/* Hover border glow */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          border: `2px solid ${color}80`,
          boxShadow: `0 0 15px ${color}40`,
        }}
      />
    </motion.a>
  );
}

function SeriesSection({ series, defaultOpen }: { series: VideoSeries; defaultOpen: boolean }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const totalViews = series.videos.reduce((sum, v) => sum + parseInt(v.views), 0);

  return (
    <div className="mb-8">
      {/* Series Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 mb-4 group cursor-pointer"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: series.color + "20", border: `1px solid ${series.color}40` }}
        >
          {series.emoji}
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:underline" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {series.name}
          </h3>
          <p className="text-xs text-white/40">
            {series.videos.length} vídeos • {totalViews.toLocaleString()} visualizações
          </p>
        </div>
        <div className="shrink-0 text-white/40 group-hover:text-white transition-colors">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Videos Grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {series.videos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  seriesName={series.name}
                  color={series.color}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RecentVideos() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Section Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-3xl sm:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Canal Farmacológicas
        </h2>
        <p className="text-base text-white/60 max-w-2xl mx-auto">
          Videoaulas completas de Farmacologia organizadas por tema.
          Clique na thumbnail para assistir no YouTube.
        </p>
      </motion.div>

      {/* Series Sections */}
      {VIDEO_SERIES.map((series, idx) => (
        <SeriesSection key={series.name} series={series} defaultOpen={idx === 0} />
      ))}

      {/* View All Button */}
      <motion.div
        className="flex justify-center mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <a
          href="https://www.youtube.com/@Conex%C3%A3oemCi%C3%AAncia-Farmacol%C3%B3gica/videos"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: "rgba(247,148,29,0.15)",
            color: "#F7941D",
            border: "1px solid rgba(247,148,29,0.3)",
          }}
        >
          <ExternalLink size={18} />
          Ver Canal Completo no YouTube
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
