import { Hadith } from "../interfaces/hadits.interface"

export const fetchHaditsArbain = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/hadits/arbain/all`,
  )
  if (!response.ok) {
    throw new Error("Gagal mengambil data")
  }
  const data = await response.json()
  return data.data
}

export const fetchHadiths = async (): Promise<Hadith[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/hadits/arbain/all`,
  )
  const data = await res.json()
  return data.data
}
