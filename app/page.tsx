"use client"

import Header from "@/components/Header"
import PrayerTimeComponent from "@/app/(features)/prayer-times"
import SurahList from "./(features)/quran/components/surah-list"
import QuranReader from "./(features)/quran/components/QuranReader"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <PrayerTimeComponent />
      <main className="container mx-auto px-4 xl:px-0 pt-2 xl:pt-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Daftar surah menempel saat halaman di-scroll */}
          <aside className="hidden xl:block xl:col-span-1">
            <div className="sticky top-28">
              <SurahList />
            </div>
          </aside>
          <div className="xl:col-span-3 mb-28 xl:mb-16">
            <QuranReader />
          </div>
        </div>
      </main>
      <div className="hidden xl:block">
        <Footer />
      </div>
    </div>
  )
}
