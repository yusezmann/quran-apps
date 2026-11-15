"use client"

import { useEffect, useMemo, useState } from "react"
import { Volume2 } from "lucide-react"
import { withFathah, type Letter } from "@/lib/belajar/letters"
import { pickTarget, sessionStars, shuffle } from "@/lib/belajar/games"
import { speakArabicAndWait } from "@/lib/belajar/speech"
import { sfxCorrect, sfxPop } from "@/lib/belajar/sfx"
import { recordAttempt } from "@/lib/belajar/progress"
import { GameFinish, GameFrame, RoundStars } from "./GameKit"

const ROUNDS = 6
const LANES = ["2%", "26%", "50%", "74%"]

interface Round {
  target: Letter
  balloons: Array<{ letter: Letter; lane: string; duration: number; delay: number }>
}

function makeRound(pool: Letter[], fresh: Letter[], weak: Letter[], prev?: Letter): Round {
  let target = pickTarget(pool, fresh, weak)
  // Hindari soal yang sama dua kali berturut-turut
  for (let i = 0; i < 5 && prev && target.id === prev.id; i++) target = pickTarget(pool, fresh, weak)
  const others = shuffle(pool.filter((l) => l.id !== target.id)).slice(0, 3)
  const lanes = shuffle(LANES)
  return {
    target,
    balloons: shuffle([target, ...others]).map((letter, i) => {
      const duration = 9 + Math.random() * 4 // pelan: 9–13 detik dari bawah ke atas
      // Mulai di ketinggian berbeda-beda (delay negatif) agar tidak berbaris
      return { letter, lane: lanes[i], duration, delay: -((i / 4) * duration + Math.random() * 1.5) }
    }),
  }
}

type Phase = "listening" | "answer" | "feedback" | "celebrate"

/**
 * Pecah Balon Huruf: balon berisi huruf berfathah melayang pelan; aplikasi membunyikan satu huruf,
 * anak memecahkan balon yang benar. Tanpa batas waktu. Salah → balon bergoyang & menyebut bunyinya.
 */
