import { test, expect } from "@playwright/test"

// Tablet anak (potret)
test.use({ channel: "chrome", viewport: { width: 800, height: 1280 }, hasTouch: true })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("quran-apps:belajar"))
      localStorage.setItem(
        "quran-apps:belajar",
        JSON.stringify({ state: { stars: { 0: 3 }, memorized: [114], gameStars: 3, qari: "05" }, version: 1 }),
      )
  })
})

test("aplikasi anak: manifest sendiri, tanpa menu orang dewasa, 4 ubin besar", async ({ page }) => {
  await page.goto("/anak")
  await expect(page.getByRole("heading", { name: /Assalamu'alaikum/ })).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/anak/manifest.webmanifest")
  for (const name of ["Belajar Huruf", "Main Game", "Hafalan Surat", "Buku Stiker"])
    await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible()
  // Tidak ada navigasi/menu orang dewasa
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toHaveCount(0)
  await expect(page.getByText(/Jadwal Sholat|Kiblat|Adzan aktif/)).toHaveCount(0)

  const manifest = await (await page.request.get("/anak/manifest.webmanifest")).json()
  expect(manifest.start_url).toBe("/anak")
  expect(manifest.scope).toBe("/anak")
})

test("aplikasi anak: tombol kembali HP kembali ke layar sebelumnya (tidak keluar aplikasi)", async ({ page }) => {
  await page.goto("/anak")
  await page.getByRole("button", { name: /Belajar Huruf/ }).click()
  await page.getByRole("button", { name: "Pelajaran 1", exact: true }).click()
  await expect(page.getByRole("button", { name: "Kenal huruf" })).toBeVisible()

  await page.goBack()
  await expect(page.getByRole("heading", { name: "Mengenal Huruf" })).toBeVisible()
  await expect(page).toHaveURL(/\/anak$/)
  await page.goBack()
  await expect(page.getByRole("button", { name: /Main Game/ })).toBeVisible()
  await expect(page).toHaveURL(/\/anak$/)

  // Dari game, "Pilih game" kembali ke daftar game (bukan beranda)
  await page.getByRole("button", { name: /Main Game/ }).click()
  await page.getByRole("button", { name: /Cari Pasangan/ }).click()
  await page.getByRole("button", { name: "Pilih game" }).click()
  await expect(page.getByRole("heading", { name: /Main Game/ })).toBeVisible()
})

test("aplikasi anak: laporan orang tua hanya terbuka dengan tekan-tahan 3 detik", async ({ page }) => {
  await page.goto("/anak")
  const gate = page.getByRole("button", { name: /Untuk orang tua/ })
  await gate.click() // ketukan biasa anak
  await page.waitForTimeout(500)
  await expect(page.getByRole("heading", { name: "Ringkasan" })).toHaveCount(0)

  const box = (await gate.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(3300)
  await page.mouse.up()
  await expect(page.getByRole("heading", { name: "Ringkasan" })).toBeVisible()
})
