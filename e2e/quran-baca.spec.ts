import { test, expect, devices } from "@playwright/test"

test.use({ ...devices["Pixel 7"], channel: "chrome" })

test("Baca: qari Quran.com bisa dipilih & audio ayat memakai qari itu (dipakai juga di hafalan)", async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto("/quran")
  await expect(page.getByRole("button", { name: "Putar ayat 1" })).toBeVisible({ timeout: 30_000 })

  // Pilih qari dari daftar baru
  await page.locator(".ant-select").filter({ hasText: /Al-Afasi|Misyari/ }).first().click()
  await page.getByTitle(/Al-Husary \(Mu'allim\)/).click()
  await page.getByRole("button", { name: "Putar ayat 1" }).click()
  await expect
    .poll(() => page.locator("audio").first().evaluate((a: HTMLAudioElement) => a.currentSrc || a.src), { timeout: 15_000 })
    .toContain("Husary_Muallim")
  await page.screenshot({ path: "test-results/baca-qari.png" })

  // Pilihan yang sama terpakai di hafalan anak
  await page.goto("/quran/belajar")
  await page.getByRole("button", { name: "An-Nas 6 ayat" }).click()
  await expect(page.getByRole("button", { name: "Qari Mahmud Khalil Al-Husary (Mu'allim)" })).toHaveAttribute("aria-pressed", "true", {
    timeout: 30_000,
  })
})

test("Baca: bilah audio ringkas di HP — jeda, lanjut, ayat berikutnya, tutup", async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto("/quran")
  await page.getByRole("button", { name: "Putar ayat 1" }).click({ timeout: 30_000 })
  await expect(page.getByText("Ayat 1/7")).toBeVisible()
  await page.getByRole("button", { name: "Jeda" }).click()
  await expect(page.getByText("Al-Fatihah · Dijeda")).toBeVisible()
  await page.getByRole("button", { name: "Ayat selanjutnya" }).click()
  await expect(page.getByText("Ayat 2/7")).toBeVisible()
  await page.screenshot({ path: "test-results/baca-bar.png" })
  await page.getByRole("button", { name: "Tutup pemutar" }).click()
  await expect(page.getByText("Ayat 2/7")).toHaveCount(0)
})
