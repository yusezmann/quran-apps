"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, Lock, Star, Volume2 } from "lucide-react"
import LessonView from "./LessonView"
import SurahPractice from "./SurahPractice"
import BalloonGame from "./games/BalloonGame"
import MemoryGame from "./games/MemoryGame"
import OddOneGame from "./games/OddOneGame"
import StickerBook from "./games/StickerBook"
import TraceGame from "./games/TraceGame"
import ParentReport from "./ParentReport"
import NumbersView from "./NumbersView"
import SambungAyatGame from "./games/SambungAyatGame"
import { SHORT_SURAHS } from "@/lib/belajar/surahs"
import { LESSONS } from "@/lib/belajar/letters"
import { isLessonUnlocked, useBelajarProgress, useTotalStars } from "@/lib/belajar/progress"
import { STICKERS, gamePool, highestUnlocked } from "@/lib/belajar/games"
import { NO_VOICE_EVENT, hasArabicVoice, openTtsInstall, speakArabic } from "@/lib/belajar/speech"

type GameId = "balon" | "pasangan" | "beda" | "tebal" | "sambung"

const GAMES: Array<{ id: GameId; emoji: string; name: string; desc: string; bg: string }> = [
  { id: "balon", emoji: "🎈", name: "Pecah Balon", desc: "Dengar & pecahkan", bg: "from-sky-400 to-blue-500" },
  { id: "pasangan", emoji: "🃏", name: "Cari Pasangan", desc: "Ingat kartunya", bg: "from-pink-400 to-rose-500" },
  { id: "beda", emoji: "🔍", name: "Mana yang Beda?", desc: "Lihat titiknya", bg: "from-violet-400 to-purple-600" },
  { id: "tebal", emoji: "✍️", name: "Tebalkan Huruf", desc: "Huruf & angka", bg: "from-amber-400 to-orange-500" },
  { id: "sambung", emoji: "🧩", name: "Sambung Ayat", desc: "Ayat berikutnya?", bg: "from-teal-400 to-emerald-600" },
]

type Section = "huruf" | "game" | "hafalan"

type View =
  | { kind: "home" }
  | { kind: "section"; section: Section }
  | { kind: "lesson"; index: number }
  | { kind: "surah"; number: number }
  | { kind: "game"; game: GameId; session: number }
  | { kind: "stickers" }
  | { kind: "parent" }
  | { kind: "angka" }

/**
 * Seluruh fitur "Belajar" (pelajaran huruf, game, hafalan, stiker, laporan orang tua).
 *
 * - variant "tab": tab Belajar di Quran Apps — semua bagian ditampilkan berurutan dalam satu halaman.
 * - variant "kid": aplikasi PWA anak (/anak) — beranda berisi 4 ubin besar; laporan orang tua
 *   dikunci dengan tekan-tahan agar anak tidak masuk sendiri.
 *
 * Setiap pindah tampilan dicatat di riwayat browser, sehingga tombol/gestur "kembali" di HP/tablet
 * kembali ke layar sebelumnya (bukan menutup aplikasi).
 */
