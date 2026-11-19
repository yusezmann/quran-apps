"use client"

import { useEffect, useMemo, useState } from "react"
import { Volume2 } from "lucide-react"
import { withFathah, type Letter } from "@/lib/belajar/letters"
import { NUMBERS, numberAudioId } from "@/lib/belajar/numbers"
import { pick, pickTarget, sessionStars, shuffle } from "@/lib/belajar/games"
import { speakArabicAndWait } from "@/lib/belajar/speech"
import { sfxCorrect, sfxPop } from "@/lib/belajar/sfx"
import { recordAttempt } from "@/lib/belajar/progress"
import { GameFinish, GameFrame, RoundStars } from "./GameKit"

const ROUNDS = 6
const LANES = ["2%", "26%", "50%", "74%"]
const NUMBER_COLORS = ["#0ea5e9", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#14b8a6", "#16a34a"]

type Mode = "huruf" | "angka"
/** Diingat selama aplikasi terbuka: "Main lagi" langsung memakai mode yang sama */
let lastMode: Mode | null = null

/** Isi satu balon: huruf berfathah atau angka Arab */
interface Item {
  id: string
  label: string
  color: string
  aria: string
  speak: () => Promise<unknown>
  /** id huruf (untuk catatan laporan orang tua); kosong untuk angka */
  letterId?: string
}

const letterItem = (l: Letter): Item => ({
  id: l.id,
  label: withFathah(l),
  color: l.color,
  aria: `Balon ${l.fathahLatin}`,
  speak: () => speakArabicAndWait(withFathah(l), `${l.id}-fathah`),
  letterId: l.id,
})

const numberItem = (n: number): Item => {
  const item = NUMBERS[n]
  return {
    id: `angka-${n}`,
    label: item.numeral,
    color: NUMBER_COLORS[n % NUMBER_COLORS.length],
    aria: `Balon angka ${item.latin}`,
    speak: () => speakArabicAndWait(item.nameAr, numberAudioId(n)),
  }
}

interface Round {
  target: Item
  balloons: Array<{ item: Item; lane: string; duration: number; delay: number }>
}

function makeRound(mode: Mode, pool: Letter[], fresh: Letter[], weak: Letter[], prev?: Item): Round {
  let target: Item
  let others: Item[]
  if (mode === "angka") {
    const all = Array.from({ length: 10 }, (_, k) => k + 1) // 1–10
    let t = pick(all)
    for (let i = 0; i < 5 && prev && `angka-${t}` === prev.id; i++) t = pick(all)
    target = numberItem(t)
    others = shuffle(all.filter((k) => k !== t)).slice(0, 3).map(numberItem)
  } else {
    let l = pickTarget(pool, fresh, weak)
    // Hindari soal yang sama dua kali berturut-turut
    for (let i = 0; i < 5 && prev && l.id === prev.id; i++) l = pickTarget(pool, fresh, weak)
    target = letterItem(l)
    others = shuffle(pool.filter((p) => p.id !== l.id)).slice(0, 3).map(letterItem)
  }
  const lanes = shuffle(LANES)
  return {
    target,
    balloons: shuffle([target, ...others]).map((item, i) => {
      const duration = 9 + Math.random() * 4 // pelan: 9–13 detik dari bawah ke atas
      // Mulai di ketinggian berbeda-beda (delay negatif) agar tidak berbaris
      return { item, lane: lanes[i], duration, delay: -((i / 4) * duration + Math.random() * 1.5) }
    }),
  }
}

type Phase = "listening" | "answer" | "feedback" | "celebrate"

type Props = {
  pool: Letter[]
  fresh: Letter[]
  weak: Letter[]
  onAgain: () => void
  onExit: () => void
  onStickers: () => void
}

/**
 * Pecah Balon: balon berisi huruf berfathah ATAU angka Arab melayang pelan; aplikasi membunyikan satu,
 * anak memecahkan balon yang benar. Tanpa batas waktu. Salah → balon bergoyang & menyebut bunyinya.
 */
export default function BalloonGame(props: Props) {
  const [mode, setMode] = useState<Mode | null>(lastMode)
  const [session, setSession] = useState(0)

  if (!mode) {
    return (
      <GameFrame title="Pecah Balon" emoji="🎈" onExit={props.onExit} hint="Mau pecah balon apa? 🎈">
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ["huruf", "بَ", "Huruf", "from-emerald-400 to-green-600"],
              ["angka", "١٢٣", "Angka", "from-rose-400 to-pink-600"],
            ] as const
          ).map(([value, sample, label, bg]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                lastMode = value
                setMode(value)
              }}
              className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-[2rem] bg-gradient-to-br ${bg} text-white shadow-xl ring-4 ring-white/40 active:scale-95`}
            >
              <span dir="rtl" className="font-tertiary pb-[0.2em] text-7xl leading-[1.2] drop-shadow">
                {sample}
              </span>
              <span className="text-2xl font-bold">{label}</span>
            </button>
          ))}
        </div>
      </GameFrame>
    )
  }

  return (
    <BalloonPlay
      key={`${mode}-${session}`}
      {...props}
      mode={mode}
      onSwitchMode={() => {
        const next = mode === "huruf" ? "angka" : "huruf"
        lastMode = next
        setMode(next)
        setSession((s) => s + 1)
      }}
    />
  )
}

function BalloonPlay({
  pool,
  fresh,
  weak,
  mode,
  onAgain,
  onExit,
  onStickers,
  onSwitchMode,
}: Props & { mode: Mode; onSwitchMode: () => void }) {
  const [roundNo, setRoundNo] = useState(0)
  const [round, setRound] = useState(() => makeRound(mode, pool, fresh, weak))
  const [results, setResults] = useState<Array<boolean | undefined>>(() => Array(ROUNDS).fill(undefined))
  const [phase, setPhase] = useState<Phase>("listening")
  const [missed, setMissed] = useState(false)
  const [wiggle, setWiggle] = useState<{ id: string; n: number } | null>(null)
  const [popped, setPopped] = useState<string | null>(null)

  const done = roundNo >= ROUNDS

  const playTarget = async () => {
    setPhase("listening")
    await round.target.speak()
    setPhase((p) => (p === "listening" ? "answer" : p))
  }

  useEffect(() => {
    if (!done) playTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  const tap = async (item: Item) => {
    if (phase !== "answer" || popped) return
    if (item.letterId && round.target.letterId) recordAttempt(round.target.letterId, item.letterId)
    if (item.id !== round.target.id) {
      setMissed(true)
      setWiggle((w) => ({ id: item.id, n: (w?.n ?? 0) + 1 }))
      setPhase("feedback")
      await item.speak()
      await new Promise((r) => setTimeout(r, 350))
      await round.target.speak()
      setPhase("answer")
      return
    }
    sfxPop()
    setPopped(item.id)
    setPhase("celebrate")
    setResults((r) => r.map((v, i) => (i === roundNo ? !missed : v)))
    window.setTimeout(sfxCorrect, 150)
    window.setTimeout(() => {
      setPopped(null)
      setMissed(false)
      setWiggle(null)
      if (roundNo + 1 < ROUNDS) setRound(makeRound(mode, pool, fresh, weak, round.target))
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

  const title = mode === "angka" ? "Pecah Balon Angka" : "Pecah Balon"

  if (done) {
    return (
      <GameFrame title={title} emoji="🎈" onExit={onExit}>
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
      title={title}
      emoji="🎈"
      onExit={onExit}
      progress={<RoundStars results={results} current={roundNo} />}
      hint={
        phase === "listening"
          ? "Dengarkan dulu… 👂"
          : phase === "feedback"
            ? mode === "angka"
              ? "Itu angka lain. Dengarkan lagi 👂"
              : "Itu bunyi lain. Dengarkan lagi 👂"
            : phase === "celebrate"
              ? missed
                ? "Benar! 🎈"
                : "⭐ Hebat, langsung benar!"
              : mode === "angka"
                ? "Pecahkan balon angka yang disebut! 🎈"
                : "Pecahkan balon yang bunyinya sama! 🎈"
      }
    >
      <div className="flex items-center justify-center gap-3">
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
        <button
          type="button"
          onClick={onSwitchMode}
          className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow"
          aria-label={mode === "angka" ? "Ganti ke balon huruf" : "Ganti ke balon angka"}
        >
          Ganti ke {mode === "angka" ? "huruf بَ" : "angka ١٢٣"}
        </button>
      </div>

      <div
        className="relative h-[min(640px,calc(100dvh-330px))] min-h-[320px] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-300 via-sky-200 to-sky-50 shadow-inner"
        aria-label="Langit balon"
      >
        {clouds.map((c, i) => (
          <span key={i} aria-hidden="true" className={`absolute opacity-80 ${c.size}`} style={{ top: c.top, left: c.left }}>
            ☁️
          </span>
        ))}

        {round.balloons.map(({ item, lane, duration, delay }) => {
          const isPopped = popped === item.id
          const isWiggle = wiggle?.id === item.id
          return (
            <div
              key={`${roundNo}-${item.id}`}
              className="absolute w-[24%] max-w-[120px] animate-float-up"
              style={{ left: lane, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
            >
              <div className="animate-sway" style={{ animationDelay: `${delay / 3}s` }}>
                <button
                  type="button"
                  key={isWiggle ? wiggle!.n : 0}
                  aria-label={item.aria}
                  onClick={() => tap(item)}
                  className={`flex w-full flex-col items-center ${isPopped ? "animate-pop" : isWiggle ? "animate-wiggle" : ""} ${
                    phase === "answer" ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className="relative flex aspect-[5/6] w-full items-center justify-center rounded-[50%] shadow-lg"
                    style={{
                      background: `radial-gradient(circle at 30% 25%, #ffffffaa 0 10%, transparent 11%), ${item.color}`,
                    }}
                  >
                    <span dir="rtl" className="font-tertiary pb-[0.3em] text-5xl leading-[1.2] text-white drop-shadow sm:text-6xl">
                      {item.label}
                    </span>
                    {/* simpul balon */}
                    <span aria-hidden="true" className="absolute -bottom-1.5 h-3 w-3 rotate-45" style={{ background: item.color }} />
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
