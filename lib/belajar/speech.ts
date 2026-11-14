"use client"

import { RECORDED_AUDIO } from "./recorded-audio"

/** Plugin dimuat saat dipakai (di browser), karena ia mengakses `window` dan gagal saat prerender. */
const tts = () => import("@capacitor-community/text-to-speech").then((m) => m.TextToSpeech)

/**
 * Suara untuk "Belajar":
 * 1. Bila ada rekaman asli (lib/belajar/recorded-audio.ts), putar file itu — paling akurat.
 * 2. Selain itu pakai suara bawaan perangkat (TTS bahasa Arab) lewat plugin
 *    @capacitor-community/text-to-speech (Android: mesin TTS HP; web: suara browser).
 */

let currentAudio: HTMLAudioElement | null = null

/** Kode bahasa Arab yang dicoba berurutan (mesin TTS mendaftarkan suara Arab dengan kode berbeda-beda). */
const ARABIC_TAGS = ["ar", "ar-SA", "ar-XA", "ar-EG", "ar-AE"]
let arabicTag: string | null = null

/** Dikirim ke halaman bila suara Arab tidak bisa diputar, agar petunjuk pemasangan ditampilkan. */
export const NO_VOICE_EVENT = "belajar:no-arabic-voice"

export type SpeakResult = "ok" | "no-arabic-voice" | "error"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function stopSpeaking() {
  currentAudio?.pause()
  currentAudio = null
  try {
    await (await tts()).stop()
  } catch {
    // abaikan
  }
}

/**
 * Cari kode bahasa Arab yang benar-benar terpasang (data suara sudah ada).
 * Catatan: daftar `getSupportedLanguages` memuat bahasa Arab walau data suaranya BELUM diunduh,
 * jadi tidak dipakai sebagai patokan — hanya `isLanguageSupported` per kode.
 */
async function findArabicTag(): Promise<string | null> {
  if (arabicTag) return arabicTag
  const plugin = await tts()
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      for (const lang of ARABIC_TAGS) {
        const { supported } = await plugin.isLanguageSupported({ lang })
        if (supported) {
          arabicTag = lang
          return lang
        }
      }
      return null
    } catch {
      // Mesin TTS Android baru siap beberapa saat setelah aplikasi dibuka
      await delay(600)
    }
  }
  return null
}

/** Cek apakah perangkat punya suara bahasa Arab yang siap dipakai. */
export async function hasArabicVoice(): Promise<boolean> {
  try {
    return (await findArabicTag()) !== null
  } catch {
    return false
  }
}

/**
 * Bunyikan teks Arab. `audioId` = nama file rekaman (tanpa ekstensi) bila tersedia.
 * Kecepatan sedikit lambat agar jelas untuk anak. Bila gagal, kirim NO_VOICE_EVENT.
 */
export async function speakArabic(text: string, audioId?: string): Promise<SpeakResult> {
  await stopSpeaking()

  if (audioId && RECORDED_AUDIO.has(audioId)) {
    try {
      const el = new Audio(`/assets/belajar/audio/${audioId}.mp3`)
      currentAudio = el
      await el.play()
      return "ok"
    } catch {
      // lanjut ke TTS
    }
  }

  const lang = await findArabicTag().catch(() => null)
  if (!lang) {
    window.dispatchEvent(new Event(NO_VOICE_EVENT))
    return "no-arabic-voice"
  }

  try {
    const plugin = await tts()
    // Jangan ditunggu sampai selesai bicara (speak resolve setelah ucapan berakhir)
    plugin.speak({ text, lang, rate: 0.7, pitch: 1.05, volume: 1, category: "playback" }).catch((error) => {
      console.error("TTS gagal:", error)
      window.dispatchEvent(new Event(NO_VOICE_EVENT))
    })
    return "ok"
  } catch (error) {
    console.error("TTS gagal:", error)
    window.dispatchEvent(new Event(NO_VOICE_EVENT))
    return "error"
  }
}

/** Android: buka layar pemasangan data suara TTS (untuk menambah bahasa Arab). */
export async function openTtsInstall() {
  try {
    arabicTag = null // cek ulang setelah pengguna memasang suara
    await (await tts()).openInstall()
  } catch {
    // tidak tersedia di web
  }
}
