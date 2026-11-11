import {
  PrayerTime,
  City,
} from "@/app/(features)/prayer-times/interfaces/prayer-time.interface"

const PRAYER_API_BASE = process.env.NEXT_PUBLIC_PRAYER_API_URL

/**
 * Jadwal sholat hari ini (API myquran, perhitungan Kemenag RI).
 * Catatan: API tidak mendukung metode/sudut perhitungan lain, jadi tidak ada parameter metode.
 */
export async function getPrayerTimes(cityId: string): Promise<PrayerTime> {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const url = `${PRAYER_API_BASE}/sholat/jadwal/${cityId}/${today}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error fetching prayer times: ${res.statusText}`)
  }

  const data = await res.json()
  if (!data?.data?.jadwal) {
    throw new Error("Invalid data format received from API")
  }

  return data.data
}

export async function searchCities(query: string): Promise<any[]> {
  const res = await fetch(`${PRAYER_API_BASE}/sholat/kota/cari/${query}`)
  const data = await res.json()
  return data.data
}

export async function getCities(search: string): Promise<City[]> {
  const res = await fetch(
    `${PRAYER_API_BASE}/sholat/kota/cari/${encodeURIComponent(search)}`,
  )
  // 404 = tidak ada kota yang cocok, bukan error koneksi
  if (res.status === 404) return []
  if (!res.ok) {
    throw new Error(`Error searching cities: ${res.status}`)
  }
  const data = await res.json()
  return Array.isArray(data?.data) ? data.data : []
}

/**
 * Cari kota (database API sholat) terdekat dari koordinat.
 * - Mengembalikan `null` jika lokasi berhasil di-reverse-geocode tetapi kota tidak ada di database.
 * - Melempar error untuk kegagalan jaringan / HTTP (offline, rate limit Nominatim, response bukan JSON),
 *   supaya pemanggil bisa membedakannya dari "kota tidak ditemukan".
 */
export async function getPrayerTimesByCoords(
  lat: number,
  lon: number,
): Promise<City | null> {
  let res: Response
  try {
    res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { Accept: "application/json" } },
    )
  } catch {
    throw new Error("Tidak dapat terhubung ke layanan lokasi. Periksa koneksi internet Anda.")
  }

  if (!res.ok) {
    throw new Error(
      res.status === 429
        ? "Layanan lokasi sedang sibuk. Coba lagi beberapa saat."
        : `Layanan lokasi error (${res.status})`,
    )
  }

  let data: any
  try {
    data = await res.json()
  } catch {
    throw new Error("Respons layanan lokasi tidak valid")
  }

  if (!data?.address) return null

  // Kumpulkan kandidat nama daerah tingkat Kota/Kabupaten beserta tipe aslinya
  const candidates = [
    { name: data.address.city, isKota: true },
    { name: data.address.municipality, isKota: true },
    { name: data.address.regency, isKota: false },
    { name: data.address.county, isKota: false },
    { name: data.address.state_district, isKota: false },
    { name: data.address.city_district, isKota: true },
    { name: data.address.town, isKota: true },
  ].filter((c): c is { name: string; isKota: boolean } => Boolean(c.name))

  let lastError: unknown = null
  let anyLookupSucceeded = false

  for (const candidate of candidates) {
    // Bersihkan nama kota (misal: "Kota Jakarta Selatan" -> "Jakarta")
    const cleanName = candidate.name
      .replace(/city|kota|kabupaten|south|north|east|west|selatan|utara|timur|barat|pusat/gi, "")
      .trim()

    if (cleanName.length <= 2) continue

    try {
      const cities = await getCities(cleanName)
      anyLookupSucceeded = true
      if (cities && cities.length > 0) {
        // Cari yang paling cocok berdasarkan tipe (Kota vs Kabupaten)
        const exactMatch = cities.find((c: City) => {
          const isLocKota = c.lokasi.toLowerCase().includes("kota")
          return candidate.isKota ? isLocKota : !isLocKota
        })
        return exactMatch || cities[0]
      }
    } catch (e) {
      console.error(`Gagal mencari kota untuk kandidat: ${cleanName}`, e)
      lastError = e
    }
  }

  // Semua pencarian gagal karena error (bukan karena kosong) -> laporkan sebagai error
  if (!anyLookupSucceeded && lastError) {
    throw new Error("Gagal menghubungi server jadwal sholat")
  }

  return null
}
