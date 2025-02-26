"use client"

import { useQuery } from "@tanstack/react-query"
import { useQuranStore } from "@/app/(features)/quran/store/quranStore"
import { Play, Pause, Bookmark, AlertCircle, Hexagon, Book } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import BismillahText from "@/components/BismillahText"
import {
  fetchSurah,
  fetchSurahList,
  fetchTafsir,
  type Surah,
} from "@/app/(features)/quran/services/quranService"
import { Button, Modal, Select } from "antd"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"

export default function QuranReader() {
  const currentSurah = useQuranStore((state) => state.currentSurah)
  const setCurrentSurah = useQuranStore((state) => state.setCurrentSurah)
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null)
  const [lastRead, setLastRead] = useState<{
    surah: number
    ayah: number
  } | null>(null)

  const [selectedQari, setSelectedQari] = useState("01")
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

  const { data: tafsir } = useQuery({
    queryKey: ["tafsir", currentSurah, selectedAyah],
    queryFn: () =>
      selectedAyah !== null
        ? fetchTafsir(currentSurah, selectedAyah)
        : Promise.reject("No ayah selected"),
    enabled: currentSurah !== null && selectedAyah !== null,
  })

  const openTafsirModal = (ayahNumber: any) => {
    setSelectedAyah(ayahNumber)
    setIsModalOpen(true)
  }

  const setLastReadAyah = (surahNumber: number, ayahNumber: number) => {
    const lastReadData = { surah: surahNumber, ayah: ayahNumber }
    localStorage.setItem("lastRead", JSON.stringify(lastReadData))
    setLastRead(lastReadData)
  }

  const removeLastReadAyah = () => {
    localStorage.removeItem("lastRead")
    setLastRead(null)
  }

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAyah, setCurrentAyah] = useState<number | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setAudioError(null)
    setIsPlaying(false)
    setCurrentAyah(null)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [currentSurah]) //Corrected dependency

  // Auto-scroll saat currentAyah berubah
  useEffect(() => {
    if (currentAyah && ayahRefs.current[currentAyah]) {
      ayahRefs.current[currentAyah]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [currentAyah])

  useEffect(() => {
    const savedLastRead = localStorage.getItem("lastRead")
    if (savedLastRead) {
      setLastRead(JSON.parse(savedLastRead))
    }
  }, [])

  const goToLastRead = () => {
    if (lastRead) {
      setCurrentSurah(lastRead.surah)
      setCurrentAyah(lastRead.ayah)
      playAyah(lastRead.ayah)
    }
  }

  const { data: surahList } = useQuery({
    queryKey: ["surahList"],
    queryFn: fetchSurahList,
  })

  const handleSurahSelect = (value: string) => {
    const selected = surahList?.find((s) => s.namaLatin === value)
    if (selected) setCurrentSurah(selected.nomor)
  }

  const playAyah = (ayahNumber: number) => {
    if (audioRef.current) {
      const ayah = surah?.ayat[ayahNumber - 1]
      if (!ayah) {
        setAudioError(`Ayat ${ayahNumber} tidak ditemukan.`)
        return
      }

      const ayahAudio =
        (ayah.audio as Record<string, string>)[selectedQari] || ""

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

        // Simpan bacaan terakhir ke localStorage
        const lastReadData = { surah: currentSurah, ayah: ayahNumber }
        localStorage.setItem("lastRead", JSON.stringify(lastReadData))
        setLastRead(lastReadData)
      } else {
        setAudioError(`Audio untuk ayat ${ayahNumber} tidak tersedia.`)
      }
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        if (currentAyah && surah && currentAyah < surah.jumlahAyat) {
          playAyah(currentAyah + 1)
        } else {
          setIsPlaying(false)
        }
      }
    }
  }, [currentAyah, surah])

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

  if (!currentSurah)
    return (
      <div className="bg-green-600 p-4 rounded-lg shadow">
        Pilih Surah untuk mulai membaca
      </div>
    )
  if (isLoading)
    return <div className="bg-green-600 p-4 rounded-lg shadow">Memuat...</div>
  if (error)
    return (
      <div className="bg-green-600 p-4 rounded-lg shadow">
        Error mengambil surah: {error.message}
      </div>
    )

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-green-600 text-white p-4 flex justify-between items-center">
          <Button
            type="default"
            shape="circle"
            icon={<LeftOutlined />}
            onClick={goToPreviousSurah}
            disabled={!surah?.suratSebelumnya}
          />
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold">{surah?.namaLatin}</h2>
            <p className="text-xs xl:text-sm text-center">
              {surah?.arti} • {surah?.jumlahAyat} Ayat • {surah?.tempatTurun}
            </p>
          </div>
          <Button
            type="default"
            shape="circle"
            icon={<RightOutlined />}
            onClick={goToNextSurah}
            disabled={!surah?.suratSelanjutnya}
          />
        </div>
        <div className="p-4 space-y-2">
          <label className="text-sm font-medium text-gray-600">Qari:</label>
          <Select
            defaultValue={selectedQari}
            onChange={(value) => setSelectedQari(value)}
            options={[
              { label: "Abdullah-Al-Juhany", value: "01" },
              { label: "Abdul-Muhsin-Al-Qasim", value: "02" },
              { label: "Abdurrahman-as-Sudais", value: "03" },
              { label: "Ibrahim-Al-Dossari", value: "04" },
              { label: "Misyari-Rasyid-Al-Afasi", value: "05" },
            ]}
            className="mb-2 xl:mb-4 w-full"
            placeholder="Pilih Qari"
          />
        </div>
        <div className="p-4 block xl:hidden">
          <Select
            showSearch
            placeholder="Cari Surat..."
            options={surahList?.map((s) => ({
              label: s.namaLatin,
              value: s.namaLatin,
            }))}
            onChange={handleSurahSelect}
            className="mb-4 w-full"
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
            <div
              key={ayat.nomorAyat}
              className={`border-b p-4 ${
                lastRead?.surah === currentSurah &&
                lastRead?.ayah === ayat.nomorAyat
                  ? " border-l-4 border-red-500"
                  : ""
              }`}
            >
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
                  {lastRead?.surah === currentSurah &&
                  lastRead?.ayah === ayat.nomorAyat ? (
                    <Button
                      onClick={removeLastReadAyah}
                      className="text-red-500 hover:text-red-700"
                    >
                      Hapus Tanda Bacaan Terakhir
                    </Button>
                  ) : (
                    <Button
                      type="default"
                      shape="circle"
                      onClick={() =>
                        setLastReadAyah(currentSurah, ayat.nomorAyat)
                      }
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    type="default"
                    shape="circle"
                    onClick={() => openTafsirModal(ayat.nomorAyat)}
                  >
                    <Book className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-right text-gray-800 text-2xl mb-4 leading-loose">
                {ayat.teksArab}
              </p>
              <p className="text-sm text-yellow-600 mb-2 italic font-bold">
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

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <h2 className="text-lg font-semibold mb-4">
          Tafsir {surah?.namaLatin} Ayat {selectedAyah}
        </h2>
        <div className="overflow-y-auto max-h-96 space-y-3">
          {tafsir?.length ? (
            tafsir.map((item: any, index: number) => (
              <div key={index} className="text-sm leading-relaxed space-y-2">
                {item.teks.split("\n").map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            ))
          ) : (
            <p className="text-red-500">Tafsir tidak ditemukan</p>
          )}
        </div>
      </Modal>
    </>
  )
}
