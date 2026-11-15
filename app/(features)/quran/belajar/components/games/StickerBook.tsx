"use client"

import { ArrowLeft, Star } from "lucide-react"
import { STARS_PER_STICKER, STICKERS, stickerCount } from "@/lib/belajar/games"
import { useTotalStars } from "@/lib/belajar/progress"

/** Buku stiker: setiap 3 bintang (dari pelajaran & game) membuka satu stiker. */
export default function StickerBook({ onExit }: { onExit: () => void }) {
  const total = useTotalStars()
  const have = stickerCount(total)
  const all = have >= STICKERS.length
  const toNext = STARS_PER_STICKER - (total % STARS_PER_STICKER)
  const progress = all ? 100 : ((total % STARS_PER_STICKER) / STARS_PER_STICKER) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <p className="text-sm font-semibold text-white">📒 Buku Stiker</p>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 text-lg font-bold text-gray-900">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" /> {total} bintang
          </p>
          <p className="text-sm font-semibold text-gray-600">
            {have}/{STICKERS.length} stiker
          </p>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-amber-100" aria-hidden="true">
          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {all
            ? "MasyaAllah, semua stiker sudah terkumpul! 🏆"
            : `${toNext} bintang lagi untuk stiker berikutnya. Main game atau kuis untuk mendapat bintang ⭐`}
        </p>

        <ul className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {STICKERS.map(([emoji, name], i) => {
            const owned = i < have
            const newest = i === have - 1
            return (
              <li
                key={name}
                className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-2 ${
                  owned ? "border-amber-200 bg-amber-50" : "border-dashed border-gray-200 bg-gray-50"
                }`}
                aria-label={owned ? name : "Stiker belum terbuka"}
              >
                {owned ? (
                  <>
                    <span className={`text-4xl sm:text-5xl ${newest ? "animate-bounce-in" : ""}`}>{emoji}</span>
                    <span className="mt-0.5 text-[10px] font-semibold leading-tight text-amber-900 sm:text-xs">{name}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-300">?</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
