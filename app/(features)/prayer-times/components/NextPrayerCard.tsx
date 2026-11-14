import type React from "react"
import { NextPrayerCardProps } from "../interfaces/prayer-time.interface"

/**
 * Kartu sholat berikutnya (desktop): foto Ka'bah dengan lapisan hijau brand + bingkai hijau terang,
 * agar tetap paling menonjol walau latar hero juga foto Ka'bah.
 */
const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
  nextPrayer,
  countdown,
  currentTime,
}) => {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border-2 border-green-300 text-center text-white shadow-2xl ring-4 ring-green-400/30">
      {/* Foto diperbesar & dipusatkan ke Ka'bah (±51% dari kiri, 59% dari atas foto) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: "url(/assets/images/kaabah.jpg)",
          backgroundSize: "230% auto",
          backgroundPosition: "51% 59%",
        }}
      />
      {/* Lapisan hijau: tebal di atas & bawah (teks), tipis di tengah agar Ka'bah terlihat */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-800/85 via-green-900/35 to-green-950/85" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-3 drop-shadow">
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
