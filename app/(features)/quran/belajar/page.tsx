"use client"

import { useEffect, useMemo, useState } from "react"
import { Lock, Star, Volume2 } from "lucide-react"
import Header from "@/components/Header"
import PageBackground from "@/components/PageBackground"
import { Footer } from "@/components/footer"
import QuranTabs from "../components/QuranTabs"
import LessonView from "./components/LessonView"
import SurahPractice from "./components/SurahPractice"
import { LESSONS } from "@/lib/belajar/letters"
import { isLessonUnlocked, useBelajarProgress, useTotalStars } from "@/lib/belajar/progress"
import { STICKERS, gamePool, stickerCount } from "@/lib/belajar/games"
import BalloonGame from "./components/games/BalloonGame"
import MemoryGame from "./components/games/MemoryGame"
import OddOneGame from "./components/games/OddOneGame"
import StickerBook from "./components/games/StickerBook"
import { NO_VOICE_EVENT, hasArabicVoice, openTtsInstall, speakArabic } from "@/lib/belajar/speech"

/** Surat pendek untuk anak: Al-Fatihah lalu juz 30 dari yang terpendek. */
const SHORT_SURAHS: Array<[number, string, number]> = [
  [1, "Al-Fatihah", 7],
  [114, "An-Nas", 6],
  [113, "Al-Falaq", 5],
  [112, "Al-Ikhlas", 4],
  [111, "Al-Lahab", 5],
  [110, "An-Nasr", 3],
  [109, "Al-Kafirun", 6],
  [108, "Al-Kautsar", 3],
  [107, "Al-Ma'un", 7],
  [106, "Quraisy", 4],
  [105, "Al-Fil", 5],
  [104, "Al-Humazah", 9],
  [103, "Al-'Asr", 3],
  [102, "At-Takatsur", 8],
  [101, "Al-Qari'ah", 11],
  [100, "Al-'Adiyat", 11],
  [99, "Az-Zalzalah", 8],
]

type GameId = "balon" | "pasangan" | "beda"

const GAMES: Array<{ id: GameId; emoji: string; name: string; desc: string; bg: string }> = [
  { id: "balon", emoji: "🎈", name: "Pecah Balon", desc: "Dengar & pecahkan", bg: "from-sky-400 to-blue-500" },
  { id: "pasangan", emoji: "🃏", name: "Cari Pasangan", desc: "Ingat kartunya", bg: "from-pink-400 to-rose-500" },
  { id: "beda", emoji: "🔍", name: "Mana yang Beda?", desc: "Lihat titiknya", bg: "from-violet-400 to-purple-600" },
]

type View =
  | { kind: "home" }
  | { kind: "lesson"; index: number }
  | { kind: "surah"; number: number }
  | { kind: "game"; game: GameId; session: number }
  | { kind: "stickers" }

