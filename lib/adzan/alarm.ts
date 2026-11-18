import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core"

/**
 * Alarm adzan native (android/app/src/main/java/com/quran/apps/adzan).
 * Dipakai saat "Tetap bunyikan saat mode senyap" aktif: adzan diputar sebagai ALARM sungguhan
 * (seperti jam weker) lewat volume alarm — tidak bergantung pada suara notifikasi, yang di banyak
 * merek HP dibisukan saat senyap atau saat HP lama tertidur.
 *
 * PENTING: objek plugin Capacitor adalah Proxy; jangan pernah di-`await` atau dikembalikan dari
 * fungsi async (memicu "AdzanAlarm.then() is not implemented").
 */
export interface NativeAlarm {
  id: number
  /** waktu dalam milidetik (epoch) */
  at: number
  /** nama file di res/raw tanpa ekstensi, mis. "adzan_makkah" */
  sound: string
  title: string
  body: string
  prayer: string
}

interface AlarmStatus {
  count: number
  exact: boolean
}

interface AdzanAlarmPlugin {
  schedule(options: { alarms: NativeAlarm[] }): Promise<AlarmStatus>
  cancelAll(): Promise<void>
  stop(): Promise<void>
  test(options: { sound: string; delayMs: number; title?: string; body?: string }): Promise<AlarmStatus>
  status(): Promise<AlarmStatus>
  addListener(event: "adzanStarted" | "adzanStopped", cb: (data: { prayer: string }) => void): Promise<PluginListenerHandle>
}

const AdzanAlarm = registerPlugin<AdzanAlarmPlugin>("AdzanAlarm")

/** Plugin hanya ada di APK Android versi baru (aman dipanggil di web / APK lama: tidak melakukan apa-apa). */
export const alarmAvailable = () => Capacitor.getPlatform() === "android" && Capacitor.isPluginAvailable("AdzanAlarm")

/** "adzan_makkah.mp3" → "adzan_makkah" */
export const rawName = (file: string) => file.replace(/\.[^.]+$/, "")

export async function scheduleAlarms(alarms: NativeAlarm[]): Promise<AlarmStatus | null> {
  if (!alarmAvailable()) return null
  return AdzanAlarm.schedule({ alarms })
}

export async function cancelAlarms(): Promise<void> {
  if (!alarmAvailable()) return
  await AdzanAlarm.cancelAll()
}

export async function stopAlarm(): Promise<void> {
  if (!alarmAvailable()) return
  await AdzanAlarm.stop()
}

export async function testAlarm(sound: string, delayMs: number): Promise<void> {
  if (!alarmAvailable()) throw new Error("Alarm adzan belum tersedia di versi aplikasi ini")
  await AdzanAlarm.test({ sound, delayMs })
}

/** Dengarkan adzan mulai/berhenti (untuk banner di aplikasi). Mengembalikan fungsi pelepas. */
export function onAlarmEvents(handlers: { started: (prayer: string) => void; stopped: () => void }): () => void {
  if (!alarmAvailable()) return () => {}
  const handles = [
    AdzanAlarm.addListener("adzanStarted", (d) => handlers.started(d.prayer)),
    AdzanAlarm.addListener("adzanStopped", () => handlers.stopped()),
  ]
  return () => handles.forEach((h) => h.then((x) => x.remove()).catch(() => {}))
}
