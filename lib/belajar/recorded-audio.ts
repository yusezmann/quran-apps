import recorded from "./recorded-audio.json"

/**
 * Daftar file suara yang tersedia di public/assets/belajar/audio/ (tanpa .mp3).
 * Diisi otomatis oleh `npm run belajar:audio` (Google Cloud TTS) — lihat scripts/generate-belajar-audio.ts.
 *
 * MENGGANTI DENGAN REKAMAN SENDIRI (mis. suara ustadz/ustadzah):
 * timpa file MP3 dengan nama yang sama, mis. "ba.mp3" (nama huruf) atau "ba-fathah.mp3" (dibaca "ba").
 * Huruf yang tidak punya file otomatis memakai suara bawaan HP.
 */
export const RECORDED_AUDIO = new Set<string>(recorded as string[])
