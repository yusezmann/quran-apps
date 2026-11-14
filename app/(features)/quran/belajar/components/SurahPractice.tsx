"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react"
import { fetchSurah } from "@/app/(features)/quran/services/quranService"
import { useBelajarProgress } from "@/lib/belajar/progress"
import { stopSpeaking } from "@/lib/belajar/speech"

const REPEAT_OPTIONS = [1, 3, 5]
const SPEED_OPTIONS = [
  { label: "Normal", rate: 1 },
  { label: "Lambat", rate: 0.75 },
]

/**
 * Mode hafalan surat pendek untuk anak: satu ayat per layar, teks besar,
 * ayat diulang N kali lalu lanjut otomatis, bisa diperlambat.
 */
export default function SurahPractice({ surahNumber, onExit }: { surahNumber: number; onExit: () => void }) {
  const { data: surah, isLoading, error } = useQuery({
    queryKey: ["surah", surahNumber],
    queryFn: () => fetchSurah(surahNumber),
  })
  const memorized = useBelajarProgress((s) => s.memorized.includes(surahNumber))
  const toggleMemorized = useBelajarProgress((s) => s.toggleMemorized)

  const [ayahIndex, setAyahIndex] = useState(0)
  const [repeat, setRepeat] = useState(3)
  const [rate, setRate] = useState(1)
  const [playing, setPlaying] = useState(false)
  const playedCount = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const ayat = surah?.ayat ?? []
  const current = ayat[ayahIndex]

  const stop = () => {
    audioRef.current?.pause()
    setPlaying(false)
  }

  const playCurrent = (index = ayahIndex) => {
    const a = ayat[index]
    if (!a) return
    stopSpeaking()
    audioRef.current?.pause()
    const el = new Audio(a.audio["05"])
    el.playbackRate = rate
    audioRef.current = el
    el.onended = () => {
      playedCount.current += 1
      if (playedCount.current < repeat) {
        el.currentTime = 0
        el.play().catch(() => setPlaying(false))
        return
      }
      // Ayat berikutnya otomatis; berhenti di akhir surat
      playedCount.current = 0
      if (index + 1 < ayat.length) {
        setAyahIndex(index + 1)
        playCurrent(index + 1)
      } else {
        setPlaying(false)
      }
    }
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }

  const goTo = (i: number) => {
    stop()
    playedCount.current = 0
    setAyahIndex(Math.max(0, Math.min(ayat.length - 1, i)))
  }

  useEffect(() => () => audioRef.current?.pause(), [])
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [rate])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            stop()
            onExit()
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Daftar surat
        </button>
        <button
          type="button"
          onClick={() => toggleMemorized(surahNumber)}
          aria-pressed={memorized}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow ${
            memorized ? "bg-amber-400 text-amber-950" : "bg-white text-gray-700"
          }`}
        >
          <Star className={`h-4 w-4 ${memorized ? "fill-amber-950" : ""}`} />
          {memorized ? "Sudah hafal" : "Tandai hafal"}
        </button>
      </div>

      {isLoading && <p className="rounded-2xl bg-white p-6 text-center text-gray-500">Memuat surat...</p>}
      {error && <p className="rounded-2xl bg-white p-6 text-center text-red-600">Gagal memuat surat. Periksa internet.</p>}

      {surah && current && (
        <>
          <div className="rounded-3xl bg-white p-5 text-center shadow-lg">
            <p className="text-lg font-bold text-green-800">{surah.namaLatin}</p>
            <p className="text-sm text-gray-500">
              Ayat {current.nomorAyat} dari {surah.jumlahAyat}
            </p>
            <p dir="rtl" className="font-tertiary mt-5 text-4xl leading-[2.2] text-gray-900 md:text-5xl md:leading-[2.2]">
              {current.teksArab}
            </p>
            <p className="mt-4 text-sm italic text-amber-700">{current.teksLatin}</p>
            <p className="mt-2 text-sm text-gray-600">{current.teksIndonesia}</p>
          </div>

          {/* Kontrol besar untuk anak */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Ayat sebelumnya"
              onClick={() => goTo(ayahIndex - 1)}
              disabled={ayahIndex === 0}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow disabled:opacity-40"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              aria-label={playing ? "Jeda" : "Putar"}
              onClick={() => (playing ? stop() : playCurrent())}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-white shadow-lg active:scale-95"
            >
              {playing ? <Pause className="h-9 w-9" /> : <Play className="ml-1 h-9 w-9" />}
            </button>
            <button
              type="button"
              aria-label="Ayat berikutnya"
              onClick={() => goTo(ayahIndex + 1)}
              disabled={ayahIndex >= ayat.length - 1}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow disabled:opacity-40"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>

          {/* Pengaturan untuk orang tua */}
          <div className="grid grid-cols-1 gap-3 rounded-2xl bg-white/90 p-4 text-sm shadow-sm sm:grid-cols-2">
            <div>
              <p className="mb-2 font-semibold text-gray-700">Ulangi tiap ayat</p>
              <div className="flex gap-2">
                {REPEAT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={repeat === n}
                    onClick={() => setRepeat(n)}
                    className={`flex-1 rounded-full py-2 font-semibold ${repeat === n ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  >
                    {n}×
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-semibold text-gray-700">Kecepatan</p>
              <div className="flex gap-2">
                {SPEED_OPTIONS.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    aria-pressed={rate === o.rate}
                    onClick={() => setRate(o.rate)}
                    className={`flex-1 rounded-full py-2 font-semibold ${rate === o.rate ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
