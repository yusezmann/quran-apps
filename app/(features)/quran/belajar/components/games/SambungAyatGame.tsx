"use client"

import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Check, Volume2 } from "lucide-react"
import { useBelajarProgress } from "@/lib/belajar/progress"
import { SHORT_SURAHS, surahName } from "@/lib/belajar/surahs"
import { fetchChapterAudio, fetchChapterWords, type ChapterAudio, type VerseWords } from "@/lib/belajar/recitation"
import { VersePlayer } from "@/lib/belajar/versePlayer"
import { pick, sessionStars, shuffle } from "@/lib/belajar/games"
import { sfxCorrect } from "@/lib/belajar/sfx"
import { stopSpeaking } from "@/lib/belajar/speech"
import { GameFinish, GameFrame, RoundStars } from "./GameKit"

const ROUNDS = 5
const DAY = 24 * 60 * 60 * 1000
/** Surat untuk pemula bila belum ada yang ditandai hafal */
const STARTER = [1, 114, 112, 108, 103]

interface Round {
  surah: number
  /** nomor ayat soal; jawabannya ayat berikutnya */
  ayah: number
  options: number[]
}

/**
 * Sambung Ayat: dengar satu ayat, lalu pilih ayat berikutnya (bisa didengar dulu satu per satu).
 * Memakai surat yang sudah ditandai hafal; mengulang hafalan dengan cara bermain.
 */
