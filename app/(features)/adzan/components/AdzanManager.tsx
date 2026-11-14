"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { LocalNotifications } from "@capacitor/local-notifications"
import { buildAdzanEvents, dueEvents, type AdzanEvent } from "@/lib/adzan/schedule"
import { useAdzanSettings, useAdzanUi, type Prayer } from "@/lib/adzan/settings"
import { onAdzanEnded, playAdzanSound } from "@/lib/adzan/player"
import { NATIVE_DAYS_AHEAD, isNativeApp, scheduleNativeAdzan } from "@/lib/adzan/native"
import { useUpcomingDays } from "../hooks/useUpcomingDays"

/** Toleransi keterlambatan timer (tab latar belakang dibatasi browser hingga ~1x/menit). */
const GRACE_MS = 2 * 60_000
const FIRED_KEY = "quran-apps:adzan-fired"

function loadFired(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(FIRED_KEY) ?? "[]"))
  } catch {
    return new Set()
  }
}
function saveFired(fired: Set<string>) {
  try {
    // simpan secukupnya (event terakhir) agar reload halaman tidak memutar ulang adzan yang sama
    sessionStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(fired).slice(-20)))
  } catch {
    // abaikan
  }
}

function showBrowserNotification(event: AdzanEvent) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return
  try {
    new Notification(event.title, { body: event.body, icon: "/assets/icons/icon-192.png", tag: event.key })
  } catch {
    // beberapa browser mobile hanya mengizinkan notifikasi lewat service worker
  }
}

/**
 * Penjadwal adzan untuk seluruh aplikasi (dipasang sekali di layout).
 *
 * - Web: memutar adzan di tab selama aplikasi terbuka + notifikasi browser. Waktu dicek ulang
 *   setiap tick & saat tab kembali aktif, dengan toleransi keterlambatan (bukan mencocokkan
 *   detik "00:00:00" yang bisa terlewat).
 * - APK: menjadwalkan notifikasi native 7 hari ke depan (tetap berbunyi walau aplikasi ditutup).
 */
export default function AdzanManager() {
  const settings = useAdzanSettings()
  const setActive = useAdzanUi((s) => s.setActive)
  const [native] = useState(isNativeApp)
  const { city, days } = useUpcomingDays(native ? NATIVE_DAYS_AHEAD : 1, settings.enabled)

  const settingsKey = JSON.stringify({
    enabled: settings.enabled,
    prayers: settings.prayers,
    sound: settings.sound,
    reminderMinutes: settings.reminderMinutes,
    ignoreSilent: settings.ignoreSilent,
  })

  // ---- APK: jadwalkan notifikasi native setiap jadwal/pengaturan berubah ----
  // Dijadwal ulang juga saat aplikasi kembali ke depan (mis. setelah memberi izin di Pengaturan
  // Android, atau setelah update aplikasi yang menghapus alarm lama).
  const [resumeTick, setResumeTick] = useState(0)
  useEffect(() => {
    if (!native) return
    const onVisible = () => document.visibilityState === "visible" && setResumeTick((t) => t + 1)
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [native])

  useEffect(() => {
    if (!native) return
    // Jeda singkat: jadwal bulan ini & bulan depan tiba bergantian — cukup satu penjadwalan.
    // Saat adzan aktif tapi data belum ada (masih memuat / offline), jangan hapus jadwal lama.
    if (settings.enabled && days.length === 0) return
    const timer = window.setTimeout(() => {
      const events = buildAdzanEvents(days, settings, new Date())
      scheduleNativeAdzan(events, { ignoreSilent: settings.ignoreSilent }).catch(() => {})
    }, 800)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native, days, settingsKey, city.id, resumeTick])

  // APK di latar depan: tampilkan banner saat notifikasi adzan masuk (suara dari notifikasi)
  useEffect(() => {
    if (!native) return
    const handle = LocalNotifications.addListener("localNotificationReceived", (n) => {
      const extra = n.extra as { prayer?: Prayer; kind?: string } | undefined
      if (extra?.kind === "adzan" && extra.prayer) setActive({ prayer: extra.prayer, blocked: false })
    }).catch((e) => {
      console.error("Listener notifikasi adzan gagal dipasang:", e)
      return null
    })
    return () => {
      handle.then((h) => h?.remove())
    }
  }, [native, setActive])

  // ---- Web: putar adzan di tab ----
  const events = useMemo(
    () => (native ? [] : buildAdzanEvents(days, settings, new Date(Date.now() - GRACE_MS))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [native, days, settingsKey],
  )
  const firedRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    firedRef.current = loadFired()
  }, [])

  useEffect(() => {
    if (native || !events.length) return

    const fire = async (event: AdzanEvent) => {
      firedRef.current.add(event.key)
      saveFired(firedRef.current)
      showBrowserNotification(event)

      if (event.kind === "reminder") {
        toast.info(event.title, { description: event.body, duration: 60_000, closeButton: true })
        return
      }
      const result = await playAdzanSound(event.sound!)
      setActive({ prayer: event.prayer, blocked: result !== "playing" })
    }

    const check = () => {
      for (const event of dueEvents(events, new Date(), firedRef.current, GRACE_MS)) fire(event)
    }

    // Timer presisi ke event berikutnya + pengecekan berkala sebagai cadangan
    let timeout: number | undefined
    const scheduleNext = () => {
      window.clearTimeout(timeout)
      const next = events.find((e) => !firedRef.current.has(e.key) && e.at.getTime() > Date.now())
      if (next) {
        const delay = Math.min(next.at.getTime() - Date.now() + 50, 2 ** 31 - 1)
        timeout = window.setTimeout(() => {
          check()
          scheduleNext()
        }, delay)
      }
    }

    check()
    scheduleNext()
    const interval = window.setInterval(check, 15_000)
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        check()
        scheduleNext()
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [native, events, setActive])

  // Tutup banner otomatis saat adzan selesai
  useEffect(() => onAdzanEnded(() => setActive(null)), [setActive])

  return null
}
