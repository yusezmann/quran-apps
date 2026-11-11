"use client"

import { format } from "date-fns"
import { id } from "date-fns/locale"
import { formatDate } from "@/lib/utils"
import { formatHijri } from "@/lib/hijri"
import { useHijriOffset } from "../hooks/useHijriOffset"

// Komponen yang menampilkan tanggal Masehi + Hijriah
const HijriDateDisplay = ({ currentTime }: { currentTime: Date }) => {
  const offset = useHijriOffset()
  const dayName = format(currentTime, "EEEE", { locale: id })

  return (
    <div className="text-right text-[10px] xl:text-sm">
      <div className="font-semibold">{formatDate(currentTime)}</div>
      <div className="text-white/80 italic">
        {dayName}, {formatHijri(currentTime, offset)}
      </div>
    </div>
  )
}

export default HijriDateDisplay
