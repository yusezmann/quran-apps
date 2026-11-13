import { test, expect, type Page } from "@playwright/test"

test.use({ viewport: { width: 1366, height: 900 } })

/** Wadah antd Select yang bisa diklik (input #id di dalamnya tersembunyi). */
const selectBox = (page: Page, selectId: string) =>
  page.locator(".ant-select", { has: page.locator(`#${selectId}`) })

async function pick(page: Page, selectId: string, optionTitle: string) {
  await selectBox(page, selectId).click()
  // antd memakai virtual list: gulir daftar ke atas agar pilihan awal (mis. "Maret") ikut dirender
  await page.locator(".ant-select-dropdown:visible .rc-virtual-list-holder").evaluate((el) => (el.scrollTop = 0)).catch(() => {})
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

test("Imsakiyah: ringkasan 'Libur bulan ini' (Maret 2027) & ketuk chip menyorot seluruh rangkaian", async ({ page }) => {
  await page.goto("/imsakiyah?bulan=3&tahun=2027")
  const chips = page.getByRole("navigation", { name: "Libur bulan ini" }).getByRole("button")
  await expect(chips).toHaveText([/^8 Nyepi/, /^9–15 Idulfitri · \+3 cuti/, /^25–26 Wafat Yesus Kristus · \+1 cuti/, /^28 Paskah/])

  await chips.nth(1).click()
  // Idulfitri: 9, 10, 11, 12, 15 Maret disorot; 13 & 14 (akhir pekan biasa) tidak
  for (const d of ["09", "10", "11", "12", "15"]) {
    await expect(page.locator(`tr[data-date="2027-03-${d}"]`)).toHaveClass(/imsakiyah-target/)
  }
  await expect(page.locator('tr[data-date="2027-03-13"]')).not.toHaveClass(/imsakiyah-target/)
  await expect(page.locator('tr[data-date="2027-03-10"]')).toBeInViewport()
})

test("Imsakiyah: alamat mengikuti bulan & tahun yang dipilih (refresh membuka bulan yang sama)", async ({ page }) => {
  await page.goto("/imsakiyah?bulan=12&tahun=2026&tanggal=25")
  await expect(page.getByRole("heading", { name: /Desember 2026/ })).toBeVisible()
  await expect(page).toHaveURL(/\/imsakiyah\?bulan=12&tahun=2026$/) // "tanggal" hanya untuk lompatan awal

  await page.evaluate(() => window.scrollTo(0, 0))
  await pick(page, "year-selector", "2027")
  await pick(page, "month-selector", "Maret")
  await expect(page.getByRole("heading", { name: /Maret 2027/ })).toBeVisible()
  await expect(page).toHaveURL(/\/imsakiyah\?bulan=3&tahun=2027$/)

  await page.reload()
  await expect(page.getByRole("heading", { name: /Maret 2027/ })).toBeVisible()

  await page.getByRole("button", { name: "Kembali ke bulan ini" }).click()
  await expect(page).toHaveURL(/\/imsakiyah$/)
})
