"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { getCurrentLocation } from "@/lib/geolocation"
import { getPrayerTimesByCoords } from "@/app/(features)/prayer-times/services/prayer-time.service"
import type { City } from "@/app/(features)/prayer-times/interfaces/prayer-time.interface"

const isValidCoordinate = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

/**
 * Alur bersama "Deteksi Lokasi": GPS -> reverse geocoding -> kota di database API sholat.
 * Menampilkan satu toast loading yang diganti dengan hasil akhirnya (sukses / tidak ditemukan / error).
 *
 * @returns `detectCity()` yang resolve ke kota terdeteksi, atau `null` jika gagal.
 */
export function useDetectCity() {
  const [isDetecting, setIsDetecting] = useState(false)

  const detectCity = useCallback(async (): Promise<City | null> => {
    setIsDetecting(true)
    const toastId = toast.loading("Mendeteksi lokasi Anda...")

    try {
      const { latitude, longitude } = await getCurrentLocation()

      // Jangan pakai cek truthy: latitude 0 (garis khatulistiwa, mis. Pontianak) itu valid.
      if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
        toast.error("Gagal mendeteksi lokasi: koordinat tidak valid", { id: toastId })
        return null
      }

      toast.loading("Lokasi didapatkan. Mencari kota terdekat...", { id: toastId })

      const city = await getPrayerTimesByCoords(latitude, longitude)
      if (!city) {
        toast.error("Kota Anda tidak ditemukan di database.", { id: toastId })
        return null
      }

      toast.success(`Berhasil! Lokasi diatur ke ${city.lokasi}`, { id: toastId })
      return city
    } catch (error: any) {
      console.error("Detect city error:", error)
      toast.error(
        "Gagal mendapatkan lokasi: " + (error?.message || "Error tidak diketahui"),
        { id: toastId },
      )
      return null
    } finally {
      setIsDetecting(false)
    }
  }, [])

  return { detectCity, isDetecting }
}
