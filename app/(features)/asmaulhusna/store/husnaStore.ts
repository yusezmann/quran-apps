import { create } from "zustand"
import { HusnaStore } from "../interfaces/asmaulhusna.interface"

export const useHusnaStore = create<HusnaStore>((set) => ({
  husna: [],
  setHusna: (data) => set({ husna: data }),
}))
