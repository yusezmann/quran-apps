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
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'QuranApps/1.0' } }
    )
    const data = await res.json()
    
    if (!data || !data.address) return null;

    // Kumpulkan kandidat nama daerah tingkat Kota/Kabupaten beserta tipe aslinya
    const candidates = [
      { name: data.address.city, isKota: true },
      { name: data.address.municipality, isKota: true },
      { name: data.address.regency, isKota: false },
      { name: data.address.county, isKota: false },
      { name: data.address.state_district, isKota: false },
      { name: data.address.city_district, isKota: true },
      { name: data.address.town, isKota: true }
    ].filter(c => c.name);

    for (const candidate of candidates) {
      // Bersihkan nama kota (misal: "Kota Jakarta Selatan" -> "Jakarta")
      const cleanName = candidate.name.replace(/city|kota|kabupaten|south|north|east|west|selatan|utara|timur|barat|pusat/gi, "").trim();
      
      if (cleanName.length > 2) {
        try {
          const cities = await getCities(cleanName);
          if (cities && cities.length > 0) {
            // Cari yang paling cocok berdasarkan tipe (Kota vs Kabupaten)
            const exactMatch = cities.find((c: City) => {
              const lok = c.lokasi.toLowerCase();
              const isLocKota = lok.includes("kota");
              return candidate.isKota ? isLocKota : !isLocKota;
            });
            
            return exactMatch || cities[0];
          }
        } catch (e) {
          console.error(`Gagal mencari kota untuk kandidat: ${cleanName}`);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}
