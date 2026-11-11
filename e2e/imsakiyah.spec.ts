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
