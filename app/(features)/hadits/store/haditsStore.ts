import { create } from "zustand"
import { HadithStore } from "../interfaces/hadits.interface"

export const useHadithStore = create<HadithStore>((set) => ({
  hadiths: [],
  setHadiths: (hadiths) => set({ hadiths }),
}))
