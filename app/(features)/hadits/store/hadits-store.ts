import { create } from "zustand"
import { HadithStore } from "../interfaces/hadits.interface"

export const useHadithStore = create<HadithStore>((set) => ({
  hadiths: [],
  selectedHadithId: null,
  isLoading: false,
  setHadiths: (hadiths) => set({ hadiths }),
  setSelectedHadithId: (id) => set({ selectedHadithId: id }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))
