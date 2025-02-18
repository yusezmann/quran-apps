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
): Promise<string> {
  const res = await fetch(
    `${PRAYER_API_BASE}/sholat/kota/koordinat/${lat}/${lon}`,
  )
  const data = await res.json()
  return data.data.id
}
