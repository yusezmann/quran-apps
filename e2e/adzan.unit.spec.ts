import { test, expect } from "@playwright/test"
import { buildAdzanEvents, dueEvents, toDateTime, type DayTimes } from "../lib/adzan/schedule"
import { DEFAULT_ADZAN_SETTINGS, type AdzanSettings } from "../lib/adzan/settings"

const day = (date: string): DayTimes => ({
  date,
  subuh: "04:06",
  dzuhur: "11:40",
  ashar: "14:59",
  maghrib: "17:51",
  isya: "19:04",
})
const on: AdzanSettings = { ...DEFAULT_ADZAN_SETTINGS, enabled: true }

test("waktu sholat tepat di detik & milidetik nol (akar bug lama)", () => {
  const t = toDateTime("2026-11-11", "17:51")
  expect([t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds()]).toEqual([17, 51, 0, 0])
})

test("tidak ada event bila adzan dimatikan", () => {
  expect(buildAdzanEvents([day("2026-11-11")], DEFAULT_ADZAN_SETTINGS, new Date(2026, 10, 11, 0, 0))).toEqual([])
})

test("Subuh memakai suara Adzan Subuh, lainnya suara pilihan", () => {
  const events = buildAdzanEvents([day("2026-11-11")], { ...on, sound: "mesir" }, new Date(2026, 10, 11, 0, 0))
  expect(events.map((e) => [e.prayer, e.sound])).toEqual([
    ["subuh", "subuh"],
    ["dzuhur", "mesir"],
    ["ashar", "mesir"],
    ["maghrib", "mesir"],
    ["isya", "mesir"],
  ])
})

test("hanya waktu yang diaktifkan, hanya yang akan datang, terurut, ID unik", () => {
  const settings = { ...on, prayers: { ...on.prayers, ashar: false }, reminderMinutes: 10 as const }
  const events = buildAdzanEvents([day("2026-11-11"), day("2026-11-12")], settings, new Date(2026, 10, 11, 12, 0))
  expect(events.some((e) => e.prayer === "ashar")).toBe(false)
  expect(events.every((e) => e.at > new Date(2026, 10, 11, 12, 0))).toBe(true)
  expect(events.map((e) => e.at.getTime())).toEqual([...events.map((e) => e.at.getTime())].sort((a, b) => a - b))
  expect(new Set(events.map((e) => e.id)).size).toBe(events.length)
  const reminder = events.find((e) => e.kind === "reminder" && e.prayer === "maghrib")!
  expect(reminder.at.getHours() * 60 + reminder.at.getMinutes()).toBe(17 * 60 + 41)
  expect(reminder.sound).toBeNull()
})

test("event jatuh tempo: terlambat <2 menit tetap diputar, >2 menit diabaikan, sekali saja", () => {
  const events = buildAdzanEvents([day("2026-11-11")], on, new Date(2026, 10, 11, 17, 0))
  const maghrib = (s: number) => new Date(2026, 10, 11, 17, 51, s)
  expect(dueEvents(events, new Date(2026, 10, 11, 17, 50, 59), new Set())).toHaveLength(0)
  expect(dueEvents(events, maghrib(0), new Set()).map((e) => e.prayer)).toEqual(["maghrib"])
  expect(dueEvents(events, new Date(2026, 10, 11, 17, 52, 30), new Set())).toHaveLength(1) // timer terlambat 90 detik
  expect(dueEvents(events, new Date(2026, 10, 11, 17, 54, 0), new Set())).toHaveLength(0) // sudah lama lewat
  expect(dueEvents(events, maghrib(5), new Set([events.find((e) => e.prayer === "maghrib")!.key]))).toHaveLength(0)
})
