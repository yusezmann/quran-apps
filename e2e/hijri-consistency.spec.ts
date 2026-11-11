import { test, expect } from "@playwright/test"

// Tanggal Hijriah hari ini harus sama persis di Home dan Imsakiyah (satu sumber: lib/hijri)
test("tanggal Hijriah hari ini konsisten antara Home dan Imsakiyah", async ({ page }) => {
  const hijriPattern = /\d{1,2} [A-Za-z' ]+ \d{4} H/

  await page.goto("/imsakiyah")
  const todayCard = page.getByRole("region", { name: "Jadwal hari ini" })
  await expect(todayCard).toBeVisible()
  const imsakiyahHijri = (await todayCard.innerText()).match(hijriPattern)?.[0]
  expect(imsakiyahHijri).toBeTruthy()

  await page.goto("/")
  await expect(page.getByText(hijriPattern).first()).toContainText(imsakiyahHijri!)
})
