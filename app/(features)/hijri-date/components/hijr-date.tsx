import { useEffect, useState } from "react"
import { getHijriDate } from "../services/hijri-date.service"
import { formatDate } from "@/lib/utils"

// Komponen yang menampilkan tanggal Hijriah
const HijriDateDisplay = ({ currentTime }: { currentTime: Date }) => {
  const [hijriDate, setHijriDate] = useState<string>("Memuat...")

  useEffect(() => {
    getHijriDate(currentTime)
      .then((result: any) => {
        const { date } = result
        setHijriDate(`${date[0]}, ${date[1]}`)
      })
      .catch((error) => {
        console.error("Gagal memuat tanggal Hijriah:", error)
        setHijriDate("Gagal memuat tanggal")
      })
  }, [currentTime])

  return (
    <div className="text-right text-[10px] xl:text-sm">
      <div className="font-semibold">{formatDate(currentTime)}</div>
      <div className="text-muted-foreground italic">{hijriDate}</div>
    </div>
  )
}

export default HijriDateDisplay