export default function SambungAyatGame({
  onAgain,
  onExit,
  onStickers,
}: {
  onAgain: () => void
  onExit: () => void
  onStickers: () => void
}) {
  const qariId = useBelajarProgress((s) => s.hafalanQari)
  const memorized = useBelajarProgress((s) => s.memorized)
  const queryClient = useQueryClient()

  const [rounds] = useState<Round[]>(() => {
    const own = SHORT_SURAHS.map(([n]) => n).filter((n) => memorized.includes(n))
    const pool = own.length ? own : STARTER
    return Array.from({ length: ROUNDS }, () => {
      const surah = pick(pool)
      const count = SHORT_SURAHS.find(([n]) => n === surah)![2]
      const ayah = 1 + Math.floor(Math.random() * (count - 1)) // bukan ayat terakhir
      const others = shuffle(
        Array.from({ length: count }, (_, i) => i + 1).filter((a) => a !== ayah && a !== ayah + 1),
      ).slice(0, 2)
      return { surah, ayah, options: shuffle([ayah + 1, ...others]) }
    })
  })
  const usingStarter = !SHORT_SURAHS.some(([n]) => memorized.includes(n))

  const [i, setI] = useState(0)
  const [results, setResults] = useState<Array<boolean | undefined>>(() => Array(ROUNDS).fill(undefined))
  const [data, setData] = useState<{ words: Record<number, VerseWords>; audio: ChapterAudio } | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [phase, setPhase] = useState<"loading" | "listen" | "choose" | "correct">("loading")
  const [lit, setLit] = useState<{ ayah: number; word: number } | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const [shake, setShake] = useState<{ ayah: number; n: number } | null>(null)
  const playerRef = useRef<{ url: string; player: VersePlayer } | null>(null)

  const done = i >= ROUNDS
  const r = rounds[i]

  useEffect(() => {
    stopSpeaking()
    return () => playerRef.current?.player.destroy()
  }, [])

  /** Putar satu ayat dari surat ronde ini (kata yang dibaca menyala). */
  const playAyah = async (ayah: number, d = data) => {
    if (!d) return
    const verse = d.audio.verses[ayah]
    if (!verse) return
    if (!playerRef.current || playerRef.current.url !== d.audio.url) {
      playerRef.current?.player.destroy()
      playerRef.current = { url: d.audio.url, player: new VersePlayer(d.audio.url) }
    }
    await playerRef.current.player.play(verse, (w) => setLit(w >= 0 ? { ayah, word: w } : null))
  }

  // Muat data surat ronde ini, lalu putar ayat soal
  useEffect(() => {
    if (done) return
    let cancelled = false
    setPhase("loading")
    setWrong([])
    setLit(null)
    ;(async () => {
      try {
        const [words, audio] = await Promise.all([
          queryClient.fetchQuery({ queryKey: ["hafalan-words", r.surah], queryFn: () => fetchChapterWords(r.surah), staleTime: 30 * DAY }),
          queryClient.fetchQuery({
            queryKey: ["hafalan-audio", qariId, r.surah],
            queryFn: () => fetchChapterAudio(qariId, r.surah),
            staleTime: 30 * DAY,
          }),
        ])
        if (cancelled) return
        const d = { words, audio }
        setData(d)
        setPhase("listen")
        await playAyah(r.ayah, d)
        if (!cancelled) setPhase((p) => (p === "listen" ? "choose" : p))
      } catch {
        if (!cancelled) setLoadError(true)
      }
    })()
    return () => {
      cancelled = true
      playerRef.current?.player.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, done])

  const choose = async (ayah: number) => {
    if (phase !== "choose") return
    playerRef.current?.player.stop()
    if (ayah !== r.ayah + 1) {
      setWrong((w) => [...w, ayah])
      setShake((s) => ({ ayah, n: (s?.n ?? 0) + 1 }))
      return
    }
    sfxCorrect()
    setPhase("correct")
    setResults((res) => res.map((v, k) => (k === i ? wrong.length === 0 : v)))
    // Penguatan: putar ayat jawaban dengan kata menyala, lalu ronde berikutnya
    await Promise.all([playAyah(ayah), new Promise((res) => setTimeout(res, 1500))])
    setI((k) => k + 1)
  }

  const listen = (ayah: number) => {
    if (phase !== "choose") return
    playAyah(ayah)
  }

  if (loadError) {
    return (
      <GameFrame title="Sambung Ayat" emoji="🧩" onExit={onExit}>
        <p className="rounded-2xl bg-white p-6 text-center text-red-600">Gagal memuat ayat. Game ini butuh internet.</p>
      </GameFrame>
    )
  }

  if (done) {
    const firstTry = results.filter((x) => x === true).length
    return (
      <GameFrame title="Sambung Ayat" emoji="🧩" onExit={onExit}>
        <GameFinish
          stars={sessionStars(firstTry, ROUNDS)}
          summary={`Langsung benar: ${firstTry} dari ${ROUNDS}`}
          onAgain={onAgain}
          onExit={onExit}
          onStickers={onStickers}
        />
      </GameFrame>
    )
  }

  const words = (ayah: number) => data?.words[ayah]?.words ?? []

  /** Teks ayat per kata, kata yang sedang dibaca menyala */
  const AyahText = ({ ayah, size }: { ayah: number; size: string }) => (
    <p dir="rtl" className={`font-tertiary leading-[2.1] text-gray-900 ${size}`}>
      {words(ayah).map((w, k) => (
        <span key={k}>
          <span
            className={`rounded-lg px-0.5 transition-colors ${lit?.ayah === ayah && lit.word === k ? "bg-amber-200 text-green-900" : ""}`}
          >
            {w}
          </span>{" "}
        </span>
      ))}
      {data?.words[ayah]?.end && <span className="text-green-700">﴿{data.words[ayah].end}﴾</span>}
    </p>
  )

  return (
    <GameFrame
      title="Sambung Ayat"
      emoji="🧩"
      onExit={onExit}
      progress={<RoundStars results={results} current={i} />}
      hint={
        phase === "loading"
          ? "Memuat ayat..."
          : phase === "listen"
            ? "Dengarkan ayat ini 👂"
            : phase === "correct"
              ? "⭐ Benar! Ini ayat berikutnya"
              : "Ayat berikutnya yang mana? Dengar dulu, lalu pilih 🤔"
      }
    >
      {usingStarter && i === 0 && (
        <p className="rounded-2xl bg-white/90 px-4 py-2 text-center text-xs text-gray-600">
          Belum ada surat yang ditandai hafal, jadi memakai surat pendek pilihan. Tandai surat di Hafalan Surat agar game ini
          memakai hafalan anak.
        </p>
      )}

      {/* Ayat soal */}
      <div className="rounded-3xl bg-white p-5 text-center shadow-lg">
        <p className="text-sm font-semibold text-green-800">
          {surahName(r.surah)} · ayat {r.ayah}
        </p>
        {phase !== "loading" && <AyahText ayah={r.ayah} size="text-3xl sm:text-4xl" />}
        <button
          type="button"
          onClick={() => phase === "choose" && playAyah(r.ayah)}
          disabled={phase !== "choose"}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 font-bold text-amber-950 shadow active:scale-95 disabled:opacity-60"
        >
          <Volume2 className="h-5 w-5" /> Dengar lagi
        </button>
      </div>

      {/* Pilihan ayat berikutnya */}
      {phase !== "loading" && phase !== "listen" && (
        <ul className="space-y-3">
          {r.options.map((ayah, k) => {
            const isWrong = wrong.includes(ayah)
            const isRight = phase === "correct" && ayah === r.ayah + 1
            return (
              <li
                key={`${i}-${ayah}-${shake?.ayah === ayah ? shake.n : 0}`}
                className={`rounded-3xl border-4 bg-white p-4 shadow-md transition-all ${
                  isRight ? "border-green-500 bg-green-50" : isWrong ? "border-gray-200 opacity-40" : "border-gray-200"
                } ${shake?.ayah === ayah ? "animate-wiggle" : ""}`}
              >
                <p className="mb-1 text-sm font-bold text-gray-500">Pilihan {String.fromCharCode(65 + k)}</p>
                <AyahText ayah={ayah} size="text-2xl sm:text-3xl" />
                <div className="mt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    aria-label={`Dengar pilihan ${String.fromCharCode(65 + k)}`}
                    onClick={() => listen(ayah)}
                    disabled={phase !== "choose" || isWrong}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 font-semibold text-sky-800 active:scale-95 disabled:opacity-50"
                  >
                    <Volume2 className="h-5 w-5" /> Dengar
                  </button>
                  <button
                    type="button"
                    aria-label={`Pilih ${String.fromCharCode(65 + k)}`}
                    onClick={() => choose(ayah)}
                    disabled={phase !== "choose" || isWrong}
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 font-bold text-white active:scale-95 disabled:opacity-50"
                  >
                    <Check className="h-5 w-5" /> Ini!
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </GameFrame>
  )
}
