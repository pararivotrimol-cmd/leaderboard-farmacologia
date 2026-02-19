import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause, Music, SkipForward, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ORANGE = "#F7941D";

// 10 músicas lounge hospedadas no CDN (URLs reais verificadas)
const LOUNGE_TRACKS = [
  { title: "Lounge Groove 1", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/QclUBaMsTWjOfyzF.mp3" },
  { title: "Smooth Vibes", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/QoLcqWJhhfKNntMN.mp3" },
  { title: "Chill Ambient", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/bNgqplxFRGkTFsxH.mp3" },
  { title: "Relaxing Beat", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/cPyaXLcFUgGLMWAp.mp3" },
  { title: "Evening Mood", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/KKvrsrWMCcgaHHKp.mp3" },
  { title: "Soft Jazz", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/wXlRGvxKwqOBJGoW.mp3" },
  { title: "Mellow Flow", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/NQaAjktTgJIuqLJk.mp3" },
  { title: "Peaceful Piano", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/nFVhEhgnAUnXEZjJ.mp3" },
  { title: "Calm Lounge", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/FjZbqjXespkOIyxn.mp3" },
  { title: "Deep Relax", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/PIokKCfiIDAXWAHD.mp3" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrackTitle, setCurrentTrackTitle] = useState("Lounge Mix");
  const [shuffledTracks, setShuffledTracks] = useState(() => shuffleArray(LOUNGE_TRACKS));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasSetupRef = useRef(false);

  // Create audio element once
  useEffect(() => {
    if (hasSetupRef.current) return;
    hasSetupRef.current = true;

    const audio = new Audio();
    audio.volume = 0.25;
    audio.preload = "auto";
    audioRef.current = audio;

    // Load first track
    const firstTrack = shuffledTracks[0];
    audio.src = firstTrack.url;
    setCurrentTrackTitle(firstTrack.title);

    audio.addEventListener("ended", () => {
      setCurrentTrackIndex(prev => {
        const next = (prev + 1) % shuffledTracks.length;
        return next;
      });
    });

    audio.addEventListener("error", (e) => {
      console.warn("Audio error, skipping track:", e);
      setCurrentTrackIndex(prev => (prev + 1) % shuffledTracks.length);
    });

    // Auto-start on first user interaction
    const startOnInteraction = () => {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Autoplay blocked:", err);
      });
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
    };

    document.addEventListener("click", startOnInteraction);
    document.addEventListener("touchstart", startOnInteraction);
    document.addEventListener("keydown", startOnInteraction);

    return () => {
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
    };
  }, []);

  // Change track when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || shuffledTracks.length === 0) return;

    const track = shuffledTracks[currentTrackIndex];
    setCurrentTrackTitle(track.title);
    audio.src = track.url;
    audio.load();

    if (isPlaying) {
      audio.play().catch(err => console.warn("Play failed:", err));
    }
  }, [currentTrackIndex]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(err => console.warn(err));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const skipTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTrackIndex(prev => (prev + 1) % shuffledTracks.length);
  };

  const reshuffleAndPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newShuffle = shuffleArray(LOUNGE_TRACKS);
    setShuffledTracks(newShuffle);
    setCurrentTrackIndex(0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) setIsMuted(false);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-40"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <motion.div
        className="backdrop-blur-md rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "rgba(10, 22, 40, 0.92)",
          border: `1px solid ${ORANGE}40`,
        }}
        initial={{ width: 56, height: 56 }}
        animate={{
          width: showControls ? 300 : 56,
          height: showControls ? "auto" : 56,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-3">
          <div className="flex items-center gap-2">
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

            <AnimatePresence>
              {showControls && (
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xs text-white font-medium truncate">{currentTrackTitle}</div>
                  <div className="text-[10px]" style={{ color: `${ORANGE}99` }}>
                    {currentTrackIndex + 1}/{shuffledTracks.length} • Lounge Mix
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={skipTrack}
                    className="p-1.5 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${ORANGE}20`, color: ORANGE }}
                    title="Próxima música"
                  >
                    <SkipForward size={14} />
                  </button>
                  <button
                    onClick={reshuffleAndPlay}
                    className="p-1.5 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${ORANGE}20`, color: ORANGE }}
                    title="Embaralhar playlist"
                  >
                    <Shuffle size={14} />
                  </button>
                  <button
                    onClick={toggleMute}
                    className="text-gray-300 hover:text-white transition-colors shrink-0 ml-auto"
                    title={isMuted ? "Ativar som" : "Silenciar"}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${ORANGE} 0%, ${ORANGE} ${(isMuted ? 0 : volume) * 100}%, #333 ${(isMuted ? 0 : volume) * 100}%, #333 100%)`,
                    }}
                    title="Volume"
                  />
                  <span className="text-[10px] text-gray-400 w-7 text-right shrink-0">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {isPlaying && !showControls && (
        <motion.div
          className="absolute -top-1 -right-1 pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Music size={12} style={{ color: ORANGE }} />
        </motion.div>
      )}

      {!isPlaying && (
        <motion.div
          className="absolute -top-10 right-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: "rgba(10, 22, 40, 0.9)",
            color: ORANGE,
            border: `1px solid ${ORANGE}30`,
          }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          🎵 Clique para música lounge
        </motion.div>
      )}
    </div>
  );
}
