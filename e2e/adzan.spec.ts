import { test, expect, type Page } from "@playwright/test"

/**
 * Alur adzan di web dengan jam palsu (Playwright clock).
 * Jadwal diambil dari API sungguhan (Kota Jakarta) agar waktu uji sesuai data.
 */
test.use({ timezoneId: "Asia/Jakarta", viewport: { width: 1366, height: 900 } })

async function jakartaTimes(date: string) {
  const [y, m] = date.split("-")
  const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/1301/${y}/${m}`)
  const json = await res.json()
  return json.data.jadwal.find((d: { date: string }) => d.date === date) as Record<string, string>
}

/** Rekam pemanggilan audio.play(); opsional simulasikan browser yang memblokir autoplay. */
async function setup(page: Page, opts: { at: string; settings: object; blockAutoplay?: boolean }) {
  await page.clock.install({ time: new Date(opts.at) })
  await page.addInitScript(
    ({ settings, blockAutoplay }) => {
      localStorage.setItem("quran-apps:adzan", JSON.stringify({ state: settings, version: 1 }))
      localStorage.setItem("quran-apps:city", JSON.stringify({ id: "1301", lokasi: "KOTA JAKARTA" }))
      ;(window as any).__plays = []
      HTMLMediaElement.prototype.play = function () {
        ;(window as any).__plays.push(this.src.split("/").pop())
        if (blockAutoplay) return Promise.reject(new DOMException("blocked", "NotAllowedError"))
        return Promise.resolve()
      }
    },
    { settings: opts.settings, blockAutoplay: !!opts.blockAutoplay },
  )
}

/** Banner adzan (Next.js juga punya elemen role="alert" tersembunyi untuk pengumuman rute). */
const adzanBanner = (page: Page) => page.getByRole("alert").filter({ hasText: "telah tiba" })
/** Buka halaman & tunggu jadwal bulanan untuk penjadwal adzan benar-benar diterima sebelum jam dimajukan. */
async function openAndWaitForSchedule(page: Page, path: string) {
  const schedule = page.waitForResponse((r) => /\/sholat\/jadwal\/1301\/\d{4}\/\d{2}$/.test(r.url()))
  await page.goto(path)
  await schedule
  await page.waitForLoadState("networkidle")
}
const plays = (page: Page) => page.evaluate(() => (window as any).__plays as string[])
const base = {
  enabled: true,
  prayers: { subuh: true, dzuhur: true, ashar: true, maghrib: true, isya: true },
  sound: "makkah",
  reminderMinutes: 0,
}

test("adzan Maghrib berbunyi tepat waktu di halaman mana pun + bisa dihentikan", async ({ page }) => {
  const { maghrib } = await jakartaTimes("2026-11-11")
  await setup(page, { at: `2026-11-11T${minus(maghrib, 10)}+07:00`, settings: base })
  await openAndWaitForSchedule(page, "/doa") // bukan Beranda: adzan harus tetap jalan
  await page.clock.runFor(20_000)

  await expect(adzanBanner(page)).toContainText("Waktu Maghrib telah tiba")
  expect(await plays(page)).toEqual(["adzan-makkah.mp3"])
  await page.getByRole("button", { name: "Hentikan" }).click()
  await expect(adzanBanner(page)).toHaveCount(0)
})

test("Subuh otomatis memakai Adzan Subuh", async ({ page }) => {
  const { subuh } = await jakartaTimes("2026-11-12")
  await setup(page, { at: `2026-11-12T${minus(subuh, 10)}+07:00`, settings: { ...base, sound: "mesir" } })
  await openAndWaitForSchedule(page, "/")
  await page.clock.runFor(20_000)
  expect(await plays(page)).toEqual(["adzan-shubuh.mp3"])
})

test("waktu yang dimatikan tidak berbunyi", async ({ page }) => {
  const { maghrib } = await jakartaTimes("2026-11-11")
  await setup(page, { at: `2026-11-11T${minus(maghrib, 10)}+07:00`, settings: { ...base, prayers: { ...base.prayers, maghrib: false } } })
  await openAndWaitForSchedule(page, "/")
  await page.clock.runFor(30_000)
  expect(await plays(page)).toEqual([])
  await expect(adzanBanner(page)).toHaveCount(0)
})

test("autoplay diblokir browser -> banner menawarkan tombol 'Putar adzan'", async ({ page }) => {
  const { maghrib } = await jakartaTimes("2026-11-11")
  await setup(page, { at: `2026-11-11T${minus(maghrib, 10)}+07:00`, settings: base, blockAutoplay: true })
  await openAndWaitForSchedule(page, "/")
  await page.clock.runFor(20_000)
  await expect(adzanBanner(page)).toContainText("Ketuk “Putar adzan”")
  await expect(page.getByRole("button", { name: "Putar adzan" })).toBeVisible()
})

test("pengingat 10 menit sebelum Maghrib", async ({ page }) => {
  const { maghrib } = await jakartaTimes("2026-11-11")
  await setup(page, { at: `2026-11-11T${minus(maghrib, 600 + 10)}+07:00`, settings: { ...base, reminderMinutes: 10 } })
  await openAndWaitForSchedule(page, "/")
  await page.clock.runFor(20_000)
  await expect(page.getByText("10 menit lagi Maghrib")).toBeVisible()
  expect(await plays(page)).toEqual([]) // pengingat tidak memutar adzan
})

test("pengaturan: aktifkan adzan dari Beranda, pilih suara, coba suara", async ({ page }) => {
  await setup(page, { at: "2026-11-11T09:00:00+07:00", settings: { ...base, enabled: false } })
  await page.goto("/")
  await page.getByRole("button", { name: "Aktifkan adzan" }).click()
  const dialog = page.getByRole("dialog", { name: "Pengaturan Adzan" })
  await dialog.getByRole("switch", { name: "Aktifkan adzan" }).click()
  await dialog.getByLabel("Adzan Mesir").check()
  await dialog.getByRole("button", { name: "Coba" }).first().click()
  expect(await plays(page)).toContain("adzan-makkah.mp3")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Adzan aktif" })).toBeVisible()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("quran-apps:adzan")!).state)
  expect(saved).toMatchObject({ enabled: true, sound: "mesir" })
})

/** "17:51" - n detik -> "17:50:50" */
function minus(hhmm: string, seconds: number): string {
  const [h, m] = hhmm.split(":").map(Number)
  const t = h * 3600 + m * 60 - seconds
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(Math.floor(t / 3600))}:${p(Math.floor((t % 3600) / 60))}:${p(t % 60)}`
}
