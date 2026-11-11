import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"
import { ADZAN_SOUNDS } from "./settings"
import type { AdzanEvent } from "./schedule"

/**
 * Notifikasi adzan native (APK Android) lewat @capacitor/local-notifications.
 * Dijadwalkan di sistem Android, sehingga tetap berbunyi walau aplikasi ditutup / layar mati.
 */
export const isNativeApp = () => Capacitor.isNativePlatform()

const REMINDER_CHANNEL = "pengingat_sholat"
/** Jumlah hari ke depan yang dijadwalkan (diperbarui setiap aplikasi dibuka). */
export const NATIVE_DAYS_AHEAD = 7

let channelsReady = false
async function ensureChannels() {
  if (channelsReady || Capacitor.getPlatform() !== "android") return
  for (const sound of Object.values(ADZAN_SOUNDS)) {
    await LocalNotifications.createChannel({
      id: sound.channelId,
      name: sound.label,
      description: "Suara adzan saat masuk waktu sholat",
      sound: sound.raw,
      importance: 5,
      visibility: 1,
      vibration: true,
    })
  }
  await LocalNotifications.createChannel({
    id: REMINDER_CHANNEL,
    name: "Pengingat sebelum sholat",
    description: "Pengingat beberapa menit sebelum waktu sholat",
    importance: 4,
    visibility: 1,
  })
  channelsReady = true
}

export async function requestNativePermission(): Promise<boolean> {
  const current = await LocalNotifications.checkPermissions()
  if (current.display === "granted") return true
  const result = await LocalNotifications.requestPermissions()
  return result.display === "granted"
}

/** Android 12+: alarm tepat waktu bisa dimatikan pengguna; tanpa itu adzan bisa terlambat beberapa menit. */
export async function exactAlarmStatus(): Promise<"granted" | "denied" | "unknown"> {
  try {
    const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting()
    return exact_alarm === "granted" ? "granted" : "denied"
  } catch {
    return "unknown"
  }
}

export async function openExactAlarmSetting() {
  try {
    await LocalNotifications.changeExactNotificationSetting()
  } catch {
    // tidak didukung di versi Android ini
  }
}

/** Ganti seluruh jadwal notifikasi adzan dengan daftar baru. */
export async function scheduleNativeAdzan(events: AdzanEvent[]) {
  await ensureChannels()

  const pending = await LocalNotifications.getPending()
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) })
  }
  if (!events.length) return

  await LocalNotifications.schedule({
    notifications: events.map((e) => ({
      id: e.id,
      title: e.title,
      body: e.body,
      schedule: { at: e.at, allowWhileIdle: true },
      channelId: e.sound ? ADZAN_SOUNDS[e.sound].channelId : REMINDER_CHANNEL,
      sound: e.sound ? ADZAN_SOUNDS[e.sound].raw : undefined,
      smallIcon: "ic_stat_adzan",
      autoCancel: true,
      extra: { prayer: e.prayer, kind: e.kind },
    })),
  })
}
