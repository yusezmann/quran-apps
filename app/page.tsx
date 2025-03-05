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
      <main className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 hidden xl:block">
            <SurahList />
          </div>
          <div className="lg:col-span-3 mb-24">
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
