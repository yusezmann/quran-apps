"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bell, BellOff, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import KaabaIcon from "@/components/KaabaIcon"
import { getQiblaDirection } from "@/lib/qibla"
import { DEFAULT_CITY, getSavedCity, saveCity } from "@/lib/saved-city"
import { useAdzanSettings, useAdzanUi } from "@/lib/adzan/settings"
import { useCityCoords } from "@/app/(features)/kiblat/hooks/useCityCoords"
import type { City, PrayerTime } from "@/app/(features)/prayer-times/interfaces/prayer-time.interface"
import { getPrayerTimes } from "@/app/(features)/prayer-times/services/prayer-time.service"
import HijriDateDisplay from "@/app/(features)/hijri-date/components/hijr-date"
import LocationSelector from "./components/LocationSelector"
import PrayerTimesList from "./components/PrayerTimeList"

const NEXT_PRAYERS = [
  { name: "Subuh", key: "subuh" },
  { name: "Dzuhur", key: "dzuhur" },
  { name: "Ashar", key: "ashar" },
  { name: "Maghrib", key: "maghrib" },
  { name: "Isya", key: "isya" },
] as const

const pad = (n: number) => n.toString().padStart(2, "0")

const PrayerTimeComponent = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null)
  // Kota tersimpan (dipakai bersama halaman Kiblat & penjadwal adzan); default Jakarta
  const [cityId, setCityId] = useState<string>(() => getSavedCity()?.id ?? DEFAULT_CITY.id)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null)
  const [countdown, setCountdown] = useState<string>("")
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const adzanEnabled = useAdzanSettings((s) => s.enabled)
  const openAdzanSettings = useAdzanUi((s) => s.openSettings)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true)
      try {
        setPrayerTimes(await getPrayerTimes(cityId))
      } catch (error) {
        console.error("Failed to fetch prayer times:", error)
        toast.error("Gagal mengambil jadwal sholat")
      } finally {
        setLoading(false)
      }
    }
    fetchPrayerTimes()
  }, [cityId])

  // Simpan kota yang sedang dipakai agar tetap sama saat aplikasi dibuka ulang, di Kiblat & untuk adzan
  useEffect(() => {
    if (prayerTimes?.id && prayerTimes.lokasi) {
      saveCity({ id: String(prayerTimes.id), lokasi: prayerTimes.lokasi })
    }
  }, [prayerTimes?.id, prayerTimes?.lokasi])

  const { data: cityCoords } = useCityCoords(prayerTimes?.lokasi)
  const qiblaDegree = cityCoords ? Math.round(getQiblaDirection(cityCoords.lat, cityCoords.lon)) : null

  const handleCitySelect = (city: City) => {
    setCityId(city.id)
    setLocationDialogOpen(false)
  }

  /** Hitung mundur ke sholat berikutnya (tampilan saja; adzan dijadwalkan oleh AdzanManager). */
  const updateNextPrayer = useCallback(() => {
    if (!prayerTimes) return
    const now = new Date()
    const times = NEXT_PRAYERS.map((prayer) => {
      const time = prayerTimes.jadwal[prayer.key]
      const [hours, minutes] = time.split(":").map(Number)
      const datetime = new Date(now)
      datetime.setHours(hours, minutes, 0, 0) // detik & milidetik nol
      return { ...prayer, time, datetime }
    })

    // Setelah Isya: sholat berikutnya Subuh besok
    const upcoming = times.find((prayer) => prayer.datetime > now)
    const next = upcoming ?? { ...times[0], datetime: new Date(times[0].datetime.getTime() + 86_400_000) }
    setNextPrayer({ name: next.name, time: next.time })

    const diff = Math.max(0, next.datetime.getTime() - now.getTime())
    const hours = Math.floor(diff / 3_600_000)
    const minutes = Math.floor((diff % 3_600_000) / 60_000)
    const seconds = Math.floor((diff % 60_000) / 1000)
    setCountdown(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)
  }, [prayerTimes])

  useEffect(() => {
    if (!prayerTimes) return
    updateNextPrayer()
    const timer = setInterval(updateNextPrayer, 1000)
    return () => clearInterval(timer)
  }, [prayerTimes, updateNextPrayer])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <section className="relative mb-0">
      {prayerTimes && (
        <>
          {/* Mobile/tablet: tinggi hero mengikuti isi (tidak lagi dikunci 50vh/240px yang membuat
              teks bertumpuk). Desktop: tetap layar penuh dengan kartu waktu sholat di dalamnya. */}
          <div className="relative xl:h-[100vh] border-none rounded-b-2xl xl:rounded-b-none overflow-hidden">
            <Image
              src="/assets/images/kaabah.jpg"
              alt="Kaabah"
              fill
              sizes="(max-width: 768px) 100vw"
              className="object-cover brightness-50 rounded-b-2xl xl:rounded-b-none"
            />

            <div className="relative xl:absolute xl:inset-0 z-10 flex flex-col gap-5 xl:gap-0 xl:justify-between px-4 pt-[88px] pb-12 md:px-8 xl:p-6 xl:pt-[110px] text-white">
              <div className="flex flex-wrap justify-between items-start xl:px-12 ">
                <div className="flex flex-col min-w-0">
                  <h2 className="text-2xl font-bold flex flex-wrap gap-x-2">
                    <span className="hidden xl:block">Jadwal Sholat di</span>
                    <span className="text-sm xl:text-2xl">
                      {prayerTimes?.lokasi}
                    </span>
                  </h2>
                  <button
                    type="button"
                    className="mt-1 self-start inline-flex items-center gap-1 text-xs xl:text-sm text-white/90 underline underline-offset-4 decoration-white/50 hover:text-white hover:decoration-white"
                    onClick={() => setLocationDialogOpen(true)}
                  >
                    <MapPin className="h-4 w-4" /> Salah Lokasi?
                  </button>
                  <Link
                    href="/kiblat"
                    className="mt-2 self-start inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs xl:text-sm font-medium text-white backdrop-blur-sm ring-1 ring-white/30 hover:bg-white/25"
                  >
                    <span className="rounded-full bg-white p-0.5">
                      <KaabaIcon size={16} />
                    </span>
                    Arah Kiblat{qiblaDegree !== null && <span className="text-white/80">· {qiblaDegree}°</span>}
                  </Link>
                </div>
                <div className="text-right text-[10px] xl:text-sm">
                  <HijriDateDisplay currentTime={currentTime} />
                </div>
              </div>

              <div className="block xl:hidden text-center">
                <h6 className="text-sm font-bold">Sholat Berikutnya</h6>
                <div className="font-bold text-lg">{nextPrayer?.name}</div>
                <div className="text-3xl font-bold my-2">{countdown}</div>
                <div className="text-sm text-white/80">
                  Sekarang{" "}
                  {currentTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm xl:px-6 xl:relative xl:-top-16">
                {/* Sumber jadwal (API myquran mengikuti perhitungan Kemenag RI) */}
                <span className="text-white/80">Jadwal: Kemenag RI</span>
                <button
                  type="button"
                  onClick={openAdzanSettings}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs xl:text-sm font-medium ring-1 backdrop-blur-sm transition-colors ${
                    adzanEnabled
                      ? "bg-green-500/90 text-white ring-green-300 hover:bg-green-500"
                      : "bg-white/15 text-white ring-white/30 hover:bg-white/25"
                  }`}
                >
                  {adzanEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  {adzanEnabled ? "Adzan aktif" : "Aktifkan adzan"}
                </button>
              </div>
            </div>
          </div>

          <PrayerTimesList
            prayerTimes={prayerTimes}
            nextPrayer={nextPrayer}
            countdown={countdown}
            currentTime={currentTime}
          />
        </>
      )}

      <LocationSelector
        isOpen={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
        onSelectCity={handleCitySelect}
      />

    </section>
  )
}

export default PrayerTimeComponent
