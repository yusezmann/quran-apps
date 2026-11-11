import type React from "react"
import Image from "next/image"
import { Card } from "antd"
import NextPrayerCard from "./NextPrayerCard"
import { PrayerTimesListProps } from "../interfaces/prayer-time.interface"

const PRAYER_KEYS = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"] as const

const CARD_IMAGES: Record<string, string> = {
  imsak: "/assets/images/padang-moon.jpg",
  subuh: "/assets/images/padang-moon.jpg",
  dzuhur: "/assets/images/dzuhur.jpg",
  ashar: "/assets/images/dzuhur.jpg",
  maghrib: "/assets/images/sunset.jpg",
  isya: "/assets/images/padang-moon.jpg",
}

const PrayerTimesList: React.FC<PrayerTimesListProps> = ({
  prayerTimes,
  nextPrayer,
  countdown,
  currentTime,
}) => {
  return (
    <>
      <Card
        size="small"
        className="relative z-10 mx-4 md:mx-8 -mt-6 md:-mt-8 shadow-lg block xl:hidden"
      >
        <div className="grid grid-cols-6 gap-1 text-center">
          {PRAYER_KEYS.map((key) => {
            const isNext = nextPrayer?.name.toLowerCase() === key
            return (
              <div
                key={`mobile-${key}`}
                className={`rounded-lg py-1 ${isNext ? "bg-green-50 text-green-800" : ""}`}
              >
                <div className={`text-xs font-semibold capitalize ${isNext ? "text-green-700" : "text-gray-900"}`}>
                  {key}
                </div>
                <div className="text-sm tabular-nums text-gray-700">
                  {String(prayerTimes.jadwal[key as keyof typeof prayerTimes.jadwal])}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Desktop: kartu di dalam hero (posisi absolut) sehingga tidak meninggalkan celah kosong */}
      <div className="hidden xl:block absolute inset-x-0 bottom-[190px] z-10">
        <div className="grid grid-cols-6 gap-4 px-16 items-end">
          {PRAYER_KEYS.map((key) => {
            const value = prayerTimes.jadwal[key as keyof typeof prayerTimes.jadwal]
            if (nextPrayer?.name.toLowerCase() === key) {
              return (
                <NextPrayerCard
                  key={`desktop-${key}`}
                  nextPrayer={nextPrayer}
                  countdown={countdown}
                  currentTime={currentTime}
                />
              )
            }
            return (
              <div
                key={`desktop-${key}`}
                className="relative h-32 overflow-hidden rounded-xl border border-white/40 text-center shadow-lg"
              >
                <Image
                  src={CARD_IMAGES[key] ?? "/assets/images/sunset.jpg"}
                  alt=""
                  fill
                  sizes="16vw"
                  className="object-cover"
                />
                {/* Overlay agar teks tetap terbaca di atas ilustrasi terang */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
                <div className="relative z-10 flex h-full flex-col items-center justify-center text-white drop-shadow">
                  <div className="font-semibold capitalize">{key}</div>
                  <div className="text-2xl font-bold tabular-nums">{String(value)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default PrayerTimesList
