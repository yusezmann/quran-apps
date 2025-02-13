"use client"

import { useQuery } from "@tanstack/react-query"
import { useQuranStore } from "@/store/quranStore"
import { useState, useRef, useEffect } from "react"
import { Select } from "antd"
import { fetchSurahList, fetchSurah } from "@/services/quranService"

export default function QuranReader() {
  const currentSurah = useQuranStore((state) => state.currentSurah)
  const setCurrentSurah = useQuranStore((state) => state.setCurrentSurah)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { data: surahList } = useQuery({
    queryKey: ["surahList"],
    queryFn: fetchSurahList,
  })

  const handleSurahSelect = (value: string) => {
    const selected = surahList?.find((s) => s.namaLatin === value)
    if (selected) setCurrentSurah(selected.nomor)
  }

  const {
    data: surah,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["surah", currentSurah],
    queryFn: () => fetchSurah(currentSurah),
    enabled: !!currentSurah,
  })

  if (isLoading) return <div className="p-4">Memuat surah...</div>
  if (error)
    return (
      <div className="p-4 text-red-500">
        Terjadi kesalahan saat memuat surah.
      </div>
    )

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-green-600 text-white p-4">
        <h2 className="text-2xl font-semibold">
          {surah?.namaLatin} ({surah?.arti})
        </h2>
        <Select
          showSearch
          placeholder="Cari Surat..."
          options={surahList?.map((s) => ({
            label: s.namaLatin,
            value: s.namaLatin,
          }))}
          onChange={handleSurahSelect}
          className="mb-4 w-full"
        />
      </div>
      <div className="p-4">
        {surah?.ayat?.map((ayat) => (
          <div key={ayat.nomorAyat} className="mb-4">
            <p className="text-2xl text-right text-gray-800">{ayat.teksArab}</p>
            <p className="text-sm text-gray-500 italic">{ayat.teksLatin}</p>
            <p className="text-sm text-gray-600">{ayat.teksIndonesia}</p>
          </div>
        ))}
      </div>
      <audio ref={audioRef} />
    </div>
  )
}
