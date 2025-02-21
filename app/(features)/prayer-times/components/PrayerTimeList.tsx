import type React from "react"
import Image from "next/image"
import { Card } from "antd"
import NextPrayerCard from "./NextPrayerCard"
import { PrayerTimesListProps } from "../interfaces/prayer-time.interface"

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
        style={{ width: "91%" }}
        className="relative left-[18px] md:left-[35px] -top-6 md:-top-8 lg:left-[45px] shadow-lg xl:shadow-none block xl:hidden"
      >
        <div className="flex flex-row flex-wrap gap-4 items-center justify-center">
          {Object.entries(prayerTimes.jadwal).map(([key, value]) => {
            if (["tanggal", "date", "terbit", "dhuha", "imsak"].includes(key))
              return null
            return (
              <div key={`mobile-${key}`} className="flex flex-col items-center">
                <div className="font-bold capitalize">{key}</div>
                <div className="text-gray-700">{value}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="relative hidden xl:block xl:-top-[410px]">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 px-16">
          {Object.entries(prayerTimes.jadwal).map(([key, value]) => {
            if (["tanggal", "date", "terbit", "dhuha", "imsak"].includes(key))
              return null
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
            if (["subuh", "isya"].includes(key)) {
              return (
                <Card
                  key={`desktop-${key}`}
                  className="bg-gray-100 text-center h-32 w-50 relative top-8 hidden xl:block rounded-xl"
                >
                  <Image
                    src="/assets/images/padang-moon.jpg"
                    alt="Background"
                    fill
                    sizes="(max-width: 768px) 100vw"
                    className="object-cover brightness-50 rounded-xl"
                  />
                  <h6 className="p-4 text-center text-white relative z-10">
                    <div className="font-bold capitalize">{key}</div>
                    <div className="text-xl">{value}</div>
                  </h6>
                </Card>
              )
            } else if (["dzuhur"].includes(key)) {
              return (
                <Card
                  key={`desktop-${key}`}
                  className="bg-gray-100 text-center h-32 w-50 relative top-8 hidden xl:block rounded-xl"
                >
                  <Image
                    src="/assets/images/dzuhur.jpg"
                    alt="Background"
                    fill
                    sizes="(max-width: 768px) 100vw"
                    className="object-cover brightness-50 rounded-xl"
                  />
                  <h6 className="p-4 text-center text-white relative z-10">
                    <div className="font-bold capitalize">{key}</div>
                    <div className="text-xl">{value}</div>
                  </h6>
                </Card>
              )
            } else {
              return (
                <Card
                  key={`desktop-${key}`}
                  className="bg-gray-100 text-center h-32 w-50 relative top-8 hidden xl:block rounded-xl"
                >
                  <Image
                    src="/assets/images/sunset.jpg"
                    alt="Background"
                    fill
                    sizes="(max-width: 768px) 100vw"
                    className="object-cover brightness-70 rounded-xl"
                  />
                  <h6 className="p-4 text-center text-white relative z-10">
                    <div className="font-bold capitalize">{key}</div>
                    <div className="text-xl">{value}</div>
                  </h6>
                </Card>
              )
            }
          })}
        </div>
      </div>
    </>
  )
}

export default PrayerTimesList
