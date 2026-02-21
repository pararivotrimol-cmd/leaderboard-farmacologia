import { createContext, useContext, useRef, useCallback, useEffect, ReactNode } from "react";

/**
 * Audio Context - Gerenciamento global de áudio
 * Garante que apenas um player toque por vez, evitando sobreposição
 */

interface AudioContextType {
  registerPlayer: (id: string, audioElement: HTMLAudioElement) => void;
  unregisterPlayer: (id: string) => void;
  playAudio: (id: string) => void;
  pauseAudio: (id: string) => void;
  pauseAllExcept: (exceptId?: string) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const playersRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const wasPlayingRef = useRef<Set<string>>(new Set());

  // Pausar todos os players quando a página perde o foco (mobile-friendly)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página ficou oculta - pausar todos os players e guardar quais estavam tocando
        wasPlayingRef.current.clear();
        playersRef.current.forEach((audio, id) => {
          if (!audio.paused) {
            wasPlayingRef.current.add(id);
            audio.pause();
          }
        });
      } else {
        // Página voltou a ficar visível - retomar players que estavam tocando
        wasPlayingRef.current.forEach((id) => {
          const audio = playersRef.current.get(id);
          if (audio) {
            audio.play().catch(() => {});
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const registerPlayer = useCallback((id: string, audioElement: HTMLAudioElement) => {
    playersRef.current.set(id, audioElement);
  }, []);

  const unregisterPlayer = useCallback((id: string) => {
    const audio = playersRef.current.get(id);
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    playersRef.current.delete(id);
  }, []);

  const playAudio = useCallback((id: string) => {
    const audio = playersRef.current.get(id);
    if (audio) {
      // Pausar todos os outros players antes de tocar este
      playersRef.current.forEach((otherAudio, otherId) => {
        if (otherId !== id && !otherAudio.paused) {
          otherAudio.pause();
        }
      });
      
      audio.play().catch((err) => {
        console.warn(`Audio play failed for ${id}:`, err);
      });
    }
  }, []);

  const pauseAudio = useCallback((id: string) => {
    const audio = playersRef.current.get(id);
    if (audio && !audio.paused) {
      audio.pause();
    }
  }, []);

  const pauseAllExcept = useCallback((exceptId?: string) => {
    playersRef.current.forEach((audio, id) => {
      if (id !== exceptId && !audio.paused) {
        audio.pause();
      }
    });
  }, []);

  return (
    <AudioContext.Provider
      value={{
        registerPlayer,
        unregisterPlayer,
        playAudio,
        pauseAudio,
        pauseAllExcept,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within AudioProvider");
  }
  return context;
}
