/**
 * Kota pilihan pengguna, dipakai bersama oleh Beranda (jadwal sholat) dan halaman Kiblat,
 * supaya keduanya selalu memakai lokasi yang sama dan tetap tersimpan setelah aplikasi dibuka ulang.
 */
export interface SavedCity {
  id: string
  lokasi: string
}

const KEY = "quran-apps:city"
export const DEFAULT_CITY: SavedCity = { id: "1301", lokasi: "KOTA JAKARTA" }

export function getSavedCity(): SavedCity | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const city = JSON.parse(raw)
    return city?.id && city?.lokasi ? { id: String(city.id), lokasi: String(city.lokasi) } : null
  } catch {
    return null
  }
}

export const CITY_CHANGED_EVENT = "quran-apps:city-changed"

export function saveCity(city: SavedCity) {
  try {
    const prev = getSavedCity()
    localStorage.setItem(KEY, JSON.stringify({ id: String(city.id), lokasi: city.lokasi }))
    // Beri tahu komponen lain di tab yang sama (mis. penjadwal adzan)
    if (prev?.id !== String(city.id)) window.dispatchEvent(new Event(CITY_CHANGED_EVENT))
  } catch {
    // storage diblokir: abaikan
  }
}
