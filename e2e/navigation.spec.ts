import { test, expect, devices } from "@playwright/test"

test.use({ ...devices["Pixel 7"], channel: "chrome", permissions: ["notifications"] })

test.describe("navigasi mobile", () => {
  test("navigasi bawah berisi 5 menu baru dan Doa & Hadits aktif di /hadits", async ({ page }) => {
    await page.goto("/hadits")
    const nav = page.getByRole("navigation", { name: "Navigasi utama" })
    await expect(nav.getByRole("link")).toHaveText(["Beranda", /Al.Qur'an/, "Kiblat", "Doa & Hadits", "Asmaul Husna"])
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
    // Tunggu jadwal sholat (hero) termuat: sebelum itu kartu di bawahnya masih bergeser posisi
    await expect(page.getByText("Sholat Berikutnya").first()).toBeVisible()
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

test.describe("navigasi melayang saat scroll", () => {
  /** Scroll di dalam halaman (timing tidak dipengaruhi lambatnya proses tes), lalu baca status nav. */
  const scrollAndRead = (page: import("@playwright/test").Page, steps: number, dy: number) =>
    page.evaluate(
      async ({ steps, dy }) => {
        for (let i = 0; i < steps; i++) {
          window.scrollBy(0, dy)
          // Headless Chrome tidak selalu mengirim event scroll untuk scroll terprogram
          window.dispatchEvent(new Event("scroll"))
          await new Promise((r) => setTimeout(r, 40))
        }
        await new Promise((r) => requestAnimationFrame(() => r(null)))
        return document.querySelector('nav[aria-label="Navigasi utama"]')?.getAttribute("data-hidden")
      },
      { steps, dy },
    )

  test("sembunyi selama scroll (bawah & atas), muncul lagi saat berhenti", async ({ page }) => {
    await page.goto("/hadits") // halaman panjang
    const nav = page.getByRole("navigation", { name: "Navigasi utama" })
    await expect(nav).toHaveAttribute("data-hidden", "false")
    // Tunggu hidrasi React selesai (listener scroll terpasang)
    await page.waitForLoadState("networkidle")
    await expect.poll(() => scrollAndRead(page, 2, 60), { timeout: 15_000 }).toBe("true")
    await expect(nav).toHaveAttribute("data-hidden", "false", { timeout: 2000 })

    expect(await scrollAndRead(page, 6, 120)).toBe("true") // sedang scroll ke bawah
    await expect(nav).toHaveAttribute("data-hidden", "false", { timeout: 2000 }) // berhenti -> muncul

    expect(await scrollAndRead(page, 3, -120)).toBe("true") // scroll ke atas juga menyembunyikan
    await expect(nav).toHaveAttribute("data-hidden", "false", { timeout: 2000 }) // berhenti -> muncul
  })
})

test("Doa & Hadits: tombol panah menggulir halaman (tidak diblokir daftar desktop yang tersembunyi)", async ({ page }) => {
  for (const path of ["/doa", "/hadits"]) {
    await page.goto(path)
    await page.waitForLoadState("networkidle")
    await page.mouse.click(5, 400)
    for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowDown")
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
  }
})

test("Al-Qur'an: di akhir surah ada tombol ke surah berikutnya yang membuka dari ayat pertama", async ({ page }) => {
  await page.goto("/quran")
  await expect(page.getByRole("heading", { level: 2, name: "Al-Fatihah" })).toBeVisible()
  const next = page.getByRole("navigation", { name: "Navigasi surah" }).getByRole("button", { name: /Surah berikutnya.*Al-Baqarah/ })
  await next.scrollIntoViewIfNeeded()
  await next.click()
  await expect(page.getByRole("heading", { level: 2, name: "Al-Baqarah" })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeLessThan(50)
  await expect(page.locator("#ayah-1")).toBeVisible()
})
