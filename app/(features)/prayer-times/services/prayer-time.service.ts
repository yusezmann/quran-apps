import {
  PrayerTime,
  City,
} from "@/app/(features)/prayer-times/interfaces/prayer-time.interface"

const PRAYER_API_BASE = process.env.NEXT_PUBLIC_PRAYER_API_URL

export async function getPrayerTimes(
  cityId: string,
  params?: Record<number, number>,
): Promise<PrayerTime> {
  const today = new Date().toISOString().split("T")[0]
  let url = `${PRAYER_API_BASE}/sholat/jadwal/${cityId}/${today}`

  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(String(params)).toString()
    url += `?${queryString}`
  }

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
  const res = await fetch(`${PRAYER_API_BASE}/sholat/kota/cari/${search}`)
  const data = await res.json()
  return data.data
}

export async function getPrayerTimesByCoords(
  lat: number,
  lon: number,
): Promise<City | null> {
  try {
    // 1. Ambil nama kota dari Nominatim (OpenStreetMap)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'QuranApps/1.0' } }
    )
    const data = await res.json()
    const locationName = data.address.city || data.address.town || data.address.village || data.address.county
    
    if (!locationName) return null;

    // 2. Bersihkan nama kota (misal: "South Jakarta" -> "Jakarta")
    const cleanName = locationName.replace(/city|kota|kabupaten|south|north|east|west|selatan|utara|timur|barat|pusat/gi, "").trim()
    
    // 3. Cari kota di MyQuran API
    const cities = await getCities(cleanName)
    if (cities && cities.length > 0) {
      return cities[0]
    }
    
    return null
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return null
  }
}
