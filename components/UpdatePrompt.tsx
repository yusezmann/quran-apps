"use client"

import { useEffect, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { Download, Sparkles } from "lucide-react"
import { isNewer } from "@/lib/app-version"

/** Versi APK yang terpasang (diisi saat build APK di GitHub Actions; kosong di build lokal/web). */
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION
const LATEST_RELEASE_API = "https://api.github.com/repos/yusezmann/quran-apps/releases/latest"
const APK_URL = "https://github.com/yusezmann/quran-apps/releases/latest/download/quran-apps.apk"
const CHECK_KEY = "quran-apps:update-check"
const DISMISS_KEY = "quran-apps:update-dismissed"
/** Cek paling sering tiap 3 jam (API GitHub dibatasi 60 permintaan/jam per IP). */
const CHECK_EVERY_MS = 3 * 60 * 60 * 1000
/** "Nanti saja" menyembunyikan versi yang sama selama 1 hari. */
const SNOOZE_MS = 24 * 60 * 60 * 1000

const read = <T,>(key: string): T | null => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as T | null
  } catch {
    return null
  }
}
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage diblokir: abaikan
  }
}

/** Versi terbaru di GitHub Releases (pakai simpanan bila baru dicek). */
async function latestVersion(): Promise<string | null> {
  const cached = read<{ version: string; at: number }>(CHECK_KEY)
  if (cached && Date.now() - cached.at < CHECK_EVERY_MS) return cached.version
  const res = await fetch(LATEST_RELEASE_API, { headers: { Accept: "application/vnd.github+json" } })
  if (!res.ok) return cached?.version ?? null
  const data = (await res.json()) as { tag_name?: string }
  const version = data.tag_name?.replace(/^v/, "") ?? null
  if (version) write(CHECK_KEY, { version, at: Date.now() })
  return version
}

/**
 * Pop-up "versi baru tersedia" di aplikasi Android (APK dari GitHub Releases, bukan Play Store).
 * Dicek saat aplikasi dibuka & saat kembali dari latar belakang. "Perbarui" membuka unduhan APK di browser HP,
 * lalu pengguna menekan Instal (Android tidak mengizinkan pembaruan otomatis di luar Play Store).
 */
export default function UpdatePrompt() {
  const [latest, setLatest] = useState<string | null>(null)

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !APP_VERSION) return
    const current = APP_VERSION
    const check = () =>
      latestVersion()
        .then((v) => {
          if (!v || !isNewer(v, current)) return
          const snoozed = read<{ version: string; at: number }>(DISMISS_KEY)
          if (snoozed?.version === v && Date.now() - snoozed.at < SNOOZE_MS) return
          setLatest(v)
        })
        .catch(() => {}) // tanpa internet: coba lagi nanti
    check()
    const onVisible = () => document.visibilityState === "visible" && check()
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [])

  if (!latest) return null

  const later = () => {
    write(DISMISS_KEY, { version: latest, at: Date.now() })
    setLatest(null)
  }
  const update = () => {
    write(DISMISS_KEY, { version: latest, at: Date.now() }) // jangan muncul lagi saat kembali dari browser
    setLatest(null)
    // Capacitor membuka alamat di luar aplikasi dengan browser HP → APK terunduh
    window.location.href = APK_URL
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="update-title">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center text-gray-900 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Sparkles className="h-7 w-7 text-green-700" />
        </div>
        <h2 id="update-title" className="mt-3 text-xl font-bold">
          Versi baru tersedia
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Al Quran <b>v{latest}</b> sudah tersedia (terpasang: v{APP_VERSION}). Berisi fitur & perbaikan terbaru.
        </p>
        <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs leading-snug text-gray-500">
          Setelah unduhan selesai, buka file APK lalu tekan <b>Instal</b>. Data Anda (bacaan terakhir, pengaturan adzan,
          progres belajar) tetap aman.
        </p>
        <button
          type="button"
          onClick={update}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
        >
          <Download className="h-5 w-5" /> Perbarui sekarang
        </button>
        <button type="button" onClick={later} className="mt-2 w-full rounded-full py-2.5 font-semibold text-gray-500 hover:bg-gray-50">
          Nanti saja
        </button>
      </div>
    </div>
  )
}
