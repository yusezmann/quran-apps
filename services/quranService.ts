interface Ayat {
  nomorAyat: number
  teksArab: string
  teksLatin: string
  teksIndonesia: string
  audio: {
    "01": string
    "02": string
    "03": string
    "04": string
    "05": string
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface Surah {
  nomor: number
  nama: string
  namaLatin: string
  jumlahAyat: number
  tempatTurun: string
  arti: string
  deskripsi: string
  audioFull: {
    "01": string
    "02": string
    "03": string
    "04": string
    "05": string
  }
  ayat: Ayat[]
  suratSelanjutnya: {
    nomor: number
    nama: string
    namaLatin: string
  } | null
  suratSebelumnya: {
    nomor: number
    nama: string
    namaLatin: string
  } | null
}

export async function fetchSurah(surahNumber: number): Promise<Surah> {
  try {
    const response = await fetch(`${BASE_URL}surat/${surahNumber}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching surah:", error)
    throw error
  }
}

export async function fetchAllSurahs(): Promise<Surah[]> {
  try {
    const response = await fetch(`${BASE_URL}surat`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching surahs:", error)
    throw error
  }
}

export async function fetchSurahList(): Promise<Surah[]> {
  try {
    const response = await fetch(`${BASE_URL}surat`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching surahs:", error)
    throw error
  }
}

export async function fetchTafsir(
  surahNumber: number,
  ayahNumber: number,
): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}tafsir/${surahNumber}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()

    const filtered = data?.data?.tafsir?.filter(
      (t: any) => t.ayat === ayahNumber,
    )
    return filtered?.length ? filtered : null
  } catch (error) {
    console.error("Error fetching tafsir:", error)
    return null
  }
}
