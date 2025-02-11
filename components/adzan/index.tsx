import { useState, useEffect } from "react"
import { Button, Select } from "antd"
import { Pause, Play } from "lucide-react"

const adzanList = [
  { id: 1, name: "Adzan Makkah", src: "/assets/audio/adzan-makkah.mp3" },
  {
    id: 2,
    name: "Adzan Mesir",
    src: "/assets/audio/adzan-mesir.mp3",
  },
  {
    id: 3,
    name: "Adzan Shubuh",
    src: "/assets/audio/adzan-shubuh.mp3",
  },
]

export default function AdzanPlayer() {
  const [selectedAdzan, setSelectedAdzan] = useState(adzanList[0].src)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const Option = Select

  useEffect(() => {
    // Hentikan audio sebelumnya sebelum membuat yang baru
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }

    const newAudio = new Audio(selectedAdzan)
    setAudio(newAudio)
  }, [selectedAdzan])

  const handleSelect = (id: number) => {
    const adzan = adzanList.find((item) => item.id === id)
    if (adzan) setSelectedAdzan(adzan.src)
  }

  const togglePlay = () => {
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col gap-4 items-center">
      <h2 className="text-xl font-semibold">Pemutar Adzan</h2>
      <Select onChange={handleSelect} defaultValue={adzanList[0].id}>
        {adzanList.map((adzan) => (
          <Option key={adzan.id} value={adzan.id}>
            {adzan.name}
          </Option>
        ))}
      </Select>
      <Button onClick={togglePlay} className="flex items-center gap-2">
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}{" "}
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </div>
  )
}
