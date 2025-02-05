import { create } from "zustand"

interface QuranState {
  currentSurah: number
  setCurrentSurah: (surahNumber: number) => void
}

export const useQuranStore = create<QuranState>((set) => ({
  currentSurah: 1,
  setCurrentSurah: (surahNumber) => set({ currentSurah: surahNumber }),
}))

