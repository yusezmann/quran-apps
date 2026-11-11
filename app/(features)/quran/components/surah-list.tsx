"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useQuranStore } from "@/app/(features)/quran/store/quranStore"
import { Book, Hexagon, Search, X } from "lucide-react"
import { fetchSurahList } from "@/app/(features)/quran/services/quranService"

/** Samakan ejaan untuk pencarian: "Al-Baqarah", "al baqarah", "albaqarah" -> "albaqarah" */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // hapus diakritik (â, ḥ, dst.)
    .replace(/[^a-z0-9]/g, "")

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
  const currentSurah = useQuranStore((state) => state.currentSurah)
  const setCurrentSurah = useQuranStore((state) => state.setCurrentSurah)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q || !surahs) return surahs ?? []
    return surahs.filter(
      (surah: any) =>
        String(surah.nomor) === q ||
        normalize(surah.namaLatin).includes(q) ||
        normalize(surah.arti).includes(q),
    )
  }, [surahs, query])

  const selectSurah = (nomor: number) => {
    setCurrentSurah(nomor)
    // Kembali ke awal bacaan agar surah baru langsung terlihat dari ayat pertama
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading)
    return <div className="bg-green-600 p-4 rounded-lg shadow text-white">Memuat...</div>
  if (error)
    return (
      <div className="bg-green-600 p-4 rounded-lg shadow text-white">
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

      {/* Pencarian surah */}
      <div className="border-b border-gray-200 p-3">
        <label className="relative block">
          <span className="sr-only">Cari surah</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari surah, arti, atau nomor..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-800 placeholder-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      <ul className="divide-y divide-gray-200 max-h-[calc(100vh-290px)] overflow-y-auto overscroll-contain">
        {filtered.length === 0 && (
          <li className="p-6 text-center text-sm text-gray-500">Surah tidak ditemukan</li>
        )}
        {filtered.map((surah: any) => {
          const active = surah.nomor === currentSurah
          return (
            <li key={surah.nomor}>
              <button
                type="button"
                onClick={() => selectSurah(surah.nomor)}
                aria-current={active ? "true" : undefined}
                className={`flex w-full items-center p-4 text-left transition-colors ${
                  active ? "bg-green-50 border-l-4 border-green-600" : "hover:bg-gray-100 border-l-4 border-transparent"
                }`}
              >
                <div className="relative w-10 h-10 shrink-0 flex items-center justify-center bg-green-600 rounded-full">
                  <Hexagon className="w-10 h-10 text-white" />
                  <span className="absolute text-gray-50 text-sm font-bold">{surah.nomor}</span>
                </div>
                <div className="ml-4 leading-snug">
                  <h3 className={`font-semibold ${active ? "text-green-800" : "text-gray-800"}`}>
                    {surah.namaLatin}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {surah.arti} • {surah.jumlahAyat} Ayat
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
