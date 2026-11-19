"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react"
import { COUNT_OBJECTS, NUMBERS, numberAudioId, type NumberItem } from "@/lib/belajar/numbers"
import { speakArabic, speakArabicAndWait, stopSpeaking } from "@/lib/belajar/speech"
import { pick, sessionStars, shuffle } from "@/lib/belajar/games"
import { sfxCorrect, sfxPop } from "@/lib/belajar/sfx"
import { GameFinish, RoundStars } from "./games/GameKit"

const STEPS = ["Kenal angka", "Hitung", "Kuis"] as const
const say = (item: NumberItem) => speakArabic(item.nameAr, numberAudioId(item.n))
const sayAndWait = (item: NumberItem) => speakArabicAndWait(item.nameAr, numberAudioId(item.n))
const byN = (n: number) => NUMBERS[n]

/** Mengenal angka Arab (٠–١٠): kenal → hitung benda → kuis. */
export default function NumbersView({ onExit, onStickers }: { onExit: () => void; onStickers: () => void }) {
  const [step, setStep] = useState(0)
  const [quizSession, setQuizSession] = useState(0)
  useEffect(() => () => void stopSpeaking(), [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <p className="text-sm font-semibold text-white">🔢 Angka Arab</p>
      </div>
      <ol className="grid grid-cols-3 gap-2" aria-label="Langkah">
        {STEPS.map((name, i) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={`w-full rounded-full px-1 py-2 text-xs font-semibold leading-tight transition-colors sm:text-sm ${
                i === step ? "bg-amber-400 text-amber-950 shadow-md ring-2 ring-white" : "bg-white text-green-800"
              }`}
            >
              {name}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && <KenalAngka />}
      {step === 1 && <Hitung />}
      {step === 2 && (
        <NumberQuiz
          key={quizSession}
          onAgain={() => setQuizSession((s) => s + 1)}
          onExit={onExit}
          onStickers={onStickers}
        />
      )}
    </div>
  )
}

function Intro({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-white/90 px-4 py-3 text-center text-base font-medium text-gray-700 shadow-sm">{children}</p>
}

/** Kartu angka besar yang berbunyi saat diketuk. */
function KenalAngka() {
  const [active, setActive] = useState<number | null>(null)
  return (
    <div className="space-y-4">
      <Intro>Ketuk angka untuk mendengar namanya 👂</Intro>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {NUMBERS.map((item) => (
          <li key={item.n}>
            <button
              type="button"
              aria-label={`Angka ${item.n}, ${item.latin}`}
              onClick={() => {
                setActive(item.n)
                say(item)
              }}
              className={`relative flex w-full flex-col items-center rounded-3xl border-4 bg-white py-3 shadow-md transition-transform active:scale-95 ${
                active === item.n ? "scale-105 border-amber-400" : "border-emerald-200"
              }`}
            >
              <span dir="rtl" className="font-tertiary pb-[0.15em] text-6xl leading-[1.2] text-emerald-700">
                {item.numeral}
              </span>
              <span className="text-lg font-bold text-gray-800">{item.n}</span>
              <span className="text-xs font-semibold text-gray-500">{item.latin}</span>
              <Volume2 className="absolute right-2 top-2 h-4 w-4 text-gray-300" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Menghitung benda satu per satu: setiap ketukan menyebut angka berikutnya dalam bahasa Arab. */
function Hitung() {
  const [target, setTarget] = useState(3)
  const [emoji, setEmoji] = useState(COUNT_OBJECTS[0])
  const [counted, setCounted] = useState<number[]>([])
  const done = counted.length === target

  const next = () => {
    let n = target
    while (n === target) n = 1 + Math.floor(Math.random() * 10)
    setTarget(n)
    setEmoji(pick(COUNT_OBJECTS))
    setCounted([])
  }

  const tap = (i: number) => {
    if (counted.includes(i) || done) return
    const now = [...counted, i]
    setCounted(now)
    sfxPop()
    say(byN(now.length))
    if (now.length === target) window.setTimeout(sfxCorrect, 600)
  }

  return (
    <div className="space-y-4">
      <Intro>Ketuk satu per satu sambil menghitung 👆</Intro>
      <div className="grid min-h-[220px] grid-cols-5 place-items-center gap-3 rounded-3xl bg-white p-4 shadow-md">
        {Array.from({ length: target }, (_, i) => {
          const order = counted.indexOf(i)
          return (
            <button
              key={`${target}-${emoji}-${i}`}
              type="button"
              aria-label={order >= 0 ? `Sudah dihitung ${order + 1}` : "Benda belum dihitung"}
              onClick={() => tap(i)}
              className={`relative flex h-16 w-16 items-center justify-center rounded-2xl text-5xl transition-transform sm:h-20 sm:w-20 sm:text-6xl ${
                order >= 0 ? "scale-90 bg-emerald-50" : "animate-bounce-in active:scale-90"
              }`}
            >
              <span aria-hidden="true">{emoji}</span>
              {order >= 0 && (
                <span className="font-tertiary absolute -right-1 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 pb-1 text-xl text-white shadow">
                  {byN(order + 1).numeral}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="flex min-h-[7rem] flex-col items-center justify-center rounded-3xl bg-white/90 p-3 text-center shadow-sm">
        {done ? (
          <>
            <span dir="rtl" className="font-tertiary animate-bounce-in pb-[0.15em] text-7xl leading-[1.2] text-emerald-700">
              {byN(target).numeral}
            </span>
            <span className="font-bold text-gray-800">
              {target} = {byN(target).latin} ⭐
            </span>
          </>
        ) : (
          <span className="text-lg font-semibold text-gray-600">
            {counted.length ? `Sudah ${counted.length}… terus!` : "Ada berapa? Ayo hitung!"}
          </span>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setCounted([])}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-gray-700 shadow"
        >
          <RotateCcw className="h-5 w-5" /> Ulangi
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow hover:bg-green-700"
        >
          Hitung lagi ➜
        </button>
      </div>
    </div>
  )
}

const QUIZ_ROUNDS = 6
type Round = { kind: "dengar" | "hitung"; answer: number; options: number[]; emoji: string }

function makeRounds(): Round[] {
  return Array.from({ length: QUIZ_ROUNDS }, (_, i) => {
    const answer = 1 + Math.floor(Math.random() * 10)
    const others = shuffle(Array.from({ length: 10 }, (_, k) => k + 1).filter((k) => k !== answer)).slice(0, 2)
    return { kind: i % 2 === 0 ? "dengar" : "hitung", answer, options: shuffle([answer, ...others]), emoji: pick(COUNT_OBJECTS) }
  })
}

/** Kuis: dengar nama angka / hitung benda → pilih angka Arab yang benar. */
function NumberQuiz({ onAgain, onExit, onStickers }: { onAgain: () => void; onExit: () => void; onStickers: () => void }) {
  const [rounds] = useState(makeRounds)
  const [i, setI] = useState(0)
  const [results, setResults] = useState<Array<boolean | undefined>>(() => Array(QUIZ_ROUNDS).fill(undefined))
  const [wrong, setWrong] = useState<number[]>([])
  const [phase, setPhase] = useState<"listening" | "answer" | "celebrate">("answer")
  const done = i >= QUIZ_ROUNDS
  const r = rounds[i]

  const play = async () => {
    if (!r || r.kind !== "dengar") return
    setPhase("listening")
    await sayAndWait(byN(r.answer))
    setPhase("answer")
  }

  useEffect(() => {
    if (r?.kind === "dengar") play()
    else setPhase("answer")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  const choose = (n: number) => {
    if (phase !== "answer") return
    if (n !== r.answer) {
      setWrong((w) => [...w, n])
      say(byN(n)) // sebut angka yang dipilih agar anak belajar dari kesalahan
      return
    }
    sfxCorrect()
    say(byN(n))
    setResults((res) => res.map((v, k) => (k === i ? wrong.length === 0 : v)))
    setPhase("celebrate")
    window.setTimeout(() => {
      setWrong([])
      setI((k) => k + 1)
    }, 1300)
  }

  if (done) {
    const firstTry = results.filter((x) => x === true).length
    return (
      <GameFinish
        stars={sessionStars(firstTry, QUIZ_ROUNDS)}
        summary={`Benar di percobaan pertama: ${firstTry} dari ${QUIZ_ROUNDS}`}
        onAgain={onAgain}
        onExit={onExit}
        onStickers={onStickers}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
        <RoundStars results={results} current={i} />
        <p className="flex min-h-[3.25rem] items-center justify-center text-base font-medium text-gray-700">
          {phase === "celebrate"
            ? wrong.length
              ? "Benar! 👍"
              : "⭐ Hebat!"
            : r.kind === "dengar"
              ? "Dengarkan, lalu pilih angkanya 🎧"
              : "Ada berapa? Pilih angkanya 🔢"}
        </p>
      </div>

      {r.kind === "dengar" ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => phase === "answer" && play()}
            disabled={phase !== "answer"}
            className={`inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-lg font-bold text-amber-950 shadow-md active:scale-95 ${
              phase === "listening" ? "animate-pulse" : ""
            }`}
          >
            <Volume2 className="h-6 w-6" /> {phase === "listening" ? "Dengarkan..." : "Dengar lagi"}
          </button>
        </div>
      ) : (
        <div className="flex min-h-[120px] flex-wrap items-center justify-center gap-2 rounded-3xl bg-white p-4 text-5xl shadow-md" aria-label="Benda yang dihitung">
          {Array.from({ length: r.answer }, (_, k) => (
            <span key={k} aria-hidden="true">
              {r.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {r.options.map((n) => {
          const isWrong = wrong.includes(n)
          const right = phase === "celebrate" && n === r.answer
          return (
            <button
              key={n}
              type="button"
              aria-label={`Pilih angka ${byN(n).latin}`}
              onClick={() => choose(n)}
              disabled={phase !== "answer" || isWrong}
              className={`flex min-h-[7rem] flex-col items-center justify-center rounded-3xl border-4 bg-white shadow-md transition-all ${
                right
                  ? "scale-110 border-green-500 bg-green-50"
                  : isWrong
                    ? "border-gray-200 opacity-40"
                    : phase !== "answer"
                      ? "border-gray-200 opacity-60"
                      : "border-gray-200 active:scale-95"
              }`}
            >
              <span dir="rtl" className="font-tertiary pb-[0.15em] text-6xl leading-[1.2] text-emerald-700">
                {byN(n).numeral}
              </span>
              {isWrong && <span className="text-sm font-semibold text-gray-500">{n}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
