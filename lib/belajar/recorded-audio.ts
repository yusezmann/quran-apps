/**
 * Daftar rekaman suara asli yang sudah tersedia di public/assets/belajar/audio/.
 *
 * CARA MENAMBAH REKAMAN (mis. suara ustadz/ustadzah atau orang tua):
 * 1. Simpan file MP3 di public/assets/belajar/audio/ dengan nama:
 *    - nama huruf      : <id>.mp3          mis. "ba.mp3"   (dibaca "baa")
 *    - huruf berfathah : <id>-fathah.mp3   mis. "ba-fathah.mp3" (dibaca "ba")
 *    id huruf ada di lib/belajar/letters.ts (alif, ba, ta, tsa, jim, ...)
 * 2. Tambahkan nama filenya (tanpa .mp3) ke daftar di bawah.
 * Huruf yang belum direkam otomatis memakai suara bawaan HP.
 */
export const RECORDED_AUDIO = new Set<string>([
  // "alif", "alif-fathah", "ba", "ba-fathah", ...
])
