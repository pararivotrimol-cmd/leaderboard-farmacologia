import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause, Music, SkipForward, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ORANGE = "#F7941D";

// Música autoral do projeto (para vinheta)
const AUTORAL_TRACK = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/dyTXKdfarsaUsmEI.mp3";

// 10 músicas lounge royalty-free do Pixabay CDN
const LOUNGE_TRACKS = [
  { title: "Ambient Piano", url: "https://cdn.pixabay.com/audio/2024/11/29/audio_e3e1b42e2d.mp3" },
  { title: "Calm Lounge", url: "https://cdn.pixabay.com/audio/2024/09/10/audio_6e1ebc5c8e.mp3" },
  { title: "Soft Jazz", url: "https://cdn.pixabay.com/audio/2024/10/08/audio_0b2c3f3806.mp3" },
  { title: "Chill Vibes", url: "https://cdn.pixabay.com/audio/2024/08/27/audio_a1e6c56e80.mp3" },
  { title: "Relaxing Beats", url: "https://cdn.pixabay.com/audio/2024/11/14/audio_7b8e446e1a.mp3" },
  { title: "Evening Mood", url: "https://cdn.pixabay.com/audio/2024/07/23/audio_3a1b8c2e5f.mp3" },
  { title: "Smooth Background", url: "https://cdn.pixabay.com/audio/2024/06/18/audio_4d2e7f1a3b.mp3" },
  { title: "Lounge Beat", url: "https://cdn.pixabay.com/audio/2024/05/12/audio_9c3a5b7d2e.mp3" },
  { title: "Mellow Groove", url: "https://cdn.pixabay.com/audio/2024/04/15/audio_2f8e6a4c1d.mp3" },
  { title: "Peaceful Ambient", url: "https://cdn.pixabay.com/audio/2024/03/20/audio_7a1d3e5b9c.mp3" },
];

// Shuffle array
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Background Music Player
 * - Plays autoral track during vinheta
 * - After vinheta, plays 10 lounge tracks in random order
 * - Auto-starts on first user interaction (click/touch)
 */
export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrackTitle, setCurrentTrackTitle] = useState("Lounge Mix");
  const [shuffledTracks, setShuffledTracks] = useState(() => shuffleArray(LOUNGE_TRACKS));
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize with first shuffled track
  useEffect(() => {
    if (shuffledTracks.length > 0) {
      setCurrentTrackTitle(shuffledTracks[0].title);
    }
  }, []);

  // Handle track ended - play next in shuffled order
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % shuffledTracks.length;
      if (nextIndex === 0) {
        // Re-shuffle when all tracks played
        setShuffledTracks(shuffleArray(LOUNGE_TRACKS));
      }
      setCurrentTrackIndex(nextIndex);
    };

    const handleError = () => {
      console.warn("Audio error, skipping to next track");
      setAudioError(true);
      // Skip to next track on error
      const nextIndex = (currentTrackIndex + 1) % shuffledTracks.length;
      setCurrentTrackIndex(nextIndex);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrackIndex, shuffledTracks]);

  // Load and play track when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || shuffledTracks.length === 0) return;

    const track = shuffledTracks[currentTrackIndex];
    setCurrentTrackTitle(track.title);
    setAudioError(false);
    audio.src = track.url;
    audio.load();

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn("Autoplay blocked:", err);
      });
    }
  }, [currentTrackIndex, shuffledTracks]);

  // Auto-play on first user interaction
  const startPlayback = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);

    if (audioRef.current) {
      audioRef.current.volume = volume;
      const track = shuffledTracks[currentTrackIndex];
      if (!audioRef.current.src || audioRef.current.src === "") {
        audioRef.current.src = track.url;
        audioRef.current.load();
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback failed:", err);
      });
    }
  }, [hasInteracted, volume, shuffledTracks, currentTrackIndex]);

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

  // Update volume
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
        }).catch((err) => {
          console.warn("Audio playback failed:", err);
        });
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const skipTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentTrackIndex + 1) % shuffledTracks.length;
    setCurrentTrackIndex(nextIndex);
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
        preload="auto"
        crossOrigin="anonymous"
      />

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

            {/* Track info (visible on hover) */}
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

          {/* Extended controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-2"
              >
                {/* Control buttons */}
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
                    {isMuted || volume === 0 ? (
                      <VolumeX size={14} />
                    ) : (
                      <Volume2 size={14} />
                    )}
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
          🎵 Clique para música lounge
        </motion.div>
      )}
    </div>
  );
}
