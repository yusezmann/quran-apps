"use client"

import { useEffect, useState } from "react"
import { Button } from "antd"
import { Crosshair, MapPin, Lightbulb } from "lucide-react"
import { toast } from "sonner"
import Header from "@/components/Header"
import PageBackground from "@/components/PageBackground"
import KaabaIcon from "@/components/KaabaIcon"
import { Footer } from "@/components/footer"
import CitySelector from "@/app/(features)/imsakiyah/components/CitySelector"
import { getCurrentLocation } from "@/lib/geolocation"
import { getDistanceToKaaba, type Coords } from "@/lib/qibla"
import { CITY_CHANGED_EVENT, DEFAULT_CITY, getSavedCity, saveCity, type SavedCity } from "@/lib/saved-city"
import { turnOffAutoLocationForManualChoice } from "@/lib/auto-location-run"
import QiblaCompass from "./components/QiblaCompass"
import { useCityCoords } from "./hooks/useCityCoords"

const formatKm = (km: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(km)

const tips = [
  "Letakkan ponsel mendatar (sejajar lantai) saat membaca arah.",
  "Jauhkan dari benda logam, magnet, atau perangkat elektronik besar.",
  "Jika arah terasa meleset, kalibrasi dengan menggerakkan ponsel membentuk angka 8.",
]

export default function KiblatPage() {
  // Kota yang sama dengan Beranda (tersimpan); GPS opsional untuk akurasi lebih tinggi
  const [city, setCity] = useState<SavedCity>(DEFAULT_CITY)
  const [gpsCoords, setGpsCoords] = useState<Coords | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    const sync = () => {
      const saved = getSavedCity()
      if (saved) setCity(saved)
    }
    sync()
    // Ikut berganti bila kota diperbarui oleh lokasi otomatis
    window.addEventListener(CITY_CHANGED_EVENT, sync)
    return () => window.removeEventListener(CITY_CHANGED_EVENT, sync)
  }, [])

  const cityCoords = useCityCoords(gpsCoords ? undefined : city.lokasi)
  const coords = gpsCoords ?? cityCoords.data ?? null
  const isLoadingCoords = !gpsCoords && cityCoords.isLoading

  const locateWithGps = async () => {
    setIsLocating(true)
    try {
      const { latitude, longitude } = await getCurrentLocation()
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Koordinat tidak valid")
      setGpsCoords({ lat: latitude, lon: longitude })
      toast.success("Memakai lokasi GPS Anda")
    } catch (error: any) {
      toast.error("Gagal mendapatkan lokasi: " + (error?.message || "Error tidak diketahui"))
    } finally {
      setIsLocating(false)
    }
  }

  const changeCity = (next: { id: string; lokasi: string }) => {
    const saved = { id: String(next.id), lokasi: next.lokasi }
    setCity(saved)
    saveCity(saved) // Beranda ikut memakai kota ini
    turnOffAutoLocationForManualChoice()
    setGpsCoords(null)
  }

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <Header />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mt-6 xl:mt-20 mb-10 xl:mb-20 mx-auto max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header kartu */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6 xl:px-8 flex items-center gap-4">
            <div className="rounded-xl border border-white/30 bg-white/90 p-2.5">
              <KaabaIcon size={32} />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold text-white leading-tight">Arah Kiblat</h1>
              <p className="text-white/85 text-sm xl:text-base leading-snug">
                Arah menuju Ka&apos;bah di Masjidil Haram, Makkah
              </p>
            </div>
          </div>

          <div className="p-4 md:p-8 space-y-6">
            {/* Lokasi */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-700 leading-snug">
                  <MapPin className="h-4 w-4 text-green-600" />
                  {gpsCoords ? "Lokasi Anda saat ini (GPS)" : `Berdasarkan kota: ${city.lokasi}`}
                </p>
                <Button
                  size="small"
                  icon={<Crosshair className="h-4 w-4" />}
                  loading={isLocating}
                  onClick={locateWithGps}
                  className="!text-green-700 !border-green-600"
                >
                  {gpsCoords ? "Perbarui GPS" : "Gunakan GPS (lebih akurat)"}
                </Button>
              </div>
              <CitySelector value={{ id: city.id, lokasi: city.lokasi }} onCityChange={changeCity} />
            </div>

            {/* Kompas */}
            <section aria-label="Arah kiblat" className="rounded-2xl border border-gray-200 bg-white px-4 py-6">
              {cityCoords.isError && !gpsCoords ? (
                <div className="py-10 text-center text-sm text-gray-600 leading-snug">
                  Koordinat kota tidak dapat ditemukan. Coba pilih kota lain atau gunakan GPS.
                </div>
              ) : (
                <QiblaCompass coords={coords} isLoadingCoords={isLoadingCoords} />
              )}
              {coords && (
                <p className="mt-2 text-center text-sm text-gray-500 leading-snug">
                  Jarak ke Ka&apos;bah ±{" "}
                  <span className="font-semibold text-gray-700">
                    {formatKm(getDistanceToKaaba(coords.lat, coords.lon))} km
                  </span>
                </p>
              )}
            </section>

            {/* Tips */}
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
                <Lightbulb className="h-4 w-4" /> Tips akurasi
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900/90 leading-snug">
                {tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}
