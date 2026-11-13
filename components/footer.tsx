"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { Download, Github, Globe } from "lucide-react"

const AUTHOR = "Usman"
const PORTFOLIO_URL = "https://usman-nine.vercel.app/"
const REPO_URL = "https://github.com/yusezmann/quran-apps"
// Diisi saat build APK di GitHub Actions (android-build.yml); kosong di build lokal
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION
// Link tetap GitHub yang selalu mengarah ke APK di Release terbaru
// (file "quran-apps.apk" dilampirkan di setiap Release oleh android-build.yml)
const APK_URL = `${REPO_URL}/releases/latest/download/quran-apps.apk`
const LATEST_RELEASE_API = "https://api.github.com/repos/yusezmann/quran-apps/releases/latest"
const RELEASE_CACHE_KEY = "quran-apps:latest-apk"
const RELEASE_CACHE_MS = 6 * 60 * 60 * 1000 // 6 jam (API GitHub dibatasi 60 permintaan/jam per IP)

/**
 * Versi APK terbaru dari GitHub Releases (mis. "1.1.19"), agar tombol unduh di web
 * menampilkan versi yang benar-benar akan terunduh. Di-cache di localStorage.
 */
function useLatestApkVersion(enabled: boolean): string | null {
  const [version, setVersion] = useState<string | null>(null)
  useEffect(() => {
    if (!enabled) return
    try {
      const cached = JSON.parse(localStorage.getItem(RELEASE_CACHE_KEY) ?? "null")
      if (cached && Date.now() - cached.at < RELEASE_CACHE_MS) {
        setVersion(cached.version)
        return
      }
    } catch {
      // abaikan cache rusak
    }
    let cancelled = false
    fetch(LATEST_RELEASE_API, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const tag = typeof data?.tag_name === "string" ? data.tag_name.replace(/^v/, "") : null
        if (!tag || cancelled) return
        setVersion(tag)
        try {
          localStorage.setItem(RELEASE_CACHE_KEY, JSON.stringify({ version: tag, at: Date.now() }))
        } catch {
          // storage diblokir: abaikan
        }
      })
      .catch(() => {}) // tanpa versi pun tombol tetap berfungsi
    return () => {
      cancelled = true
    }
  }, [enabled])
  return version
}

export function Footer() {
  // Tombol unduh tidak relevan jika halaman dibuka dari dalam aplikasi Android itu sendiri
  const [isNativeApp, setIsNativeApp] = useState(false)
  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform())
  }, [])
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const apkVersion = useLatestApkVersion(mounted && !isNativeApp)

  // Di aplikasi Android: tanpa footer ala situs web, cukup nama aplikasi + versi
  if (isNativeApp) {
    return (
      <p className="px-4 pt-2 pb-24 text-center text-xs text-gray-400">
        Al Quran{APP_VERSION && ` v${APP_VERSION}`}
      </p>
    )
  }

  return (
    // pb ekstra di mobile/tablet agar tidak tertutup navigasi bawah
    <footer className="bg-[#010511] text-gray-400 pt-8 pb-28 xl:py-6 border-t border-gray-800 px-4 mt-auto">
      <div className="container mx-auto flex flex-col xl:flex-row items-center justify-between text-center xl:text-left gap-5">
        {/* Logo & Nama */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold hover:text-green-300"
        >
          <Image
            src="/assets/logo/logo.png"
            alt="Logo Al Quran"
            width={40}
            height={40}
          />
          <span className="text-lg md:text-xl text-white">Al Quran</span>
        </Link>

        {!isNativeApp && (
          <a
            href={APK_URL}
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            rel="noopener"
          >
            <Download className="h-4 w-4" />
            Unduh Aplikasi Android
            <span className="font-normal text-green-100">(APK{apkVersion && ` v${apkVersion}`})</span>
          </a>
        )}

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-sm">
          <p>
            © {new Date().getFullYear()} Dibuat oleh{" "}
            <span className="text-gray-200 font-medium">{AUTHOR}</span>
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green-300 hover:text-green-200 transition-colors"
            >
              <Globe className="h-4 w-4" /> Portofolio
            </Link>
            <Link
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green-300 hover:text-green-200 transition-colors"
            >
              <Github className="h-4 w-4" /> Kode Sumber
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
