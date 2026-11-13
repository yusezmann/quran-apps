"use client"

import { toast } from "sonner"
import { getCurrentLocation, hasLocationPermission } from "./geolocation"
import { getSavedCity, saveCity } from "./saved-city"
import { useAutoLocation, AUTO_LOCATION_INTERVAL_MS } from "./auto-location"
import { getPrayerTimesByCoords } from "@/app/(features)/prayer-times/services/prayer-time.service"

let running = false

/**
 * Perbarui kota dari lokasi terkini.
 * - interactive=true  (dari tombol): boleh meminta izin & menampilkan pesan gagal
 * - interactive=false (otomatis):    tidak pernah memunculkan dialog izin; diam bila gagal
 * Mengembalikan true bila kota berhasil ditentukan.
 */
export async function updateCityFromLocation({ interactive }: { interactive: boolean }): Promise<boolean> {
  if (running) return false
  running = true
  const { markChecked } = useAutoLocation.getState()
  try {
    if (!interactive && !(await hasLocationPermission())) return false

    const { latitude, longitude } = await getCurrentLocation({
      // Untuk menentukan kota, lokasi jaringan sudah cukup: lebih cepat & hemat baterai
      highAccuracy: interactive,
      maximumAge: interactive ? 0 : 10 * 60 * 1000,
    })
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Koordinat tidak valid")

    const city = await getPrayerTimesByCoords(latitude, longitude)
    markChecked()
    if (!city) {
      if (interactive) toast.error("Kota Anda tidak ditemukan di database.")
      return false
    }

    const previous = getSavedCity()
    saveCity({ id: String(city.id), lokasi: city.lokasi })
    if (previous?.id !== String(city.id)) {
      toast.success(`Lokasi diperbarui ke ${city.lokasi}`)
    } else if (interactive) {
      toast.success(`Lokasi Anda: ${city.lokasi}`)
    }
    return true
  } catch (error: any) {
    markChecked()
    if (interactive) toast.error("Gagal mendapatkan lokasi: " + (error?.message || "izin lokasi ditolak"))
    return false
  } finally {
    running = false
  }
}

/** Pengecekan otomatis (dipanggil saat aplikasi dibuka / kembali aktif). */
export function maybeAutoUpdateCity() {
  const { mode, lastCheck } = useAutoLocation.getState()
  if (mode !== "on" || Date.now() - lastCheck < AUTO_LOCATION_INTERVAL_MS) return
  void updateCityFromLocation({ interactive: false })
}

/** Nyalakan lokasi otomatis dari aksi pengguna (meminta izin di saat itu juga). */
export async function enableAutoLocation(): Promise<boolean> {
  const ok = await updateCityFromLocation({ interactive: true })
  useAutoLocation.getState().setMode(ok ? "on" : "off")
  if (ok) useAutoLocation.getState().markChecked()
  return ok
}

/** Memilih kota secara manual mematikan lokasi otomatis, agar pilihan pengguna tidak tertimpa. */
export function turnOffAutoLocationForManualChoice() {
  const { mode, setMode } = useAutoLocation.getState()
  if (mode !== "on") return
  setMode("off")
  toast.info("Lokasi otomatis dimatikan karena Anda memilih kota secara manual.")
}
