"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, RotateCcw, Star } from "lucide-react"
import { STICKERS, stickerCount } from "@/lib/belajar/games"
import { useBelajarProgress } from "@/lib/belajar/progress"
import { sfxWin } from "@/lib/belajar/sfx"
import { stopSpeaking } from "@/lib/belajar/speech"

/** Bingkai semua game: tombol kembali, judul, dan kartu putih berisi progres. */
export function GameFrame({
  title,
  emoji,
  onExit,
  progress,
  hint,
  children,
}: {
  title: string
  emoji: string
  onExit: () => void
  progress?: React.ReactNode
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Gulir agar area game langsung terlihat penuh (tanpa anak harus menggulir sendiri)
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    return () => void stopSpeaking()
  }, [])
  return (
    <div ref={ref} className="scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Pilih game
        </button>
        <p className="text-sm font-semibold text-white">
          {emoji} {title}
        </p>
      </div>
      {(progress || hint) && (
        <div className="space-y-2 rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
          {progress}
          {hint && <p className="text-base font-medium text-gray-700">{hint}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

/** Deretan bintang per ronde: kuning = benar pertama kali, abu terisi = sempat salah, garis = belum. */
export function RoundStars({ results, current }: { results: Array<boolean | undefined>; current?: number }) {
  const got = results.filter((r) => r === true).length
  return (
    <div className="flex justify-center gap-1.5" aria-label={`${got} bintang dari ${results.length}`}>
      {results.map((r, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-8 w-8 transition-all duration-300 ${
            r === true ? "scale-110 fill-amber-400 text-amber-400" : r === false ? "fill-gray-300 text-gray-300" : "text-gray-300"
          } ${i === current ? "animate-pulse" : ""}`}
        />
      ))}
    </div>
  )
}

/**
 * Layar selesai: menambah bintang game (sekali), merayakan, dan menampilkan stiker baru bila terbuka.
 */
export function GameFinish({
  stars,
  summary,
  onAgain,
  onExit,
  onStickers,
}: {
  stars: number
  summary: string
  onAgain: () => void
  onExit: () => void
  onStickers: () => void
}) {
  const addGameStars = useBelajarProgress((s) => s.addGameStars)
  const [newSticker, setNewSticker] = useState<number | null>(null)
  const saved = useRef(false)

  useEffect(() => {
    if (saved.current) return
    saved.current = true
    const s = useBelajarProgress.getState()
    const before = Object.values(s.stars).reduce((a, b) => a + b, 0) + s.gameStars
    addGameStars(stars)
    const had = stickerCount(before)
    const now = stickerCount(before + stars)
    if (now > had) setNewSticker(now - 1)
    sfxWin()
  }, [addGameStars, stars])

  return (
    <div className="space-y-5 rounded-3xl bg-white p-6 text-center shadow-lg" role="status">
      <p className="text-2xl font-bold text-gray-900">MasyaAllah, hebat! 🎉</p>
      <div className="flex justify-center gap-2" aria-label={`${stars} bintang`}>
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            style={{ animationDelay: `${n * 0.15}s` }}
            className={`h-14 w-14 animate-bounce-in ${n <= stars ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
          />
        ))}
      </div>
      <p className="text-gray-600">{summary}</p>

      {newSticker !== null && (
        <button
          type="button"
          onClick={onStickers}
          className="mx-auto flex flex-col items-center rounded-3xl border-4 border-dashed border-amber-300 bg-amber-50 px-8 py-4"
        >
          <span className="text-sm font-bold uppercase tracking-wide text-amber-700">Stiker baru!</span>
          <span className="animate-bounce-in text-7xl" style={{ animationDelay: "0.6s" }}>
            {STICKERS[newSticker][0]}
          </span>
          <span className="font-semibold text-amber-900">{STICKERS[newSticker][1]}</span>
        </button>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onAgain}
          className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          <RotateCcw className="h-5 w-5" /> Main lagi
        </button>
        <button
          type="button"
          onClick={onStickers}
          className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-amber-950 hover:bg-amber-500"
        >
          📒 Buku stiker
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded-full bg-white px-5 py-3 font-semibold text-gray-700 ring-1 ring-gray-200"
        >
          Pilih game
        </button>
      </div>
    </div>
  )
}
