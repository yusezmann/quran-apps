import { test, expect, devices } from "@playwright/test"

test.use({ ...devices["Pixel 7"], channel: "chrome" })

test("Belajar: tab di Al-Qur'an, pelajaran terkunci berurutan, kuis memberi bintang & membuka pelajaran 2", async ({ page }) => {
  await page.goto("/quran")
  await page.getByRole("navigation", { name: "Al-Qur'an" }).getByRole("link", { name: "Belajar" }).click()
  await expect(page).toHaveURL(/\/quran\/belajar/)
  await expect(page.getByRole("navigation", { name: "Navigasi utama" }).getByRole("link", { name: /Al.Qur'an/ })).toHaveAttribute("aria-current", "page")

  await expect(page.getByRole("button", { name: "Pelajaran 2 (terkunci)" })).toBeDisabled()
  await page.getByRole("button", { name: "Pelajaran 1" }).click()
  await page.getByRole("button", { name: "Kuis" }).click()

  // Jawab benar semua: jawaban = huruf yang dibunyikan; ambil dari teks yang dikirim ke speechSynthesis
  for (let i = 0; i < 6; i++) {
    await expect(page.getByText(`Soal ${i + 1} dari 6`)).toBeVisible()
    const options = page.getByRole("button", { name: /^Pilih / })
    const count = await options.count()
    let answered = false
    for (let k = 0; k < count && !answered; k++) {
      await options.nth(k).click()
      answered = await page.getByText("⭐ Benar!").isVisible().catch(() => false)
    }
  }
  await expect(page.getByText("MasyaAllah, hebat!")).toBeVisible()
  await page.getByRole("button", { name: "Ke peta belajar" }).click()
  await expect(page.getByRole("button", { name: "Pelajaran 2", exact: true })).toBeEnabled()
})

test("Belajar: hafalan surat pendek bisa ditandai hafal", async ({ page }) => {
  await page.goto("/quran/belajar")
  await page.getByRole("button", { name: "An-Nas 6 ayat" }).click()
  await expect(page.getByText("Ayat 1 dari 6")).toBeVisible({ timeout: 30_000 })
  await page.getByRole("button", { name: "Tandai hafal" }).click()
  await page.getByRole("button", { name: "Daftar surat" }).click()
  await expect(page.getByText("1 surat sudah hafal")).toBeVisible()
})
