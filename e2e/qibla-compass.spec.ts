import { test, expect, devices, type Page } from "@playwright/test"

// Ponsel Android (layar sentuh); Chrome versi baru juga punya DeviceOrientationEvent.requestPermission
test.use({ ...devices["Pixel 7"], channel: "chrome" })

/** Kirim data sensor seperti Android: alpha absolut, berlawanan arah jarum jam dari utara. */
async function sendAndroidHeading(page: Page, headingDeg: number) {
  await page.evaluate((heading) => {
    const alpha = (360 - heading) % 360
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientationabsolute", { alpha, beta: 0, gamma: 0, absolute: true }),
    )
  }, headingDeg)
}

const compass = (page: Page) => page.getByRole("region", { name: "Arah kiblat" })

/** Tunggu koordinat kota selesai dihitung, baru baca sudut kiblat (hindari race). */
async function openCompass(page: Page) {
  await page.goto("/imsakiyah")
  await expect(compass(page)).toBeVisible()
  await page.waitForLoadState("networkidle")
  await expect(compass(page).getByText("Menghitung koordinat kota...")).toHaveCount(0)
}

/** Ambil sudut rotasi (derajat) dari style transform elemen. */
const rotationOf = (page: Page, index: number) =>
  compass(page)
    .locator('[style*="rotate("]')
    .nth(index)
    .evaluate((el) => Number(/rotate\((-?[\d.]+)deg\)/.exec((el as HTMLElement).style.transform)?.[1]))

test("kompas kiblat merespons sensor Android tanpa harus menekan tombol izin", async ({ page }) => {
  await openCompass(page)
  const qibla = Number((await compass(page).getByText(/^\d+°$/).innerText()).replace("°", ""))

  // Menghadap utara -> belum menghadap kiblat, tombol izin tidak muncul karena data sudah masuk
  await sendAndroidHeading(page, 0)
  await expect(compass(page).getByText("Putar ponsel hingga Ka'bah tepat di bawah penanda atas")).toBeVisible()
  await expect(compass(page).getByRole("button", { name: "Aktifkan kompas" })).toHaveCount(0)

  // Menghadap tepat ke arah kiblat
  await sendAndroidHeading(page, qibla)
  await expect(compass(page).getByText("Anda sudah menghadap kiblat")).toBeVisible()
  // Jarum (elemen rotasi ke-2) menunjuk lurus ke atas
  expect(Math.abs(((await rotationOf(page, 1)) % 360 + 360) % 360)).toBeLessThan(1)
})

test("melewati 0°/360° tidak membuat muka kompas berputar satu lingkaran penuh", async ({ page }) => {
  await openCompass(page)

  await sendAndroidHeading(page, 359)
  await expect.poll(() => rotationOf(page, 0)).toBeCloseTo(-359, 0)
  await sendAndroidHeading(page, 1)
  // Lanjut 2° (ke -361), bukan melompat balik ke -1 (yang memutar 358°)
  await expect.poll(() => rotationOf(page, 0)).toBeCloseTo(-361, 0)
})
