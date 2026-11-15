"use client"

import { useState } from "react"
import { withFathah, type Letter } from "@/lib/belajar/letters"
import { lookalikes, pick, pickTarget, sessionStars, shuffle } from "@/lib/belajar/games"
import { speakArabic } from "@/lib/belajar/speech"
import { sfxCorrect } from "@/lib/belajar/sfx"
import { GameFinish, GameFrame, RoundStars } from "./GameKit"

const ROUNDS = 6

interface Round {
  same: Letter
  odd: Letter
  cells: Letter[]
}

function makeRound(pool: Letter[], fresh: Letter[], n: number, prev?: Letter): Round {
  let same = pickTarget(pool, fresh)
  for (let i = 0; i < 5 && prev && same.id === prev.id; i++) same = pickTarget(pool, fresh)
  // Utamakan huruf yang bentuknya mirip (mis. ب dengan ت) — itu yang perlu dilatih
  const similar = lookalikes(same, pool)
  const odd = similar.length ? pick(similar) : pick(pool.filter((l) => l.id !== same.id))
  return { same, odd, cells: shuffle([odd, ...Array(n - 1).fill(same)]) }
}

/**
 * Mana yang Beda?: beberapa huruf sama, satu berbeda (sering hanya beda titik).
 * Ronde 1–3: 4 kotak, ronde 4–6: 6 kotak.
 */
export default function OddOneGame({
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
  const size = (r: number) => (r < 3 ? 4 : 6)
  const [roundNo, setRoundNo] = useState(0)
  const [round, setRound] = useState(() => makeRound(pool, fresh, size(0)))
  const [results, setResults] = useState<Array<boolean | undefined>>(() => Array(ROUNDS).fill(undefined))
  const [missed, setMissed] = useState(false)
  const [wiggle, setWiggle] = useState<{ i: number; n: number } | null>(null)
  const [found, setFound] = useState<number | null>(null)

  const done = roundNo >= ROUNDS

  const tap = (i: number) => {
    if (found !== null) return
    if (round.cells[i].id !== round.odd.id) {
      setMissed(true)
      setWiggle((w) => ({ i, n: (w?.n ?? 0) + 1 }))
      return
    }
    setFound(i)
    sfxCorrect()
    // Sebutkan bunyi huruf yang berbeda itu agar bentuk & bunyinya tersambung
    window.setTimeout(() => speakArabic(withFathah(round.odd), `${round.odd.id}-fathah`), 350)
    setResults((r) => r.map((v, k) => (k === roundNo ? !missed : v)))
    window.setTimeout(() => {
      setFound(null)
      setMissed(false)
      setWiggle(null)
      if (roundNo + 1 < ROUNDS) setRound(makeRound(pool, fresh, size(roundNo + 1), round.same))
      setRoundNo((n) => n + 1)
    }, 1800)
  }

  const firstTry = results.filter((r) => r === true).length
  const stars = sessionStars(firstTry, ROUNDS)

  if (done) {
    return (
      <GameFrame title="Mana yang Beda?" emoji="🔍" onExit={onExit}>
        <GameFinish
          stars={stars}
          summary={`Langsung ketemu: ${firstTry} dari ${ROUNDS}`}
          onAgain={onAgain}
          onExit={onExit}
          onStickers={onStickers}
        />
      </GameFrame>
    )
  }

  return (
    <GameFrame
      title="Mana yang Beda?"
      emoji="🔍"
      onExit={onExit}
      progress={<RoundStars results={results} current={roundNo} />}
      hint={
        found !== null
          ? missed
            ? `Ketemu! Yang beda: ${round.odd.fathahLatin} 👍`
            : `⭐ Hebat! Yang beda: ${round.odd.fathahLatin}`
          : "Ada satu huruf yang berbeda. Ketuk huruf itu! 🔍"
      }
    >
      <div className={`grid gap-3 ${round.cells.length === 4 ? "grid-cols-2" : "grid-cols-3"}`}>
        {round.cells.map((l, i) => {
          const isFound = found === i
          const isWiggle = wiggle?.i === i
          return (
            <button
              key={`${roundNo}-${i}-${isWiggle ? wiggle!.n : 0}`}
              type="button"
              aria-label={`Kotak ${i + 1}`}
              onClick={() => tap(i)}
              className={`flex aspect-square items-center justify-center rounded-3xl border-4 bg-white shadow-md transition-transform ${
                isFound ? "scale-105 border-green-500 bg-green-50" : "border-gray-200 active:scale-95"
              } ${isWiggle ? "animate-wiggle" : ""} ${found !== null && !isFound ? "opacity-40" : ""}`}
            >
              {/* Semua huruf satu warna: yang dibedakan BENTUKNYA, bukan warnanya */}
              <span dir="rtl" className="font-tertiary pb-[0.3em] text-6xl leading-[1.2] text-green-800 sm:text-7xl">
                {withFathah(l)}
              </span>
            </button>
          )
        })}
      </div>
    </GameFrame>
  )
}
