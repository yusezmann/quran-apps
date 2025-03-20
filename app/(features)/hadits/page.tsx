"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Image from "next/image"
import { useHadithStore } from "./store/haditsStore"
import { useQuery } from "@tanstack/react-query"
import { Hadith } from "./interfaces/hadits.interface"
import { fetchHadiths } from "./services/hadits.service"
import HadithList from "./components/HaditsList"
import HadithDetails from "./components/HaditsView"
import { Footer } from "@/components/footer"
import { Alert, Spin } from "antd"

const Hadits = () => {
  const { setHadiths } = useHadithStore()
  const [selectedHadithId, setSelectedHadithId] = useState<string | null>(null)

  const {
    data: hadiths,
    isLoading,
    error,
  } = useQuery<Hadith[], Error>({
    queryKey: ["hadiths"],
    queryFn: fetchHadiths,
  })

  useEffect(() => {
    if (hadiths) {
      setHadiths(hadiths)
    }
  }, [hadiths, setHadiths])

  const [searchTerm, setSearchTerm] = useState("")

  const filteredHadiths = hadiths?.filter(
    (hadith) =>
      hadith.arab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hadith.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hadith.no.toString().includes(searchTerm), // Pastikan `no` diubah ke string sebelum `includes`
  )

  const selectedHadith = hadiths?.find(
    (hadith) => hadith.no === selectedHadithId,
  )

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert message="Terjadi kesalahan!" type="error" showIcon />
      </div>
    )

  return (
    <div>
      <Header />
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image
          src="/assets/images/kaabah.jpg"
          alt="Kaabah"
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
      </div>

      <div className="px-2 xl:px-16 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-[35px] xl:mt-[85px] mb-20">
          {/* Untuk mode mobile, tampilkan HadithDetails di atas */}
          <div className="md:hidden">
            <HadithDetails hadith={selectedHadith} />
          </div>

          <div>
            <HadithList
              hadiths={filteredHadiths || []}
              selectedHadithId={selectedHadithId}
              setSelectedHadithId={setSelectedHadithId}
            />
          </div>

          {/* Untuk mode desktop, tampilkan HadithDetails di samping */}
          <div className="hidden md:block col-span-2">
            <HadithDetails hadith={selectedHadith} />
          </div>
        </div>
      </div>
      <div className="hidden xl:block">
        <Footer />
      </div>
    </div>
  )
}

export default Hadits
