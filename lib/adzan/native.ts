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

export type NativeScheduleStatus =
  | { state: "idle" }
  | { state: "scheduled"; count: number; next: { title: string; at: string } | null; exact: boolean }
  | { state: "no-permission" }
  | { state: "error"; message: string }

/** Status penjadwalan terakhir, ditampilkan di Pengaturan Adzan (diagnostik untuk pengguna). */
let lastStatus: NativeScheduleStatus = { state: "idle" }
const statusListeners = new Set<(s: NativeScheduleStatus) => void>()
const setStatus = (s: NativeScheduleStatus) => {
  lastStatus = s
  statusListeners.forEach((cb) => cb(s))
}
export const getNativeStatus = () => lastStatus
export function onNativeStatus(cb: (s: NativeScheduleStatus) => void): () => void {
  statusListeners.add(cb)
  return () => {
    statusListeners.delete(cb)
  }
}

/** ID < 1000 dicadangkan untuk notifikasi uji; tidak ikut dibersihkan saat menjadwal ulang. */
const TEST_NOTIFICATION_ID = 1

/**
 * Antrian: panggilan schedule() tidak boleh tumpang tindih. Sebelumnya dua panggilan berdekatan
 * (jadwal bulan ini & bulan depan tiba bergantian) bisa saling membatalkan.
 */
let queue: Promise<unknown> = Promise.resolve()

/** Ganti seluruh jadwal notifikasi adzan dengan daftar baru (diserialisasi). */
export function scheduleNativeAdzan(events: AdzanEvent[]): Promise<void> {
  const run = queue.then(() => doSchedule(events))
  queue = run.catch(() => {})
  return run
}

async function doSchedule(events: AdzanEvent[]) {
  try {
    const permission = await LocalNotifications.checkPermissions()
    if (permission.display !== "granted") {
      // Jangan menjadwalkan diam-diam tanpa izin: plugin akan menolak / memunculkan dialog sendiri
      if (events.length) setStatus({ state: "no-permission" })
      return
    }

    await ensureChannels()

    // PENTING: jangan biarkan plugin membuka layar "Alarm & pengingat" otomatis di setiap
    // penjadwalan (perilaku default plugin di Android 12+ bila izin alarm tepat belum ada).
    // Dulu hal ini membuat penjadwalan menggantung / gagal setelah jadwal lama terlanjur dibatalkan.
    // Jika izin belum ada, jadwalkan sebagai alarm biasa dan tampilkan tombol "Izinkan" di pengaturan.
    const exact = (await exactAlarmStatus()) !== "denied"

    const pending = await LocalNotifications.getPending()
    const newIds = new Set(events.map((e) => e.id))

    // 1) Jadwalkan dulu (ID sama menimpa jadwal lama), 2) baru bersihkan yang sudah tidak dipakai.
    //    Urutan ini memastikan jadwal tidak pernah kosong bila langkah penjadwalan gagal.
    if (events.length) {
      await LocalNotifications.schedule({
        notifications: events.map((e) => ({
          id: e.id,
          title: e.title,
          body: e.body,
          schedule: { at: e.at, allowWhileIdle: true },
          isExactNotification: exact,
          channelId: e.sound ? ADZAN_SOUNDS[e.sound].channelId : REMINDER_CHANNEL,
          sound: e.sound ? ADZAN_SOUNDS[e.sound].raw : undefined,
          smallIcon: "ic_stat_adzan",
          autoCancel: true,
          extra: { prayer: e.prayer, kind: e.kind },
        })),
      })
    }

    const stale = pending.notifications.filter((n) => n.id >= 1000 && !newIds.has(n.id))
    if (stale.length) await LocalNotifications.cancel({ notifications: stale.map((n) => ({ id: n.id })) })

    const next = events[0]
    setStatus({
      state: "scheduled",
      count: events.length,
      next: next ? { title: next.title, at: next.at.toISOString() } : null,
      exact,
    })
  } catch (error: any) {
    console.error("Gagal menjadwalkan adzan:", error)
    setStatus({ state: "error", message: error?.message ?? String(error) })
    throw error
  }
}

/** Notifikasi uji 10 detik lagi dengan suara adzan pilihan — untuk memastikan notifikasi berbunyi di HP ini. */
export async function scheduleTestNotification(sound: keyof typeof ADZAN_SOUNDS): Promise<void> {
  const granted = await requestNativePermission()
  if (!granted) throw new Error("Izin notifikasi belum diberikan")
  await ensureChannels()
  await LocalNotifications.schedule({
    notifications: [
      {
        id: TEST_NOTIFICATION_ID,
        title: "Tes adzan",
        body: "Jika Anda mendengar adzan ini, notifikasi adzan berfungsi.",
        schedule: { at: new Date(Date.now() + 10_000), allowWhileIdle: true },
        isExactNotification: (await exactAlarmStatus()) !== "denied",
        channelId: ADZAN_SOUNDS[sound].channelId,
        sound: ADZAN_SOUNDS[sound].raw,
        smallIcon: "ic_stat_adzan",
        autoCancel: true,
        extra: { kind: "test" },
      },
    ],
  })
}
