import { findHijriOffset, toLocalISODate, DEFAULT_HIJRI_OFFSET } from "@/lib/hijri"

interface HijriApiResponse {
  data?: {
    date?: string[]
    // [hari, tgl, bln, thn, tgl_hijri, bln_hijri, thn_hijri]
    num?: number[]
  }
}

/**
 * Ambil offset kalender Hijriah dari API myquran (konvensi Indonesia) untuk hari ini,
 * supaya semua tampilan Hijriah di aplikasi (Home & Imsakiyah) memakai sumber yang sama.
 * Jika API gagal, pakai DEFAULT_HIJRI_OFFSET (sama dengan default API).
 */
export async function fetchHijriOffset(today = new Date()): Promise<number> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/cal/hijr/${toLocalISODate(today)}`,
    )
    if (!res.ok) return DEFAULT_HIJRI_OFFSET
    const json: HijriApiResponse = await res.json()
    const num = json.data?.num
    if (!num || num.length < 7) return DEFAULT_HIJRI_OFFSET

    const offset = findHijriOffset(today, { day: num[4], month: num[5], year: num[6] })
    return offset ?? DEFAULT_HIJRI_OFFSET
  } catch {
    return DEFAULT_HIJRI_OFFSET
  }
}
