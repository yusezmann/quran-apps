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

export type SpeakResult = "ok" | "no-arabic-voice" | "error"

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
 * Bunyikan teks Arab. `audioId` = nama file rekaman (tanpa ekstensi) bila tersedia.
 * Kecepatan sedikit lambat agar jelas untuk anak.
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

  try {
    await (await tts()).speak({ text, lang: "ar-SA", rate: 0.7, pitch: 1.05, volume: 1, category: "playback" })
    return "ok"
  } catch (error: any) {
    const msg = String(error?.message ?? error).toLowerCase()
    return msg.includes("language") || msg.includes("not supported") ? "no-arabic-voice" : "error"
  }
}

/** Cek apakah perangkat punya suara bahasa Arab. */
export async function hasArabicVoice(): Promise<boolean> {
  try {
    const plugin = await tts()
    const { supported } = await plugin.isLanguageSupported({ lang: "ar-SA" })
    if (supported) return true
    const { languages } = await plugin.getSupportedLanguages()
    return languages.some((l) => l.toLowerCase().startsWith("ar"))
  } catch {
    return false
  }
}

/** Android: buka layar pemasangan data suara TTS (untuk menambah bahasa Arab). */
export async function openTtsInstall() {
  try {
    await (await tts()).openInstall()
  } catch {
    // tidak tersedia di web
  }
}
