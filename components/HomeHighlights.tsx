"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BookOpen, CalendarDays, CalendarHeart, ChevronRight, LocateFixed, Moon } from "lucide-react"
import { useAutoLocation } from "@/lib/auto-location"
import { enableAutoLocation } from "@/lib/auto-location-run"
import { differenceInCalendarDays, format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { findHolidayRange, getHolidays, getNextHoliday, groupHolidayRanges, type Holiday } from "@/lib/holidays"
import { getHijriParts } from "@/lib/hijri"
import { useHijriOffset } from "@/app/(features)/hijri-date/hooks/useHijriOffset"

interface LastRead {
  surah: number
  ayah: number
  name: string
}

function readLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem("lastRead")
    if (!raw) return null
    const v = JSON.parse(raw)
    return Number.isInteger(v?.surah) && Number.isInteger(v?.ayah) ? v : null
  } catch {
    return null
  }
}

/** Kartu tautan seragam untuk dasbor Beranda. */
function HighlightCard({
  href,
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  href: string
  icon: React.ReactNode
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-green-400 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 group-hover:bg-green-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1 leading-snug">
        <p className="text-xs font-medium uppercase tracking-wide text-green-700">{eyebrow}</p>
        <p className="line-clamp-2 font-semibold text-gray-900">{title}</p>
        {subtitle && <p className="line-clamp-2 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-green-600" />
    </Link>
  )
}

function NextHolidayCard({ holiday, hijriOffset }: { holiday: Holiday; hijriOffset: number }) {
  const date = parseISO(holiday.date)
  const days = differenceInCalendarDays(date, new Date())
  const when = days === 0 ? "Hari ini" : days === 1 ? "Besok" : `${days} hari lagi`

  // Rangkaian libur (mis. Idulfitri 2 hari + cuti bersama) agar kartu menyebut seluruh liburnya
  const yearHolidays = getHolidays(date.getFullYear(), hijriOffset)
  const range = findHolidayRange(groupHolidayRanges(yearHolidays), holiday.date)
  const liburDates = (range?.dates ?? [holiday.date]).filter((d) =>
    yearHolidays.some((h) => h.date === d && h.kind === "libur"),
  )
  const first = parseISO(liburDates[0] ?? holiday.date)
  const last = parseISO(liburDates[liburDates.length - 1] ?? holiday.date)
  const dateLabel =
    liburDates.length > 1
      ? `${format(first, "d", { locale: idLocale })}–${format(last, "d MMM yyyy", { locale: idLocale })}`
      : format(date, "EEE, d MMM yyyy", { locale: idLocale })
  const cuti = range?.cutiDays ? ` (+${range.cutiDays} hari cuti bersama)` : ""

  return (
    <HighlightCard
      href={`/imsakiyah?bulan=${date.getMonth() + 1}&tahun=${date.getFullYear()}&tanggal=${date.getDate()}`}
      icon={<CalendarHeart className="h-6 w-6" />}
      eyebrow="Libur berikutnya"
      title={holiday.name}
      subtitle={`${dateLabel}${cuti} · ${when}${holiday.estimated ? " · perkiraan" : ""}`}
    />
  )
}

/**
 * Tawaran sekali (mode "ask"): gunakan lokasi otomatis? Izin baru diminta saat tombol ditekan.
 * Ditampilkan setelah mount agar tidak bentrok dengan HTML statis hasil build.
 */
function AutoLocationOffer() {
  const mode = useAutoLocation((s) => s.mode)
  const setMode = useAutoLocation((s) => s.setMode)
  const [busy, setBusy] = useState(false)
  if (mode !== "ask") return null

  const accept = async () => {
    setBusy(true)
    await enableAutoLocation()
    setBusy(false)
  }

  return (
    <div role="region" aria-label="Tawaran lokasi otomatis" className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
          <LocateFixed className="h-5 w-5" />
        </div>
        <div className="flex-1 leading-snug">
          <p className="font-semibold text-gray-900">Gunakan lokasi otomatis?</p>
          <p className="mt-0.5 text-sm text-gray-600">
            Jadwal sholat, arah kiblat & adzan menyesuaikan saat Anda bepergian. Bisa diubah kapan saja lewat
            &quot;Salah Lokasi?&quot;.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={accept}
              disabled={busy}
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {busy ? "Mendeteksi lokasi..." : "Aktifkan"}
            </button>
            <button
              type="button"
              onClick={() => setMode("off")}
              disabled={busy}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white"
            >
              Nanti saja
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Dasbor ringkas di bawah jadwal sholat:
 * - "Lanjutkan membaca" (menggantikan pembaca Al-Qur'an yang dulu ada di Beranda)
 * - "Jadwal sholat sebulan" (Imsakiyah, progressive disclosure dari jadwal hari ini)
 * - Kartu Ramadhan yang hanya muncul saat bulan Ramadhan
 */
export default function HomeHighlights() {
  const [lastRead, setLastRead] = useState<LastRead | null>(null)
  // Semua yang bergantung pada tanggal hari ini dihitung SETELAH mount: halaman ini di-prerender
  // saat build (static export), jadi menghitungnya saat render menimbulkan hydration mismatch.
  const [now, setNow] = useState<Date | null>(null)
  const hijriOffset = useHijriOffset()
  const hijri = now ? getHijriParts(now, hijriOffset) : null
  const isRamadan = hijri?.month === 9
  const nextHoliday = now ? getNextHoliday(now, hijriOffset) : null

  useEffect(() => {
    setLastRead(readLastRead())
    setNow(new Date())
  }, [])

  return (
    <section aria-label="Pintasan" className="space-y-4">
      {now && <AutoLocationOffer />}
      {isRamadan && (
        <Link
          href="/imsakiyah"
          className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-green-600 p-4 text-white shadow-md hover:from-emerald-800 hover:to-green-700"
        >
          <Moon className="h-8 w-8 shrink-0" />
          <div className="flex-1 leading-snug">
            <p className="font-semibold">Ramadhan {hijri?.year} H</p>
            <p className="text-sm text-white/85">Lihat jadwal imsakiyah lengkap bulan ini</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lastRead ? (
          <HighlightCard
            href={`/quran?surah=${lastRead.surah}&ayat=${lastRead.ayah}`}
            icon={<BookOpen className="h-6 w-6" />}
            eyebrow="Lanjutkan membaca"
            title={lastRead.name || `Surah ${lastRead.surah}`}
            subtitle={`Ayat ${lastRead.ayah}`}
          />
        ) : (
          <HighlightCard
            href="/quran"
            icon={<BookOpen className="h-6 w-6" />}
            eyebrow="Al-Qur'an"
            title="Mulai membaca Al‑Qur'an" // tanda hubung tak-terputus agar "Al-Qur'an" tidak terpotong
            subtitle="114 surah, audio qari & tafsir"
          />
        )}
        <HighlightCard
          href="/imsakiyah"
          icon={<CalendarDays className="h-6 w-6" />}
          eyebrow="Jadwal sholat"
          title="Lihat jadwal sebulan"
          subtitle="Imsakiyah & unduh PDF"
        />
        {nextHoliday && <NextHolidayCard holiday={nextHoliday} hijriOffset={hijriOffset} />}
      </div>
    </section>
  )
}
