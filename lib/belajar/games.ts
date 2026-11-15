import { LESSONS, LETTERS, lettersUpTo, type Letter } from "./letters"
import type { LetterStat } from "./progress"
import { weakLetters } from "./stats"

export const shuffle = <T,>(arr: readonly T[]): T[] =>
  arr
    .map((v) => [Math.random(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v)

export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

/** Pelajaran terakhir yang sudah terbuka (pelajaran sebelumnya punya bintang). */
export function highestUnlocked(stars: Record<number, number>) {
  let i = 0
  while (i + 1 < LESSONS.length && (stars[i] ?? 0) > 0) i++
  return i
}

/**
 * Huruf untuk game: hanya yang sudah/sedang dipelajari.
 * `fresh` = huruf pelajaran terbaru, `weak` = huruf yang masih sering salah (dari catatan jawaban).
 */
export function gamePool(stars: Record<number, number>, letterStats: Record<string, LetterStat> = {}) {
  const top = highestUnlocked(stars)
  const pool = lettersUpTo(top)
  const weak = weakLetters(letterStats)
    .map((w) => w.letter)
    .filter((l) => pool.some((p) => p.id === l.id))
  return { pool, fresh: LESSONS[top].letters, weak }
}

/**
 * Pilih huruf soal (latihan yang menyesuaikan):
 * ±35% huruf yang masih lemah (bila ada), ±35% huruf pelajaran terbaru, sisanya acak dari yang sudah dipelajari.
 */
export const pickTarget = (pool: Letter[], fresh: Letter[], weak: Letter[] = []) => {
  const r = Math.random()
  if (weak.length && r < 0.35) return pick(weak)
  return r < 0.7 ? pick(fresh) : pick(pool)
}

/** Bintang sesi: 3 = semua benar pertama kali, 2 = hampir semua, 1 = sudah mencoba. */
export const sessionStars = (firstTry: number, total: number) => (firstTry >= total ? 3 : firstTry >= total - 2 ? 2 : 1)

/** Kelompok huruf yang bentuknya mirip (dibedakan oleh titik/sedikit garis) — inti Iqro' 1. */
const LOOKALIKE: string[][] = [
  ["ba", "ta", "tsa", "nun", "ya"],
  ["jim", "ha", "kho"],
  ["dal", "dzal"],
  ["ro", "zai"],
  ["sin", "syin"],
  ["shod", "dhod"],
  ["tho", "zho"],
  ["ain", "ghoin"],
  ["fa", "qof"],
]

/** Huruf yang mirip dengan `l` dan ada di `pool` (kosong bila tidak ada). */
export function lookalikes(l: Letter, pool: Letter[]) {
  const group = LOOKALIKE.find((g) => g.includes(l.id)) ?? []
  return pool.filter((p) => p.id !== l.id && group.includes(p.id))
}

export const letterById = (id: string) => LETTERS.find((l) => l.id === id)!

/**
 * Stiker hadiah: benda, buah & alam (tanpa makhluk bernyawa).
 * Setiap STARS_PER_STICKER bintang membuka satu stiker berikutnya.
 */
export const STARS_PER_STICKER = 3
export const STICKERS: Array<[string, string]> = [
  ["🍎", "Apel"],
  ["🍌", "Pisang"],
  ["🍇", "Anggur"],
  ["🍉", "Semangka"],
  ["🍓", "Stroberi"],
  ["🍊", "Jeruk"],
  ["🥭", "Mangga"],
  ["🍍", "Nanas"],
  ["🌙", "Bulan"],
  ["⭐", "Bintang"],
  ["☀️", "Matahari"],
  ["🌈", "Pelangi"],
  ["🌸", "Bunga"],
  ["🌻", "Bunga matahari"],
  ["🌳", "Pohon"],
  ["🌴", "Pohon kurma"],
  ["🕌", "Masjid"],
  ["📖", "Buku"],
  ["🎈", "Balon"],
  ["🎁", "Hadiah"],
  ["🚂", "Kereta"],
  ["🚀", "Roket"],
  ["⛵", "Perahu"],
  ["🏆", "Piala"],
]

export const stickerCount = (totalStars: number) => Math.min(STICKERS.length, Math.floor(totalStars / STARS_PER_STICKER))
