import { toHijri } from "hijri-converter"
import { addDays } from "date-fns"

/** Nama bulan Hijriah, ejaan sama dengan API myquran (/cal/hijr). */
export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
] as const

/**
 * Koreksi default (hari) terhadap kalender Umm al-Qura.
 * API myquran juga memakai adj -1 sebagai default untuk Indonesia.
 */
export const DEFAULT_HIJRI_OFFSET = -1

export interface HijriParts {
  day: number
  month: number // 1-12
  year: number
}

/** Tanggal lokal (bukan UTC) dalam format YYYY-MM-DD. */
export function toLocalISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function getHijriParts(date: Date, offsetDays = DEFAULT_HIJRI_OFFSET): HijriParts {
  const shifted = addDays(date, offsetDays)
  const h = toHijri(shifted.getFullYear(), shifted.getMonth() + 1, shifted.getDate())
  return { day: h.hd, month: h.hm, year: h.hy }
}

/** Contoh: "30 Jumadil Awal 1448 H" */
export function formatHijri(date: Date, offsetDays = DEFAULT_HIJRI_OFFSET): string {
  const { day, month, year } = getHijriParts(date, offsetDays)
  return `${day} ${HIJRI_MONTHS[month - 1]} ${year} H`
}

/**
 * Cari offset (hari) yang membuat konversi lokal sama dengan tanggal referensi (mis. dari API).
 * Mengembalikan null jika tidak ada offset -3..3 yang cocok.
 */
export function findHijriOffset(date: Date, reference: HijriParts): number | null {
  for (const offset of [0, -1, 1, -2, 2, -3, 3]) {
    const p = getHijriParts(date, offset)
    if (p.day === reference.day && p.month === reference.month && p.year === reference.year) {
      return offset
    }
  }
  return null
}
