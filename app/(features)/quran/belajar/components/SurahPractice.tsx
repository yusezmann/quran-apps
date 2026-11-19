"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Star } from "lucide-react"
import { fetchSurah } from "@/app/(features)/quran/services/quranService"
import { useBelajarProgress } from "@/lib/belajar/progress"
import { stopSpeaking } from "@/lib/belajar/speech"
import { HAFALAN_QARI, fetchChapterAudio, fetchChapterWords, type ChapterAudio } from "@/lib/belajar/recitation"

const REPEAT_OPTIONS = [1, 3, 5]
const SPEED_OPTIONS = [
  { label: "Normal", rate: 1 },
  { label: "Lambat", rate: 0.75 },
]
const DAY = 24 * 60 * 60 * 1000

/**
 * Mode hafalan surat pendek untuk anak: satu ayat per layar, teks besar per kata,
 * KATA YANG SEDANG DIBACA MENYALA mengikuti suara qari (data waktu per kata dari Quran.com).
 * Ayat diulang N kali lalu lanjut otomatis; bisa diperlambat; ketuk satu kata untuk mendengar kata itu saja.
 */
export default function SurahPractice({ surahNumber, onExit }: { surahNumber: number; onExit: () => void }) {
  const qariId = useBelajarProgress((s) => s.hafalanQari)
  const setQariId = useBelajarProgress((s) => s.setHafalanQari)
  const memorized = useBelajarProgress((s) => s.memorized.includes(surahNumber))
  const toggleMemorized = useBelajarProgress((s) => s.toggleMemorized)

  // Latin & terjemahan (equran.id), kata-kata ayat & audio + waktu per kata (Quran.com)
  const surahQ = useQuery({ queryKey: ["surah", surahNumber], queryFn: () => fetchSurah(surahNumber) })
  const wordsQ = useQuery({
    queryKey: ["hafalan-words", surahNumber],
    queryFn: () => fetchChapterWords(surahNumber),
    staleTime: 30 * DAY,
  })
  const audioQ = useQuery({
    queryKey: ["hafalan-audio", qariId, surahNumber],
    queryFn: () => fetchChapterAudio(qariId, surahNumber),
    staleTime: 30 * DAY,
  })

  const [ayahIndex, setAyahIndex] = useState(0)
  const [repeat, setRepeat] = useState(3)
  const [rate, setRate] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [activeWord, setActiveWord] = useState(-1)
  /** "tirukan": setelah tiap ayat berhenti sejenak agar anak menirukan (talaqqi) */
  const [method, setMethod] = useState<"tirukan" | "dengar">("tirukan")
  const [turn, setTurn] = useState<{ ms: number; key: number } | null>(null)
  const turnTimer = useRef<number | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number | null>(null)
  // Nilai terbaru untuk dibaca di dalam loop animasi (tanpa menunggu render)
  const live = useRef({
    ayahIndex: 0,
    repeat: 3,
    played: 0,
    mode: "verse" as "verse" | "word",
    wordEnd: 0,
    talaqqi: true,
    timing: null as ChapterAudio | null,
  })
  live.current.repeat = repeat
  live.current.talaqqi = method === "tirukan"
  live.current.timing = audioQ.data ?? null

  const surah = surahQ.data
  const ayat = surah?.ayat ?? []
  const current = ayat[ayahIndex]
  const verseNo = current?.nomorAyat ?? ayahIndex + 1
  const verseWords = wordsQ.data?.[verseNo]
  const ready = !!(surah && wordsQ.data && audioQ.data)
  const error = surahQ.error || wordsQ.error || audioQ.error

  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  const clearTurn = () => {
    if (turnTimer.current) window.clearTimeout(turnTimer.current)
    turnTimer.current = null
    setTurn(null)
  }

  const stop = useCallback(() => {
    clearTurn()
    stopLoop()
    audioRef.current?.pause()
    setPlaying(false)
    setActiveWord(-1)
  }, [])

  // Audio surat untuk qari terpilih (satu file, dipotong per ayat dengan data waktu)
  useEffect(() => {
    if (!audioQ.data) return
    stop()
    const el = new Audio(audioQ.data.url)
    el.preload = "auto"
    audioRef.current = el
    return () => {
      el.pause()
      el.src = ""
    }
  }, [audioQ.data, stop])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [rate])

  useEffect(() => () => stop(), [stop])

  /** Loop animasi: cari kata yang sedang dibaca & tangani akhir ayat / akhir kata. */
  const tick = () => {
    const el = audioRef.current
    const timing = live.current.timing
    if (!el || !timing) return
    const t = el.currentTime * 1000
    const state = live.current

    if (state.mode === "word") {
      if (t >= state.wordEnd || el.ended) {
        el.pause()
        setPlaying(false)
        setActiveWord(-1)
        return
      }
    } else {
      const verse = timing.verses[ayatNumber(state.ayahIndex)]
      if (verse) {
        const seg = verse.segments.findIndex(([, s, e]) => t >= s && t < e)
        setActiveWord((prev) => (seg >= 0 ? verse.segments[seg][0] - 1 : prev))
        if (t >= verse.to - 40 || el.ended) {
          onVerseEnd()
          return
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  /** Nomor ayat dari indeks (ayat di equran berurutan 1..n) */
  const ayatNumber = (index: number) => ayat[index]?.nomorAyat ?? index + 1

  const playVerse = (index: number) => {
    const el = audioRef.current
    const verse = audioQ.data?.verses[ayatNumber(index)]
    if (!el || !verse) return
    stopSpeaking()
    stopLoop()
    live.current.ayahIndex = index
    live.current.mode = "verse"
    el.currentTime = verse.from / 1000
    el.playbackRate = rate
    setActiveWord(-1)
    el.play()
      .then(() => {
        setPlaying(true)
        rafRef.current = requestAnimationFrame(tick)
      })
      .catch(() => setPlaying(false))
  }

  const onVerseEnd = () => {
    const state = live.current
    if (state.talaqqi) {
      // Giliran anak menirukan: jeda ≈ panjang ayat (+1 dtk), 2,5–15 dtk
      const verse = state.timing?.verses[ayatNumber(state.ayahIndex)]
      const speed = audioRef.current?.playbackRate || 1
      const ms = Math.min(15000, Math.max(2500, (verse ? (verse.to - verse.from) / speed : 3000) + 1000))
      audioRef.current?.pause()
      stopLoop()
      setActiveWord(-1)
      setTurn({ ms, key: Date.now() })
      turnTimer.current = window.setTimeout(() => {
        turnTimer.current = null
        setTurn(null)
        afterVerse()
      }, ms)
      return
    }
    afterVerse()
  }

  /** Setelah ayat (dan giliran menirukan): ulangi ayat, lanjut ke ayat berikutnya, atau selesai. */
  const afterVerse = () => {
    const state = live.current
    state.played += 1
    if (state.played < state.repeat) {
      playVerse(state.ayahIndex) // ulangi ayat yang sama
      return
    }
    state.played = 0
    if (state.ayahIndex + 1 < ayat.length) {
      setAyahIndex(state.ayahIndex + 1)
      playVerse(state.ayahIndex + 1)
    } else {
      stop() // akhir surat
    }
  }

  /** Ketuk satu kata: putar kata itu saja. */
  const playWord = (wordIdx: number) => {
    const el = audioRef.current
    const verse = audioQ.data?.verses[verseNo]
    const seg = verse?.segments.find(([pos]) => pos === wordIdx + 1)
    if (!el || !seg) return
    stopSpeaking()
    stopLoop()
    live.current.mode = "word"
    live.current.wordEnd = seg[2]
    el.currentTime = seg[1] / 1000
    el.playbackRate = rate
    setActiveWord(wordIdx)
    el.play()
      .then(() => {
        setPlaying(true)
        rafRef.current = requestAnimationFrame(tick)
      })
      .catch(() => setPlaying(false))
  }

  const goTo = (i: number) => {
    stop()
    live.current.played = 0
    const next = Math.max(0, Math.min(ayat.length - 1, i))
    live.current.ayahIndex = next
    setAyahIndex(next)
  }

  /** Kembali ke ayat 1 dan langsung memutarnya (menghafal = mengulang dari awal) */
  const restart = () => {
    goTo(0)
    playVerse(0)
  }

  const togglePlay = () => {
    if (playing) {
      stop()
      return
    }
    live.current.played = 0
    playVerse(ayahIndex)
  }

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

      {!ready && !error && <p className="rounded-2xl bg-white p-6 text-center text-gray-500">Memuat surat...</p>}
      {error && <p className="rounded-2xl bg-white p-6 text-center text-red-600">Gagal memuat surat. Periksa internet.</p>}

      {ready && current && (
        <>
          <div className="rounded-3xl bg-white p-5 text-center shadow-lg">
            <p className="text-lg font-bold text-green-800">{surah!.namaLatin}</p>
            <p className="text-sm text-gray-500">
              Ayat {current.nomorAyat} dari {surah!.jumlahAyat}
            </p>

            {/* Ayat per kata: kata yang sedang dibaca menyala; ketuk kata untuk mendengarnya */}
            <p dir="rtl" className="font-tertiary mt-3 pb-[0.2em] pt-[0.45em] text-4xl leading-[2.3] text-gray-900 md:text-5xl md:leading-[2.3]">
              {(verseWords?.words ?? [current.teksArab]).map((w, i) => (
                <span key={i}>
                  <button
                    type="button"
                    onClick={() => playWord(i)}
                    aria-label={`Kata ${i + 1}`}
                    className={`rounded-xl px-1 transition-colors duration-150 ${
                      i === activeWord ? "bg-amber-200 text-green-900 shadow-[0_0_0_3px_rgba(253,230,138,0.9)]" : "hover:bg-green-50"
                    }`}
                  >
                    {w}
                  </button>{" "}
                </span>
              ))}
              {verseWords?.end && (
                <span className="mx-1 inline-flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-green-600 px-1 align-middle text-2xl text-green-700">
                  {verseWords.end}
                </span>
              )}
            </p>
            {turn && (
              <div className="mx-auto mt-3 max-w-md rounded-2xl bg-amber-50 p-3 ring-2 ring-amber-300" role="status">
                <p className="text-lg font-bold text-amber-900">Giliranmu! 🎤 Tirukan ayat ini</p>
                <TurnBar key={turn.key} ms={turn.ms} />
                <button
                  type="button"
                  onClick={() => {
                    clearTurn()
                    afterVerse()
                  }}
                  className="mt-2 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-bold text-amber-950 hover:bg-amber-300"
                >
                  Sudah, lanjut ➜
                </button>
              </div>
            )}
            <p className="mt-4 text-sm italic text-amber-700">{current.teksLatin}</p>
            <p className="mt-2 text-sm text-gray-600">{current.teksIndonesia}</p>

            {/* Penanda ayat: ketuk untuk melompat ke ayat mana pun */}
            {ayat.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center" role="group" aria-label="Pilih ayat">
                {ayat.map((a, i) => (
                  <button
                    key={a.nomorAyat}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Ayat ${a.nomorAyat}`}
                    aria-current={i === ayahIndex ? "step" : undefined}
                    className="p-1.5"
                  >
                    <span
                      className={`block h-3 rounded-full transition-all ${
                        i === ayahIndex ? "w-7 bg-green-600" : i < ayahIndex ? "w-3 bg-green-300" : "w-3 bg-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kontrol besar untuk anak */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Ayat sebelumnya"
              onClick={() => goTo(ayahIndex - 1)}
              disabled={ayahIndex === 0}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-600 bg-white text-green-700 shadow-md transition-transform hover:bg-green-50 active:scale-95 disabled:border-gray-200 disabled:text-gray-300 disabled:shadow-none"
            >
              <ChevronLeft className="h-8 w-8" strokeWidth={2.75} />
            </button>
            <button
              type="button"
              aria-label={playing ? "Jeda" : "Putar"}
              onClick={togglePlay}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-white shadow-lg active:scale-95"
            >
              {playing ? <Pause className="h-9 w-9" /> : <Play className="ml-1 h-9 w-9" />}
            </button>
            <button
              type="button"
              aria-label="Ayat berikutnya"
              onClick={() => goTo(ayahIndex + 1)}
              disabled={ayahIndex >= ayat.length - 1}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-600 bg-white text-green-700 shadow-md transition-transform hover:bg-green-50 active:scale-95 disabled:border-gray-200 disabled:text-gray-300 disabled:shadow-none"
            >
              <ChevronRight className="h-8 w-8" strokeWidth={2.75} />
            </button>
          </div>

          {/* Ayat terakhir: ulangi surat dari awal */}
          {ayat.length > 1 && ayahIndex === ayat.length - 1 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={restart}
                className="inline-flex animate-bounce-in items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-lg font-bold text-amber-950 shadow-md hover:bg-amber-300 active:scale-95"
              >
                <RotateCcw className="h-5 w-5" /> Ulangi dari ayat 1
              </button>
            </div>
          )}

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
            <div className="sm:col-span-2">
              <p className="mb-2 font-semibold text-gray-700">Cara belajar</p>
              <div className="flex gap-2">
                {(
                  [
                    ["tirukan", "Dengar lalu tirukan 🎤"],
                    ["dengar", "Dengar saja"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={method === value}
                    onClick={() => {
                      setMethod(value)
                      if (value === "dengar" && turn) {
                        clearTurn()
                        afterVerse()
                      }
                    }}
                    className={`flex-1 rounded-full py-2 font-semibold ${method === value ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="mb-2 font-semibold text-gray-700">Qari</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih qari">
                {HAFALAN_QARI.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    title={o.note ? `${o.name} — ${o.note}` : o.name}
                    aria-label={`Qari ${o.name}`}
                    aria-pressed={qariId === o.id}
                    onClick={() => setQariId(o.id)}
                    className={`rounded-full px-4 py-2 font-semibold ${qariId === o.id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  >
                    {o.short}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Kata yang sedang dibaca akan menyala. Ketuk satu kata untuk mendengar kata itu saja.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/** Bilah waktu giliran menirukan: menyusut dari penuh ke kosong selama `ms`. */
function TurnBar({ ms }: { ms: number }) {
  const [shrink, setShrink] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShrink(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-amber-200" aria-hidden="true">
      <div
        className="h-full rounded-full bg-amber-500"
        style={{ width: shrink ? "0%" : "100%", transition: `width ${ms}ms linear` }}
      />
    </div>
  )
}
