/*
 * Service worker aplikasi anak "Belajar Mengaji" (cakupan /anak).
 * Tujuan: pelajaran huruf & game tetap bisa dipakai tanpa internet setelah aplikasi dibuka sekali.
 *
 * - Halaman /anak: jaringan dulu (agar pembaruan langsung masuk), cadangan dari simpanan saat offline.
 * - Kode (/_next/static), font, ikon, dan suara huruf: dari simpanan dulu (nama file unik / tidak berubah).
 * - Data dari server lain (mis. audio qari hafalan surat) tidak disimpan.
 */
const CACHE = "belajar-anak-v1"
const SHELL = [
  "/anak",
  "/anak/manifest.webmanifest",
  "/anak/icons/icon-192.png",
  "/anak/icons/icon-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("belajar-anak-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Halaman meminta file tambahan disimpan (kode yang sudah dimuat + semua suara huruf)
self.addEventListener("message", (event) => {
  const data = event.data || {}
  if (data.type !== "precache" || !Array.isArray(data.urls)) return
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        data.urls.map((url) =>
          cache.match(url).then((hit) => hit || cache.add(url).catch(() => {})),
        ),
      ),
    ),
  )
})

const isStatic = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/assets/belajar/") ||
  url.pathname.startsWith("/anak/icons/")

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Navigasi halaman: jaringan dulu, simpanan bila offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put("/anak", res.clone()))
          return res
        })
        .catch(() => caches.match("/anak").then((hit) => hit || Response.error())),
    )
    return
  }

  // Suara (mp3) diminta dengan header Range oleh pemutar: layani dari simpanan bila ada
  if (isStatic(url)) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok && res.status === 200) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          }),
      ),
    )
  }
})
