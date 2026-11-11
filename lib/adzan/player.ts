import { ADZAN_SOUNDS, type AdzanSoundId } from "./settings"

/** Satu pemutar audio adzan untuk seluruh aplikasi (adzan baru menghentikan yang lama). */
let audio: HTMLAudioElement | null = null
const endedListeners = new Set<() => void>()

export type PlayResult = "playing" | "blocked" | "error"

export async function playAdzanSound(id: AdzanSoundId): Promise<PlayResult> {
  stopAdzanSound()
  const el = new Audio(ADZAN_SOUNDS[id].src)
  audio = el
  el.addEventListener("ended", () => {
    if (audio === el) audio = null
    endedListeners.forEach((cb) => cb())
  })
  try {
    await el.play()
    return "playing"
  } catch (error: any) {
    if (audio === el) audio = null
    // Browser menolak autoplay tanpa interaksi pengguna sebelumnya
    return error?.name === "NotAllowedError" ? "blocked" : "error"
  }
}

export function stopAdzanSound() {
  if (!audio) return
  audio.pause()
  audio.currentTime = 0
  audio = null
}

export function isAdzanPlaying(): boolean {
  return !!audio && !audio.paused
}

export function onAdzanEnded(cb: () => void): () => void {
  endedListeners.add(cb)
  return () => endedListeners.delete(cb)
}
