"use client"

import { BellRing, Play, Square, X } from "lucide-react"
import { LocalNotifications } from "@capacitor/local-notifications"
import { PRAYER_LABEL, soundFor, useAdzanSettings, useAdzanUi } from "@/lib/adzan/settings"
import { playAdzanSound, stopAdzanSound } from "@/lib/adzan/player"
import { isNativeApp } from "@/lib/adzan/native"

/** Banner saat masuk waktu sholat: hentikan adzan, atau putar manual bila browser memblokir autoplay. */
export default function AdzanBanner() {
  const active = useAdzanUi((s) => s.active)
  const setActive = useAdzanUi((s) => s.setActive)
  const sound = useAdzanSettings((s) => s.sound)
  if (!active) return null

  const label = PRAYER_LABEL[active.prayer]

  const stop = () => {
    stopAdzanSound()
    // Di APK, menutup notifikasi juga menghentikan suaranya
    if (isNativeApp()) LocalNotifications.removeAllDeliveredNotifications().catch(() => {})
    setActive(null)
  }

  const playManually = async () => {
    const result = await playAdzanSound(soundFor(active.prayer, { sound }))
    setActive({ prayer: active.prayer, blocked: result !== "playing" })
  }

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-24 z-[60] mx-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 p-4 text-white shadow-2xl ring-1 ring-white/20"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
          <BellRing className="h-6 w-6 animate-pulse" />
        </div>
        <div className="flex-1 leading-snug">
          <p className="font-bold">Waktu {label} telah tiba</p>
          <p className="text-sm text-white/85">
            {active.blocked ? "Ketuk “Putar adzan” untuk mendengarkan adzan" : "Adzan sedang berkumandang"}
          </p>
        </div>
        {active.blocked ? (
          <button
            type="button"
            onClick={playManually}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
          >
            <Play className="h-4 w-4" /> Putar adzan
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
          >
            <Square className="h-4 w-4" /> Hentikan
          </button>
        )}
        {active.blocked && (
          <button type="button" onClick={stop} aria-label="Tutup" className="rounded-full p-1 text-white/80 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
