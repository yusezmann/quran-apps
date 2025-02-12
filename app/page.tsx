"use client"

import Header from "@/components/header"
import SurahList from "@/components/surah-list"
import QuranReader from "@/components/quran-reader"
import PrayerTimeComponent from "@/components/prayer-times"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <PrayerTimeComponent />
      <main className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 hidden xl:block">
            <SurahList />
          </div>
          <div className="lg:col-span-3">
            <QuranReader />
          </div>
        </div>
      </main>
    </div>
  )
}
