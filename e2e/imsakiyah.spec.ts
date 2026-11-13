import { test, expect, type Page } from "@playwright/test"

test.use({ viewport: { width: 1366, height: 900 } })

/** Wadah antd Select yang bisa diklik (input #id di dalamnya tersembunyi). */
const selectBox = (page: Page, selectId: string) =>
  page.locator(".ant-select", { has: page.locator(`#${selectId}`) })

async function pick(page: Page, selectId: string, optionTitle: string) {
  await selectBox(page, selectId).click()
  await page.locator(`.ant-select-dropdown:visible .ant-select-item-option[title="${optionTitle}"]`).click()
}

test("Imsakiyah: memilih tahun & bulan lain memuat jadwal bulan tersebut", async ({ page }) => {
  const thisYear = new Date().getFullYear()
  const nextYear = String(Math.min(thisYear + 1, 2040))

  await page.goto("/imsakiyah")
  await expect(page.getByRole("region", { name: "Jadwal hari ini" })).toBeVisible()

  await pick(page, "year-selector", nextYear)
  await pick(page, "month-selector", "Maret")

  await expect(page.getByRole("heading", { name: new RegExp(`Maret ${nextYear}\s*31 hari`) })).toBeVisible()
  // Kartu "Hari ini" hanya untuk bulan berjalan
  await expect(page.getByRole("region", { name: "Jadwal hari ini" })).toHaveCount(0)
  await expect(page.locator("tbody tr.ant-table-row")).toHaveCount(31)

  await page.getByRole("button", { name: "Kembali ke bulan ini" }).click()
  await expect(page.getByRole("region", { name: "Jadwal hari ini" })).toBeVisible()
})

test("Imsakiyah: pilihan tahun dibatasi rentang data API (2024–2040)", async ({ page }) => {
  await page.goto("/imsakiyah")
  await selectBox(page, "year-selector").click()
  const years = await page.locator(".ant-select-dropdown:visible .ant-select-item-option").allTextContents()
  const nums = years.map(Number)
  expect(nums.length).toBeGreaterThan(1)
  expect(Math.min(...nums)).toBeGreaterThanOrEqual(2024)
  expect(Math.max(...nums)).toBeLessThanOrEqual(2040)
  expect(nums).toContain(new Date().getFullYear())
})

test("Imsakiyah: libur nasional & cuti bersama resmi tampil (Desember 2026)", async ({ page }) => {
  await page.goto("/imsakiyah?bulan=12&tahun=2026")
  await expect(page.getByRole("heading", { name: /Desember 2026\s*31 hari · 1 libur nasional/ })).toBeVisible()
  const natal = page.locator("tbody tr.ant-table-row", { hasText: "25 Desember" })
  await expect(natal).toContainText("Kelahiran Yesus Kristus (Natal)")
  await expect(natal).toHaveClass(/imsakiyah-holiday/)
  await expect(page.locator("tbody tr.ant-table-row", { hasText: "24 Desember" })).toContainText("Cuti bersama Natal")
  // Tahun dengan SKB resmi tidak menampilkan catatan perkiraan
  await expect(page.getByRole("note")).toHaveCount(0)
})

test("Imsakiyah: tahun tanpa SKB menampilkan libur perkiraan + catatan", async ({ page }) => {
  await page.goto("/imsakiyah?bulan=8&tahun=2030")
  await expect(page.getByRole("note")).toContainText("SKB libur nasional 2030 belum terbit")
  await expect(page.locator("tbody tr.ant-table-row", { hasText: "17 Agustus" })).toContainText("Proklamasi Kemerdekaan (perkiraan)")
})

test("Beranda: kartu libur berikutnya membuka & menggulir ke tanggal libur di Imsakiyah", async ({ page }) => {
  await page.goto("/")
  const card = page.getByRole("link", { name: /Libur berikutnya/ })
  await expect(card).toBeVisible()
  const href = await card.getAttribute("href")
  expect(href).toMatch(/\/imsakiyah\?bulan=\d+&tahun=\d{4}&tanggal=\d+/)
  await card.click()
  const m = /bulan=(\d+)&tahun=(\d+)&tanggal=(\d+)/.exec(href!)!
  const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][Number(m[1]) - 1]
  await expect(page.getByRole("heading", { name: new RegExp(`${bulan} ${m[2]}`) })).toBeVisible()
  // Baris tanggal libur langsung terlihat di layar (bukan hanya bulannya)
  const iso = `${m[2]}-${m[1].padStart(2, "0")}-${m[3].padStart(2, "0")}`
  await expect(page.locator(`tr[data-date="${iso}"]`)).toBeInViewport({ timeout: 10_000 })
})
