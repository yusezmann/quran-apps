import { test, expect, type Page } from "@playwright/test"

const PONTIANAK = { latitude: 0, longitude: 109.3333 }
const JAKARTA_CITY = { id: "1301", lokasi: "KOTA JAKARTA" }

async function seed(page: Page, autoLocation: object | null) {
  await page.addInitScript(
    ({ city, auto }) => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("quran-apps:city", JSON.stringify(city))
        if (auto) localStorage.setItem("quran-apps:auto-location", JSON.stringify({ state: auto, version: 1 }))
        sessionStorage.setItem("seeded", "1")
      }
    },
    { city: JAKARTA_CITY, auto: autoLocation },
  )
}

const heroCity = (page: Page) => page.getByRole("heading", { name: /KOTA (JAKARTA|PONTIANAK)/ }).first()

test.describe("lokasi otomatis", () => {
  test("tawaran sekali di Beranda: Aktifkan → kota mengikuti GPS & tawaran hilang", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"])
    await context.setGeolocation(PONTIANAK)
    await seed(page, null) // mode "ask" (belum pernah ditanya)
    await page.goto("/")

    const offer = page.getByRole("region", { name: "Tawaran lokasi otomatis" })
    await expect(offer).toBeVisible()
    await offer.getByRole("button", { name: "Aktifkan" }).click()

    await expect(page.getByText("Lokasi diperbarui ke KOTA PONTIANAK")).toBeVisible({ timeout: 30_000 })
    await expect(heroCity(page)).toContainText("KOTA PONTIANAK")
    await expect(offer).toHaveCount(0)
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("quran-apps:auto-location")!).state.mode)
    expect(saved).toBe("on")
  })

  test("Nanti saja → tidak ditanya lagi", async ({ page }) => {
    await seed(page, null)
    await page.goto("/")
    await page.getByRole("region", { name: "Tawaran lokasi otomatis" }).getByRole("button", { name: "Nanti saja" }).click()
    await page.reload()
    await expect(heroCity(page)).toBeVisible()
    await expect(page.getByRole("region", { name: "Tawaran lokasi otomatis" })).toHaveCount(0)
  })

  test("mode aktif + izin sudah ada → kota diperbarui otomatis saat aplikasi dibuka", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"])
    await context.setGeolocation(PONTIANAK)
    await seed(page, { mode: "on", lastCheck: 0 })
    await page.goto("/")
    await expect(heroCity(page)).toContainText("KOTA PONTIANAK", { timeout: 30_000 })
  })

  test("mode aktif tapi izin belum ada → tidak memunculkan dialog izin, kota tetap", async ({ page }) => {
    await seed(page, { mode: "on", lastCheck: 0 })
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await expect(heroCity(page)).toContainText("KOTA JAKARTA")
  })

  test("memilih kota manual mematikan lokasi otomatis", async ({ page }) => {
    await seed(page, { mode: "on", lastCheck: Date.now() })
    await page.goto("/")
    await page.getByText("Salah Lokasi?", { exact: true }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog.getByRole("switch", { name: "Lokasi otomatis" })).toBeChecked()
    await dialog.getByPlaceholder("Cari kota...").fill("bandung")
    await dialog.getByRole("button", { name: "Cari" }).click()
    await dialog.getByRole("button", { name: /KOTA BANDUNG/ }).click()
    await expect(page.getByText("Lokasi otomatis dimatikan")).toBeVisible()
    await expect(heroCity(page).or(page.getByRole("heading", { name: /KOTA BANDUNG/ }).first())).toContainText("BANDUNG")
  })
})
