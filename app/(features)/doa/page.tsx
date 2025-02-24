"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchDuas } from "./services/doa.service"
import { useStore } from "./store/doa-store"
import Header from "@/components/header"
import Image from "next/image"
import DuaList from "./components/list-doa"
import DuaDetails from "./components/doa-view"
import { Footer } from "@/components/footer"

const Doa = () => {
  const { setDuas, setIsLoading, duas, selectedDuaId, setSelectedDuaId } =
    useStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ["duas"],
    queryFn: fetchDuas,
  })

  useEffect(() => {
    setIsLoading(isLoading)
    if (data?.data) {
      setDuas(data.data)
    }
  }, [data, isLoading, setDuas, setIsLoading])

  const selectedDua = duas.find((d) => d.judul === selectedDuaId)

  if (error) return <div className="p-4">Error: {error.message}</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Image
        src="/assets/images/kaabah.jpg"
        alt="Kaabah"
        fill
        sizes="(max-width: 768px) 100vw"
        className="object-cover brightness-50"
      />
      <div className="px-2 xl:px-16 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-[65px]">
          {/* Untuk mode mobile, tampilkan DuaDetails di atas */}
          <div className="md:hidden">
            <DuaDetails dua={selectedDua} />
          </div>

          <div>
            <DuaList
              duas={duas}
              selectedDuaId={selectedDuaId}
              setSelectedDuaId={setSelectedDuaId}
            />
          </div>

          {/* Untuk mode desktop, tampilkan DuaDetails di samping */}
          <div className="hidden md:block col-span-2">
            <DuaDetails dua={selectedDua} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Doa
