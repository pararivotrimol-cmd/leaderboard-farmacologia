/**
 * Lounge Playlist Component
 * Reproduz músicas lounge royalty-free com rotação automática
 */
import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, SkipForward, Volume2 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
}

// Faixas de lounge royalty-free (URLs podem ser atualizadas com faixas reais do Pixabay/Bensound)
const LOUNGE_TRACKS: Track[] = [
  {
    id: "1",
    title: "Retro Lounge",
    artist: "Bransboynd",
    duration: 106,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1234567_retro_lounge.mp3" // Placeholder
  },
  {
    id: "2",
    title: "Jazz Lounge Elevator",
    artist: "lkoliks",
    duration: 87,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1234568_jazz_lounge.mp3" // Placeholder
  },
  {
    id: "3",
    title: "Lounge Beats",
    artist: "NastelBom",
    duration: 142,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1234569_lounge_beats.mp3" // Placeholder
  },
  {
    id: "4",
    title: "Tropic Daze",
    artist: "AlexGrohl",
    duration: 137,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1234570_tropic_daze.mp3" // Placeholder
  },
  {
    id: "5",
    title: "Cozy Chill Lounge",
    artist: "Poradovskyi",
    duration: 124,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1234571_cozy_chill.mp3" // Placeholder
  },
];

export default function LoungePlaylist() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [isExpanded, setIsExpanded] = useState(false);

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

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  // Update audio element when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Handle autoplay policy restrictions
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
        audioRef.current.play().catch(() => {
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
      <audio ref={audioRef} crossOrigin="anonymous" />

      {/* Playlist Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 p-3 rounded-full shadow-lg transition-all hover:scale-110"
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
          className="w-80 rounded-lg shadow-2xl p-4 space-y-4 mb-2"
          style={{
            backgroundColor: "#0D1B2A",
            border: "1px solid rgba(247, 148, 29, 0.3)",
          }}
        >
          {/* Current Track Info */}
          <div>
            <h3 className="text-white font-bold text-lg">{currentTrack.title}</h3>
            <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
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
              className="p-2 rounded-full transition-all hover:scale-110"
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
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{
                backgroundColor: "rgba(247, 148, 29, 0.3)",
                color: "#F7941D",
              }}
            >
              <SkipForward size={20} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Volume2 size={16} style={{ color: "#F7941D" }} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16"
                style={{
                  accentColor: "#F7941D",
                }}
              />
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-xs text-gray-400 font-semibold">PLAYLIST</p>
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
                <div className="text-sm font-medium">{track.title}</div>
                <div className="text-xs text-gray-400">{track.artist}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
