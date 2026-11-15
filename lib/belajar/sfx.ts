"use client"

/**
 * Efek suara game dibuat langsung dengan Web Audio (tanpa file, tanpa lisensi).
 * Lembut & pendek — tidak ada bunyi "salah" yang mengagetkan anak.
 */
let ctx: AudioContext | null = null
const audio = () => {
  if (typeof window === "undefined") return null
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === "suspended") void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", gain = 0.18) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + start
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(g).connect(a.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

/** Balon pecah: letupan pendek */
export function sfxPop() {
  const a = audio()
  if (!a) return
  const len = Math.floor(a.sampleRate * 0.12)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  const src = a.createBufferSource()
  const g = a.createGain()
  g.gain.value = 0.5
  src.buffer = buf
  src.connect(g).connect(a.destination)
  src.start()
  tone(900, 0, 0.08, "triangle", 0.12)
}

/** Benar: dua nada naik */
export function sfxCorrect() {
  tone(660, 0, 0.18)
  tone(990, 0.12, 0.28)
}

/** Kartu dibalik: klik lembut */
export function sfxFlip() {
  tone(520, 0, 0.07, "triangle", 0.1)
}

/** Selesai / stiker baru: arpeggio ceria */
export function sfxWin() {
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.35))
}
