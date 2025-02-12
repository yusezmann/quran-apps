"use client"

import { useQuery } from "@tanstack/react-query"
import { useQuranStore } from "@/store/quranStore"
import {
  Play,
  Pause,
  Bookmark,
  Share2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  LucideStar,
  Hexagon,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import BismillahText from "../BismillahText"
import { fetchSurah, type Surah } from "@/services/quranService"
import { Button } from "antd"
import {
  LeftOutlined,
  RightOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  BookOutlined,
  ShareAltOutlined,
} from "@ant-design/icons"

interface Bookmark {
  surahNumber: number
  ayahNumber: number
}

export default function QuranReader() {
  const currentSurah = useQuranStore((state) => state.currentSurah)
  const setCurrentSurah = useQuranStore((state) => state.setCurrentSurah)
  const {
    data: surah,
    isLoading,
    error,
  } = useQuery<Surah, Error>({
    queryKey: ["surah", currentSurah],
    queryFn: () => fetchSurah(currentSurah),
    enabled: !!currentSurah,
    retry: 2,
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAyah, setCurrentAyah] = useState<number | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    setAudioError(null)
    setIsPlaying(false)
    setCurrentAyah(null)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [audioRef]) //Corrected dependency

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        if (surah?.audioFull["01"]) {
          audioRef.current.src = surah.audioFull["01"]
          audioRef.current.play().catch((e) => {
            console.error("Error playing audio:", e)
            setAudioError(
              "Tidak dapat memutar audio surah. Silakan coba lagi nanti.",
            )
          })
        } else {
          setAudioError("Audio surah tidak tersedia.")
        }
      }
      setIsPlaying(!isPlaying)
    }
  }

  const playAyah = (ayahNumber: number) => {
    if (audioRef.current) {
      const ayahAudio = surah?.ayat[ayahNumber - 1]?.audio["01"]
      if (ayahAudio) {
        audioRef.current.src = ayahAudio
        audioRef.current.play().catch((e) => {
          console.error("Error playing ayah audio:", e)
          setAudioError(
            `Tidak dapat memutar audio ayat ${ayahNumber}. Silakan coba ayat lain.`,
          )
        })
        setIsPlaying(true)
        setCurrentAyah(ayahNumber)
        setAudioError(null)
      } else {
        setAudioError(`Audio untuk ayat ${ayahNumber} tidak tersedia.`)
      }
    }
  }

  const stopAyah = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentAyah(null)
    }
  }

  const goToPreviousSurah = () => {
    if (surah?.suratSebelumnya) {
      setCurrentSurah(surah.suratSebelumnya.nomor)
    }
  }

  const goToNextSurah = () => {
    if (surah?.suratSelanjutnya) {
      setCurrentSurah(surah.suratSelanjutnya.nomor)
    }
  }

  const goToPreviousAyah = () => {
    if (currentAyah && currentAyah > 1) {
      setCurrentAyah(currentAyah - 1)
      playAyah(currentAyah - 1)
    } else if (surah?.suratSebelumnya) {
      goToPreviousSurah()
    }
  }

  const goToNextAyah = () => {
    if (currentAyah && surah && currentAyah < surah.jumlahAyat) {
      setCurrentAyah(currentAyah + 1)
      playAyah(currentAyah + 1)
    } else if (surah?.suratSelanjutnya) {
      goToNextSurah()
    }
  }

  const handleBookmark = () => {
    if (currentAyah) {
      setBookmarks((prevBookmarks) => [
        ...prevBookmarks,
        { surahNumber: currentSurah, ayahNumber: currentAyah },
      ])
    }
  }

  if (!currentSurah)
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        Pilih Surah untuk mulai membaca
      </div>
    )
  if (isLoading)
    return <div className="bg-white p-4 rounded-lg shadow">Memuat...</div>
  if (error)
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        Error mengambil surah: {error.message}
      </div>
    )

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-green-600 text-white p-4">
        <h2 className="text-2xl font-semibold">{surah?.namaLatin}</h2>
        <p>
          {surah?.arti} • {surah?.jumlahAyat} Ayat
        </p>
      </div>

      <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
        <Button
          type="default"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={goToPreviousSurah}
          disabled={!surah?.suratSebelumnya}
        />

        <div className="flex space-x-2">
          <Button
            type="default"
            shape="circle"
            icon={
              isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )
            }
            onClick={togglePlayPause}
            disabled={!surah?.audioFull["01"]}
          />
          <Button type="default" shape="circle" icon={<BookOutlined />} />
          <Button type="default" shape="circle" icon={<ShareAltOutlined />} />
        </div>

        <Button
          type="default"
          shape="circle"
          icon={<RightOutlined />}
          onClick={goToNextSurah}
          disabled={!surah?.suratSelanjutnya}
        />
      </div>
      {audioError && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <p>{audioError}</p>
          </div>
        </div>
      )}
      <div className="p-4 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        <BismillahText />
        {surah?.ayat.map((ayat: any) => (
          <div key={ayat.nomorAyat} className="border-b pb-4">
            <div className="flex justify-between items-center mb-2 ">
              <div className="relative w-10 h-10 flex items-center justify-center bg-green-600 rounded-full">
                <Hexagon className="w-10 h-10 text-white" />
                <span className="absolute text-gray-50 text-sm font-bold">
                  {ayat.nomorAyat}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="default"
                  shape="circle"
                  onClick={() =>
                    currentAyah === ayat.nomorAyat && isPlaying
                      ? stopAyah()
                      : playAyah(ayat.nomorAyat)
                  }
                  disabled={!ayat.audio["01"]}
                >
                  {currentAyah === ayat.nomorAyat && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button type="default" shape="circle">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button type="default" shape="circle">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-right text-gray-800 text-2xl mb-4 leading-loose">
              {ayat.teksArab}
            </p>
            <p className="text-sm text-gray-600 mb-2 italic font-bold">
              {ayat.teksLatin}
            </p>
            <p className="text-gray-600 text-sm">{ayat.teksIndonesia}</p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex justify-between items-center">
        <Button
          onClick={goToPreviousAyah}
          disabled={
            !currentAyah || (currentAyah === 1 && !surah?.suratSebelumnya)
          }
        >
          Ayat Sebelumnya
        </Button>
        <Button
          onClick={goToNextAyah}
          disabled={
            !currentAyah ||
            (currentAyah === surah?.jumlahAyat && !surah?.suratSelanjutnya)
          }
        >
          Ayat Selanjutnya
        </Button>
      </div>
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentAyah(null)
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={(e) => {
          console.error("Audio playback error:", e)
          setAudioError(
            "Terjadi kesalahan saat memutar audio. Silakan coba lagi nanti.",
          )
          setIsPlaying(false)
          setCurrentAyah(null)
        }}
      />
    </div>
  )
}