export default function BelajarPage() {
  const [view, setView] = useState<View>({ kind: "home" })
  const stars = useBelajarProgress((s) => s.stars)
  const memorized = useBelajarProgress((s) => s.memorized)
  const totalAllStars = useTotalStars()
  const [voiceOk, setVoiceOk] = useState<boolean | null>(null)
  const { pool, fresh } = useMemo(() => gamePool(stars), [stars])

  useEffect(() => {
    // Huruf & fathah memakai file suara bawaan aplikasi, jadi suara Arab perangkat hanya dibutuhkan
    // sebagai cadangan. Petunjuk pemasangan hanya muncul bila suara BENAR-BENAR gagal diputar.
    // Suara gagal diputar saat kartu diketuk → tampilkan petunjuk pemasangan
    const onNoVoice = () => setVoiceOk(false)
    // Kembali dari pengaturan TTS Android → cek ulang
    const onVisible = () =>
      document.visibilityState === "visible" && hasArabicVoice().then((ok) => ok && setVoiceOk(true))
    window.addEventListener(NO_VOICE_EVENT, onNoVoice)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.removeEventListener(NO_VOICE_EVENT, onNoVoice)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  // Petunjuk dipasang di atas agar terlihat dari halaman mana pun (peta, pelajaran, surat)
  useEffect(() => {
    if (voiceOk === false) window.scrollTo({ top: 0, behavior: "smooth" })
  }, [voiceOk])

  // Kembali ke atas setiap pindah tampilan
  useEffect(() => {
    // Game menggulir sendiri ke area permainan
    if (view.kind !== "game") window.scrollTo({ top: 0, behavior: "smooth" })
  }, [view])

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0)

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <Header />

      <div className="relative z-10 pt-28 pb-6 text-center px-4">
        <h1 className="text-3xl xl:text-4xl font-bold text-white mb-1 leading-tight">Al-Qur&apos;an</h1>
        <p className="text-white/85 leading-snug">Belajar mengaji untuk anak</p>
        <QuranTabs />
      </div>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-10">
        {voiceOk === false && (
          <div role="note" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-snug text-amber-900">
            <p className="font-semibold">Sebagian suara belum bisa diputar di perangkat ini</p>
            <p className="mt-1">
              Tekan tombol di bawah, pilih <b>Google Speech Services</b> (atau mesin TTS HP Anda) → <b>Instal data
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

        {view.kind === "lesson" && <LessonView lessonIndex={view.index} onExit={() => setView({ kind: "home" })} />}
        {view.kind === "surah" && <SurahPractice surahNumber={view.number} onExit={() => setView({ kind: "home" })} />}
        {view.kind === "stickers" && <StickerBook onExit={() => setView({ kind: "home" })} />}
        {view.kind === "game" &&
          (() => {
            const key = `${view.game}-${view.session}` // sesi baru = komponen baru (Main lagi)
            const props = {
              pool,
              fresh,
              onAgain: () => setView({ ...view, session: view.session + 1 }),
              onExit: () => setView({ kind: "home" }),
              onStickers: () => setView({ kind: "stickers" }),
            }
            if (view.game === "balon") return <BalloonGame key={key} {...props} />
            if (view.game === "pasangan") return <MemoryGame key={key} {...props} />
            return <OddOneGame key={key} {...props} />
          })()}

        {view.kind === "home" && (
          <div className="space-y-8">
            {/* Game: hanya memakai huruf dari pelajaran yang sudah terbuka */}
            <section aria-labelledby="main-game" className="rounded-3xl bg-white p-5 shadow-lg">
              <div className="mb-4">
                <h2 id="main-game" className="text-xl font-bold text-gray-900">
                  Main Game 🎮
                </h2>
                <p className="text-sm text-gray-500">Kumpulkan bintang untuk membuka stiker</p>
              </div>
              <ul className="grid grid-cols-3 gap-3">
                {GAMES.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setView({ kind: "game", game: g.id, session: 0 })}
                      className={`flex w-full flex-col items-center gap-1 rounded-2xl bg-gradient-to-br ${g.bg} px-2 py-4 text-white shadow-md transition-transform hover:scale-[1.03] active:scale-95`}
                    >
                      <span className="text-4xl sm:text-5xl" aria-hidden="true">
                        {g.emoji}
                      </span>
                      <span className="text-sm font-bold leading-tight sm:text-base">{g.name}</span>
                      <span className="hidden text-xs text-white/85 sm:block">{g.desc}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setView({ kind: "stickers" })}
                className="mt-3 flex w-full items-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-left hover:bg-amber-100"
              >
                <span className="text-3xl" aria-hidden="true">
                  📒
                </span>
                <span className="flex-1 leading-tight">
                  <span className="block font-bold text-amber-900">Buku Stiker</span>
                  <span className="text-xs text-amber-800">
                    {stickerCount(totalAllStars)} dari {STICKERS.length} stiker terkumpul
                  </span>
                </span>
                <span className="text-2xl" aria-hidden="true">
                  {STICKERS.slice(0, stickerCount(totalAllStars)).slice(-3).map(([e]) => e).join("") || "❔"}
                </span>
              </button>
            </section>

            {/* Peta belajar Iqro' 1 */}
            <section aria-labelledby="peta-belajar" className="rounded-3xl bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 id="peta-belajar" className="text-xl font-bold text-gray-900">
                    Mengenal Huruf
                  </h2>
                  <p className="text-sm text-gray-500">Huruf hijaiyah & fathah · setara Iqro&apos; 1</p>
                </div>
                <p className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {totalStars}
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
                        onClick={() => setView({ kind: "lesson", index: lesson.index })}
                        aria-label={`Pelajaran ${lesson.index + 1}${unlocked ? "" : " (terkunci)"}`}
                        className={`flex w-full flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-transform ${
                          unlocked
                            ? "border-green-200 bg-green-50 hover:scale-[1.02] active:scale-95"
                            : "border-gray-200 bg-gray-50 opacity-60"
                        }`}
                      >
                        <span className="text-xs font-semibold text-gray-500">Pelajaran {lesson.index + 1}</span>
                        <span dir="rtl" className="font-tertiary text-3xl leading-tight text-green-800">
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

            {/* Surat pendek */}
            <section aria-labelledby="surat-pendek" className="rounded-3xl bg-white p-5 shadow-lg">
              <div className="mb-4">
                <h2 id="surat-pendek" className="text-xl font-bold text-gray-900">
                  Hafalan Surat Pendek
                </h2>
                <p className="text-sm text-gray-500">
                  Dengar & ulangi ayat per ayat · {memorized.length} surat sudah hafal
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SHORT_SURAHS.map(([number, name, ayat]) => {
                  const done = memorized.includes(number)
                  return (
                    <li key={number}>
                      <button
                        type="button"
                        onClick={() => setView({ kind: "surah", number })}
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

            <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-500">
              <Volume2 className="h-4 w-4" />
              <button type="button" className="underline" onClick={() => speakArabic("بِسْمِ اللَّهِ")}>
                Coba suara
              </button>
              · Suara huruf memakai suara bawaan perangkat
            </p>
          </div>
        )}
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}
