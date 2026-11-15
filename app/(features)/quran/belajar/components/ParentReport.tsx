"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Volume2 } from "lucide-react"
import { LESSONS, withFathah, type Letter } from "@/lib/belajar/letters"
import { STICKERS, stickerCount } from "@/lib/belajar/games"
import { useBelajarProgress, useTotalStars } from "@/lib/belajar/progress"
import { masteredLetters, tipFor, topConfusions, weakLetters } from "@/lib/belajar/stats"
import { speakArabic } from "@/lib/belajar/speech"

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    return { key, label: DAY_NAMES[d.getDay()], date: d.getDate() }
  })
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-lg">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {note && <p className="text-sm text-gray-500">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function LetterChip({ letter, detail, tone }: { letter: Letter; detail: string; tone: "weak" | "good" }) {
  return (
    <button
      type="button"
      onClick={() => speakArabic(withFathah(letter), `${letter.id}-fathah`)}
      aria-label={`Dengar ${letter.fathahLatin}, ${detail}`}
      className={`flex flex-col items-center rounded-2xl border-2 px-3 py-2 ${
        tone === "weak" ? "border-rose-200 bg-rose-50" : "border-green-200 bg-green-50"
      }`}
    >
      <span dir="rtl" className="font-tertiary pb-[0.3em] pt-[0.15em] text-4xl leading-[1.2]" style={{ color: letter.color }}>
        {withFathah(letter)}
      </span>
      <span className="text-sm font-semibold text-gray-700">{letter.fathahLatin}</span>
      <span className={`text-xs ${tone === "weak" ? "text-rose-700" : "text-green-700"}`}>{detail}</span>
    </button>
  )
}

/**
 * Laporan untuk orang tua: kebiasaan belajar, huruf yang perlu dilatih, huruf yang sering tertukar
 * (dengan petunjuk membedakannya), dan huruf yang sudah dikuasai.
 */
