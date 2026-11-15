import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { QariId } from "@/lib/quran/qari"

/** Progres belajar anak (tersimpan di perangkat). */
interface BelajarProgress {
  /** bintang 0–3 per pelajaran (index) */
  stars: Record<number, number>
  /** surat pendek yang ditandai sudah hafal (nomor surat) */
  memorized: number[]
  /** bintang yang dikumpulkan dari game (bertambah tiap sesi) */
  gameStars: number
  addGameStars: (n: number) => void
  /** qari untuk hafalan surat pendek */
  qari: QariId
  setQari: (qari: QariId) => void
  setStars: (lesson: number, stars: number) => void
  toggleMemorized: (surah: number) => void
}

export const useBelajarProgress = create<BelajarProgress>()(
  persist(
    (set) => ({
      stars: {},
      memorized: [],
      gameStars: 0,
      addGameStars: (n) => set((s) => ({ gameStars: s.gameStars + n })),
      qari: "05",
      setQari: (qari) => set({ qari }),
      // simpan nilai terbaik
      setStars: (lesson, stars) => set((s) => ({ stars: { ...s.stars, [lesson]: Math.max(stars, s.stars[lesson] ?? 0) } })),
      toggleMemorized: (surah) =>
        set((s) => ({
          memorized: s.memorized.includes(surah) ? s.memorized.filter((n) => n !== surah) : [...s.memorized, surah],
        })),
    }),
    { name: "quran-apps:belajar", version: 1 },
  ),
)

/** Semua bintang anak: bintang terbaik tiap pelajaran + bintang dari game (untuk buku stiker). */
export const useTotalStars = () =>
  useBelajarProgress((s) => Object.values(s.stars).reduce((a, b) => a + b, 0) + s.gameStars)

/** Pelajaran terbuka bila pelajaran sebelumnya sudah mendapat minimal 1 bintang. */
export const isLessonUnlocked = (stars: Record<number, number>, index: number) =>
  index === 0 || (stars[index - 1] ?? 0) > 0
