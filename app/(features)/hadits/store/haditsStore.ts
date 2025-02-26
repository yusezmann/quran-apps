import { create } from "zustand"

export const useHadithStore = create((set) => ({
  kitab: "bukhari", // Default kitab
  setKitab: (kitab: string) => set({ kitab }),
}))
