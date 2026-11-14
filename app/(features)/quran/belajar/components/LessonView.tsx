"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, RotateCcw, Star, Volume2 } from "lucide-react"
import { LESSONS, joinSyllables, lettersUpTo, syllablePairs, withFathah, type Letter } from "@/lib/belajar/letters"
import { speakArabic, stopSpeaking } from "@/lib/belajar/speech"
import { useBelajarProgress } from "@/lib/belajar/progress"

const STEPS = ["Kenal huruf", "Fathah", "Sambung", "Kuis"] as const
const QUIZ_LENGTH = 6

/** Kartu besar yang berbunyi saat diketuk. */
function SoundCard({
  text,
  caption,
  color,
  onTap,
  big = true,
  label,
}: {
  text: string
  caption?: string
  color: string
  onTap: () => void
  big?: boolean
  label: string
}) {
  const [pulse, setPulse] = useState(false)
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        setPulse(true)
        window.setTimeout(() => setPulse(false), 400)
        onTap()
      }}
      className={`relative flex flex-col items-center justify-center rounded-3xl border-4 bg-white shadow-md transition-transform active:scale-95 ${
        pulse ? "scale-105" : ""
      } ${big ? "aspect-square" : "min-h-[110px] px-4"}`}
      style={{ borderColor: color }}
    >
      <span
        dir="rtl"
        className={`font-tertiary leading-none ${big ? "text-7xl md:text-8xl" : "text-5xl md:text-6xl"}`}
        style={{ color }}
      >
        {text}
      </span>
      {caption && <span className="mt-2 text-base font-semibold text-gray-600">{caption}</span>}
      <Volume2 className="absolute right-3 top-3 h-5 w-5 text-gray-300" aria-hidden="true" />
    </button>
  )
}

/** Satu soal kuis: dengarkan bunyi, pilih huruf yang benar. */
interface Question {
  answer: Letter
  options: Letter[]
}

function buildQuiz(lessonIndex: number): Question[] {
  const current = LESSONS[lessonIndex].letters
  const pool = lettersUpTo(lessonIndex)
  // Urutan acak sederhana tapi stabil per sesi
  const shuffle = <T,>(arr: T[]) => arr.map((v) => [Math.random(), v] as const).sort((a, b) => a[0] - b[0]).map(([, v]) => v)
  return Array.from({ length: QUIZ_LENGTH }, (_, i) => {
    const answer = current[i % current.length]
    const others = shuffle(pool.filter((l) => l.id !== answer.id)).slice(0, 2)
    return { answer, options: shuffle([answer, ...others]) }
  })
}

