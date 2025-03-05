"use client"

import Header from "@/components/Header"
import Image from "next/image"
import CitySelector from "./components/CitySelector"
import Schedule from "./components/Schedule"
import { useState } from "react"
import { City } from "./interfaces/imsakiyah.interface"
import { Footer } from "@/components/footer"

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
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mt-24 bg-white bg-opacity-80 p-4 rounded-lg shadow-lg mb-20">
          <h2 className="text-3xl font-bold mb-4 text-gray-600 text-center">
            Jadwal Imsakiyah dan Shalat
          </h2>

          <Schedule />
        </div>
      </div>
      <div className="hidden xl:block">
        <Footer />
      </div>
    </div>
  )
}

export default Imsakiyah
