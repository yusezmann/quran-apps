"use client"

import Header from "@/components/Header"
import Image from "next/image"
import Schedule from "./components/Schedule"
import { Footer } from "@/components/footer"
import { Calendar, Clock } from "lucide-react"

const Imsakiyah = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/kaabah.jpg"
          alt="Kaabah"
          fill
          sizes="100vw"
          className="object-cover brightness-50 w-full h-full"
          priority
        />
      </div>

      <Header />
      <div className="container mx-auto px-4 py-6 xl:py-12 relative z-10">
        <div className="mt-6 xl:mt-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl mb-20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 px-6 xl:px-8 py-6 xl:py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 xl:p-4 rounded-xl border border-white/30">
                  <Calendar className="w-6 h-6 xl:w-8 xl:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl xl:text-3xl font-bold text-white mb-1">
                    Jadwal Imsakiyah dan Shalat
                  </h2>
                  <p className="text-white/80 text-sm xl:text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Informasi jadwal shalat lengkap untuk seluruh Indonesia
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 xl:p-8">
            <Schedule />
          </div>
        </div>
      </div>
      <div className="hidden xl:block">
        <Footer />
      </div>
    </div>
  )
}

export default Imsakiyah
