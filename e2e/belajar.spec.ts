import { test, expect, devices } from "@playwright/test"

test.use({ ...devices["Pixel 7"], channel: "chrome" })

test("Belajar: tab di Al-Qur'an, pelajaran terkunci berurutan, kuis memberi bintang & membuka pelajaran 2", async ({ page }) => {
  // Kuis sengaja lambat: tebakan salah memutar 2 bunyi sebelum kartu terbuka lagi
  test.setTimeout(240_000)
  await page.goto("/quran")
  await page.getByRole("navigation", { name: "Al-Qur'an" }).getByRole("link", { name: "Belajar" }).click()
  await expect(page).toHaveURL(/\/quran\/belajar/)
  await expect(page.getByRole("navigation", { name: "Navigasi utama" }).getByRole("link", { name: /Al.Qur'an/ })).toHaveAttribute("aria-current", "page")

  await expect(page.getByRole("button", { name: "Pelajaran 2 (terkunci)" })).toBeDisabled()
  await page.getByRole("button", { name: "Pelajaran 1" }).click()
  await page.getByRole("button", { name: "Kuis" }).click()

  // Kartu terkunci selama bunyi soal diputar (mencegah anak asal ketuk)
  await expect(page.getByText("Soal 1 dari 6")).toBeVisible()
  await expect(page.getByRole("button", { name: /^Pilih / }).first()).toBeDisabled()

  // Jawab dengan mencoba kartu satu per satu; soal yang salah diulang di akhir
  const finished = page.getByText("MasyaAllah, hebat!")
  const openCard = page.locator('button[aria-label^="Pilih "]:not([disabled])').first()
  for (let attempt = 0; attempt < 40; attempt++) {
    // Tunggu kartu terbuka (bunyi selesai) atau kuis selesai
    await expect(openCard.or(finished)).toBeVisible({ timeout: 15_000 })
    if (await finished.isVisible()) break
    await openCard.click().catch(() => {})
    await page.waitForTimeout(300)
  }
  await expect(finished).toBeVisible({ timeout: 15_000 })
  await page.getByRole("button", { name: "Ke peta belajar" }).click()
  await expect(page.getByRole("button", { name: "Pelajaran 2", exact: true })).toBeEnabled()
})

test("Belajar: hafalan surat pendek bisa ditandai hafal", async ({ page }) => {
  await page.goto("/quran/belajar")
  await page.getByRole("button", { name: "An-Nas 6 ayat" }).click()
  await expect(page.getByText("Ayat 1 dari 6")).toBeVisible({ timeout: 30_000 })
  // Qari bisa dipilih & tersimpan
  await expect(page.getByRole("button", { name: "Qari Misyari Rasyid Al-Afasi" })).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("button", { name: "Qari Abdurrahman As-Sudais" }).click()
  await expect(page.getByRole("button", { name: "Qari Abdurrahman As-Sudais" })).toHaveAttribute("aria-pressed", "true")
  await page.screenshot({ path: "test-results/qari.png", fullPage: true })
  await page.getByRole("button", { name: "Tandai hafal" }).click()
  await page.getByRole("button", { name: "Daftar surat" }).click()
  await expect(page.getByText("1 surat sudah hafal")).toBeVisible()
})

test("Hafalan: lompat ke ayat lewat penanda & ulangi dari ayat 1 di ayat terakhir", async ({ page }) => {
  await page.goto("/quran/belajar")
  await page.getByRole("button", { name: "An-Nas 6 ayat" }).click()
  await expect(page.getByText("Ayat 1 dari 6")).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole("button", { name: "Ulangi dari ayat 1" })).toHaveCount(0)
  await page.getByRole("button", { name: "Ayat 6", exact: true }).click()
  await expect(page.getByText("Ayat 6 dari 6")).toBeVisible()
  await page.screenshot({ path: "test-results/hafalan-akhir.png", fullPage: true })
  await page.getByRole("button", { name: "Ulangi dari ayat 1" }).click()
  await expect(page.getByText("Ayat 1 dari 6")).toBeVisible()
})
