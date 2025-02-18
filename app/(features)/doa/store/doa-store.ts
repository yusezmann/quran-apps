import { create } from "zustand"
import { Doa } from "../interfaces/doa.interface"

// Definisikan tipe untuk state Zustand
interface DoaState {
  doaList: Doa[]
  setDoaList: (newDoaList: Doa[]) => void
}

const useStore = create<DoaState>((set) => ({
  doaList: [],
  setDoaList: (newDoaList) => set({ doaList: newDoaList }),
}))

export default useStore
