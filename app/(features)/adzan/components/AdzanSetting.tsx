import { useEffect, useState } from "react"
import { Modal, Button, Switch, Select } from "antd"
import { LucideVolume2 } from "lucide-react"

const { Option } = Select

const adzanList = [
  { id: 1, name: "Adzan Makkah", src: "/assets/audio/adzan-makkah.mp3" },
  { id: 2, name: "Adzan Mesir", src: "/assets/audio/adzan-mesir.mp3" },
  { id: 3, name: "Adzan Shubuh", src: "/assets/audio/adzan-shubuh.mp3" },
]

let audioCtx: AudioContext | null = null // Gunakan satu instance AudioContext

export const playAdzan = (src: string) => {
  if (!src) {
    console.error("Sumber audio tidak ditemukan!")
    return
  }

  const audio = new Audio(src)

  const playAudio = () => {
    audio.play().catch((error) => console.error("Gagal memutar adzan:", error))
  }

  // Cek apakah browser mendukung AudioContext
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  // Jika AudioContext dalam keadaan "suspended", resume setelah interaksi
  if (audioCtx.state === "suspended") {
    const resumeAudioContext = () => {
      audioCtx?.resume().then(() => {
        playAudio()
      })
      document.body.removeEventListener("click", resumeAudioContext) // Hapus listener setelah digunakan
    }

    document.body.addEventListener("click", resumeAudioContext, { once: true })
  } else {
    playAudio()
  }
}

const AdzanSettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [adzanEnabled, setAdzanEnabled] = useState(false)
  const [selectedAdzan, setSelectedAdzan] = useState(adzanList[0].src)

  // Load settings from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem("adzanEnabled")
    const savedAdzan = localStorage.getItem("selectedAdzan")

    if (savedEnabled !== null) setAdzanEnabled(JSON.parse(savedEnabled))
    if (savedAdzan) setSelectedAdzan(savedAdzan)
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("adzanEnabled", JSON.stringify(adzanEnabled))
    localStorage.setItem("selectedAdzan", selectedAdzan)
  }, [adzanEnabled, selectedAdzan])

  return (
    <div>
      {/* Tombol Buka Modal */}

      <Button
        type="default"
        shape="circle"
        icon={<LucideVolume2 className="h-4 w-4" />}
        onClick={() => setIsModalOpen(true)}
      />

      {/* Modal Ant Design */}
      <Modal
        title="Pengaturan Adzan"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Tutup
          </Button>,
        ]}
      >
        {/* Toggle Notifikasi Adzan */}
        <div className="flex items-center justify-between mb-4">
          <span>Aktifkan Notifikasi Adzan</span>
          <Switch
            checked={adzanEnabled}
            onChange={(checked) => setAdzanEnabled(checked)}
          />
        </div>

        {/* Pilihan Suara Adzan */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Pilih Suara Adzan:
          </label>
          <Select
            className="w-full"
            value={selectedAdzan}
            onChange={(value) => setSelectedAdzan(value)}
          >
            {adzanList.map((option) => (
              <Option key={option.id} value={option.src}>
                {option.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Tombol Coba Suara Adzan */}
        {/* <Button type="primary" onClick={() => playAdzan(selectedAdzan)}>
          Coba Adzan
        </Button> */}
      </Modal>
    </div>
  )
}

export default AdzanSettings
