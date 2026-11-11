import { test, expect } from "@playwright/test"

// Pontianak: tepat di garis khatulistiwa (latitude 0) — kasus yang dulu dianggap "gagal"
const PONTIANAK = { latitude: 0, longitude: 109.3333 }

test.use({
  geolocation: PONTIANAK,
  permissions: ["geolocation", "notifications"],
})

// Toast hasil deteksi lokasi (Home juga bisa menampilkan toast lain, mis. notifikasi)
const toast = (page: import("@playwright/test").Page, text: string | RegExp) =>
  page.locator("[data-sonner-toast]").filter({ hasText: text })

test("manifest PWA ter-link dan ikon berupa PNG", async ({ page, request }) => {
  await page.goto("/")
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  )

  const manifest = await (await request.get("/manifest.webmanifest")).json()
  expect(manifest).toMatchObject({ name: "Quran Apps", display: "standalone", start_url: "/" })

  for (const icon of manifest.icons) {
    const res = await request.get(icon.src)
    expect(res.status(), icon.src).toBe(200)
    expect(res.headers()["content-type"], icon.src).toContain("image/png")
  }
})

test("Imsakiyah: deteksi lokasi di latitude 0 mengisi kota", async ({ page }) => {
  await page.goto("/imsakiyah")
  await page.getByRole("button", { name: "Deteksi Lokasi" }).click()

  await expect(toast(page, "Berhasil! Lokasi diatur ke KOTA PONTIANAK")).toBeVisible()
  // Select menampilkan nama kota, bukan id mentah
  await expect(page.locator(".ant-select-selection-item").first()).toHaveText("KOTA PONTIANAK")
  // Jadwal hari ini termuat untuk kota baru
  await expect(page.getByRole("region", { name: "Jadwal hari ini" })).toBeVisible()
  await page.screenshot({ path: "test-results/imsakiyah-detect.png" })
})

test("Home: Salah Lokasi? → Deteksi Lokasi mengganti kota jadwal", async ({ page }) => {
  await page.goto("/")
  await page.getByText("Salah Lokasi?", { exact: true }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Deteksi Lokasi" }).click()

  await expect(toast(page, "Berhasil! Lokasi diatur ke KOTA PONTIANAK")).toBeVisible()
  // Teks heading terpecah ke beberapa <span>, jadi cocokkan lewat role heading
  await expect(page.getByRole("heading", { name: /Jadwal Sholat di\s*KOTA PONTIANAK/ })).toBeVisible()
  await page.screenshot({ path: "test-results/home-detect.png" })
})

test("Imsakiyah: Nominatim tidak bisa diakses → pesan error koneksi", async ({ page }) => {
  await page.route("**/nominatim.openstreetmap.org/**", (route) => route.abort())
  await page.goto("/imsakiyah")
  await page.getByRole("button", { name: "Deteksi Lokasi" }).click()

  await expect(toast(page, "Tidak dapat terhubung ke layanan lokasi")).toBeVisible()
  await expect(toast(page, "tidak ditemukan")).toHaveCount(0)
})
