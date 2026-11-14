"use client"

import { useEffect } from "react"
import Header from "@/components/Header"
import PageBackground from "@/components/PageBackground"
import { Footer } from "@/components/footer"
import SurahList from "./components/surah-list"
import QuranReader from "./components/QuranReader"
import { useQuranStore } from "./store/quranStore"
import QuranTabs from "./components/QuranTabs"

export default function QuranPage() {
  const setCurrentSurah = useQuranStore((s) => s.setCurrentSurah)
  const setScrollTarget = useQuranStore((s) => s.setScrollTarget)

  // Dukung tautan langsung, mis. /quran?surah=2&ayat=12 (dari kartu "Lanjutkan membaca")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const surah = Number(params.get("surah"))
    const ayat = Number(params.get("ayat"))
    if (Number.isInteger(surah) && surah >= 1 && surah <= 114) {
      setCurrentSurah(surah)
      if (Number.isInteger(ayat) && ayat >= 1) setScrollTarget(ayat)
    }
  }, [setCurrentSurah, setScrollTarget])

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <Header />

      <div className="relative z-10 pt-28 pb-6 text-center px-4">
        <h1 className="text-3xl xl:text-4xl font-bold text-white mb-1 leading-tight">Al-Qur&apos;an</h1>
        <p className="text-white/85 leading-snug">Baca, dengarkan, dan pelajari tafsirnya</p>
        <QuranTabs />
      </div>

      <main className="relative z-10 container mx-auto px-4 xl:px-0 pb-10 xl:pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Daftar surah menempel saat halaman di-scroll (desktop) */}
          <aside className="hidden xl:block xl:col-span-1">
            <div className="sticky top-28">
              <SurahList />
            </div>
          </aside>
          <div className="xl:col-span-3">
            <QuranReader />
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}
