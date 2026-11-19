import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { QariId } from "@/lib/quran/qari"

/** Hasil jawaban per huruf: r = benar, w = salah (huruf ini yang dibunyikan/dicari). */
export type LetterStat = { r: number; w: number }

/** Progres belajar anak (tersimpan di perangkat). */
interface BelajarProgress {
  /** bintang 0–3 per pelajaran (index) */
  stars: Record<number, number>
  /** surat pendek yang ditandai sudah hafal (nomor surat) */
  memorized: number[]
  /** bintang yang dikumpulkan dari game (bertambah tiap sesi) */
  gameStars: number
  addGameStars: (n: number) => void
  /** catatan jawaban per huruf (kuis & game) untuk laporan orang tua & latihan yang menyesuaikan */
  letterStats: Record<string, LetterStat>
  /** pasangan huruf yang tertukar, kunci "a|b" (urut abjad id) → berapa kali */
  confusions: Record<string, number>
  /** tanggal belajar (YYYY-MM-DD), maks. 60 hari terakhir */
  activeDays: string[]
  /** catat satu jawaban: `target` = huruf yang benar, `chosen` = yang dipilih anak */
  recordAttempt: (target: string, chosen: string) => void
  resetStats: () => void
  /** nama panggilan anak (diisi orang tua) untuk sapaan di aplikasi anak */
  childName: string
  setChildName: (name: string) => void
  /** qari hafalan surat pendek (id Quran.com, dengan highlight per kata) */
  hafalanQari: number
  setHafalanQari: (id: number) => void
  /** qari lama (equran) — tidak dipakai lagi di hafalan, disimpan agar data lama tetap terbaca */
  qari: QariId
  setQari: (qari: QariId) => void
  setStars: (lesson: number, stars: number) => void
  toggleMemorized: (surah: number) => void
}

/** Tanggal lokal hari ini, mis. "2026-11-15". */
export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const withToday = (days: string[]) => {
  const t = today()
  return days.includes(t) ? days : [...days, t].slice(-60)
}

export const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

export const useBelajarProgress = create<BelajarProgress>()(
  persist(
    (set) => ({
      stars: {},
      memorized: [],
      gameStars: 0,
      addGameStars: (n) => set((s) => ({ gameStars: s.gameStars + n, activeDays: withToday(s.activeDays) })),
      letterStats: {},
      confusions: {},
      activeDays: [],
      recordAttempt: (target, chosen) =>
        set((s) => {
          const prev = s.letterStats[target] ?? { r: 0, w: 0 }
          const ok = target === chosen
          const stat = ok ? { ...prev, r: prev.r + 1 } : { ...prev, w: prev.w + 1 }
          const key = pairKey(target, chosen)
          return {
            letterStats: { ...s.letterStats, [target]: stat },
            confusions: ok ? s.confusions : { ...s.confusions, [key]: (s.confusions[key] ?? 0) + 1 },
            activeDays: withToday(s.activeDays),
          }
        }),
      resetStats: () => set({ letterStats: {}, confusions: {} }),
      childName: "",
      setChildName: (name) => set({ childName: name.replace(/\s+/g, " ").trimStart().slice(0, 20) }),
      hafalanQari: 7,
      setHafalanQari: (id) => set({ hafalanQari: id }),
      qari: "05",
      setQari: (qari) => set({ qari }),
      // simpan nilai terbaik
      setStars: (lesson, stars) =>
        set((s) => ({
          stars: { ...s.stars, [lesson]: Math.max(stars, s.stars[lesson] ?? 0) },
          activeDays: withToday(s.activeDays),
        })),
      toggleMemorized: (surah) =>
        set((s) => ({
          memorized: s.memorized.includes(surah) ? s.memorized.filter((n) => n !== surah) : [...s.memorized, surah],
        })),
    }),
    { name: "quran-apps:belajar", version: 1 },
  ),
)

/** Catat jawaban dari luar komponen React (kuis & game). */
export const recordAttempt = (target: string, chosen: string) =>
  useBelajarProgress.getState().recordAttempt(target, chosen)

/** Semua bintang anak: bintang terbaik tiap pelajaran + bintang dari game (untuk buku stiker). */
export const useTotalStars = () =>
  useBelajarProgress((s) => Object.values(s.stars).reduce((a, b) => a + b, 0) + s.gameStars)

/** Pelajaran terbuka bila pelajaran sebelumnya sudah mendapat minimal 1 bintang. */
export const isLessonUnlocked = (stars: Record<number, number>, index: number) =>
  index === 0 || (stars[index - 1] ?? 0) > 0
