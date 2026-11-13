import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Mode lokasi otomatis:
 * - "ask": belum pernah ditanya → Beranda menampilkan kartu tawaran sekali
 * - "on":  kota diperbarui dari GPS setiap aplikasi dibuka / kembali aktif
 * - "off": kota hanya berubah bila dipilih manual
 */
export type AutoLocationMode = "ask" | "on" | "off"

/** Jeda minimum antar pengecekan otomatis (hemat baterai & kuota layanan peta). */
export const AUTO_LOCATION_INTERVAL_MS = 30 * 60 * 1000

interface AutoLocationStore {
  mode: AutoLocationMode
  lastCheck: number
  setMode: (mode: AutoLocationMode) => void
  markChecked: () => void
}

export const useAutoLocation = create<AutoLocationStore>()(
  persist(
    (set) => ({
      mode: "ask",
      lastCheck: 0,
      setMode: (mode) => set({ mode, lastCheck: 0 }),
      markChecked: () => set({ lastCheck: Date.now() }),
    }),
    { name: "quran-apps:auto-location", version: 1 },
  ),
)
