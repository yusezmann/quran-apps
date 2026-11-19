"use client"

import { useEffect } from "react"
import BelajarApp from "@/app/(features)/quran/belajar/components/BelajarApp"
import { RECORDED_AUDIO } from "@/lib/belajar/recorded-audio"
import KidBackground from "./KidBackground"

/**
 * Beranda aplikasi anak "Belajar Mengaji" (/anak).
 * Tanpa menu orang dewasa; latar hijau-biru ceria; bisa dipakai tanpa internet setelah dibuka sekali
 * (kecuali hafalan surat yang memutar audio qari dari internet).
 */
export default function AnakPage() {
  useEffect(() => {
    registerOfflineSupport()
  }, [])

  return (
    <div className="relative min-h-screen select-none overflow-x-hidden bg-teal-600 [-webkit-tap-highlight-color:transparent]">
      <KidBackground />

      <header className="relative z-10 px-4 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))] text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Belajar Mengaji</p>
        <h1 className="mt-1 text-3xl font-bold drop-shadow sm:text-4xl">Assalamu&apos;alaikum! 👋</h1>
        <p className="mt-1 text-white/90">Ayo belajar & bermain hari ini</p>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 landscape:max-w-5xl pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <BelajarApp variant="kid" />
      </main>
    </div>
  )
}

/**
 * Service worker (lihat public/anak-sw.js): menyimpan halaman, kode, font, dan semua suara huruf
 * di perangkat agar pelajaran & game tetap jalan tanpa internet. Hanya di build produksi
 * (di mode pengembangan file kode tidak bernama unik sehingga bisa tersimpan versi lama).
 */
function registerOfflineSupport() {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return
  navigator.serviceWorker
    .register("/anak-sw.js", { scope: "/anak" })
    .then(() => navigator.serviceWorker.ready)
    .then((reg) => {
      const loaded = performance
        .getEntriesByType("resource")
        .map((e) => e.name)
        .filter((u) => u.startsWith(location.origin) && /\/_next\/static\//.test(u))
      const audio = Array.from(RECORDED_AUDIO).map((id) => `/assets/belajar/audio/${id}.mp3`)
      reg.active?.postMessage({ type: "precache", urls: [...loaded, ...audio] })
    })
    .catch(() => {
      // tanpa dukungan offline pun aplikasi tetap berjalan
    })
}
