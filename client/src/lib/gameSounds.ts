/**
 * Game Sound Effects using Web Audio API
 * No external files needed — all sounds are synthesized programmatically.
 */

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

/** Play a sequence of notes */
function playNotes(
  notes: Array<{ freq: number; duration: number; delay: number; type?: OscillatorType; volume?: number }>
) {
  try {
    const ctx = getAudioCtx();
    notes.forEach(({ freq, duration, delay, type = "sine", volume = 0.3 }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    });
  } catch {
    // Silently fail if audio is not available
  }
}

/** 🎺 Victory fanfare — triumphant ascending notes */
export function playVictorySound() {
  playNotes([
    { freq: 523, duration: 0.15, delay: 0, type: "square", volume: 0.25 },
    { freq: 659, duration: 0.15, delay: 0.15, type: "square", volume: 0.25 },
    { freq: 784, duration: 0.15, delay: 0.30, type: "square", volume: 0.25 },
    { freq: 1047, duration: 0.40, delay: 0.45, type: "square", volume: 0.30 },
    // Harmony
    { freq: 659, duration: 0.40, delay: 0.45, type: "sine", volume: 0.15 },
    { freq: 784, duration: 0.40, delay: 0.45, type: "sine", volume: 0.10 },
    // Sparkle
    { freq: 1568, duration: 0.10, delay: 0.85, type: "sine", volume: 0.15 },
    { freq: 2093, duration: 0.20, delay: 0.95, type: "sine", volume: 0.10 },
  ]);
}

/** 🔔 Correct answer — short positive chime */
export function playCorrectSound() {
  playNotes([
    { freq: 880, duration: 0.12, delay: 0, type: "sine", volume: 0.25 },
    { freq: 1108, duration: 0.20, delay: 0.10, type: "sine", volume: 0.20 },
  ]);
}

/** ❌ Wrong answer — low descending buzz */
export function playWrongSound() {
  playNotes([
    { freq: 300, duration: 0.15, delay: 0, type: "sawtooth", volume: 0.20 },
    { freq: 220, duration: 0.25, delay: 0.12, type: "sawtooth", volume: 0.15 },
    { freq: 150, duration: 0.30, delay: 0.30, type: "sawtooth", volume: 0.10 },
  ]);
}

/** 💀 Boss defeat (player loses) — dramatic descending */
export function playDefeatSound() {
  playNotes([
    { freq: 440, duration: 0.20, delay: 0, type: "sawtooth", volume: 0.20 },
    { freq: 370, duration: 0.20, delay: 0.20, type: "sawtooth", volume: 0.18 },
    { freq: 311, duration: 0.20, delay: 0.40, type: "sawtooth", volume: 0.15 },
    { freq: 220, duration: 0.50, delay: 0.60, type: "sawtooth", volume: 0.12 },
  ]);
}

/** 🎵 Boss encounter — ominous low rumble */
export function playBossEncounterSound() {
  playNotes([
    { freq: 110, duration: 0.30, delay: 0, type: "sawtooth", volume: 0.15 },
    { freq: 130, duration: 0.30, delay: 0.30, type: "sawtooth", volume: 0.15 },
    { freq: 110, duration: 0.60, delay: 0.60, type: "sawtooth", volume: 0.12 },
    { freq: 98, duration: 0.80, delay: 1.00, type: "sawtooth", volume: 0.10 },
  ]);
}

/** ⭐ Week complete — celebratory arpeggio */
export function playWeekCompleteSound() {
  const scale = [523, 659, 784, 1047, 1319, 1568];
  playNotes(scale.map((freq, i) => ({
    freq,
    duration: 0.20,
    delay: i * 0.10,
    type: "square" as OscillatorType,
    volume: 0.20,
  })));
  // Final chord
  playNotes([
    { freq: 1047, duration: 0.60, delay: 0.65, type: "sine", volume: 0.20 },
    { freq: 1319, duration: 0.60, delay: 0.65, type: "sine", volume: 0.15 },
    { freq: 1568, duration: 0.60, delay: 0.65, type: "sine", volume: 0.10 },
  ]);
}
