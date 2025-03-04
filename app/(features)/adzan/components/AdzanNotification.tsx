"use client"

import { useEffect, useState } from "react"
import moment from "moment-timezone"

interface PrayerTimes {
  subuh: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
  [key: string]: string
}

interface City {
  id: string
  lokasi: string
}

export default function AdhanNotification() {
  const [cities, setCities] = useState<City[]>([])
  const [cityId, setCityId] = useState<string>("1301") // Default Jakarta
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const [nextPrayer, setNextPrayer] = useState<string>("")
  const [countdown, setCountdown] = useState<string>("")
  const [adhanAudio, setAdhanAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    if (cityId) fetchPrayerTimes()
    const interval = setInterval(() => {
      checkPrayerTime()
      updateCountdown()
    }, 1000) // Update setiap detik
    return () => clearInterval(interval)
  }, [cityId])

  const fetchCities = async () => {
    try {
      const response = await fetch(
        "https://api.myquran.com/v2/sholat/kota/semua",
      )
      const data = await response.json()
      setCities(data.data)
    } catch (error) {
      console.error("Gagal mengambil daftar kota", error)
    }
  }

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch(
        `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${moment().format(
          "YYYY/MM/DD",
        )}`,
      )
      const data = await response.json()
      if (data.status) {
        setPrayerTimes(data.data.jadwal)
        findNextPrayer(data.data.jadwal)
        setAdhanAudio(new Audio("/adhan.mp3"))
      }
    } catch (error) {
      console.error("Gagal mengambil jadwal sholat", error)
    }
  }

  const findNextPrayer = (times: PrayerTimes) => {
    const now = moment().tz("Asia/Jakarta")
    let upcomingTime: string | null = null
    let upcomingPrayer: string = ""

    Object.entries(times).forEach(([name, time]) => {
      const prayerTime = moment(time, "HH:mm").tz("Asia/Jakarta")
      if (prayerTime.isAfter(now)) {
        if (
          !upcomingTime ||
          prayerTime.isBefore(moment(upcomingTime, "HH:mm"))
        ) {
          upcomingTime = time
          upcomingPrayer = name
        }
      }
    })

    setNextPrayer(upcomingPrayer)
  }

  const checkPrayerTime = () => {
    if (!prayerTimes) return

    const now = moment().tz("Asia/Jakarta").format("HH:mm")
    if (Object.values(prayerTimes).includes(now)) {
      showNotification(nextPrayer)
      if (adhanAudio) {
        adhanAudio.play()
      }
      findNextPrayer(prayerTimes)
    }
  }

  const updateCountdown = () => {
    if (!prayerTimes || !nextPrayer) return

    const now = moment().tz("Asia/Jakarta")
    const nextTime = moment(prayerTimes[nextPrayer], "HH:mm").tz("Asia/Jakarta")

    if (nextTime.isBefore(now)) {
      findNextPrayer(prayerTimes)
      return
    }

    const duration = moment.duration(nextTime.diff(now))
    const formattedCountdown = `${duration.hours()} jam ${duration.minutes()} menit ${duration.seconds()} detik`
    setCountdown(formattedCountdown)
  }

  const showNotification = (prayerName: string) => {
    if (Notification.permission === "granted") {
      new Notification("Waktu Sholat", {
        body: `Sudah masuk waktu sholat ${prayerName}!`,
        icon: "/azan-icon.png",
      })
    } else {
      Notification.requestPermission()
    }
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-bold">Jadwal Sholat</h2>

      {/* Pilihan Kota */}
      <div className="mt-2">
        <label className="mr-2">Pilih Kota:</label>
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="border rounded p-1 text-gray-500"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.lokasi}
            </option>
          ))}
        </select>
      </div>

      {/* Countdown */}
      {nextPrayer && (
        <p className="mt-3 text-green-600 font-medium">
          Sholat berikutnya: <b>{nextPrayer}</b> dalam <b>{countdown}</b>
        </p>
      )}

      <p className="text-gray-600 text-sm">Notifikasi Adzan Aktif</p>
    </div>
  )
}
