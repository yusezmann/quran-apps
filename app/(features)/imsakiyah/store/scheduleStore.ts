import { create } from "zustand"

type ScheduleStore = {
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  currentDate: new Date(),
  setCurrentDate: (date) => set({ currentDate: date }),
}))
