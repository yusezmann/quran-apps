import { create } from "zustand"

interface QuranState {
  currentSurah: number
  setCurrentSurah: (surahNumber: number) => void
  /** Ayat yang perlu di-scroll setelah surah termuat (mis. dari "Lanjutkan membaca"). */
  scrollTarget: number | null
  setScrollTarget: (ayah: number | null) => void
}

export const useQuranStore = create<QuranState>((set) => ({
  currentSurah: 1,
  setCurrentSurah: (surahNumber) => set({ currentSurah: surahNumber }),
  scrollTarget: null,
  setScrollTarget: (ayah) => set({ scrollTarget: ayah }),
}))
