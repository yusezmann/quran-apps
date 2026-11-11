import { create } from "zustand"
import { persist } from "zustand/middleware"

export const PRAYERS = ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const
export type Prayer = (typeof PRAYERS)[number]

export const PRAYER_LABEL: Record<Prayer, string> = {
  subuh: "Subuh",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
}

/**
 * Suara adzan. `raw` = nama file di android/app/src/main/res/raw (untuk notifikasi native),
 * `channelId` = channel notifikasi Android (suara channel tidak bisa diubah setelah dibuat,
 * jadi tiap suara punya channel sendiri).
 */
export const ADZAN_SOUNDS = {
  makkah: { label: "Adzan Makkah", src: "/assets/audio/adzan-makkah.mp3", raw: "adzan_makkah.mp3", channelId: "adzan_makkah" },
  mesir: { label: "Adzan Mesir", src: "/assets/audio/adzan-mesir.mp3", raw: "adzan_mesir.mp3", channelId: "adzan_mesir" },
  subuh: { label: "Adzan Subuh", src: "/assets/audio/adzan-shubuh.mp3", raw: "adzan_shubuh.mp3", channelId: "adzan_subuh" },
} as const
export type AdzanSoundId = keyof typeof ADZAN_SOUNDS
/** Suara yang bisa dipilih pengguna; Subuh selalu memakai "Adzan Subuh" (ada lafaz ash-shalatu khairun minan naum). */
export const SELECTABLE_SOUNDS: AdzanSoundId[] = ["makkah", "mesir"]

export const REMINDER_OPTIONS = [0, 5, 10, 15] as const
export type ReminderMinutes = (typeof REMINDER_OPTIONS)[number]

export interface AdzanSettings {
  enabled: boolean
  prayers: Record<Prayer, boolean>
  sound: AdzanSoundId
  /** Pengingat sebelum waktu sholat (0 = tidak ada) */
  reminderMinutes: ReminderMinutes
}

export const DEFAULT_ADZAN_SETTINGS: AdzanSettings = {
  enabled: false,
  prayers: { subuh: true, dzuhur: true, ashar: true, maghrib: true, isya: true },
  sound: "makkah",
  reminderMinutes: 0,
}

/** Suara yang dipakai untuk waktu sholat tertentu. */
export const soundFor = (prayer: Prayer, settings: Pick<AdzanSettings, "sound">): AdzanSoundId =>
  prayer === "subuh" ? "subuh" : settings.sound

interface AdzanSettingsStore extends AdzanSettings {
  update: (patch: Partial<AdzanSettings>) => void
  togglePrayer: (prayer: Prayer, on: boolean) => void
}

/** Pengaturan adzan, tersimpan di localStorage dan reaktif di semua komponen. */
export const useAdzanSettings = create<AdzanSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_ADZAN_SETTINGS,
      update: (patch) => set(patch),
      togglePrayer: (prayer, on) => set((s) => ({ prayers: { ...s.prayers, [prayer]: on } })),
    }),
    {
      name: "quran-apps:adzan",
      version: 1,
      partialize: ({ enabled, prayers, sound, reminderMinutes }) => ({ enabled, prayers, sound, reminderMinutes }),
    },
  ),
)

/** Status UI adzan: modal pengaturan & adzan yang sedang berbunyi. */
interface AdzanUiStore {
  settingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  /** Adzan yang sedang aktif (banner); `blocked` = browser menolak autoplay */
  active: { prayer: Prayer; blocked: boolean } | null
  setActive: (active: AdzanUiStore["active"]) => void
}

export const useAdzanUi = create<AdzanUiStore>()((set) => ({
  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  active: null,
  setActive: (active) => set({ active }),
}))
