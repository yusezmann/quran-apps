import type React from "react"
import Image from "next/image"
import { Card } from "antd"
import { NextPrayerCardProps } from "../interfaces/prayer-time.interface"

const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
  nextPrayer,
  countdown,
  currentTime,
}) => {
  return (
    <Card className="col-span-1 relative overflow-hidden">
      <Image
        src="/assets/images/kaabah.jpg"
        alt="Background"
        fill
        sizes="(max-width: 768px) 100vw"
        className="object-cover brightness-50"
      />
      <h6 className="p-4 text-center relative z-10 text-white">
        <div className="text-sm font-bold">Sholat Selanjutnya</div>
        <div className="font-bold">{nextPrayer?.name}</div>
        <div className="text-3xl font-bold my-2">{countdown}</div>
        <div className="text-sm">
          {currentTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </h6>
    </Card>
  )
}

export default NextPrayerCard
