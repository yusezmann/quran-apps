import { PRAYERS, PRAYER_LABEL, soundFor, type AdzanSettings, type AdzanSoundId, type Prayer } from "./settings"

/** Jadwal satu hari (format API myquran: date "YYYY-MM-DD", jam "HH:mm"). */
export interface DayTimes {
  date: string
  subuh: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
}

export interface AdzanEvent {
  /** ID stabil & unik (angka, untuk notifikasi native) */
  id: number
  key: string
  prayer: Prayer
  kind: "adzan" | "reminder"
  at: Date
  title: string
  body: string
  sound: AdzanSoundId | null
}

/** "2026-11-11" + "17:51" -> Date lokal 17:51:00.000 (detik & milidetik nol). */
export function toDateTime(date: string, hhmm: string): Date {
  const [y, m, d] = date.split("-").map(Number)
  const [hh, mm] = hhmm.split(":").map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

/** ID numerik stabil: YYMMDD * 100 + indeks sholat * 10 + jenis (0 adzan, 1 pengingat). */
function eventId(date: string, prayerIndex: number, kind: AdzanEvent["kind"]): number {
  const ymd = Number(date.slice(2).replace(/-/g, "")) // 261111
  return ymd * 100 + prayerIndex * 10 + (kind === "adzan" ? 0 : 1)
}

/**
 * Susun daftar adzan & pengingat yang akan datang, terurut waktu.
 * Hanya sholat yang diaktifkan; tidak ada event jika adzan dimatikan.
 */
export function buildAdzanEvents(days: DayTimes[], settings: AdzanSettings, now: Date): AdzanEvent[] {
  if (!settings.enabled) return []
  const events: AdzanEvent[] = []

  for (const day of days) {
    PRAYERS.forEach((prayer, index) => {
      if (!settings.prayers[prayer] || !day[prayer]) return
      const at = toDateTime(day.date, day[prayer])
      const label = PRAYER_LABEL[prayer]

      events.push({
        id: eventId(day.date, index, "adzan"),
        key: `${day.date}:${prayer}:adzan`,
        prayer,
        kind: "adzan",
        at,
        title: `Waktu ${label}`,
        body: `Sudah masuk waktu sholat ${label} (${day[prayer]}).`,
        sound: soundFor(prayer, settings),
      })

      if (settings.reminderMinutes > 0) {
        events.push({
          id: eventId(day.date, index, "reminder"),
          key: `${day.date}:${prayer}:reminder`,
          prayer,
          kind: "reminder",
          at: new Date(at.getTime() - settings.reminderMinutes * 60_000),
          title: `${settings.reminderMinutes} menit lagi ${label}`,
          body: `Waktu ${label} pukul ${day[prayer]}. Bersiaplah untuk sholat.`,
          sound: null,
        })
      }
    })
  }

  return events.filter((e) => e.at.getTime() > now.getTime()).sort((a, b) => a.at.getTime() - b.at.getTime())
}

/**
 * Event yang "jatuh tempo" sekarang: waktunya sudah lewat tapi belum lebih dari `graceMs`.
 * Toleransi ini menangani timer yang terlambat (tab di latar belakang dibatasi browser),
 * tanpa memutar adzan yang sudah lama lewat saat aplikasi baru dibuka.
 */
export function dueEvents(events: AdzanEvent[], now: Date, fired: Set<string>, graceMs = 2 * 60_000): AdzanEvent[] {
  const t = now.getTime()
  return events.filter((e) => !fired.has(e.key) && e.at.getTime() <= t && t - e.at.getTime() <= graceMs)
}
