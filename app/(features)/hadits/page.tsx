"use client"

import { useEffect } from "react"
import Header from "@/components/Header"
import Image from "next/image"
import { useHadithStore } from "./store/hadits-store"
import { useQuery } from "@tanstack/react-query"
import { fetchHadiths } from "./services/hadits.service"
import HadithList from "./components/hadits-list"
import HadithDetails from "./components/hadits-view"
import { Footer } from "@/components/footer"
import { Alert, Spin } from "antd"
import { FaMosque } from "react-icons/fa"

const Hadits = () => {
  const { setHadiths, setIsLoading, hadiths, selectedHadithId, setSelectedHadithId } =
    useHadithStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ["hadiths"],
    queryFn: fetchHadiths,
  })

  useEffect(() => {
    setIsLoading(isLoading)
    if (data?.data) {
      setHadiths(data.data)
      if (!selectedHadithId && data.data.length > 0) {
        setSelectedHadithId(data.data[0].no)
      }
    }
  }, [data, isLoading, setHadiths, setIsLoading, selectedHadithId, setSelectedHadithId])

  const selectedHadith = hadiths.find((h) => h.no === selectedHadithId)

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center">
            <FaMosque className="w-12 h-12 text-green-600 mb-4 animate-pulse" />
            <Spin size="large" />
            <p className="mt-4 text-gray-600 font-medium">Memuat kumpulan hadits...</p>
          </div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen relative">
        <Header />
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/images/kaabah.jpg"
            alt="Kaabah"
            fill
            sizes="100vw"
            className="object-cover w-full h-full brightness-50"
            priority
          />
        </div>
        <div className="flex justify-center items-center min-h-screen relative z-10 px-4">
          <div className="max-w-md w-full">
            <Alert
              message="Terjadi Kesalahan!"
              description="Gagal memuat data hadits. Silakan refresh halaman atau coba lagi nanti."
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

      {/* Background dengan overlay gradient */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/kaabah.jpg"
          alt="Kaabah"
          fill
          sizes="100vw"
          className="object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-emerald-900/10"></div>
      </div>

      {/* Hero section */}
      <div className="relative z-10 pt-28 pb-8">
        <div className="text-center px-4 mb-8">
          <h1 className="text-3xl xl:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Hadits Arbain Nawawi
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto drop-shadow">
            Kumpulan 40 hadits pilihan yang mencakup berbagai aspek kehidupan
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-4 xl:px-16 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Mobile: Hadith List + Details */}
            <div className="lg:hidden col-span-1 space-y-4">
              <HadithList
                hadiths={hadiths}
                selectedHadithId={selectedHadithId}
                setSelectedHadithId={setSelectedHadithId}
                isMobile={true}
              />
              <HadithDetails hadith={selectedHadith} />
            </div>

            {/* Desktop: Hadith List */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <HadithList
                hadiths={hadiths}
                selectedHadithId={selectedHadithId}
                setSelectedHadithId={setSelectedHadithId}
                isMobile={false}
              />
            </div>

            {/* Desktop: Hadith Details */}
            <div className="hidden lg:block lg:col-span-8 xl:col-span-9">
              <HadithDetails hadith={selectedHadith} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer hanya di desktop */}
      <div className="hidden xl:block relative z-10">
        <Footer />
      </div>

      {/* Floating stats */}
      <div className="fixed bottom-6 right-6 z-50 hidden xl:block animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/95 backdrop-blur-md rounded-full px-5 py-3 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3 text-sm">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-gray-700 font-semibold">{hadiths.length} Hadits Tersedia</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hadits
