/**
 * Notification sound library — synthesized via Web Audio API so we don't
 * ship any audio files and everything works offline. Each sound is a small
 * function that schedules oscillators + envelopes on a shared AudioContext.
 *
 * Sounds aim for the "premium iPhone notification" feel: short, sharp,
 * harmonious (no dissonance), peaks under 250 ms, with reverb tails.
 *
 * Apple's actual notification tones (Tri-tone, Note, Anticipate, etc.) are
 * proprietary and we can't ship them. These are originals that evoke the
 * same family of sounds — bell-like, multi-pitched, polished.
 */

let _ctx = null
function getCtx() {
  if (_ctx) return _ctx
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!Ctx) return null
  _ctx = new Ctx()
  return _ctx
}

// Helper to schedule a single note with ADSR envelope, optional pitch glide
function note({ ctx, freq, freq2, time = 0, dur = 0.18, gain = 0.18, type = 'sine', filter, fm }) {
  const t0 = ctx.currentTime + time
  const osc = ctx.createOscillator()
  const g   = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freq2) {
    osc.frequency.exponentialRampToValueAtTime(freq2, t0 + dur * 0.8)
  }

  // Optional FM modulator for bell-like harmonics
  if (fm) {
    const mod = ctx.createOscillator()
    const modGain = ctx.createGain()
    mod.frequency.setValueAtTime(fm.freq, t0)
    modGain.gain.setValueAtTime(fm.depth, t0)
    mod.connect(modGain)
    modGain.connect(osc.frequency)
    mod.start(t0)
    mod.stop(t0 + dur + 0.05)
  }

  // Optional low-pass filter (mellow the high end)
  let chain = osc
  if (filter) {
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(filter, t0)
    osc.connect(f); chain = f
  }

  chain.connect(g)
  g.connect(ctx.destination)

  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008)              // sharp attack
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)              // exponential decay → bell

  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

// ═══════════════════════════════════════════════════════════════════════════
// Sound definitions — each is { id, label, description, play(ctx) }
// ═══════════════════════════════════════════════════════════════════════════

export const SOUNDS = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Soft single bell, the default',
    play: (ctx) => {
      note({ ctx, freq: 880, freq2: 440, dur: 0.30, gain: 0.18, type: 'sine' })
    },
  },
  {
    id: 'tritone',
    label: 'Tri-tone',
    description: 'Three quick rising tones',
    play: (ctx) => {
      const base = 1046  // C6
      note({ ctx, freq: base,           time: 0.00, dur: 0.16, gain: 0.16, type: 'triangle' })
      note({ ctx, freq: base * 1.122,   time: 0.08, dur: 0.16, gain: 0.16, type: 'triangle' })  // D6
      note({ ctx, freq: base * 1.498,   time: 0.16, dur: 0.22, gain: 0.18, type: 'triangle' })  // G6
    },
  },
  {
    id: 'chime',
    label: 'Chime',
    description: 'Bright bell with shimmer',
    play: (ctx) => {
      note({ ctx, freq: 1568, time: 0.00, dur: 0.55, gain: 0.14, type: 'sine',
             fm: { freq: 2.5, depth: 4 } })   // shimmer
      note({ ctx, freq: 1976, time: 0.04, dur: 0.45, gain: 0.10, type: 'sine' })
      note({ ctx, freq: 2349, time: 0.08, dur: 0.35, gain: 0.07, type: 'sine' })
    },
  },
  {
    id: 'pop',
    label: 'Pop',
    description: 'Short percussive pop',
    play: (ctx) => {
      note({ ctx, freq: 1200, freq2: 600, time: 0.00, dur: 0.12, gain: 0.20, type: 'sine', filter: 2400 })
    },
  },
  {
    id: 'glissando',
    label: 'Sweep',
    description: 'Quick upward sweep',
    play: (ctx) => {
      note({ ctx, freq: 440, freq2: 1320, time: 0.00, dur: 0.28, gain: 0.16, type: 'sine' })
      note({ ctx, freq: 660, freq2: 1980, time: 0.04, dur: 0.24, gain: 0.10, type: 'sine' })
    },
  },
  {
    id: 'marimba',
    label: 'Marimba',
    description: 'Two-note marimba',
    play: (ctx) => {
      // Marimba is a sharp attack + fast decay sine with woody overtones
      note({ ctx, freq: 783,  time: 0.00, dur: 0.40, gain: 0.18, type: 'sine', filter: 3200,
             fm: { freq: 3.5, depth: 6 } })
      note({ ctx, freq: 1175, time: 0.10, dur: 0.36, gain: 0.14, type: 'sine', filter: 3200,
             fm: { freq: 3.5, depth: 5 } })
    },
  },
  {
    id: 'twotone',
    label: 'Two-tone',
    description: 'Hi-lo notification',
    play: (ctx) => {
      note({ ctx, freq: 1318, time: 0.00, dur: 0.16, gain: 0.18, type: 'triangle' })
      note({ ctx, freq:  988, time: 0.16, dur: 0.22, gain: 0.18, type: 'triangle' })
    },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Subtle single pulse',
    play: (ctx) => {
      note({ ctx, freq: 660, freq2: 660, time: 0.00, dur: 0.18, gain: 0.12, type: 'sine', filter: 1800 })
    },
  },
]

export const DEFAULT_SOUND_ID = 'tritone'

export function playSound(soundId = DEFAULT_SOUND_ID) {
  const ctx = getCtx()
  if (!ctx) return
  // Some browsers suspend the context until first user interaction —
  // a fresh resume() before play handles that case gracefully.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  const sound = SOUNDS.find(s => s.id === soundId) || SOUNDS[0]
  try { sound.play(ctx) } catch {}
}

export function getSoundById(id) {
  return SOUNDS.find(s => s.id === id) || SOUNDS.find(s => s.id === DEFAULT_SOUND_ID) || SOUNDS[0]
}
