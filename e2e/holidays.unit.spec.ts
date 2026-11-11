import { test, expect } from "@playwright/test"
import { estimateHolidays, getHolidays, getNextHoliday, easterSunday } from "../lib/holidays"
import { OFFICIAL_HOLIDAYS } from "../lib/holidays/official"
import { toLocalISODate } from "../lib/hijri"

// Libur yang memang tidak diperkirakan (kalender Saka/Buddha/Tionghoa)
const NOT_ESTIMATED = /Imlek|Nyepi|Waisak/

const ISLAMIC = /Isra|Idulfitri|Iduladha|Muharam|Maulid/
const dayDiff = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / 86_400_000)

for (const year of [2026, 2027]) {
  test(`perkiraan libur ${year}: tanggal tetap & Kristen tepat, libur Islam meleset maks. ±1 hari`, () => {
    const estimated = estimateHolidays(year)
    const problems = OFFICIAL_HOLIDAYS[year]
      .filter((h) => h.kind === "libur" && !NOT_ESTIMATED.test(h.name))
      .filter((h) => {
        const tolerance = ISLAMIC.test(h.name) ? 1 : 0
        const key = h.name.split(" ")[0] // "Idulfitri", "Wafat", "Isra", dst.
        return !estimated.some((e) => e.name.startsWith(key) && Math.abs(dayDiff(e.date, h.date)) <= tolerance)
      })
      .map((h) => `${h.date} ${h.name}`)
    expect(problems).toEqual([])
  })
}

test("Paskah dihitung benar", () => {
  expect(toLocalISODate(easterSunday(2026))).toBe("2026-04-05")
  expect(toLocalISODate(easterSunday(2027))).toBe("2027-03-28")
  expect(toLocalISODate(easterSunday(2030))).toBe("2030-04-21")
})

test("tahun dengan SKB memakai data resmi; tahun lain ditandai perkiraan", () => {
  expect(getHolidays(2026).every((h) => !h.estimated)).toBe(true)
  expect(getHolidays(2026).filter((h) => h.kind === "cuti")).toHaveLength(8)
  expect(getHolidays(2030).every((h) => h.estimated)).toBe(true)
})

test("libur berikutnya", () => {
  expect(getNextHoliday(new Date(2026, 10, 11))?.date).toBe("2026-12-25")
  expect(getNextHoliday(new Date(2026, 11, 26))?.date).toBe("2027-01-01")
})
