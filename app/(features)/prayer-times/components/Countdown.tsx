import { useEffect, useState } from "react"
import { playAdzan } from "../../adzan/components/AdzanSetting"
import { adzanList } from ".."
import { Button } from "antd" // Pastikan ini sesuai dengan library yang kamu gunakan
import { LucideVolume2 } from "lucide-react"

const CountdownTest = () => {
  const [countdown, setCountdown] = useState(5) // Ubah ke 5 detik untuk uji coba
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if (countdown <= 0) {
      setShowButton(true) // Setelah countdown selesai, tampilkan tombol
      return
    }

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown])

  return (
    <div>
      <h2>Countdown Test</h2>
      <p>
        {countdown > 0
          ? `00:00:${countdown.toString().padStart(2, "0")}`
          : "Waktu Sholat!"}
      </p>

      {showButton && (
        <Button
          type="default"
          shape="circle"
          icon={<LucideVolume2 className="h-4 w-4" />}
          onClick={() => playAdzan(adzanList[0]?.src)}
        >
          Putar Adzan
        </Button>
      )}
    </div>
  )
}

export default CountdownTest
