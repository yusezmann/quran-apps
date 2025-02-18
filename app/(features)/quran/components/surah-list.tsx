"use client"

import { useQuery } from "@tanstack/react-query"
import { useQuranStore } from "@/app/(features)/quran/store/quranStore"
import { Book, Hexagon, Star } from "lucide-react"
import { fetchSurahList } from "@/app/(features)/quran/services/quranService"

interface Surah {
  nomor: number
  nama: string
  nama_latin: string
  jumlah_ayat: number
  tempat_turun: string
  arti: string
}

export default function SurahList() {
  const {
    data: surahs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahList,
    retry: 2,
  })
  const setCurrentSurah = useQuranStore((state) => state.setCurrentSurah)

  if (isLoading)
    return <div className="bg-green-600 p-4 rounded-lg shadow">Memuat...</div>
  if (error)
    return (
      <div className="bg-green-600 p-4 rounded-lg shadow">
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
        {surahs?.map((surah: any) => (
          <li
            key={surah.nomor}
            className="cursor-pointer hover:bg-gray-100 p-4"
            onClick={() => setCurrentSurah(surah.nomor)}
          >
            <div className="flex items-center">
              <div className="relative w-10 h-10 flex items-center justify-center bg-green-600 rounded-full">
                <Hexagon className="w-10 h-10 text-white" />
                <span className="absolute text-gray-50 text-sm font-bold">
                  {surah.nomor}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-800 font-semibold">
                  {surah.namaLatin}
                </h3>
                <p className="text-sm text-gray-600">
                  {surah.arti} • {surah.jumlahAyat} Ayat
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
