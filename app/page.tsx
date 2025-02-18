"use client"

import Header from "@/components/header"
import PrayerTimeComponent from "@/app/(features)/prayer-times/components/prayer-times"
import SurahList from "./(features)/quran/components/surah-list"
import QuranReader from "./(features)/quran/components/quran-reader"

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
