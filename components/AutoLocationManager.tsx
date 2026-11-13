"use client"

import { useEffect } from "react"
import { useAutoLocation } from "@/lib/auto-location"
import { maybeAutoUpdateCity } from "@/lib/auto-location-run"

/**
 * Lokasi otomatis untuk seluruh aplikasi: cek saat aplikasi dibuka & saat kembali dari latar
 * belakang (dibatasi tiap 30 menit). Perubahan kota disiarkan lewat saveCity → Beranda, Kiblat
 * dan penjadwal adzan ikut menyesuaikan.
 */
export default function AutoLocationManager() {
  const mode = useAutoLocation((s) => s.mode)

  useEffect(() => {
    if (mode !== "on") return
    maybeAutoUpdateCity()
    const onVisible = () => document.visibilityState === "visible" && maybeAutoUpdateCity()
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [mode])

  return null
}
