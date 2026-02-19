import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ORANGE = "#F7941D";

/**
 * Background Music Player
 * Plays lounge music with volume controls
 * Auto-starts on first user interaction (click/touch)
 */
export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // CDN-hosted royalty-free ambient lounge music
  const musicUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/YbUYLOZABZPESahD.wav";

  // Auto-play on first user interaction (browsers require user gesture)
  const startPlayback = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);
    
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio playback failed:", err);
      });
    }
  }, [hasInteracted, volume]);

  // Listen for any user interaction to auto-start music
  useEffect(() => {
    const handler = () => startPlayback();
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
    
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [startPlayback]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn("Audio playback failed:", err);
        });
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-40"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <audio
        ref={audioRef}
        src={musicUrl}
        loop
        preload="auto"
      />

      <motion.div
        className="backdrop-blur-md rounded-full shadow-2xl"
        style={{
          backgroundColor: "rgba(10, 22, 40, 0.9)",
          border: `1px solid ${ORANGE}40`,
        }}
        initial={{ width: 52, height: 52 }}
        animate={{
          width: showControls ? 240 : 52,
          height: 52,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2 p-2.5">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 shrink-0"
            style={{
              backgroundColor: ORANGE,
              color: "#fff",
              boxShadow: isPlaying ? `0 0 12px ${ORANGE}60` : "none",
            }}
            title={isPlaying ? "Pausar música" : "Tocar música lounge"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          {/* Volume controls (visible on hover) */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                className="flex items-center gap-2 flex-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={toggleMute}
                  className="text-gray-300 hover:text-white transition-colors shrink-0"
                  title={isMuted ? "Ativar som" : "Silenciar"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={16} />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${ORANGE} 0%, ${ORANGE} ${(isMuted ? 0 : volume) * 100}%, #333 ${(isMuted ? 0 : volume) * 100}%, #333 100%)`,
                  }}
                  title="Volume"
                />

                <span className="text-xs text-gray-400 w-8 text-right shrink-0">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Pulsing music icon when playing */}
      {isPlaying && !showControls && (
        <motion.div
          className="absolute -top-1 -right-1 pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Music size={12} style={{ color: ORANGE }} />
        </motion.div>
      )}

      {/* Prompt to click if not yet interacted */}
      {!hasInteracted && (
        <motion.div
          className="absolute -top-10 right-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: "rgba(10, 22, 40, 0.9)",
            color: ORANGE,
            border: `1px solid ${ORANGE}30`,
          }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          🎵 Clique para música
        </motion.div>
      )}
    </div>
  );
}
