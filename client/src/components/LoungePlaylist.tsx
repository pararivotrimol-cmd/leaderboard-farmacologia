/**
 * Lounge Playlist Component
 * Reproduz músicas lounge royalty-free com rotação automática
 */
import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, SkipForward, Volume2, Volume1 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
}

// Faixas de lounge royalty-free com URLs reais do Bensound (royalty-free)
const LOUNGE_TRACKS: Track[] = [
  {
    id: "1",
    title: "Sunny",
    artist: "Bensound",
    duration: 180,
    url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3"
  },
  {
    id: "2",
    title: "Ukulele",
    artist: "Bensound",
    duration: 150,
    url: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3"
  },
  {
    id: "3",
    title: "Cafe",
    artist: "Bensound",
    duration: 240,
    url: "https://www.bensound.com/bensound-music/bensound-cafe.mp3"
  },
  {
    id: "4",
    title: "Relaxing",
    artist: "Bensound",
    duration: 210,
    url: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3"
  },
  {
    id: "5",
    title: "Ambient",
    artist: "Bensound",
    duration: 300,
    url: "https://www.bensound.com/bensound-music/bensound-ambient.mp3"
  },
];

export default function LoungePlaylist() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentTrack = LOUNGE_TRACKS[currentTrackIndex];

  // Auto-play next track when current ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % LOUNGE_TRACKS.length);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Update audio element when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.warn("Play error:", err);
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % LOUNGE_TRACKS.length);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = (currentTime / currentTrack.duration) * 100;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="auto"
      />

      {/* Playlist Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 p-3 rounded-full shadow-lg transition-all hover:scale-110 animate-pulse"
        style={{
          backgroundColor: "#F7941D",
          color: "#fff",
        }}
        title="Playlist de Lounge"
      >
        <Music size={24} />
      </button>

      {/* Expanded Playlist */}
      {isExpanded && (
        <div
          className="w-80 rounded-lg shadow-2xl p-4 space-y-4 mb-2 max-h-96 overflow-hidden flex flex-col"
          style={{
            backgroundColor: "#0D1B2A",
            border: "1px solid rgba(247, 148, 29, 0.3)",
          }}
        >
          {/* Current Track Info */}
          <div>
            <h3 className="text-white font-bold text-lg">{currentTrack.title}</h3>
            <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
            {isLoading && <p className="text-xs text-yellow-400 mt-1">Carregando...</p>}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full transition-all"
                style={{
                  backgroundColor: "#F7941D",
                  width: `${progressPercent}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="p-2 rounded-full transition-all hover:scale-110 disabled:opacity-50"
              style={{
                backgroundColor: "#F7941D",
                color: "#fff",
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Skip */}
            <button
              onClick={skipTrack}
              disabled={isLoading}
              className="p-2 rounded-full transition-all hover:scale-110 disabled:opacity-50"
              style={{
                backgroundColor: "rgba(247, 148, 29, 0.3)",
                color: "#F7941D",
              }}
            >
              <SkipForward size={20} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1">
              {volume === 0 ? (
                <Volume1 size={16} style={{ color: "#F7941D" }} />
              ) : (
                <Volume2 size={16} style={{ color: "#F7941D" }} />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-12"
                style={{
                  accentColor: "#F7941D",
                }}
              />
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-2 overflow-y-auto flex-1">
            <p className="text-xs text-gray-400 font-semibold sticky top-0">PLAYLIST</p>
            {LOUNGE_TRACKS.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setCurrentTime(0);
                  setIsPlaying(true);
                }}
                className="w-full text-left p-2 rounded transition-all hover:bg-opacity-80"
                style={{
                  backgroundColor:
                    index === currentTrackIndex
                      ? "rgba(247, 148, 29, 0.3)"
                      : "rgba(255,255,255,0.05)",
                  color: index === currentTrackIndex ? "#F7941D" : "#fff",
                }}
              >
                <div className="text-sm font-medium truncate">{track.title}</div>
                <div className="text-xs text-gray-400">{track.artist}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