export default function ParentReport({ onExit, onPlayOdd }: { onExit: () => void; onPlayOdd: () => void }) {
  const stars = useBelajarProgress((s) => s.stars)
  const memorized = useBelajarProgress((s) => s.memorized)
  const letterStats = useBelajarProgress((s) => s.letterStats)
  const confusions = useBelajarProgress((s) => s.confusions)
  const activeDays = useBelajarProgress((s) => s.activeDays)
  const resetStats = useBelajarProgress((s) => s.resetStats)
  const totalStars = useTotalStars()
  const [confirmReset, setConfirmReset] = useState(false)

  const weak = useMemo(() => weakLetters(letterStats), [letterStats])
  const mastered = useMemo(() => masteredLetters(letterStats), [letterStats])
  const pairs = useMemo(() => topConfusions(confusions), [confusions])
  const answers = Object.values(letterStats).reduce((a, s) => a + s.r + s.w, 0)
  const lessonsDone = LESSONS.filter((l) => (stars[l.index] ?? 0) > 0).length
  const days = lastDays(14)
  const activeCount = days.filter((d) => activeDays.includes(d.key)).length
  const enoughData = answers >= 15

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <p className="text-sm font-semibold text-white">👨‍👩‍👧 Untuk Orang Tua</p>
      </div>

      <Card title="Ringkasan">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Pelajaran selesai", `${lessonsDone}/${LESSONS.length}`],
            ["Bintang", `⭐ ${totalStars}`],
            ["Surat dihafal", `${memorized.length}`],
            ["Stiker", `${stickerCount(totalStars)}/${STICKERS.length}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-gray-50 px-3 py-2">
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="text-xl font-bold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm font-semibold text-gray-700">
          Hari belajar · {activeCount} dari 14 hari terakhir
        </p>
        <ol className="mt-2 grid grid-cols-7 gap-1.5" aria-label={`Belajar ${activeCount} dari 14 hari terakhir`}>
          {days.map((d) => {
            const on = activeDays.includes(d.key)
            return (
              <li
                key={d.key}
                className={`flex flex-col items-center rounded-xl py-1.5 text-xs ${on ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}
              >
                <span>{d.label}</span>
                <span className="font-bold">{d.date}</span>
              </li>
            )
          })}
        </ol>
        <p className="mt-2 text-xs text-gray-500">Sedikit tapi rutin (5–10 menit sehari) lebih baik daripada lama tapi jarang.</p>
      </Card>

      <Card
        title="Perlu dilatih"
        note="Huruf yang masih sering salah di kuis & game. Ketuk untuk mendengar bunyinya."
      >
        {weak.length ? (
          <>
            <div className="flex flex-wrap gap-2">
              {weak.map((w) => (
                <LetterChip key={w.letter.id} letter={w.letter} tone="weak" detail={`${w.percent}% benar`} />
              ))}
            </div>
            <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              💡 Huruf-huruf ini otomatis lebih sering muncul di game & kuis sampai anak menguasainya.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            {enoughData
              ? "Tidak ada huruf yang sering salah. MasyaAllah! 🎉"
              : "Belum cukup data. Ajak anak bermain kuis atau game beberapa kali dulu."}
          </p>
        )}
      </Card>

      <Card title="Sering tertukar" note="Pasangan huruf yang sering dikira sama oleh anak.">
        {pairs.length ? (
          <ul className="space-y-3">
            {pairs.map(({ a, b, count }) => {
              const tip = tipFor(a.id, b.id)
              return (
                <li key={`${a.id}-${b.id}`} className="rounded-2xl border border-gray-200 p-3">
                  <div className="flex items-center gap-3">
                    {[a, b].map((l, i) => (
                      <span key={l.id} className="contents">
                        {i === 1 && <span className="text-xl text-gray-400">↔</span>}
                        <button
                          type="button"
                          onClick={() => speakArabic(withFathah(l), `${l.id}-fathah`)}
                          className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-1"
                          aria-label={`Dengar ${l.fathahLatin}`}
                        >
                          <span dir="rtl" className="font-tertiary pb-[0.3em] pt-[0.15em] text-3xl leading-[1.2]" style={{ color: l.color }}>
                            {withFathah(l)}
                          </span>
                          <Volume2 className="h-4 w-4 text-gray-400" />
                        </button>
                      </span>
                    ))}
                    <span className="ml-auto text-sm text-gray-500">{count}×</span>
                  </div>
                  {tip && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      💡{" "}
                      {/* Huruf Arab di dalam kalimat diperbesar agar titiknya terlihat */}
                      {tip.split(/([؀-ۿ]+)/).map((part, i) =>
                        /[؀-ۿ]/.test(part) ? (
                          <span key={i} dir="rtl" className="font-tertiary mx-0.5 align-middle text-2xl leading-none text-green-800">
                            {part}
                          </span>
                        ) : (
                          <span key={i}>{part}</span>
                        ),
                      )}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Belum ada huruf yang sering tertukar.</p>
        )}
        <button
          type="button"
          onClick={onPlayOdd}
          className="mt-3 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          🔍 Latih dengan &quot;Mana yang Beda?&quot;
        </button>
      </Card>

      <Card title="Sudah dikuasai" note="Benar minimal 4 kali dengan ketepatan 85% ke atas.">
        {mastered.length ? (
          <div className="flex flex-wrap gap-2">
            {mastered.map((m) => (
              <LetterChip key={m.letter.id} letter={m.letter} tone="good" detail={`${m.percent}% benar`} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Belum ada. Terus berlatih, insyaAllah segera! 💪</p>
        )}
      </Card>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            if (!confirmReset) return setConfirmReset(true)
            resetStats()
            setConfirmReset(false)
          }}
          onBlur={() => setConfirmReset(false)}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${confirmReset ? "bg-rose-600 text-white" : "text-gray-500 underline"}`}
        >
          {confirmReset ? "Yakin? Ketuk lagi untuk menghapus catatan jawaban" : "Hapus catatan jawaban (bintang & stiker tetap)"}
        </button>
      </div>
    </div>
  )
}
