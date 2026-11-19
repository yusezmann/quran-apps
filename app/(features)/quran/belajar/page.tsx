"use client"

import Header from "@/components/Header"
import PageBackground from "@/components/PageBackground"
import { Footer } from "@/components/footer"
import QuranTabs from "../components/QuranTabs"
import BelajarApp from "./components/BelajarApp"

/** Tab "Belajar" di halaman Al-Qur'an (Quran Apps). Versi khusus anak ada di /anak. */
export default function BelajarPage() {
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
        <BelajarApp variant="tab" />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}
