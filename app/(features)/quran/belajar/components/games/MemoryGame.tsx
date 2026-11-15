"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { withFathah, type Letter } from "@/lib/belajar/letters"
import { shuffle } from "@/lib/belajar/games"
import { speakArabic } from "@/lib/belajar/speech"
import { sfxCorrect, sfxFlip } from "@/lib/belajar/sfx"
import { GameFinish, GameFrame } from "./GameKit"

const PAIRS = 4

interface Card {
  key: number
  letter: Letter
}

function makeDeck(pool: Letter[], fresh: Letter[]): Card[] {
  // Minimal 2 huruf dari pelajaran terbaru, sisanya dari huruf yang sudah dipelajari
  const picked = shuffle(fresh).slice(0, 2)
  const rest = shuffle(pool.filter((l) => !picked.some((p) => p.id === l.id))).slice(0, PAIRS - picked.length)
  const letters = [...picked, ...rest]
  return shuffle([...letters, ...letters]).map((letter, key) => ({ key, letter }))
}

/**
 * Cari Pasangan (memory): kartu tertutup; dibuka → menyebut bunyinya; cari dua kartu yang sama.
 * Bintang dihitung dari jumlah percobaan yang belum cocok (bukan dari waktu).
 */
export default function MemoryGame({
  pool,
  fresh,
  onAgain,
  onExit,
  onStickers,
}: {
  pool: Letter[]
  fresh: Letter[]
  onAgain: () => void
  onExit: () => void
  onStickers: () => void
}) {
  const [deck] = useState(() => makeDeck(pool, fresh))
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [misses, setMisses] = useState(0)
  const [justMatched, setJustMatched] = useState<string | null>(null)

  const done = matched.length === PAIRS
  const busy = open.length === 2

  const flip = (card: Card) => {
    if (busy || open.includes(card.key) || matched.includes(card.letter.id)) return
    sfxFlip()
    speakArabic(withFathah(card.letter), `${card.letter.id}-fathah`)
    const next = [...open, card.key]
    setOpen(next)
    if (next.length < 2) return
    const [a, b] = next.map((k) => deck[k])
    if (a.letter.id === b.letter.id) {
      window.setTimeout(() => {
        sfxCorrect()
        setMatched((m) => [...m, a.letter.id])
        setJustMatched(a.letter.id)
        setOpen([])
      }, 700)
    } else {
      // Biarkan anak melihat & mendengar kedua kartu sebelum ditutup lagi
      window.setTimeout(() => {
        setMisses((n) => n + 1)
        setOpen([])
      }, 1500)
    }
  }

  const stars = misses <= 2 ? 3 : misses <= 5 ? 2 : 1

  if (done) {
    return (
      <GameFrame title="Cari Pasangan" emoji="🃏" onExit={onExit}>
        <GameFinish
          stars={stars}
          summary={`Semua ${PAIRS} pasangan ketemu! Kartu yang belum cocok: ${misses} kali`}
          onAgain={onAgain}
          onExit={onExit}
          onStickers={onStickers}
        />
      </GameFrame>
    )
  }

  return (
    <GameFrame
      title="Cari Pasangan"
      emoji="🃏"
      onExit={onExit}
      progress={
        <div className="flex justify-center gap-1.5" aria-label={`${matched.length} dari ${PAIRS} pasangan`}>
          {Array.from({ length: PAIRS }, (_, i) => (
            <Star
              key={i}
              aria-hidden="true"
              className={`h-8 w-8 transition-all ${i < matched.length ? "scale-110 fill-amber-400 text-amber-400" : "text-gray-300"}`}
            />
          ))}
        </div>
      }
      hint="Buka dua kartu. Cari huruf yang sama! 🔍"
    >
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {deck.map((card) => {
          const isMatched = matched.includes(card.letter.id)
          const faceUp = isMatched || open.includes(card.key)
          return (
            <button
              key={card.key}
              type="button"
              aria-label={faceUp ? `Kartu ${card.letter.fathahLatin}` : "Kartu tertutup"}
              onClick={() => flip(card)}
              className="aspect-[3/4] [perspective:800px]"
            >
              <span
                className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                  faceUp ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                {/* belakang kartu */}
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-green-500 to-emerald-700 shadow-md [backface-visibility:hidden]">
                  <span className="text-3xl text-white/90 sm:text-5xl">⭐</span>
                </span>
                {/* muka kartu */}
                <span
                  className={`absolute inset-0 flex items-center justify-center rounded-2xl border-4 bg-white shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    isMatched ? "border-green-500 bg-green-50" : "border-gray-200"
                  } ${justMatched === card.letter.id ? "ring-4 ring-amber-300" : ""}`}
                >
                  <span
                    dir="rtl"
                    className="font-tertiary pb-[0.3em] text-4xl leading-[1.2] sm:text-6xl"
                    style={{ color: card.letter.color }}
                  >
                    {withFathah(card.letter)}
                  </span>
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </GameFrame>
  )
}
