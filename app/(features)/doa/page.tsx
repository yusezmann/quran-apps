"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchDuas } from "./services/doa.service"
import { useStore } from "./store/doa-store"
import Header from "@/components/Header"
import PageBackground from "@/components/PageBackground"
import DoaHaditsTabs from "@/components/DoaHaditsTabs"
import DuaList from "./components/list-doa"
import DuaDetails from "./components/doa-view"
import { Footer } from "@/components/footer"
import { Alert, Spin } from "antd"
import { FaMosque } from "react-icons/fa"

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
      // Auto select first doa if none selected
      if (!selectedDuaId && data.data.length > 0) {
        setSelectedDuaId(data.data[0].judul)
      }
    }
  }, [data, isLoading, setDuas, setIsLoading, selectedDuaId, setSelectedDuaId])

  const selectedDua = duas.find((d) => d.judul === selectedDuaId)

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center">
            <FaMosque className="w-12 h-12 text-green-600 mb-4 animate-pulse" />
            <Spin size="large" />
            <p className="mt-4 text-gray-600 font-medium">Memuat kumpulan doa...</p>
          </div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen relative">
        <Header />
        <PageBackground />
        <div className="flex justify-center items-center min-h-screen relative z-10 px-4">
          <div className="max-w-md w-full">
            <Alert 
              message="Terjadi Kesalahan!" 
              description="Gagal memuat data doa. Silakan refresh halaman atau coba lagi nanti."
              type="error" 
              showIcon 
              className="shadow-xl rounded-2xl border-0 bg-white/95 backdrop-blur-sm"
              action={
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Refresh Halaman
                </button>
              }
            />
          </div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen relative">
      <Header />
      <PageBackground />

      {/* Hero section */}
      <div className="relative z-10 pt-28 pb-8">
        <div className="text-center px-4 mb-8">
          <DoaHaditsTabs />
          <h1 className="text-3xl xl:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Kumpulan Doa Harian
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto drop-shadow">
            Pelajari dan amalkan doa-doa pilihan untuk kehidupan sehari-hari
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-4 xl:px-16 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Mobile: Search compact + Doa Details */}
            <div className="lg:hidden col-span-1 space-y-4">
              <DuaList
                duas={duas}
                selectedDuaId={selectedDuaId}
                setSelectedDuaId={setSelectedDuaId}
                isMobile={true}
              />
              <DuaDetails dua={selectedDua} />
            </div>

            {/* Desktop: Doa List full */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <DuaList
                duas={duas}
                selectedDuaId={selectedDuaId}
                setSelectedDuaId={setSelectedDuaId}
                isMobile={false}
              />
            </div>

            {/* Desktop: Doa Details di samping */}
            <div className="hidden lg:block lg:col-span-8 xl:col-span-9">
              <DuaDetails dua={selectedDua} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer (juga di mobile: berisi tombol unduh APK) */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

export default Doa