import { LETTERS, type Letter } from "./letters"
import type { LetterStat } from "./progress"

/**
 * Analisis jawaban anak untuk laporan orang tua & latihan yang menyesuaikan.
 * Butuh beberapa jawaban dulu agar tidak menyimpulkan dari satu kali salah ketuk.
 */
const accuracy = (s: LetterStat) => s.r / Math.max(1, s.r + s.w)

export interface LetterReport {
  letter: Letter
  right: number
  wrong: number
  /** 0–100 */
  percent: number
}

const toReport = (letter: Letter, s: LetterStat): LetterReport => ({
  letter,
  right: s.r,
  wrong: s.w,
  percent: Math.round(accuracy(s) * 100),
})

/** Huruf yang masih sering salah (min. 2 kali salah & ketepatan < 75%), paling lemah dulu. */
export function weakLetters(stats: Record<string, LetterStat>): LetterReport[] {
  return LETTERS.filter((l) => {
    const s = stats[l.id]
    return s && s.w >= 2 && accuracy(s) < 0.75
  })
    .map((l) => toReport(l, stats[l.id]))
    .sort((a, b) => a.percent - b.percent || b.wrong - a.wrong)
}

/** Huruf yang sudah dikuasai (min. 4 kali benar & ketepatan ≥ 85%). */
export function masteredLetters(stats: Record<string, LetterStat>): LetterReport[] {
  return LETTERS.filter((l) => {
    const s = stats[l.id]
    return s && s.r >= 4 && accuracy(s) >= 0.85
  }).map((l) => toReport(l, stats[l.id]))
}

/** Pasangan huruf yang paling sering tertukar. */
export function topConfusions(confusions: Record<string, number>, limit = 5) {
  return Object.entries(confusions)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => {
      const [a, b] = key.split("|").map((id) => LETTERS.find((l) => l.id === id)!)
      return { a, b, count }
    })
    .filter((c) => c.a && c.b)
}

/** Huruf yang paling sering tertukar dengan `id` (untuk pilihan jawaban kuis yang menantang). */
export function mostConfusedWith(id: string, confusions: Record<string, number>, pool: Letter[]) {
  let best: Letter | null = null
  let bestN = 0
  for (const l of pool) {
    if (l.id === id) continue
    const n = confusions[id < l.id ? `${id}|${l.id}` : `${l.id}|${id}`] ?? 0
    if (n > bestN) {
      best = l
      bestN = n
    }
  }
  return best
}

/** Petunjuk membedakan huruf mirip, untuk orang tua saat mendampingi. */
const TIPS: Array<[string[], string]> = [
  [["ba", "ta", "tsa", "nun", "ya"], "Lihat titiknya: ب satu titik di bawah, ت dua di atas, ث tiga di atas, ن satu di atas, ي dua di bawah."],
  [["jim", "ha", "kho"], "ج titik di dalam bawah, ح tanpa titik, خ titik di atas."],
  [["dal", "dzal"], "د tanpa titik, ذ satu titik di atas."],
  [["ro", "zai"], "ر tanpa titik, ز satu titik di atas."],
  [["sin", "syin"], "س tanpa titik, ش tiga titik di atas."],
  [["shod", "dhod"], "ص tanpa titik, ض satu titik di atas."],
  [["tho", "zho"], "ط tanpa titik, ظ satu titik di atas."],
  [["ain", "ghoin"], "ع tanpa titik, غ satu titik di atas."],
  [["fa", "qof"], "ف satu titik di atas, ق dua titik di atas."],
  [["alif", "ain"], "Bunyinya mirip: أَ dari tenggorokan atas (ringan), عَ ditekan dari tengah tenggorokan."],
  [["ha", "ha2"], "Bunyinya mirip: حَ dari tengah tenggorokan (berdesis), هَ dari dalam (seperti menghembus)."],
  [["kaf", "qof"], "Bunyinya mirip: كَ ringan, قَ tebal dari pangkal lidah."],
  [["ta", "tho"], "Bunyinya mirip: تَ tipis, طَ tebal."],
  [["dal", "dhod"], "Bunyinya mirip: دَ tipis, ضَ tebal."],
  [["sin", "shod", "tsa"], "Bunyinya mirip: سَ tipis, صَ tebal, ثَ ujung lidah di antara gigi."],
  [["dzal", "zai", "zho"], "Bunyinya mirip: ذَ ujung lidah di antara gigi, زَ seperti 'z', ظَ tebal."],
]

export function tipFor(a: string, b: string) {
  return TIPS.find(([ids]) => ids.includes(a) && ids.includes(b))?.[1] ?? null
}
