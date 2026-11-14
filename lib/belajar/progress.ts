import { create } from "zustand"
import { persist } from "zustand/middleware"

/** Progres belajar anak (tersimpan di perangkat). */
interface BelajarProgress {
  /** bintang 0–3 per pelajaran (index) */
  stars: Record<number, number>
  /** surat pendek yang ditandai sudah hafal (nomor surat) */
  memorized: number[]
  setStars: (lesson: number, stars: number) => void
  toggleMemorized: (surah: number) => void
}

export const useBelajarProgress = create<BelajarProgress>()(
  persist(
    (set) => ({
      stars: {},
      memorized: [],
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

/** Pelajaran terbuka bila pelajaran sebelumnya sudah mendapat minimal 1 bintang. */
export const isLessonUnlocked = (stars: Record<number, number>, index: number) =>
  index === 0 || (stars[index - 1] ?? 0) > 0
