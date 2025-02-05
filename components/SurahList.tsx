"use client"

import { useQuery } from "@tanstack/react-query"
import { useQuranStore } from "@/store/quranStore"
import { Book } from "lucide-react"

interface Surah {
  nomor: number
  nama: string
  nama_latin: string
  jumlah_ayat: number
  tempat_turun: string
  arti: string
}

async function fetchSurahs() {
  try {
    const response = await fetch("https://quran-api.santrikoding.com/api/surah")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching surahs:", error)
    throw error
  }
}

export default function SurahList() {
  const {
    data: surahs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahs,
    retry: 2,
  })
  const setCurrentSurah = useQuranStore((state) => state.setCurrentSurah)

  if (isLoading)
    return <div className="bg-white p-4 rounded-lg shadow">Memuat...</div>
  if (error)
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        Error mengambil surah: {(error as Error).message}
      </div>
    )

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-green-600 text-white p-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Book className="mr-2" />
          Daftar Surah
        </h2>
      </div>
      <ul className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
        {surahs?.map((surah: Surah) => (
          <li
            key={surah.nomor}
            className="cursor-pointer hover:bg-gray-100 p-4"
            onClick={() => setCurrentSurah(surah.nomor)}
          >
            <div className="flex items-center">
              <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3">
                {surah.nomor}
              </span>
              <div>
                <h3 className="text-gray-800 font-semibold">
                  {surah.nama_latin}
                </h3>
                <p className="text-sm text-gray-600">
                  {surah.arti} • {surah.jumlah_ayat} Ayat
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