export default function BelajarApp({ variant }: { variant: "tab" | "kid" }) {
  const [view, setViewState] = useState<View>({ kind: "home" })
  const stars = useBelajarProgress((s) => s.stars)
  const memorized = useBelajarProgress((s) => s.memorized)
  const letterStats = useBelajarProgress((s) => s.letterStats)
  const totalAllStars = useTotalStars()
  const stickerOwned = useBelajarProgress((s) => s.stickers)
  const [voiceOk, setVoiceOk] = useState<boolean | null>(null)
  const { pool, fresh, weak } = useMemo(() => gamePool(stars, letterStats), [stars, letterStats])
  const kid = variant === "kid"

  // ---- Navigasi + riwayat (tombol kembali HP) ----
  const navigate = useCallback((next: View) => {
    setViewState(next)
    try {
      window.history.pushState({ belajarView: next }, "")
    } catch {
      // abaikan
    }
  }, [])

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const v = (e.state as { belajarView?: View } | null)?.belajarView
      setViewState(v ?? { kind: "home" })
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  /** Tujuan "kembali" dari pelajaran/game/surat: bagian asalnya (aplikasi anak) atau beranda (tab). */
  const backTo = (section: Section): View => (kid ? { kind: "section", section } : { kind: "home" })
  const goHome = () => navigate({ kind: "home" })

  // ---- Petunjuk suara Arab (hanya bila suara benar-benar gagal diputar) ----
  useEffect(() => {
    const onNoVoice = () => setVoiceOk(false)
    const onVisible = () =>
      document.visibilityState === "visible" && hasArabicVoice().then((ok) => ok && setVoiceOk(true))
    window.addEventListener(NO_VOICE_EVENT, onNoVoice)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.removeEventListener(NO_VOICE_EVENT, onNoVoice)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  useEffect(() => {
    if (voiceOk === false) window.scrollTo({ top: 0, behavior: "smooth" })
  }, [voiceOk])

  // Kembali ke atas setiap pindah tampilan (game menggulir sendiri ke area permainan)
  useEffect(() => {
    if (view.kind !== "game") window.scrollTo({ top: 0, behavior: "smooth" })
  }, [view])

  const lessonStars = Object.values(stars).reduce((a, b) => a + b, 0)
  const currentLesson = highestUnlocked(stars)

  // ---- Bagian-bagian (dipakai di kedua varian) ----
  const gamesSection = (
    <section aria-labelledby="main-game" className="rounded-3xl bg-white p-5 shadow-lg">
      <div className="mb-4">
        <h2 id="main-game" className="text-xl font-bold text-gray-900">
          Main Game 🎮
        </h2>
        <p className="text-sm text-gray-500">Kumpulkan bintang untuk membuka stiker</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GAMES.map((g) => (
          <li key={g.id}>
            <button
              type="button"
              onClick={() => navigate({ kind: "game", game: g.id, session: 0 })}
              className={`flex w-full flex-col items-center gap-1 rounded-2xl bg-gradient-to-br ${g.bg} px-2 text-white shadow-md transition-transform hover:scale-[1.03] active:scale-95 ${
                kid ? "py-6" : "py-4"
              }`}
            >
              <span className={kid ? "text-6xl" : "text-4xl sm:text-5xl"} aria-hidden="true">
                {g.emoji}
              </span>
              <span className={`font-bold leading-tight ${kid ? "text-lg" : "text-sm sm:text-base"}`}>{g.name}</span>
              <span className="hidden text-xs text-white/85 sm:block">{g.desc}</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => navigate({ kind: "stickers" })}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-left hover:bg-amber-100"
      >
        <span className="text-3xl" aria-hidden="true">
          📒
        </span>
        <span className="flex-1 leading-tight">
          <span className="block font-bold text-amber-900">Buku Stiker</span>
          <span className="text-xs text-amber-800">
            {stickerOwned} dari {STICKERS.length} stiker terkumpul
          </span>
        </span>
        <span className="text-2xl" aria-hidden="true">
          {STICKERS.slice(0, stickerOwned).slice(-3).map(([e]) => e).join("") || "❔"}
        </span>
      </button>
    </section>
  )

  const lessonsSection = (
    <section aria-labelledby="peta-belajar" className="rounded-3xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="peta-belajar" className="text-xl font-bold text-gray-900">
            Mengenal Huruf
          </h2>
          <p className="text-sm text-gray-500">Huruf hijaiyah & fathah · setara Iqro&apos; 1</p>
        </div>
        <p className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800">
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {lessonStars}
        </p>
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LESSONS.map((lesson) => {
          const unlocked = isLessonUnlocked(stars, lesson.index)
          const got = stars[lesson.index] ?? 0
          return (
            <li key={lesson.index}>
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => navigate({ kind: "lesson", index: lesson.index })}
                aria-label={`Pelajaran ${lesson.index + 1}${unlocked ? "" : " (terkunci)"}`}
                className={`flex w-full flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-transform ${
                  unlocked
                    ? "border-green-200 bg-green-50 hover:scale-[1.02] active:scale-95"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <span className="text-xs font-semibold text-gray-500">Pelajaran {lesson.index + 1}</span>
                <span dir="rtl" className="font-tertiary pb-[0.35em] pt-[0.15em] text-3xl leading-[1.3] text-green-800">
                  {lesson.title}
                </span>
                {unlocked ? (
                  <span className="flex gap-0.5" aria-label={`${got} bintang`}>
                    {[1, 2, 3].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= got ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </span>
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )

  const surahSection = (
    <section aria-labelledby="surat-pendek" className="rounded-3xl bg-white p-5 shadow-lg">
      <div className="mb-4">
        <h2 id="surat-pendek" className="text-xl font-bold text-gray-900">
          Hafalan Surat Pendek
        </h2>
        <p className="text-sm text-gray-500">
          Dengar & ulangi ayat per ayat · {memorized.length} surat sudah hafal
          {kid && " · butuh internet"}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SHORT_SURAHS.map(([number, name, ayat]) => {
          const done = memorized.includes(number)
          return (
            <li key={number}>
              <button
                type="button"
                onClick={() => navigate({ kind: "surah", number })}
                className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-left hover:border-green-400 hover:bg-green-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  {number}
                </span>
                <span className="flex-1 leading-tight">
                  <span className="block font-semibold text-gray-900">{name}</span>
                  <span className="text-xs text-gray-500">{ayat} ayat</span>
                </span>
                {done && <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-label="Sudah hafal" />}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )

  const SECTION_TITLE: Record<Section, string> = { huruf: "📖 Belajar Huruf", game: "🎮 Main Game", hafalan: "🎧 Hafalan Surat" }

  return (
    <>
      {voiceOk === false && (
        <div role="note" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-snug text-amber-900">
          <p className="font-semibold">Sebagian suara belum bisa diputar di perangkat ini</p>
          <p className="mt-1">
            Tekan tombol di bawah, pilih <b>Google Speech Services</b> (atau mesin TTS perangkat) → <b>Instal data
            suara</b> → <b>Arab</b>, lalu kembali ke aplikasi ini. Pastikan juga volume <b>media</b> tidak nol.
          </p>
          <button
            type="button"
            onClick={openTtsInstall}
            className="mt-3 rounded-full bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
          >
            Pasang suara Arab
          </button>
        </div>
      )}

      {view.kind === "lesson" && <LessonView lessonIndex={view.index} onExit={() => navigate(backTo("huruf"))} />}
      {view.kind === "surah" && <SurahPractice surahNumber={view.number} onExit={() => navigate(backTo("hafalan"))} />}
      {view.kind === "stickers" && <StickerBook onExit={goHome} />}
      {view.kind === "angka" && <NumbersView onExit={goHome} onStickers={() => navigate({ kind: "stickers" })} />}
      {view.kind === "parent" && (
        <ParentReport onExit={goHome} onPlayOdd={() => navigate({ kind: "game", game: "beda", session: 0 })} />
      )}
      {view.kind === "game" &&
        (() => {
          const key = `${view.game}-${view.session}` // sesi baru = komponen baru (Main lagi)
          const props = {
            pool,
            fresh,
            weak,
            onAgain: () => navigate({ ...view, session: view.session + 1 }),
            onExit: () => navigate(backTo("game")),
            onStickers: () => navigate({ kind: "stickers" }),
          }
          if (view.game === "balon") return <BalloonGame key={key} {...props} />
          if (view.game === "pasangan") return <MemoryGame key={key} {...props} />
          if (view.game === "tebal") return <TraceGame key={key} {...props} />
          if (view.game === "sambung")
            return <SambungAyatGame key={key} onAgain={props.onAgain} onExit={props.onExit} onStickers={props.onStickers} />
          return <OddOneGame key={key} {...props} />
        })()}

      {/* Aplikasi anak: satu bagian per layar, dengan tombol kembali ke beranda */}
      {view.kind === "section" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goHome}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" /> Beranda
            </button>
            <p className="text-sm font-semibold text-white">{SECTION_TITLE[view.section]}</p>
          </div>
          {view.section === "huruf" && lessonsSection}
          {view.section === "game" && gamesSection}
          {view.section === "hafalan" && surahSection}
        </div>
      )}

      {view.kind === "home" &&
        (kid ? (
          <KidHome
            lessonNumber={currentLesson + 1}
            totalStars={totalAllStars}
            stickers={stickerOwned}
            memorized={memorized.length}
            onOpen={(section) => navigate({ kind: "section", section })}
            onStickers={() => navigate({ kind: "stickers" })}
            onNumbers={() => navigate({ kind: "angka" })}
            onParent={() => navigate({ kind: "parent" })}
          />
        ) : (
          <div className="space-y-8">
            {gamesSection}
            {lessonsSection}
            <button
              type="button"
              onClick={() => navigate({ kind: "angka" })}
              className="flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-lg hover:bg-gray-50"
            >
              <span dir="rtl" className="font-tertiary pb-[0.2em] text-4xl leading-[1.2] text-emerald-700" aria-hidden="true">
                ١٢٣
              </span>
              <span className="flex-1 leading-tight">
                <span className="block text-lg font-bold text-gray-900">Mengenal Angka Arab</span>
                <span className="text-sm text-gray-500">٠ sampai ١٠ · kenal, hitung, kuis</span>
              </span>
              <span className="text-2xl text-gray-400" aria-hidden="true">
                ›
              </span>
            </button>
            {surahSection}

            {/* Untuk orang tua */}
            <button
              type="button"
              onClick={() => navigate({ kind: "parent" })}
              className="flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-lg hover:bg-gray-50"
            >
              <span className="text-4xl" aria-hidden="true">
                👨‍👩‍👧
              </span>
              <span className="flex-1 leading-tight">
                <span className="block text-lg font-bold text-gray-900">Laporan untuk Orang Tua</span>
                <span className="text-sm text-gray-500">Huruf yang perlu dilatih, sering tertukar & hari belajar</span>
              </span>
              <span className="text-2xl text-gray-400" aria-hidden="true">
                ›
              </span>
            </button>

            <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-500">
              <Volume2 className="h-4 w-4" />
              <button type="button" className="underline" onClick={() => speakArabic("بِسْمِ اللَّهِ")}>
                Coba suara
              </button>
              · Suara huruf memakai suara bawaan perangkat
            </p>
          </div>
        ))}
    </>
  )
}

/** Beranda aplikasi anak: 4 ubin besar + kunci orang tua (tekan-tahan). */
function KidHome({
  lessonNumber,
  totalStars,
  stickers,
  memorized,
  onOpen,
  onStickers,
  onNumbers,
  onParent,
}: {
  lessonNumber: number
  totalStars: number
  stickers: number
  memorized: number
  onOpen: (section: Section) => void
  onStickers: () => void
  onNumbers: () => void
  onParent: () => void
}) {
  const tiles: Array<{ key: string; emoji: string; name: string; info: string; bg: string; onClick: () => void }> = [
    { key: "huruf", emoji: "📖", name: "Belajar Huruf", info: `Pelajaran ${lessonNumber}`, bg: "from-emerald-400 to-green-600", onClick: () => onOpen("huruf") },
    { key: "game", emoji: "🎮", name: "Main Game", info: `${GAMES.length} permainan`, bg: "from-sky-400 to-blue-600", onClick: () => onOpen("game") },
    { key: "angka", emoji: "🔢", name: "Angka Arab", info: "١٢٣", bg: "from-rose-400 to-pink-600", onClick: onNumbers },
    { key: "hafalan", emoji: "🎧", name: "Hafalan Surat", info: `${memorized} surat hafal`, bg: "from-violet-400 to-purple-600", onClick: () => onOpen("hafalan") },
    { key: "stiker", emoji: "📒", name: "Buku Stiker", info: `${stickers} dari ${STICKERS.length}`, bg: "from-amber-400 to-orange-500", onClick: onStickers },
  ]
  return (
    <div className="space-y-6">
      {/* Potret: 2×2; mendatar (tablet diputar): satu baris agar semua terlihat tanpa menggulir */}
      <ul className="grid grid-cols-2 gap-4 landscape:grid-cols-5">
        {tiles.map((t, i) => (
          <li key={t.key} className={i === tiles.length - 1 ? "col-span-2 landscape:col-span-1" : ""}>
            <button
              type="button"
              onClick={t.onClick}
              className={`flex w-full items-center justify-center gap-2 rounded-[2rem] ${
                // ubin terakhir di potret selebar 2 kolom: mendatar & pendek (emoji di kiri)
                i === tiles.length - 1 ? "flex-row gap-5 py-5 landscape:aspect-square landscape:flex-col landscape:gap-2" : "aspect-square flex-col"
              } bg-gradient-to-br ${t.bg} p-4 text-white shadow-xl ring-4 ring-white/40 transition-transform hover:scale-[1.02] active:scale-95`}
            >
              <span className="text-7xl drop-shadow sm:text-8xl landscape:sm:text-7xl" aria-hidden="true">
                {t.emoji}
              </span>
              <span className="flex flex-col items-center gap-2">
                <span className="text-xl font-bold leading-tight sm:text-2xl landscape:sm:text-lg">{t.name}</span>
                <span className="rounded-full bg-white/25 px-3 py-0.5 text-sm font-semibold">{t.info}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="flex items-center justify-center gap-2 text-lg font-bold text-white">
        <Star className="h-6 w-6 fill-amber-300 text-amber-300" /> {totalStars} bintang
      </p>
      <ParentGate onOpen={onParent} />
    </div>
  )
}

/**
 * Pintu orang tua: tekan & tahan 3 detik. Anak umumnya hanya mengetuk, jadi tidak masuk tanpa sengaja.
 */
function ParentGate({ onOpen }: { onOpen: () => void }) {
  const HOLD_MS = 3000
  const [progress, setProgress] = useState(0)
  const timer = useRef<number | null>(null)
  const started = useRef(0)

  const stop = () => {
    if (timer.current) window.clearInterval(timer.current)
    timer.current = null
    setProgress(0)
  }
  const start = () => {
    stop()
    started.current = Date.now()
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - started.current) / HOLD_MS)
      setProgress(p)
      if (p >= 1) {
        stop()
        onOpen()
      }
    }, 50)
  }
  useEffect(() => stop, [])

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Untuk orang tua: tekan dan tahan 3 detik"
        className="relative select-none overflow-hidden rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/40 [-webkit-touch-callout:none]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-white/40"
          style={{ width: `${progress * 100}%`, transition: progress === 0 ? "none" : "width 50ms linear" }}
        />
        <span className="relative">👨‍👩‍👧 Orang tua · tahan 3 detik</span>
      </button>
    </div>
  )
}
