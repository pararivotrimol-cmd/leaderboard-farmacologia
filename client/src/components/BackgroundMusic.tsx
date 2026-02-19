import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Background Music Player
 * Plays lounge music with volume controls
 * Uses royalty-free music from Pixabay/Mixkit
 */
export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Royalty-free lounge music playlist (using placeholder URLs)
  // TODO: Replace with actual royalty-free music URLs from Pixabay/Mixkit
  const playlist = [
    "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3", // Lounge track 1
    "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c0e3e2e0.mp3", // Lounge track 2
  ];

  const [currentTrack, setCurrentTrack] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.warn("Audio playback failed:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleTrackEnd = () => {
    // Play next track in playlist
    const nextTrack = (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
    if (audioRef.current) {
      audioRef.current.src = playlist[nextTrack];
      audioRef.current.play().catch(err => {
        console.warn("Audio playback failed:", err);
      });
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
        src={playlist[currentTrack]}
        onEnded={handleTrackEnd}
        loop={false}
      />

      <motion.div
        className="bg-gray-900/90 backdrop-blur-sm rounded-full shadow-2xl border border-gray-700"
        initial={{ width: 48, height: 48 }}
        animate={{
          width: showControls ? 220 : 48,
          height: 48,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2 p-2">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "#F7941D",
              color: "#fff",
            }}
            title={isPlaying ? "Pausar música" : "Tocar música"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
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
                  className="text-gray-300 hover:text-white transition-colors"
                  title={isMuted ? "Ativar som" : "Silenciar"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={18} />
                  ) : (
                    <Volume2 size={18} />
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
                    background: `linear-gradient(to right, #F7941D 0%, #F7941D ${(isMuted ? 0 : volume) * 100}%, #4A4A4A ${(isMuted ? 0 : volume) * 100}%, #4A4A4A 100%)`,
                  }}
                  title="Volume"
                />

                <span className="text-xs text-gray-400 w-8 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating music note animation when playing */}
      {isPlaying && (
        <motion.div
          className="absolute -top-2 -left-2 text-2xl"
          animate={{
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🎵
        </motion.div>
      )}
    </div>
  );
}
