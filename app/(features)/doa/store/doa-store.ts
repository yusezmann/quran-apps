import { create } from "zustand"
import type { Dua } from "../interfaces/doa.interface"

interface DuaStore {
  duas: Dua[]
  selectedDuaId: string | null
  isLoading: boolean
  setDuas: (duas: Dua[]) => void
  setSelectedDuaId: (id: string | null) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useStore = create<DuaStore>((set) => ({
  duas: [],
  selectedDuaId: null,
  isLoading: false,
  setDuas: (duas) => set({ duas }),
  setSelectedDuaId: (id) => {
    set({ selectedDuaId: id })
  },
  setIsLoading: (isLoading) => set({ isLoading }),
}))
