import { addDays } from "date-fns"
import { getHijriParts, toLocalISODate, DEFAULT_HIJRI_OFFSET } from "../hijri"
import { OFFICIAL_HOLIDAYS, type HolidayKind } from "./official"

export type { HolidayKind } from "./official"

export interface Holiday {
  /** YYYY-MM-DD (tanggal lokal) */
  date: string
  name: string
  kind: HolidayKind
  /** true = belum ada SKB resmi untuk tahun ini, tanggal hasil perhitungan */
  estimated: boolean
}

/** Tanggal Paskah (kalender Gregorian, algoritma Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/**
 * Perkiraan libur nasional untuk tahun tanpa SKB:
 * - tanggal tetap (1 Jan, 1 Mei, 1 Jun, 17 Agu, 25 Des)
 * - libur Kristen dari tanggal Paskah
 * - libur Islam dari kalender Hijriah (koreksi yang sama dengan bagian lain aplikasi)
 * Nyepi, Waisak, Imlek dan cuti bersama TIDAK diperkirakan (tidak bisa dihitung andal).
 */
export function estimateHolidays(year: number, hijriOffset = DEFAULT_HIJRI_OFFSET): Holiday[] {
  const list: Holiday[] = []
  const add = (date: Date, name: string) =>
    list.push({ date: toLocalISODate(date), name, kind: "libur", estimated: true })

  add(new Date(year, 0, 1), `Tahun Baru ${year} Masehi`)
  add(new Date(year, 4, 1), "Hari Buruh Internasional")
  add(new Date(year, 5, 1), "Hari Lahir Pancasila")
  add(new Date(year, 7, 17), "Proklamasi Kemerdekaan")
  add(new Date(year, 11, 25), "Kelahiran Yesus Kristus (Natal)")

  const easter = easterSunday(year)
  add(addDays(easter, -2), "Wafat Yesus Kristus")
  add(easter, "Kebangkitan Yesus Kristus (Paskah)")
  add(addDays(easter, 39), "Kenaikan Yesus Kristus")

  for (let d = new Date(year, 0, 1); d.getFullYear() === year; d = addDays(d, 1)) {
    const h = getHijriParts(d, hijriOffset)
    if (h.month === 7 && h.day === 27) add(d, "Isra Mikraj Nabi Muhammad saw.")
    if (h.month === 10 && (h.day === 1 || h.day === 2)) add(d, `Idulfitri ${h.year} H`)
    if (h.month === 12 && h.day === 10) add(d, `Iduladha ${h.year} H`)
    if (h.month === 1 && h.day === 1) add(d, `1 Muharam Tahun Baru Islam ${h.year} H`)
    if (h.month === 3 && h.day === 12) add(d, "Maulid Nabi Muhammad saw.")
  }

  return list.sort((a, b) => a.date.localeCompare(b.date))
}

/** Libur satu tahun: data SKB resmi bila ada, selain itu perkiraan. */
export function getHolidays(year: number, hijriOffset = DEFAULT_HIJRI_OFFSET): Holiday[] {
  const official = OFFICIAL_HOLIDAYS[year]
  if (official) return official.map((h) => ({ ...h, estimated: false }))
  return estimateHolidays(year, hijriOffset)
}

export function hasOfficialHolidays(year: number): boolean {
  return Boolean(OFFICIAL_HOLIDAYS[year])
}

/** Peta tanggal -> daftar libur (satu tanggal bisa berisi lebih dari satu). */
export function holidaysByDate(holidays: Holiday[]): Map<string, Holiday[]> {
  const map = new Map<string, Holiday[]>()
  for (const h of holidays) map.set(h.date, [...(map.get(h.date) ?? []), h])
  return map
}