export default function BalloonGame({
  pool,
  fresh,
  weak,
  onAgain,
  onExit,
  onStickers,
}: {
  pool: Letter[]
  fresh: Letter[]
  weak: Letter[]
  onAgain: () => void
  onExit: () => void
  onStickers: () => void
}) {
  const [roundNo, setRoundNo] = useState(0)
  const [round, setRound] = useState(() => makeRound(pool, fresh, weak))
  const [results, setResults] = useState<Array<boolean | undefined>>(() => Array(ROUNDS).fill(undefined))
  const [phase, setPhase] = useState<Phase>("listening")
  const [missed, setMissed] = useState(false)
  const [wiggle, setWiggle] = useState<{ id: string; n: number } | null>(null)
  const [popped, setPopped] = useState<string | null>(null)

  const done = roundNo >= ROUNDS
  const sound = (l: Letter) => speakArabicAndWait(withFathah(l), `${l.id}-fathah`)

  const playTarget = async () => {
    setPhase("listening")
    await sound(round.target)
    setPhase((p) => (p === "listening" ? "answer" : p))
  }

  useEffect(() => {
    if (!done) playTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  const tap = async (l: Letter) => {
    if (phase !== "answer" || popped) return
    recordAttempt(round.target.id, l.id)
    if (l.id !== round.target.id) {
      setMissed(true)
      setWiggle((w) => ({ id: l.id, n: (w?.n ?? 0) + 1 }))
      setPhase("feedback")
      await sound(l)
      await new Promise((r) => setTimeout(r, 350))
      await sound(round.target)
      setPhase("answer")
      return
    }
    sfxPop()
    setPopped(l.id)
    setPhase("celebrate")
    setResults((r) => r.map((v, i) => (i === roundNo ? !missed : v)))
    window.setTimeout(sfxCorrect, 150)
    window.setTimeout(() => {
      setPopped(null)
      setMissed(false)
      setWiggle(null)
      if (roundNo + 1 < ROUNDS) setRound(makeRound(pool, fresh, weak, round.target))
      setRoundNo((n) => n + 1)
    }, 1200)
  }

  const firstTry = results.filter((r) => r === true).length
  const stars = sessionStars(firstTry, ROUNDS)

  // Awan dekorasi (tetap di tempat)
  const clouds = useMemo(
    () => [
      { top: "8%", left: "6%", size: "text-5xl" },
      { top: "30%", left: "70%", size: "text-6xl" },
      { top: "62%", left: "15%", size: "text-4xl" },
    ],
    [],
  )

  if (done) {
    return (
      <GameFrame title="Pecah Balon" emoji="🎈" onExit={onExit}>
        <GameFinish
          stars={stars}
          summary={`Balon benar di percobaan pertama: ${firstTry} dari ${ROUNDS}`}
          onAgain={onAgain}
          onExit={onExit}
          onStickers={onStickers}
        />
      </GameFrame>
    )
  }

  return (
    <GameFrame
      title="Pecah Balon"
      emoji="🎈"
      onExit={onExit}
      progress={<RoundStars results={results} current={roundNo} />}
      hint={
        phase === "listening"
          ? "Dengarkan dulu… 👂"
          : phase === "feedback"
            ? "Itu bunyi lain. Dengarkan lagi 👂"
            : phase === "celebrate"
              ? missed
                ? "Benar! 🎈"
                : "⭐ Hebat, langsung benar!"
              : "Pecahkan balon yang bunyinya sama! 🎈"
      }
    >
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => phase === "answer" && playTarget()}
          disabled={phase !== "answer"}
          className={`inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-lg font-bold text-amber-950 shadow-md active:scale-95 ${
            phase === "listening" ? "animate-pulse" : ""
          }`}
        >
          <Volume2 className="h-6 w-6" /> {phase === "listening" ? "Dengarkan..." : "Dengar lagi"}
        </button>
      </div>

      <div
        className="relative h-[min(440px,calc(100dvh-330px))] min-h-[320px] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-300 via-sky-200 to-sky-50 shadow-inner"
        aria-label="Langit balon"
      >
        {clouds.map((c, i) => (
          <span key={i} aria-hidden="true" className={`absolute opacity-80 ${c.size}`} style={{ top: c.top, left: c.left }}>
            ☁️
          </span>
        ))}

        {round.balloons.map(({ letter, lane, duration, delay }) => {
          const isPopped = popped === letter.id
          const isWiggle = wiggle?.id === letter.id
          return (
            <div
              key={`${roundNo}-${letter.id}`}
              className="absolute w-[24%] max-w-[120px] animate-float-up"
              style={{ left: lane, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
            >
              <div className="animate-sway" style={{ animationDelay: `${delay / 3}s` }}>
                <button
                  type="button"
                  key={isWiggle ? wiggle!.n : 0}
                  aria-label={`Balon ${letter.fathahLatin}`}
                  onClick={() => tap(letter)}
                  className={`flex w-full flex-col items-center ${isPopped ? "animate-pop" : isWiggle ? "animate-wiggle" : ""} ${
                    phase === "answer" ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className="relative flex aspect-[5/6] w-full items-center justify-center rounded-[50%] shadow-lg"
                    style={{
                      background: `radial-gradient(circle at 30% 25%, #ffffffaa 0 10%, transparent 11%), ${letter.color}`,
                    }}
                  >
                    <span dir="rtl" className="font-tertiary pb-[0.3em] text-5xl leading-[1.2] text-white drop-shadow sm:text-6xl">
                      {withFathah(letter)}
                    </span>
                    {/* simpul balon */}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1.5 h-3 w-3 rotate-45"
                      style={{ background: letter.color }}
                    />
                  </span>
                  {/* tali */}
                  <span aria-hidden="true" className="h-12 w-px bg-gray-500/60" />
                </button>
              </div>
            </div>
          )
        })}

        {phase === "celebrate" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="animate-bounce-in text-7xl">{missed ? "👍" : "⭐"}</span>
          </div>
        )}
      </div>
    </GameFrame>
  )
}
