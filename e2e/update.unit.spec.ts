import { test, expect } from "@playwright/test"
import { isNewer } from "../lib/app-version"

test("versi APK: perbandingan angka per bagian (bukan teks)", () => {
  expect(isNewer("1.1.37", "1.1.36")).toBe(true)
  expect(isNewer("1.1.100", "1.1.99")).toBe(true) // "100" > "99" secara angka
  expect(isNewer("1.2.0", "1.1.99")).toBe(true)
  expect(isNewer("1.1.36", "1.1.36")).toBe(false)
  expect(isNewer("1.1.35", "1.1.36")).toBe(false)
})
