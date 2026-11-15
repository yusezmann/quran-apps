"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, RotateCcw, Star, Volume2 } from "lucide-react"
import { LESSONS, joinSyllables, lettersUpTo, pairAudioId, syllablePairs, withFathah, type Letter } from "@/lib/belajar/letters"
import { speakArabic, speakArabicAndWait, stopSpeaking } from "@/lib/belajar/speech"
import { recordAttempt, useBelajarProgress } from "@/lib/belajar/progress"
import { mostConfusedWith } from "@/lib/belajar/stats"

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
      } ${big ? "aspect-square" : "min-h-[110px] px-4 py-3"}`}
      style={{ borderColor: color }}
    >
      {/* Tinggi baris longgar: huruf seperti ج ح خ punya ekor di bawah garis yang bisa menimpa teks latin */}
      <span
        dir="rtl"
        className={`font-tertiary pt-[0.3em] leading-[1.2] ${caption ? "pb-[0.45em]" : ""} ${big ? "text-6xl md:text-7xl" : "text-5xl md:text-6xl"}`}
        style={{ color }}
      >
        {text}
      </span>
      {caption && <span className="text-base font-semibold leading-tight text-gray-600">{caption}</span>}
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
    // Latihan yang menyesuaikan: bila huruf ini pernah tertukar, jadikan pasangannya salah satu pilihan
    const confused = mostConfusedWith(answer.id, useBelajarProgress.getState().confusions, pool)
    const rest = shuffle(pool.filter((l) => l.id !== answer.id && l.id !== confused?.id))
    const others = (confused ? [confused, ...rest] : rest).slice(0, 2)
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
        <p className="text-sm font-semibold text-white">Pelajaran {lessonIndex + 1}</p>
      </div>
      <ol className="grid grid-cols-4 gap-2" aria-label="Langkah pelajaran">
        {STEPS.map((name, i) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={`w-full rounded-full px-1 py-2 text-xs font-semibold leading-tight transition-colors ${
                // Langkah ini berada di atas latar hijau: aktif = kuning menyolok, selesai = putih hijau, berikutnya = putih pudar
                i === step
                  ? "bg-amber-400 text-amber-950 shadow-md ring-2 ring-white"
                  : i < step
                    ? "bg-white text-green-800"
                    : "bg-white/70 text-gray-600"
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
              onTap={() => speakArabic(text, pairAudioId(pair))}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Kuis "dengar & pilih" yang mendorong anak MENDENGAR, bukan menebak:
 * - kartu terkunci sampai bunyi soal selesai diputar
 * - salah pilih → kartu itu menyebut bunyinya sendiri, lalu soal diputar ulang (kartu terkunci)
 * - deretan 6 bintang di atas hanya terisi bila benar pada percobaan PERTAMA
 * - soal yang salah diulang sekali di akhir (tanpa bintang tambahan)
 */
type Phase = "listening" | "answer" | "feedback" | "celebrate"

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
  // Antrian soal (indeks ke `quiz`); soal yang salah ditambahkan sekali lagi di akhir
  const [queue, setQueue] = useState<number[]>(() => quiz.map((_, i) => i))
  const [pos, setPos] = useState(0)
  /** per soal asli: true = benar percobaan pertama, false = sempat salah, undefined = belum */
  const [results, setResults] = useState<Array<boolean | undefined>>(() => quiz.map(() => undefined))
  const [wrongThisQuestion, setWrongThisQuestion] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>("listening")

  const done = pos >= queue.length
  const qIndex = queue[pos]
  const q = quiz[qIndex]
  const isRepeat = pos >= quiz.length
  const firstTryCorrect = results.filter((r) => r === true).length
  const stars = firstTryCorrect >= QUIZ_LENGTH ? 3 : firstTryCorrect >= QUIZ_LENGTH - 2 ? 2 : 1

  const playQuestion = async () => {
    if (!q) return
    setPhase("listening")
    await speakArabicAndWait(withFathah(q.answer), `${q.answer.id}-fathah`)
    setPhase((p) => (p === "listening" ? "answer" : p))
  }

  // Soal baru: putar bunyinya; kartu baru bisa dipilih setelah bunyi selesai
  useEffect(() => {
    playQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, quiz])

  useEffect(() => {
    if (done) onFinish(stars)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const choose = async (l: Letter) => {
    if (phase !== "answer") return
    recordAttempt(q.answer.id, l.id)
    if (l.id !== q.answer.id) {
      // Bukan hukuman: kartu yang dipilih menyebut bunyinya, lalu soal diulang
      setWrongThisQuestion((w) => [...w, l.id])
      if (!isRepeat) setResults((r) => r.map((v, i) => (i === qIndex && v === undefined ? false : v)))
      setPhase("feedback")
      await speakArabicAndWait(withFathah(l), `${l.id}-fathah`)
      await new Promise((r) => setTimeout(r, 400))
      await speakArabicAndWait(withFathah(q.answer), `${q.answer.id}-fathah`)
      setPhase("answer")
      return
    }
    const firstTry = wrongThisQuestion.length === 0
    if (!isRepeat && firstTry) setResults((r) => r.map((v, i) => (i === qIndex ? true : v)))
    // Sempat salah di soal asli → ulangi sekali di akhir
    if (!isRepeat && !firstTry) setQueue((qq) => [...qq, qIndex])
    setPhase("celebrate")
    window.setTimeout(() => {
      setWrongThisQuestion([])
      setPos((i) => i + 1)
    }, 900)
  }

  const restart = () => {
    const fresh = buildQuiz(lessonIndex)
    setQuiz(fresh)
    setQueue(fresh.map((_, i) => i))
    setResults(fresh.map(() => undefined))
    setWrongThisQuestion([])
    setPos(0)
  }

  /** Deretan bintang per soal: kuning = benar pertama kali, abu = sempat menebak */
  const starRow = (
    <div className="flex justify-center gap-1.5" aria-label={`${firstTryCorrect} bintang dari ${QUIZ_LENGTH}`}>
      {results.map((r, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-8 w-8 transition-all duration-300 ${
            r === true
              ? "scale-110 fill-amber-400 text-amber-400"
              : r === false
                ? "fill-gray-300 text-gray-300"
                : "text-gray-300"
          } ${i === qIndex && !done && !isRepeat ? "animate-pulse" : ""}`}
        />
      ))}
    </div>
  )

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
        {starRow}
        <p className="text-gray-600">
          Benar di percobaan pertama: {firstTryCorrect} dari {QUIZ_LENGTH}
        </p>
        {firstTryCorrect < QUIZ_LENGTH && (
          <p className="text-sm text-gray-500">Dengarkan baik-baik dulu sebelum memilih, supaya semua bintangnya kuning ⭐</p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={restart}
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

  const locked = phase !== "answer"

  return (
    <div className="space-y-4">
      {/* Bintang & petunjuk dalam satu kartu putih: selalu terbaca, tidak bergantung warna latar */}
      <div className="space-y-2 rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
        {starRow}
        <p className="text-base font-medium text-gray-700">
          {isRepeat
            ? "Ayo coba lagi soal yang tadi 💪"
            : `Soal ${pos + 1} dari ${quiz.length}: dengarkan, lalu pilih hurufnya 🎧`}
        </p>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => !locked && playQuestion()}
          disabled={locked}
          className={`inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-lg font-bold text-amber-950 shadow-md active:scale-95 ${
            phase === "listening" ? "animate-pulse" : ""
          }`}
        >
          <Volume2 className="h-6 w-6" /> {phase === "listening" ? "Dengarkan..." : "Dengar lagi"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {q.options.map((l) => {
          const wrong = wrongThisQuestion.includes(l.id)
          const right = phase === "celebrate" && l.id === q.answer.id
          return (
            <button
              key={l.id}
              type="button"
              aria-label={`Pilih ${l.fathahLatin}`}
              onClick={() => choose(l)}
              disabled={locked || wrong}
              className={`flex min-h-[7.5rem] flex-col items-center justify-center rounded-3xl border-4 bg-white py-2 shadow-md transition-all ${
                right
                  ? "scale-110 border-green-500 bg-green-50"
                  : wrong
                    ? "border-gray-200 opacity-40"
                    : locked
                      ? "border-gray-200 opacity-50"
                      : "border-gray-200 active:scale-95"
              }`}
            >
              <span dir="rtl" className={`font-tertiary pt-[0.3em] text-5xl leading-[1.2] sm:text-6xl ${wrong ? "pb-[0.45em]" : "pb-[0.2em]"}`} style={{ color: l.color }}>
                {withFathah(l)}
              </span>
              {wrong && <span className="text-sm font-semibold leading-tight text-gray-600">{l.fathahLatin}</span>}
            </button>
          )
        })}
      </div>
      <p className="min-h-[2rem] text-center font-bold" role="status">
        {phase === "celebrate" &&
          (wrongThisQuestion.length === 0 ? (
            <span className="text-2xl text-green-600">⭐ Benar!</span>
          ) : (
            <span className="text-xl text-green-600">Benar! Lain kali dengarkan dulu ya 😊</span>
          ))}
        {phase === "feedback" && <span className="text-lg text-gray-600">Itu bunyi lain. Dengarkan lagi soalnya 👂</span>}
        {phase === "listening" && <span className="text-base font-medium text-gray-500">Dengarkan dulu sampai selesai…</span>}
      </p>
    </div>
  )
}