export default function LessonView({ lessonIndex, onExit }: { lessonIndex: number; onExit: () => void }) {
  const lesson = LESSONS[lessonIndex]
  const [step, setStep] = useState(0)
  const setStars = useBelajarProgress((s) => s.setStars)

  useEffect(() => () => void stopSpeaking(), [])

  return (
    <div className="space-y-5">
      {/* Kepala pelajaran + langkah */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Peta belajar
        </button>
        <p className="text-sm font-semibold text-gray-600">Pelajaran {lessonIndex + 1}</p>
      </div>
      <ol className="grid grid-cols-4 gap-2" aria-label="Langkah pelajaran">
        {STEPS.map((name, i) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={`w-full rounded-full px-1 py-2 text-xs font-semibold leading-tight transition-colors ${
                i === step ? "bg-green-600 text-white" : i < step ? "bg-green-100 text-green-800" : "bg-white text-gray-500"
              }`}
            >
              {name}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && <LettersStep letters={lesson.letters} />}
      {step === 1 && <FathahStep letters={lesson.letters} />}
      {step === 2 && <JoinStep lessonIndex={lessonIndex} />}
      {step === 3 && (
        <QuizStep
          lessonIndex={lessonIndex}
          onFinish={(stars) => setStars(lessonIndex, stars)}
          onExit={onExit}
        />
      )}

      {step < 3 && (
        <div className="flex justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-gray-700 shadow disabled:opacity-40"
          >
            <ArrowLeft className="h-5 w-5" /> Kembali
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow hover:bg-green-700"
          >
            Lanjut <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function StepIntro({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-white/90 px-4 py-3 text-center text-base font-medium text-gray-700 shadow-sm">{children}</p>
}

function LettersStep({ letters }: { letters: Letter[] }) {
  return (
    <div className="space-y-4">
      <StepIntro>Ketuk huruf untuk mendengar namanya 👂</StepIntro>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {letters.map((l) => (
          <SoundCard
            key={l.id}
            label={`Huruf ${l.latin}`}
            text={l.char}
            caption={l.latin}
            color={l.color}
            onTap={() => speakArabic(l.nameAr, l.id)}
          />
        ))}
      </div>
    </div>
  )
}

function FathahStep({ letters }: { letters: Letter[] }) {
  return (
    <div className="space-y-4">
      <StepIntro>Garis kecil di atas huruf dibaca &quot;a&quot;. Ketuk & tirukan! 🗣️</StepIntro>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {letters.map((l) => (
          <SoundCard
            key={l.id}
            label={`Bacaan ${l.fathahLatin}`}
            text={withFathah(l)}
            caption={l.fathahLatin}
            color={l.color}
            onTap={() => speakArabic(withFathah(l), `${l.id}-fathah`)}
          />
        ))}
      </div>
    </div>
  )
}

function JoinStep({ lessonIndex }: { lessonIndex: number }) {
  const pairs = useMemo(() => syllablePairs(lessonIndex), [lessonIndex])
  return (
    <div className="space-y-4">
      <StepIntro>Huruf bisa disambung. Ketuk lalu baca bersama 📖</StepIntro>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {pairs.map((pair) => {
          const text = joinSyllables(pair)
          return (
            <SoundCard
              key={text}
              big={false}
              label={`Bacaan ${pair.map((l) => l.fathahLatin).join("-")}`}
              text={text}
              caption={pair.map((l) => l.fathahLatin).join(" - ")}
              color={pair[0].color}
              onTap={() => speakArabic(text)}
            />
          )
        })}
      </div>
    </div>
  )
}

function QuizStep({
  lessonIndex,
  onFinish,
  onExit,
}: {
  lessonIndex: number
  onFinish: (stars: number) => void
  onExit: () => void
}) {
  const [quiz, setQuiz] = useState(() => buildQuiz(lessonIndex))
  const [index, setIndex] = useState(0)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [wrongThisQuestion, setWrongThisQuestion] = useState<string[]>([])
  const [celebrate, setCelebrate] = useState(false)
  const done = index >= quiz.length
  const q = quiz[index]

  // Putar bunyi soal otomatis
  useEffect(() => {
    if (q) speakArabic(withFathah(q.answer), `${q.answer.id}-fathah`)
  }, [q])

  const stars = firstTryCorrect >= QUIZ_LENGTH ? 3 : firstTryCorrect >= QUIZ_LENGTH - 2 ? 2 : 1

  useEffect(() => {
    if (done) onFinish(stars)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const choose = (l: Letter) => {
    if (celebrate) return
    if (l.id !== q.answer.id) {
      // Tidak ada bunyi "salah" yang menakutkan: cukup tandai & coba lagi
      setWrongThisQuestion((w) => [...w, l.id])
      return
    }
    if (wrongThisQuestion.length === 0) setFirstTryCorrect((n) => n + 1)
    setCelebrate(true)
    window.setTimeout(() => {
      setCelebrate(false)
      setWrongThisQuestion([])
      setIndex((i) => i + 1)
    }, 900)
  }

  if (done) {
    return (
      <div className="space-y-5 rounded-3xl bg-white p-6 text-center shadow-lg" role="status">
        <p className="text-2xl font-bold text-gray-900">MasyaAllah, hebat! 🎉</p>
        <div className="flex justify-center gap-2" aria-label={`${stars} bintang`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`h-14 w-14 ${n <= stars ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
            />
          ))}
        </div>
        <p className="text-gray-600">
          Benar di percobaan pertama: {firstTryCorrect} dari {QUIZ_LENGTH}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setQuiz(buildQuiz(lessonIndex))
              setIndex(0)
              setFirstTryCorrect(0)
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-gray-700 ring-1 ring-gray-200"
          >
            <RotateCcw className="h-5 w-5" /> Ulangi kuis
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Ke peta belajar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <StepIntro>
        Soal {index + 1} dari {quiz.length}: dengarkan, lalu pilih hurufnya 🎧
      </StepIntro>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => speakArabic(withFathah(q.answer), `${q.answer.id}-fathah`)}
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-lg font-bold text-amber-950 shadow-md active:scale-95"
        >
          <Volume2 className="h-6 w-6" /> Dengar lagi
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {q.options.map((l) => {
          const wrong = wrongThisQuestion.includes(l.id)
          const right = celebrate && l.id === q.answer.id
          return (
            <button
              key={l.id}
              type="button"
              aria-label={`Pilih ${l.fathahLatin}`}
              onClick={() => choose(l)}
              disabled={wrong}
              className={`flex aspect-square items-center justify-center rounded-3xl border-4 bg-white shadow-md transition-all ${
                right ? "scale-110 border-green-500 bg-green-50" : wrong ? "border-gray-200 opacity-40" : "border-gray-200 active:scale-95"
              }`}
            >
              <span dir="rtl" className="font-tertiary text-6xl leading-none" style={{ color: l.color }}>
                {withFathah(l)}
              </span>
            </button>
          )
        })}
      </div>
      {celebrate && (
        <p className="text-center text-2xl font-bold text-green-600" role="status">
          ⭐ Benar!
        </p>
      )}
    </div>
  )
}
