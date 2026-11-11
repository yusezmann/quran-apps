/** Koordinat Ka'bah, Masjidil Haram, Makkah. */
export const KAABA = { lat: 21.422487, lon: 39.826206 } as const

export interface Coords {
  lat: number
  lon: number
}

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/** Arah kiblat (derajat searah jarum jam dari utara sejati), 0..360. */
export function getQiblaDirection(lat: number, lon: number): number {
  const phi = toRad(lat)
  const latK = toRad(KAABA.lat)
  const dLon = toRad(KAABA.lon - lon)
  const q = Math.atan2(Math.sin(dLon), Math.cos(phi) * Math.tan(latK) - Math.sin(phi) * Math.cos(dLon))
  return (toDeg(q) + 360) % 360
}

/** Jarak lingkaran besar ke Ka'bah dalam km (rumus haversine). */
export function getDistanceToKaaba(lat: number, lon: number): number {
  const R = 6371
  const dLat = toRad(KAABA.lat - lat)
  const dLon = toRad(KAABA.lon - lon)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

const CACHE_PREFIX = "quran-apps:coords:"

function readCache(key: string): Coords | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    return raw ? (JSON.parse(raw) as Coords) : null
  } catch {
    return null
  }
}

function writeCache(key: string, coords: Coords) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(coords))
  } catch {
    // storage penuh / diblokir: abaikan, cukup tidak di-cache
  }
}

/**
 * Cari koordinat kota (nama dari API jadwal sholat, mis. "KOTA JAKARTA" / "KAB. BANDUNG")
 * lewat Nominatim, dibatasi ke Indonesia. Hasil disimpan di localStorage karena koordinat kota tidak berubah.
 */
export async function geocodeCity(lokasi: string): Promise<Coords> {
  const key = lokasi.trim().toUpperCase()
  const cached = readCache(key)
  if (cached) return cached

  const cleanName = lokasi.replace(/KOTA|KAB\.|KABUPATEN|ADM\./gi, "").trim()
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanName)}&countrycodes=id&format=json&limit=1`,
  )
  if (!res.ok) throw new Error(`Gagal mencari koordinat (${res.status})`)
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) throw new Error("Koordinat kota tidak ditemukan")

  const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  writeCache(key, coords)
  return coords
}
