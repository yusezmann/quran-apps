"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "antd"
import { Info, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import type {
  City,
  PrayerTime,
} from "@/app/(features)/prayer-times/interfaces/prayer-time.interface"
import {
  getPrayerTimes,
  getCities,
  getPrayerTimesByCoords,
} from "@/app/(features)/prayer-times/services/prayer-time.service"
import HijriDateDisplay from "@/app/(features)/hijri-date/components/hijr-date"
import LocationSelector from "./components/LocationSelector"
import MethodSelector from "./components/MethodSelector"
import PrayerTimesList from "./components/PrayerTimeList"
import AdzanSettings from "../adzan/components/AdzanSetting"
import CountdownTest from "./components/Countdown"
import Marquee from "react-fast-marquee"
import AdhanNotification from "../adzan/components/AdzanNotification"

const PRAYER_METHODS = [
  { id: "kemenag", name: "Kemenag", params: { subuh: 20, isya: 18 } },
  { id: "mwl", name: "Muslim World League", params: { subuh: 18, isya: 17 } },
  {
    id: "egypt",
    name: "Egyptian General Authority",
    params: { subuh: 19.5, isya: 17.5 },
  },
]

export const adzanList = [
  { id: 1, name: "Adzan Makkah", src: "/assets/audio/adzan-makkah.mp3" },
  { id: 2, name: "Adzan Mesir", src: "/assets/audio/adzan-mesir.mp3" },
  { id: 3, name: "Adzan Shubuh", src: "/assets/audio/adzan-shubuh.mp3" },
]

const PrayerTimeComponent = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null)
  const [cityId, setCityId] = useState<string>("1301") // Default to Jakarta
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nextPrayer, setNextPrayer] = useState<{
    name: string
    time: string
  } | null>(null)
  const [countdown, setCountdown] = useState<string>("")
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState(PRAYER_METHODS[0])
  const [methodDialogOpen, setMethodDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<City[]>([])
  const [searching, setSearching] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  useEffect(() => {
    fetchPrayerTimes()
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (prayerTimes) {
      updateNextPrayer()
      const timer = setInterval(updateNextPrayer, 1000)
      return () => clearInterval(timer)
    }
  }, [prayerTimes])

  useEffect(() => {
    fetchPrayerTimes()
  }, [cityId, selectedMethod])

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          toast.error("Notifikasi tidak diizinkan oleh pengguna")
        }
      })
    }
  }, [])

  const sendNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/assets/icons/prayer.png" })
    }
  }

  const fetchPrayerTimes = async () => {
    setLoading(true)
    try {
      const data = await getPrayerTimes(cityId, selectedMethod.params)
      setPrayerTimes(data)
    } catch (error) {
      console.error("Failed to fetch prayer times:", error)
      toast.error("Gagal mengambil jadwal sholat")
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async () => {
    if (searchQuery.length < 3) {
      toast.error("Masukkan minimal 3 karakter")
      return
    }

    setSearching(true)
    try {
      const results = await getCities(searchQuery)
      setSearchResults(results || [])
    } catch (error: any) {
      console.error("Failed to search cities:", error)
      toast.error("Gagal mencari kota")
    } finally {
      setSearching(false)
    }
  }

  const handleCitySelect = (city: City) => {
    setCityId(city.id)
    setLocationDialogOpen(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung di browser Anda")
      return
    }

    setIsDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        if (latitude && longitude) {
          toast.success(
            `Lokasi berhasil dideteksi: (${latitude}, ${longitude})`,
          )

          try {
            const cityId = await getPrayerTimesByCoords(latitude, longitude)
            if (cityId) {
              const cities = await getCities(cityId)
              if (cities && cities.length > 0) {
                setSearchResults(cities)
                handleCitySelect(cities[0])
              } else {
                toast.error("Kota tidak ditemukan pada API")
              }
            } else {
              toast.error("Gagal mendapatkan ID kota dari koordinat")
            }
          } catch (error) {
            console.error("Gagal mendapatkan daftar kota:", error)
            toast.error("Gagal mendapatkan daftar kota dari koordinat")
          }
        } else {
          toast.error("Gagal mendeteksi lokasi: koordinat tidak valid")
        }
        setIsDetectingLocation(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        let errorMessage = "Gagal mendapatkan lokasi"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += ": Izin akses lokasi ditolak"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += ": Informasi lokasi tidak tersedia"
            break
          case error.TIMEOUT:
            errorMessage += ": Waktu permintaan lokasi habis"
            break
          default:
            errorMessage += ": " + error.message
        }
        toast.error(errorMessage)
        setIsDetectingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000,
      },
    )
  }

  // Fungsi untuk memainkan suara adzan
  const playAdzan = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  // const updateNextPrayer = useCallback(() => {
  //   if (!prayerTimes) return

  //   const prayers = [
  //     { name: "Subuh", time: prayerTimes.jadwal.subuh },
  //     { name: "Dzuhur", time: prayerTimes.jadwal.dzuhur },
  //     { name: "Ashar", time: prayerTimes.jadwal.ashar },
  //     { name: "Maghrib", time: prayerTimes.jadwal.maghrib },
  //     { name: "Isya", time: prayerTimes.jadwal.isya },
  //   ]

  //   const now = new Date()
  //   const times = prayers.map((prayer) => {
  //     const [hours, minutes] = prayer.time.split(":")
  //     const prayerTime = new Date(now)
  //     prayerTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0)
  //     return { ...prayer, datetime: prayerTime }
  //   })

  //   const next = times.find((prayer) => prayer.datetime > now) || times[0]
  //   setNextPrayer({ name: next.name, time: next.time })

  //   // Calculate countdown
  //   const diff = next.datetime.getTime() - now.getTime()
  //   if (diff < 0) {
  //     // Add 24 hours if we're comparing with tomorrow's prayer
  //     const newDiff = diff + 24 * 60 * 60 * 1000
  //     const hours = Math.floor(newDiff / (1000 * 60 * 60))
  //     const minutes = Math.floor((newDiff % (1000 * 60 * 60)) / (1000 * 60))
  //     const seconds = Math.floor((newDiff % (1000 * 60)) / 1000)
  //     setCountdown(
  //       `${hours.toString().padStart(2, "0")}:${minutes
  //         .toString()
  //         .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
  //     )
  //   } else {
  //     const hours = Math.floor(diff / (1000 * 60 * 60))
  //     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  //     const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  //     setCountdown(
  //       `${hours.toString().padStart(2, "0")}:${minutes
  //         .toString()
  //         .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
  //     )

  //     // Check if it's time for prayer and send notification
  //     // if (hours === 0 && minutes === 0 && seconds === 0 && notificationsEnabled) {
  //     //   sendNotification(`Waktu ${next.name}`, `Sekarang waktunya shalat ${next.name}`)
  //     // }
  //   }
  // }, [prayerTimes])

  const updateNextPrayer = useCallback(() => {
    if (!prayerTimes) return

    const prayers = [
      { name: "Subuh", time: prayerTimes.jadwal.subuh },
      { name: "Dzuhur", time: prayerTimes.jadwal.dzuhur },
      { name: "Ashar", time: prayerTimes.jadwal.ashar },
      { name: "Maghrib", time: prayerTimes.jadwal.maghrib },
      { name: "Isya", time: prayerTimes.jadwal.isya },
    ]

    const now = new Date()
    const times = prayers.map((prayer) => {
      const [hours, minutes] = prayer.time.split(":")
      const prayerTime = new Date(now)
      prayerTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0)
      return { ...prayer, datetime: prayerTime }
    })

    const next = times.find((prayer) => prayer.datetime > now) || times[0]
    setNextPrayer({ name: next.name, time: next.time })

    // Hitung selisih waktu untuk countdown
    let diff = next.datetime.getTime() - now.getTime()

    if (diff < 0) {
      // Tambahkan 24 jam jika waktu sholat berikutnya adalah besok
      diff += 24 * 60 * 60 * 1000
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    setCountdown(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    )

    // Kirim notifikasi saat waktu sholat tiba
    if (hours === 0 && minutes === 0 && seconds === 0) {
      // alert("Waktu sholat tiba")
      // sendNotification(
      //   `Waktu ${next.name}`,
      //   `Sekarang waktunya shalat ${next.name}`,
      // )
      playAdzan(adzanList[0].src)
    }
  }, [prayerTimes])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <section className="mb-0">
      {/* <Marquee
        speed={50}
        pauseOnHover={true}
        gradient={false}
        direction="left"
        className="p-4 bg-transparent"
      >
        <p className="text-gray-500 text-center ">
          🔥 Berita terbaru hari ini! 🚀 | 💰 Pasar saham melonjak tinggi! 📈 |
          🏆 Tim favorit menang besar! 🎉
        </p>
      </Marquee> */}
      {prayerTimes && (
        <>
          <div className="relative h-[50vh] md:h-60 xl:h-[100vh] border-none rounded-b-2xl xl:rounded-b-none overflow-hidden">
            <Image
              src="/assets/images/kaabah.jpg"
              alt="Kaabah"
              fill
              sizes="(max-width: 768px) 100vw"
              className="object-cover brightness-50 rounded-b-2xl xl:rounded-b-none"
            />

            <div className="absolute inset-0 flex flex-col justify-between p-4 xl:p-6 text-white z-10 mt-[45px]">
              <div className="flex flex-wrap justify-between items-start xl:px-12 ">
                <div className="flex flex-col min-w-0">
                  <h2 className="text-2xl font-bold flex">
                    <span className="hidden xl:block">Jadwal Sholat di</span>
                    <span className="ml-2 text-sm xl:text-2xl">
                      {prayerTimes?.lokasi}
                    </span>
                  </h2>
                  <Button
                    variant="link"
                    color="danger"
                    className="text-primary self-start"
                    onClick={() => setLocationDialogOpen(true)}
                  >
                    <MapPin className="h-4 w-4" /> Salah Lokasi?
                  </Button>
                </div>
                <div className="text-right text-[10px] xl:text-sm">
                  <HijriDateDisplay currentTime={currentTime} />
                </div>
              </div>

              <div className="block xl:hidden text-center relative -top-[14px] md:-top-[120px]">
                <h6 className="text-sm font-bold">Sholat Selanjutnya</h6>
                <div className="font-bold text-lg">{nextPrayer?.name}</div>
                <div className="text-3xl font-bold my-2">{countdown}</div>
                <div className="text-sm">
                  {currentTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm px-2 xl:px-6 relative -top-8 xl:-top-16">
                <div className="flex items-center gap-2">
                  <span>{selectedMethod.name}</span>
                  <Button
                    variant="link"
                    color="danger"
                    className="text-primary p-0 h-auto"
                    onClick={() => setMethodDialogOpen(true)}
                  >
                    Ganti
                  </Button>
                  <Button
                    type="default"
                    shape="circle"
                    className="border-none bg-transparent "
                    onClick={() =>
                      toast.info(
                        `Menggunakan parameter: Subuh ${selectedMethod.params.subuh}°, Isya ${selectedMethod.params.isya}°`,
                      )
                    }
                  >
                    <Info className="h-6 w-6 text-white" />
                  </Button>
                  <span className="text-muted-foreground">
                    Subuh {selectedMethod.params.subuh}°, Isya{" "}
                    {selectedMethod.params.isya}°
                  </span>
                </div>
                {/* <AdhanNotification /> */}
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

      <MethodSelector
        isOpen={methodDialogOpen}
        onClose={() => setMethodDialogOpen(false)}
        methods={PRAYER_METHODS}
        onSelectMethod={setSelectedMethod}
      />
    </section>
  )
}

export default PrayerTimeComponent
