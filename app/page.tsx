"use client"

import Header from "@/components/Header"
import PrayerTimeComponent from "@/app/(features)/prayer-times"
import HomeHighlights from "@/components/HomeHighlights"
import { Footer } from "@/components/footer"

/**
 * Beranda = dasbor harian: waktu sholat (hero) + pintasan ringkas.
 * Pembaca Al-Qur'an dipindah ke /quran (menu "Al-Qur'an").
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <PrayerTimeComponent />
      <main className="container mx-auto max-w-6xl px-4 pt-2 pb-10 xl:pt-10 xl:pb-16">
        <HomeHighlights />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}
