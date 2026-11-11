"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BookOpen, CalendarDays, ChevronRight, Moon } from "lucide-react"
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
        <p className="truncate font-semibold text-gray-900">{title}</p>
        {subtitle && <p className="truncate text-sm text-gray-500">{subtitle}</p>}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-green-600" />
    </Link>
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
  const hijriOffset = useHijriOffset()
  const hijri = getHijriParts(new Date(), hijriOffset)
  const isRamadan = hijri.month === 9

  useEffect(() => {
    setLastRead(readLastRead())
  }, [])

  return (
    <section aria-label="Pintasan" className="space-y-4">
      {isRamadan && (
        <Link
          href="/imsakiyah"
          className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-green-600 p-4 text-white shadow-md hover:from-emerald-800 hover:to-green-700"
        >
          <Moon className="h-8 w-8 shrink-0" />
          <div className="flex-1 leading-snug">
            <p className="font-semibold">Ramadhan {hijri.year} H</p>
            <p className="text-sm text-white/85">Lihat jadwal imsakiyah lengkap bulan ini</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            title="Mulai membaca Al-Qur'an"
            subtitle="114 surah, audio qari & tafsir"
          />
        )}
        <HighlightCard
          href="/imsakiyah"
          icon={<CalendarDays className="h-6 w-6" />}
          eyebrow="Jadwal sholat"
          title="Lihat jadwal sebulan"
          subtitle="Imsakiyah lengkap & unduh PDF"
        />
      </div>
    </section>
  )
}
