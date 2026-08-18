/** Synthesised battle sounds and spoken call-outs, in the spirit of Electronic Talking Battleship. */

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export const WHISTLE_MS = 1000

const STORAGE_KEY = 'battleship-sound'

let context: AudioContext | null = null
let soundOn = readStored()

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function isSoundOn(): boolean {
  return soundOn
}

export function setSoundOn(on: boolean): void {
  soundOn = on
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // Private browsing: the preference just won't persist.
  }
  if (!on) window.speechSynthesis?.cancel()
}

/** Browsers only allow audio after a user gesture, so the context is created on first use. */
function audio(): AudioContext | null {
  if (!soundOn) return null
  if (!context) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext
    if (!Ctor) return null
    context = new Ctor()
  }
  if (context.state === 'suspended') void context.resume()
  return context
}

function noise(ctx: AudioContext, seconds: number): AudioBufferSourceNode {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  return source
}

/** Descending shell whistle: the shot is in the air. */
export function playWhistle(): void {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  const seconds = WHISTLE_MS / 1000

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1500, now)
  osc.frequency.exponentialRampToValueAtTime(320, now + seconds)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.12)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds)

  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + seconds)
}

/** Thump plus a filtered noise burst. */
export function playExplosion(): void {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime

  const blast = noise(ctx, 0.9)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1800, now)
  filter.frequency.exponentialRampToValueAtTime(180, now + 0.9)

  const blastGain = ctx.createGain()
  blastGain.gain.setValueAtTime(0.5, now)
  blastGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)
  blast.connect(filter).connect(blastGain).connect(ctx.destination)
  blast.start(now)

  const thump = ctx.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(120, now)
  thump.frequency.exponentialRampToValueAtTime(38, now + 0.5)
  const thumpGain = ctx.createGain()
  thumpGain.gain.setValueAtTime(0.6, now)
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
  thump.connect(thumpGain).connect(ctx.destination)
  thump.start(now)
  thump.stop(now + 0.5)
}

/** Short watery splash for a miss. */
export function playSplash(): void {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime

  const source = noise(ctx, 0.5)
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 0.9
  band.frequency.setValueAtTime(2400, now)
  band.frequency.exponentialRampToValueAtTime(500, now + 0.45)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.35, now + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)

  source.connect(band).connect(gain).connect(ctx.destination)
  source.start(now)
}

/** Speaks a call-out such as "Hit! Cruiser" using the browser voice. */
export function say(text: string): void {
  if (!soundOn) return
  const speech = window.speechSynthesis
  if (!speech) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 0.9
  speech.cancel()
  speech.speak(utterance)
}
