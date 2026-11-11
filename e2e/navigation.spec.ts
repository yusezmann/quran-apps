import { test, expect, devices } from "@playwright/test"

test.use({ ...devices["Pixel 7"], channel: "chrome", permissions: ["notifications"] })

test.describe("navigasi mobile", () => {
  test("navigasi bawah berisi 5 menu baru dan Doa & Hadits aktif di /hadits", async ({ page }) => {
    await page.goto("/hadits")
    const nav = page.getByRole("navigation", { name: "Navigasi utama" })
    await expect(nav.getByRole("link")).toHaveText(["Beranda", "Al-Qur'an", "Kiblat", "Doa & Hadits", "Asmaul Husna"])
    await expect(nav.getByRole("link", { name: "Doa & Hadits" })).toHaveAttribute("aria-current", "page")
    // Tab berpindah ke Doa
    await page.getByRole("navigation", { name: "Doa dan Hadits" }).getByRole("link", { name: "Doa Harian" }).click()
    await expect(page).toHaveURL(/\/doa/)
  })

  test("Beranda: 'Lanjutkan membaca' membuka surah & ayat terakhir di /quran", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() =>
      localStorage.setItem("lastRead", JSON.stringify({ surah: 2, ayah: 12, name: "Al-Baqarah" })),
    )
    await page.reload()
    const card = page.getByRole("link", { name: /Lanjutkan membaca.*Al-Baqarah.*Ayat 12/ })
    await expect(card).toBeVisible()
    await card.click()
    await expect(page).toHaveURL(/\/quran\?surah=2&ayat=12/)
    await expect(page.getByRole("heading", { name: "Al-Baqarah" })).toBeVisible()
    await expect(page.locator("#ayah-12")).toBeInViewport({ timeout: 15000 })
  })

  test("Beranda: 'Lihat jadwal sebulan' membuka Imsakiyah", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /Lihat jadwal sebulan/ }).click()
    await expect(page).toHaveURL(/\/imsakiyah/)
  })
})

test.describe("Al-Qur'an desktop", () => {
  test.use({ viewport: { width: 1366, height: 900 }, isMobile: false, hasTouch: false })

  test("daftar surah bisa dicari dengan nama tanpa tanda baca dan membuka surahnya", async ({ page }) => {
    await page.goto("/quran")
    const search = page.getByRole("searchbox", { name: "Cari surah" })
    await search.fill("al baqarah")
    const results = page.locator("aside").getByRole("button", { name: /Al-Baqarah/ })
    await expect(results).toHaveCount(1)
    await results.click()
    await expect(page.getByRole("heading", { level: 2, name: "Al-Baqarah" })).toBeVisible()

    await search.fill("zzz")
    await expect(page.getByText("Surah tidak ditemukan")).toBeVisible()
  })
})
