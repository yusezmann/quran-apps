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
import { Button, Card, Modal, Select } from "antd"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"
import { FaBookOpen } from "react-icons/fa"

export default function QuranReader() {
  const currentSurah = useQuranStore((state) => state.currentSurah)
  const setCurrentSurah = useQuranStore((state) => state.setCurrentSurah)
  const scrollTarget = useQuranStore((state) => state.scrollTarget)
  const setScrollTarget = useQuranStore((state) => state.setScrollTarget)
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null)
  const [lastRead, setLastRead] = useState<{
    surah: number
    ayah: number
    name: string
  } | null>(null)

  const [selectedQari, setSelectedQari] = useState("05")
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

  const setLastReadAyah = (
    surahNumber: number,
    ayahNumber: number,
    nameSurah: string,
  ) => {
    const lastReadData = {
      surah: surahNumber,
      ayah: ayahNumber,
      name: nameSurah,
    }
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

  // Lompat ke ayat tanpa memutar audio (sebelumnya memakai currentAyah sehingga bilah audio ikut muncul)
  const goToLastRead = () => {
    if (lastRead) {
      setCurrentSurah(lastRead.surah)
      setScrollTarget(lastRead.ayah)
    }
  }

  // Fungsi untuk scroll ke ayat yang dituju
  const scrollToAyah = (ayahNumber: number) => {
    const ayahElement = document.getElementById(`ayah-${ayahNumber}`)

    if (ayahElement) {
      ayahElement.scrollIntoView({ behavior: "smooth", block: "start" }) // jarak atas: scroll-mt pada elemen ayat
    } else {
      console.log("Ayat tidak ditemukan!")
    }
  }

  // Scroll ke ayat target setelah surah yang benar selesai dimuat
  useEffect(() => {
    if (!scrollTarget || !surah || surah.nomor !== currentSurah) return
    const timer = setTimeout(() => {
      scrollToAyah(scrollTarget)
      setScrollTarget(null)
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTarget, surah, currentSurah])

  // Gunakan useEffect untuk menangani perubahan currentAyah
  useEffect(() => {
    if (currentAyah) {
      setTimeout(() => {
        scrollToAyah(currentAyah)
      }, 500) // Tambahkan delay agar elemen siap
    }
  }, [currentAyah])

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
        const lastReadData = {
          surah: currentSurah,
          ayah: ayahNumber,
          name: surah?.namaLatin,
        }
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

  // Pindah surah (dari judul yang menempel atau akhir surah) selalu kembali ke awal bacaan
  const goToPreviousSurah = () => {
    if (surah?.suratSebelumnya) openSurahFromEnd(surah.suratSebelumnya.nomor)
  }

  const goToNextSurah = () => {
    if (surah?.suratSelanjutnya) openSurahFromEnd(surah.suratSelanjutnya.nomor)
  }

  /** Pindah surah dari bagian bawah: kembali ke awal bacaan agar ayat 1 surah baru langsung terlihat. */
  const openSurahFromEnd = (nomor: number) => {
    setCurrentSurah(nomor) // audio berhenti otomatis saat surah berganti
    window.scrollTo({ top: 0, behavior: "smooth" })
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
      <div className="bg-white rounded-lg shadow">
        {/* Judul surah menempel di bawah header aplikasi (88px; 98px di desktop) saat di-scroll,
            sehingga tombol pindah surah selalu terjangkau dari tengah surah */}
        <div className="sticky top-[88px] xl:top-[98px] z-20 bg-green-600 text-white px-3 py-2.5 md:p-4 flex justify-between items-center rounded-t-lg shadow-md">
          <Button
            type="default"
            shape="circle"
            icon={<LeftOutlined />}
            onClick={goToPreviousSurah}
            disabled={!surah?.suratSebelumnya}
          />
          <div className="flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-semibold leading-tight">{surah?.namaLatin}</h2>
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

        <div className="p-4 space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
          <div className="w-full md:w-auto flex flex-col">
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
              className="mt-1 w-full md:w-64"
              placeholder="Pilih Qari"
            />
          </div>
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

        {lastRead && (
          <div className="w-full md:w-auto flex flex-col justify-end px-4 py-4">
            <Card
              onClick={goToLastRead}
              className="text-green-500 w-full md:w-auto xl:mt-6 cursor-pointer"
            >
              <div className="flex items-center gap-6">
                <FaBookOpen className="h-8 w-8" />
                <div className="flex flex-col">
                  <span className="text-sm font italic">Terakhir Dibaca</span>
                  <span className="text-sm font-bold">
                    {lastRead?.name ?? "Tidak diketahui"}
                  </span>
                  <span className="text-sm font italic">
                    Ayat {lastRead?.ayah}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

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
        <div className="p-4 space-y-6">
          <BismillahText />
          {surah?.ayat.map((ayat: any) => (
            <div
              key={ayat.nomorAyat}
              id={`ayah-${ayat.nomorAyat}`} // Tambahkan id untuk scroll
              // scroll-mt: ayat yang dituju tampil di bawah header + judul surah yang menempel
              className={`scroll-mt-[180px] xl:scroll-mt-[200px] border-b p-4 ${
                lastRead?.surah === currentSurah &&
                lastRead?.ayah === ayat.nomorAyat
                  ? " border-l-4 border-red-500 bg-yellow-100"
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
                      type="default"
                      shape="circle"
                      onClick={removeLastReadAyah}
                      className="text-red-500 hover:text-red-700 border-red-500"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="default"
                      shape="circle"
                      onClick={() =>
                        setLastReadAyah(
                          currentSurah,
                          ayat.nomorAyat,
                          surah?.namaLatin,
                        )
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
              <p className="text-right text-gray-800 text-2xl mb-4 font-tertiary leading-loose">
                {ayat.teksArab}
              </p>
              <p className="text-sm text-yellow-600 mb-2 italic font-bold">
                {ayat.teksLatin}
              </p>
              <p className="text-gray-600 text-sm">{ayat.teksIndonesia}</p>
            </div>
          ))}
        </div>

        {/* Akhir surah: lanjut ke surah berikutnya tanpa harus scroll kembali ke atas */}
        {surah && (surah.suratSelanjutnya || surah.suratSebelumnya) && (
          <nav aria-label="Navigasi surah" className="border-t px-4 pb-6 pt-5">
            <p className="mb-3 text-center text-sm text-gray-500">
              Akhir surah {surah.namaLatin} · {surah.jumlahAyat} ayat
            </p>
            {surah.suratSelanjutnya && (
              <button
                type="button"
                onClick={() => openSurahFromEnd(surah.suratSelanjutnya!.nomor)}
                className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-green-600 px-5 py-4 text-left text-white shadow-md transition-colors hover:bg-green-700"
              >
                <span className="leading-snug">
                  <span className="block text-xs font-medium uppercase tracking-wide text-green-100">
                    Surah berikutnya
                  </span>
                  <span className="text-lg font-bold">
                    {surah.suratSelanjutnya.nomor}. {surah.suratSelanjutnya.namaLatin}
                  </span>
                </span>
                <RightOutlined className="text-lg transition-transform group-hover:translate-x-1" />
              </button>
            )}
            {surah.suratSebelumnya && (
              <button
                type="button"
                onClick={() => openSurahFromEnd(surah.suratSebelumnya!.nomor)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-green-500 hover:text-green-700"
              >
                <LeftOutlined /> Surah sebelumnya: {surah.suratSebelumnya.namaLatin}
              </button>
            )}
          </nav>
        )}
        {/* Kontrol audio: hanya tampil saat ada ayat yang diputar, menempel di bawah layar */}
        {currentAyah !== null && (
        <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+92px)] xl:bottom-0 z-20 p-3 border-t bg-white/95 backdrop-blur flex justify-between items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <Button
            onClick={goToPreviousAyah}
            disabled={
              !currentAyah || (currentAyah === 1 && !surah?.suratSebelumnya)
            }
          >
            Ayat Sebelumnya
          </Button>
          <span className="text-sm text-gray-600 tabular-nums">
            {isPlaying ? "Memutar" : "Dijeda"} · Ayat {currentAyah}/{surah?.jumlahAyat}
          </span>
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
        )}
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
