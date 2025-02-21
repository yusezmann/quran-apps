import { useEffect, useState } from "react"
import { getHijriDate } from "../services/hijri-date.service"
import { formatDate } from "@/lib/utils"

// Komponen yang menampilkan tanggal Hijriah
const HijriDateDisplay = ({ currentTime }: { currentTime: Date }) => {
  const [hijriDate, setHijriDate] = useState<string>("Memuat...")

  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        const result: any = await getHijriDate(currentTime)
        if (!result || !result.date) throw new Error("Data tidak valid")

        const { date } = result
        setHijriDate(`${date[0]}, ${date[1]}`)
      } catch (error) {
        if (error instanceof TypeError) {
          console.error(
            "Gagal memuat tanggal Hijriah: Periksa koneksi internet atau izin CORS.",
            error,
          )
        } else {
          console.error("Gagal memuat tanggal Hijriah:", error)
        }
      }
    }

    fetchHijriDate()
  }, [currentTime])

  return (
    <div className="text-right text-[10px] xl:text-sm">
      <div className="font-semibold">{formatDate(currentTime)}</div>
      <div className="text-muted-foreground italic">{hijriDate}</div>
    </div>
  )
}

export default HijriDateDisplay
