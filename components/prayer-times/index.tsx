"use client"

import { getHijriDate } from "@/services/hijri-date"
import {
  getCities,
  getPrayerTimes,
  getPrayerTimesByCoords,
} from "@/services/prayer-time.service"
import { City, PrayerTime } from "@/interfaces/prayer-time.interface"
import { Button, Card, Input, List, Modal, Tooltip } from "antd"
import { Info, Loader2, MapPin } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import AdzanPlayer from "../adzan"

const PRAYER_METHODS = [
  { id: "kemenag", name: "Kemenag", params: { subuh: 20, isya: 18 } },
  { id: "mwl", name: "Muslim World League", params: { subuh: 18, isya: 17 } },
  {
    id: "egypt",
    name: "Egyptian General Authority",
    params: { subuh: 19.5, isya: 17.5 },
  },
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
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<City[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState(PRAYER_METHODS[0])
  const [methodDialogOpen, setMethodDialogOpen] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  useEffect(() => {
    fetchPrayerTimes()
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, []) // Removed cityId from dependencies

  useEffect(() => {
    if (prayerTimes) {
      updateNextPrayer()
      const timer = setInterval(updateNextPrayer, 1000)
      return () => clearInterval(timer)
    }
  }, [prayerTimes, currentTime])

  useEffect(() => {
    fetchPrayerTimes()
  }, [cityId, selectedMethod])

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
      setSearchResults(results)
    } catch (error) {
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
        try {
          const cityId = await getPrayerTimesByCoords(
            position.coords.latitude,
            position.coords.longitude,
          )
          setCityId(cityId)
          setLocationDialogOpen(false)
          toast.success("Lokasi berhasil dideteksi")
          fetchPrayerTimes() // Fetch new prayer times after location change
        } catch (error) {
          console.error("Failed to detect location:", error)
          toast.error(
            "Gagal mendeteksi lokasi: " +
              (error instanceof Error ? error.message : "Unknown error"),
          )
        } finally {
          setIsDetectingLocation(false)
        }
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
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const updateNextPrayer = () => {
    if (!prayerTimes) return

    const prayers = [
      { name: "Subuh", time: prayerTimes.jadwal.subuh },
      { name: "Terbit", time: prayerTimes.jadwal.terbit },
      { name: "Dzuhur", time: prayerTimes.jadwal.dzuhur },
      { name: "Ashar", time: prayerTimes.jadwal.ashar },
      { name: "Maghrib", time: prayerTimes.jadwal.maghrib },
      { name: "Isya", time: prayerTimes.jadwal.isya },
    ]

    const now = currentTime
    const times = prayers.map((prayer) => {
      const [hours, minutes] = prayer.time.split(":")
      const prayerTime = new Date(now)
      prayerTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0)
      return { ...prayer, datetime: prayerTime }
    })

    const next = times.find((prayer) => prayer.datetime > now) || times[0]
    setNextPrayer({ name: next.name, time: next.time })

    // Calculate countdown
    const diff = next.datetime.getTime() - now.getTime()
    if (diff < 0) {
      // Add 24 hours if we're comparing with tomorrow's prayer
      const newDiff = diff + 24 * 60 * 60 * 1000
      const hours = Math.floor(newDiff / (1000 * 60 * 60))
      const minutes = Math.floor((newDiff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((newDiff % (1000 * 60)) / 1000)
      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const hijriDate = getHijriDate(currentTime)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <section className="mb-0">
      {prayerTimes &&
        Object.entries(prayerTimes.jadwal).map(([key, value]) => {
          if (["tanggal", "date", "terbit", "dhuha"].includes(key)) return null

          if (nextPrayer?.name.toLowerCase() === key)
            return (
              <>
                <Card
                  size="small"
                  style={{ width: "100%" }}
                  className="relative h-[50vh] md:h-60 xl:h-[100vh] border-none rounded-b-2xl"
                >
                  <Image
                    src="/assets/images/kaabah.jpg"
                    alt="Kaabah"
                    fill
                    sizes="(max-width: 768px) 100vw"
                    className="object-cover brightness-50 rounded-b-2xl"
                  />
                  <div className="flex flex-col xl:flex-row justify-between items-start relative z-10 text-white xl:px-6 xl:py-8">
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-bold">
                        Jadwal Sholat di {prayerTimes?.lokasi}
                      </h2>
                      <Button
                        variant="link"
                        color="danger"
                        className="relative text-primary -left-28 xl:left-[-120px]"
                        onClick={() => setLocationDialogOpen(true)}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Salah Lokasi?
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatDate(currentTime)}</div>
                      <div className="text-muted-foreground italic">
                        {hijriDate.day} {hijriDate.month}, {hijriDate.year}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 xl:p-0 text-center relative z-10 text-white block xl:hidden">
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

                  <div className="relative text-white top-[50px] xl:top-[500px]">
                    <div className="flex justify-between items-center text-sm xl:px-6">
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
                          className="border-none"
                          onClick={() =>
                            toast.info(
                              `Menggunakan parameter: Subuh ${selectedMethod.params.subuh}°, Isya ${selectedMethod.params.isya}°`,
                            )
                          }
                        >
                          <Info className="h-6 w-6" />
                        </Button>
                        <span className="text-muted-foreground">
                          Subuh {selectedMethod.params.subuh} derajat, Isya{" "}
                          {selectedMethod.params.isya} derajat
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card
                  size="small"
                  style={{ width: "91%" }}
                  className="relative left-[18px] md:left-[35px] -top-6 md:-top-8 lg:left-[45px] shadow-lg xl:shadow-none block xl:hidden"
                >
                  <div className="flex flex-row flex-wrap gap-4 items-center justify-center">
                    {Object.entries(prayerTimes.jadwal).map(([key, value]) => {
                      if (
                        [
                          "tanggal",
                          "date",
                          "terbit",
                          "dhuha",
                          "imsak",
                        ].includes(key)
                      )
                        return null
                      return (
                        <div key={key} className="flex flex-col items-center ">
                          <div className="font-bold capitalize">{key}</div>
                          <div className="text-gray-700">{value}</div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
                <div className="relative hidden xl:block xl:-top-[500px]">
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 px-6  ">
                    {Object.entries(prayerTimes.jadwal).map(([key, value]) => {
                      if (
                        [
                          "tanggal",
                          "date",
                          "terbit",
                          "dhuha",
                          "imsak",
                        ].includes(key)
                      )
                        return null
                      if (nextPrayer?.name.toLowerCase() === key) {
                        return (
                          <Card
                            key={key}
                            className="col-span-1 relative overflow-hidden"
                          >
                            <Image
                              src="/assets/images/kaabah.jpg"
                              alt="Background"
                              fill
                              sizes="(max-width: 768px) 100vw"
                              className="object-cover brightness-50"
                            />
                            <h6 className="p-4 text-center relative z-10 text-white">
                              <div className="text-sm font-bold">
                                Sholat Selanjutnya
                              </div>
                              <div className="font-bold">
                                {nextPrayer?.name}
                              </div>
                              <div className="text-3xl font-bold my-2">
                                {countdown}
                              </div>
                              <div className="text-sm">
                                {currentTime.toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </h6>
                          </Card>
                        )
                      } else {
                        return (
                          <div
                            key={key}
                            className="items-center justify-center"
                          >
                            <Card className="bg-gray-100 text-center h-30 w-50 relative top-8 hidden xl:block">
                              <h6 className="p-4 text-center relative z-10">
                                <div className="font-bold capitalize">
                                  {key}
                                </div>
                                <div className="text-xl">{value}</div>
                              </h6>
                            </Card>
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              </>
            )
        })}

      <Modal
        open={locationDialogOpen}
        onCancel={() => setLocationDialogOpen(false)}
        footer={null}
        className="relative left-[-1px] xl:left-0"
      >
        <div>
          <div>
            <h2>Pilih Lokasi</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Cari kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
              />
              <Button onClick={handleLocationSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cari"
                )}
              </Button>
            </div>
            <Button
              variant="link"
              className="w-full"
              onClick={detectLocation}
              disabled={isDetectingLocation}
            >
              {isDetectingLocation ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendeteksi Lokasi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MapPin className="mr-2 h-4 w-4" />
                  Deteksi Lokasi
                </span>
              )}
            </Button>
            {searchResults.length > 0 && (
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                <List
                  dataSource={searchResults}
                  renderItem={(city) => (
                    <List.Item>
                      <Button
                        type="text"
                        className="w-full justify-start"
                        onClick={() => handleCitySelect(city)}
                      >
                        {city.lokasi}, {city.daerah}
                      </Button>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={methodDialogOpen}
        onCancel={() => setMethodDialogOpen(false)}
        footer={null}
        className="relative left-[-1px] xl:left-0"
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <h2>Pilih Metode Perhitungan</h2>
          </div>
          <div className="space-y-2">
            {PRAYER_METHODS.map((method) => (
              <Button
                key={method.id}
                variant="link"
                className="w-full justify-start h-16"
                onClick={() => {
                  setSelectedMethod(method)
                  setMethodDialogOpen(false)
                }}
              >
                <div className="flex flex-col items-start">
                  <span>{method.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Subuh: {method.params.subuh}°, Isya: {method.params.isya}°
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </Modal>
    </section>
  )
}

export default PrayerTimeComponent
