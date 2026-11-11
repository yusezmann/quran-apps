import type React from "react"
import { NextPrayerCardProps } from "../interfaces/prayer-time.interface"

/** Kartu sholat berikutnya (desktop): disorot dengan warna brand, bukan foto, supaya paling menonjol. */
const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
  nextPrayer,
  countdown,
  currentTime,
}) => {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-600 to-emerald-700 text-center text-white shadow-2xl">
      <div className="flex h-full flex-col items-center justify-center px-3">
        <div className="text-xs font-medium uppercase tracking-wider text-green-100">
          Sholat berikutnya
        </div>
        <div className="text-lg font-bold">{nextPrayer?.name}</div>
        <div className="my-1 text-3xl font-bold tabular-nums">{countdown}</div>
        <div className="text-xs text-green-100">
          Sekarang{" "}
          {currentTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  )
}

export default NextPrayerCard
