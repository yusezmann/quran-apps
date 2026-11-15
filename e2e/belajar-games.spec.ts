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

test("Game: Tebalkan Huruf — menebalkan mengikuti garis huruf dianggap berhasil", async ({ page }) => {
  await page.getByRole("button", { name: /Tebalkan Huruf/ }).click()
  let successes = 0
  for (let n = 0; n < 5; n++) {
    await expect(page.getByText(/^Tebalkan huruf /)).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(300)
    const guide = page.locator("canvas").first()
    // Ambil baris-baris piksel huruf abu-abu (koordinat kanvas 600×600)
    const runs = await guide.evaluate((c: HTMLCanvasElement) => {
      const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data
      const out: Array<[number, number, number]> = []
      for (let y = 0; y < c.height; y += 14) {
        let start = -1
        for (let x = 0; x <= c.width; x++) {
          const on = x < c.width && d[(y * c.width + x) * 4 + 3] > 0
          if (on && start < 0) start = x
          if (!on && start >= 0) {
            out.push([y, start, x - 1])
            start = -1
          }
        }
      }
      return { runs: out, size: c.width }
    })
    const box = (await guide.boundingBox())!
    const at = (v: number) => (v / runs.size) * box.width
    for (const [y, x0, x1] of runs.runs) {
      if (await page.getByText(/⭐ Bagus!/).isVisible()) break
      await page.mouse.move(box.x + at(x0), box.y + at(y))
      await page.mouse.down()
      await page.mouse.move(box.x + at(x1), box.y + at(y), { steps: 4 })
      await page.mouse.up()
    }
    if (await page.getByText(/⭐ Bagus!/).isVisible()) successes++
    else await page.getByRole("button", { name: "Lewati" }).click()
    await expect(page.getByText(/^Tebalkan huruf /).or(finished(page))).toBeVisible({ timeout: 5_000 })
  }
  await expect(finished(page)).toBeVisible()
  expect(successes).toBeGreaterThanOrEqual(4)
})

test("Laporan orang tua menampilkan huruf yang perlu dilatih & yang sering tertukar", async ({ page }) => {
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("quran-apps:belajar")!)
    raw.state.letterStats = { kho: { r: 1, w: 4 }, ha: { r: 2, w: 3 }, ba: { r: 6, w: 0 } }
    raw.state.confusions = { "ha|kho": 5 }
    localStorage.setItem("quran-apps:belajar", JSON.stringify(raw))
  })
  await page.reload()
  await page.getByRole("button", { name: /Laporan untuk Orang Tua/ }).click()
  await expect(page.getByRole("button", { name: /Dengar kho, 20% benar/ })).toBeVisible()
  await expect(page.getByText("ج titik di dalam bawah, ح tanpa titik, خ titik di atas.", { exact: false })).toBeVisible()
  await expect(page.getByRole("button", { name: /Dengar ba, 100% benar/ })).toBeVisible()
})

test("Game: Tebalkan Huruf — coretan asal di seluruh kanvas tidak dianggap berhasil", async ({ page }) => {
  await page.getByRole("button", { name: /Tebalkan Huruf/ }).click()
  await expect(page.getByText(/^Tebalkan huruf /)).toBeVisible({ timeout: 15_000 })
  const box = (await page.locator("canvas").first().boundingBox())!
  for (let y = 10; y < box.height; y += 18) {
    await page.mouse.move(box.x + 5, box.y + y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width - 5, box.y + y, { steps: 6 })
    await page.mouse.up()
  }
  await expect(page.getByText(/⭐ Bagus!/)).toHaveCount(0)
  await expect(page.getByText("Pelan-pelan, ikuti garis abu-abu ya ✍️")).toBeVisible()
})
