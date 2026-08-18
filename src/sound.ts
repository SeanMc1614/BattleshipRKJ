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

/** Exponential ramps can't touch zero, so silence is approximated by a tiny value. */
const SILENT = 0.0001

function sweep(param: AudioParam, from: number, to: number, start: number, seconds: number): void {
  param.setValueAtTime(from, start)
  param.exponentialRampToValueAtTime(to, start + seconds)
}

/**
 * Gain node that fades from silence up to `peak` over `attack` seconds and back
 * down by `seconds`. With no attack it starts at full volume, as a percussive hit does.
 */
function envelope(
  ctx: AudioContext,
  start: number,
  { peak, seconds, attack = 0 }: { peak: number; seconds: number; attack?: number },
): GainNode {
  const gain = ctx.createGain()
  if (attack > 0) {
    sweep(gain.gain, SILENT, peak, start, attack)
    sweep(gain.gain, peak, SILENT, start + attack, seconds - attack)
  } else {
    sweep(gain.gain, peak, SILENT, start, seconds)
  }
  return gain
}

function tone(ctx: AudioContext, from: number, to: number, start: number, seconds: number): OscillatorNode {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  sweep(osc.frequency, from, to, start, seconds)
  return osc
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

  const osc = tone(ctx, 1500, 320, now, seconds)
  osc.connect(envelope(ctx, now, { peak: 0.16, seconds, attack: 0.12 })).connect(ctx.destination)
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
  sweep(filter.frequency, 1800, 180, now, 0.9)
  blast
    .connect(filter)
    .connect(envelope(ctx, now, { peak: 0.5, seconds: 0.9 }))
    .connect(ctx.destination)
  blast.start(now)

  const thump = tone(ctx, 120, 38, now, 0.5)
  thump.connect(envelope(ctx, now, { peak: 0.6, seconds: 0.5 })).connect(ctx.destination)
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
  sweep(band.frequency, 2400, 500, now, 0.45)

  source
    .connect(band)
    .connect(envelope(ctx, now, { peak: 0.35, seconds: 0.5, attack: 0.04 }))
    .connect(ctx.destination)
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