/** Libur berikutnya mulai hari ini (memeriksa tahun ini dan tahun depan). */
export function getNextHoliday(today: Date, hijriOffset = DEFAULT_HIJRI_OFFSET): Holiday | null {
  const todayIso = toLocalISODate(today)
  const year = today.getFullYear()
  const upcoming = [...getHolidays(year, hijriOffset), ...getHolidays(year + 1, hijriOffset)]
    .filter((h) => h.kind === "libur" && h.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
  return upcoming[0] ?? null
}

/* ------------------------------------------------------------------------------------------
 * Rangkaian libur: libur nasional + cuti bersama dari acara yang sama yang berdekatan
 * (mis. Idulfitri 10–11 Mar + cuti 9, 12, 15 Mar 2027 → satu rangkaian 9–15 Mar).
 * ---------------------------------------------------------------------------------------- */

export interface HolidayRange {
  key: string
  /** Nama libur nasional utama (mis. "Idulfitri 1448 H") */
  title: string
  /** YYYY-MM-DD */
  start: string
  end: string
  /** Semua tanggal merah dalam rangkaian (libur + cuti), terurut */
  dates: string[]
  liburDays: number
  cutiDays: number
  estimated: boolean
}

/** Kata kunci acara; urutan penting ("tahun baru" umum dicek paling akhir). */
const EVENT_KEYWORDS = [
  "idulfitri", "iduladha", "imlek", "nyepi", "waisak", "natal", "kenaikan", "wafat", "paskah",
  "isra", "muharam", "maulid", "buruh", "pancasila", "proklamasi", "tahun baru",
]

export function holidayEventKey(name: string): string {
  const n = name.toLowerCase()
  return EVENT_KEYWORDS.find((k) => n.includes(k)) ?? n
}

/** Selisih hari antara dua tanggal ISO. */
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)

/**
 * Gabungkan libur & cuti dari acara yang sama bila jaraknya ≤ 4 hari (menjembatani akhir pekan,
 * mis. cuti Jumat 12 → Senin 15). Acara berbeda yang bersebelahan tetap terpisah.
 */
export function groupHolidayRanges(holidays: Holiday[]): HolidayRange[] {
  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date))
  const ranges: HolidayRange[] = []
  for (const h of sorted) {
    const key = holidayEventKey(h.name)
    const last = [...ranges].reverse().find((r) => r.key === key)
    if (last && daysBetween(last.end, h.date) <= 4) {
      if (!last.dates.includes(h.date)) last.dates.push(h.date)
      last.end = h.date > last.end ? h.date : last.end
      if (h.kind === "libur") {
        last.liburDays += 1
        if (last.title.startsWith("Cuti bersama")) last.title = h.name
      } else last.cutiDays += 1
      last.estimated ||= h.estimated
      continue
    }
    ranges.push({
      key,
      title: h.name,
      start: h.date,
      end: h.date,
      dates: [h.date],
      liburDays: h.kind === "libur" ? 1 : 0,
      cutiDays: h.kind === "cuti" ? 1 : 0,
      estimated: h.estimated,
    })
  }
  return ranges.sort((a, b) => a.start.localeCompare(b.start))
}

/** Rangkaian yang memuat tanggal tertentu. */
export function findHolidayRange(ranges: HolidayRange[], date: string): HolidayRange | undefined {
  return ranges.find((r) => r.dates.includes(date))
}

const SHORT_NAMES: Record<string, string> = {
  idulfitri: "Idulfitri", iduladha: "Iduladha", imlek: "Imlek", nyepi: "Nyepi", waisak: "Waisak",
  natal: "Natal", kenaikan: "Kenaikan Yesus Kristus", wafat: "Wafat Yesus Kristus", paskah: "Paskah",
  isra: "Isra Mikraj", muharam: "Tahun Baru Islam", maulid: "Maulid Nabi", buruh: "Hari Buruh",
  pancasila: "Hari Lahir Pancasila", proklamasi: "HUT RI", "tahun baru": "Tahun Baru Masehi",
}

/** Nama pendek untuk chip/kartu, mis. "Kelahiran Yesus Kristus (Natal)" → "Natal". */
export function shortHolidayName(name: string): string {
  return SHORT_NAMES[holidayEventKey(name)] ?? name
}
