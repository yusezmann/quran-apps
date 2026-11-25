"use client"

import { useEffect, useRef, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { Download, Sparkles } from "lucide-react"
import { isNewer } from "@/lib/app-version"
import { downloadUpdate, inAppUpdateAvailable, installUpdate } from "@/lib/app-updater"

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
 * Dicek saat aplikasi dibuka & saat kembali dari latar belakang. "Perbarui" mengunduh APK DI DALAM aplikasi
 * (dengan bilah kemajuan) lalu membuka layar pemasangan Android; pengguna cukup menekan "Update"
 * (Android tidak mengizinkan pembaruan tanpa konfirmasi di luar Play Store).
 * APK lama tanpa plugin pengunduh: cadangan lewat browser HP.
 */
export default function UpdatePrompt() {
  const [latest, setLatest] = useState<string | null>(null)
  const [phase, setPhase] = useState<"ask" | "downloading" | "permission" | "error">("ask")
  const [percent, setPercent] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const install = async () => {
    try {
      const { needsPermission } = await installUpdate()
      setPhase(needsPermission ? "permission" : "ask")
      if (!needsPermission) setLatest(null) // layar pemasangan Android sudah terbuka
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e))
      setPhase("error")
    }
  }

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
    const onVisible = () => {
      if (document.visibilityState !== "visible") return
      // Kembali dari layar izin "instal aplikasi tidak dikenal" → langsung lanjut memasang
      if (phaseRef.current === "permission") install()
      else if (phaseRef.current === "ask") check()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!latest) return null

  const later = () => {
    write(DISMISS_KEY, { version: latest, at: Date.now() })
    setLatest(null)
    setPhase("ask")
  }

  const update = async () => {
    if (!inAppUpdateAvailable()) {
      // APK lama: buka unduhan di browser HP (Capacitor membuka alamat luar dengan browser)
      write(DISMISS_KEY, { version: latest, at: Date.now() })
      setLatest(null)
      window.location.href = APK_URL
      return
    }
    setPercent(0)
    setPhase("downloading")
    try {
      await downloadUpdate(APK_URL, setPercent)
      await install()
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e))
      setPhase("error")
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="update-title">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center text-gray-900 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Sparkles className="h-7 w-7 text-green-700" />
        </div>
        <h2 id="update-title" className="mt-3 text-xl font-bold">
          {phase === "downloading" ? "Mengunduh pembaruan…" : "Versi baru tersedia"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Al Quran <b>v{latest}</b> sudah tersedia (terpasang: v{APP_VERSION}). Berisi fitur & perbaikan terbaru.
        </p>

        {phase === "downloading" && (
          <div className="mt-4">
            <div className="h-3 overflow-hidden rounded-full bg-green-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-green-800">{percent}%</p>
            <p className="mt-1 text-xs text-gray-500">Setelah selesai, tekan <b>Update</b> di layar Android.</p>
          </div>
        )}

        {phase === "permission" && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm leading-snug text-amber-900">
            Sekali saja: aktifkan <b>Izinkan dari sumber ini</b> untuk Quran Apps, lalu kembali ke aplikasi. Pemasangan akan
            berlanjut otomatis.
          </p>
        )}

        {phase === "error" && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm leading-snug text-red-800">
            Pembaruan gagal ({errorMsg}). Periksa internet lalu coba lagi.
          </p>
        )}

        {phase === "ask" && (
          <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs leading-snug text-gray-500">
            Data Anda (bacaan terakhir, pengaturan adzan, progres belajar) tetap aman.
          </p>
        )}

        {phase !== "downloading" && (
          <>
            <button
              type="button"
              onClick={phase === "permission" ? install : update}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
            >
              <Download className="h-5 w-5" />
              {phase === "permission" ? "Lanjutkan pemasangan" : phase === "error" ? "Coba lagi" : "Perbarui sekarang"}
            </button>
            <button type="button" onClick={later} className="mt-2 w-full rounded-full py-2.5 font-semibold text-gray-500 hover:bg-gray-50">
              Nanti saja
            </button>
          </>
        )}
      </div>
    </div>
  )
}
