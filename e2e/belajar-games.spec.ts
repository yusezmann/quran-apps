import { test, expect, devices, type Page } from "@playwright/test"

test.use({ ...devices["Pixel 7"], channel: "chrome" })

const finished = (page: Page) => page.getByText("MasyaAllah, hebat!")

test.beforeEach(async ({ page }) => {
  // Pelajaran 1 selesai → huruf pelajaran 1 & 2 dipakai di game
  await page.addInitScript(() => {
    if (!localStorage.getItem("quran-apps:belajar"))
      localStorage.setItem(
        "quran-apps:belajar",
        JSON.stringify({ state: { stars: { 0: 3 }, memorized: [], gameStars: 0, qari: "05" }, version: 1 }),
      )
  })
  await page.goto("/quran/belajar")
})

test("Game: Pecah Balon sampai selesai memberi bintang", async ({ page }) => {
  await page.getByRole("button", { name: /Pecah Balon/ }).click()
  for (let attempt = 0; attempt < 60; attempt++) {
    // Tunggu balon bisa dipilih (bunyi selesai) atau game selesai
    await expect(page.locator("button:enabled", { hasText: "Dengar lagi" }).or(finished(page))).toBeVisible({ timeout: 15_000 })
    if (await finished(page).isVisible()) break
    // Balon bergerak terus → klik lewat event (Playwright menunggu elemen diam bila klik biasa)
    await page.getByRole("button", { name: /^Balon / }).nth(attempt % 4).dispatchEvent("click")
    await page.waitForTimeout(400)
  }
  await expect(finished(page)).toBeVisible({ timeout: 15_000 })
})

test("Game: Cari Pasangan sampai semua kartu cocok", async ({ page }) => {
  await page.getByRole("button", { name: /Cari Pasangan/ }).click()
  const cards = page.locator('button[aria-label^="Kartu"]')
  await expect(cards).toHaveCount(8)
  const seen = new Map<number, string>()
  const label = async (i: number) => (await cards.nth(i).getAttribute("aria-label"))!
  for (let turn = 0; turn < 20 && !(await finished(page).isVisible()); turn++) {
    const closed: number[] = []
    for (let i = 0; i < 8; i++) if ((await label(i)) === "Kartu tertutup") closed.push(i)
    if (!closed.length) break
    const a = closed[0]
    await cards.nth(a).click()
    const la = await label(a)
    seen.set(a, la)
    const known = Array.from(seen).find(([i, l]) => i !== a && l === la && closed.includes(i))
    const b = known ? known[0] : closed.find((i) => i !== a && !seen.has(i)) ?? closed[1]
    await cards.nth(b).click()
    seen.set(b, await label(b))
    await page.waitForTimeout(1700)
  }
  await expect(finished(page)).toBeVisible({ timeout: 10_000 })
})

test("Game: Mana yang Beda sampai selesai, lalu stiker terbuka di buku stiker", async ({ page }) => {
  await page.getByRole("button", { name: /Mana yang Beda/ }).click()
  for (let r = 0; r < 6; r++) {
    const cells = page.getByRole("button", { name: /^Kotak / })
    const n = await cells.count()
    for (let i = 0; i < n; i++) {
      await cells.nth(i).click()
      if (await page.getByText(/Yang beda:/).isVisible().catch(() => false)) break
    }
    await expect(page.getByText(/Yang beda:/)).toBeVisible()
    await page.waitForTimeout(1900)
  }
  await expect(finished(page)).toBeVisible()
  // 3 bintang pelajaran + bintang game ≥ 4 → minimal 1 stiker
  await page.getByRole("button", { name: "📒 Buku stiker" }).click()
  await expect(page.getByText(/^[1-9]\d*\/24 stiker$/)).toBeVisible()
  await expect(page.getByRole("listitem", { name: "Apel" })).toBeVisible()
})
