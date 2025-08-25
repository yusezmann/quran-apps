"use client"

import { useEffect, useState } from "react"
import { useHusna } from "../asmaulhusna/hooks/useHusna"
import { useHusnaStore } from "../asmaulhusna/store/husnaStore"
import Header from "@/components/Header"
import Image from "next/image"
import { Alert, Spin } from "antd"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "./asmaulhusna.css"
import SliderBtns from "./components/SliderBtns"
import AsmaulHusnaCard from "./components/AsmaulHusnaCard"
import AsmaulHusnaInfo from "./components/AsmaulHusnaInfo"
import ProgressBar from "./components/ProgressBar"
import QuickNavigation from "./components/QuickNavigation"
import ReadingStats from "./components/ReadingStats"
import MobileSliderControls from "./components/MobileSliderControls"
import { Footer } from "@/components/footer"

export default function AsmaulHusnaPage() {
  const { husna, setHusna } = useHusnaStore()
  const { data, error, isLoading } = useHusna()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const [isAutoplayActive, setIsAutoplayActive] = useState(true)

  useEffect(() => {
    if (data && data !== husna) {
      setHusna(data)
    }
  }, [data, husna, setHusna])

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-900 to-blue-900">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-white mt-4 text-lg">Memuat Asmaul Husna...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-900 to-blue-900">
        <Alert 
          message="Terjadi kesalahan!" 
          description="Gagal memuat data Asmaul Husna. Silakan coba lagi."
          type="error" 
          showIcon 
          className="max-w-md"
        />
      </div>
    )

  const handleSlideChange = (swiper: any) => {
    const currentIndex = swiper.activeIndex
    setCurrentSlide(currentIndex)
  }

  const handleSlideTo = (index: number) => {
    if (swiperInstance) {
      swiperInstance.slideTo(index)
    }
  }

  const toggleAutoplay = () => {
    setIsAutoplayActive(!isAutoplayActive)
    if (swiperInstance) {
      if (isAutoplayActive) {
        swiperInstance.autoplay.stop()
      } else {
        swiperInstance.autoplay.start()
      }
    }
  }

  return (
    <>
      <Header />
      <ProgressBar currentSlide={currentSlide} totalSlides={husna.length} />
      <div className="flex flex-col min-h-screen relative">
        {/* Background Image dengan overlay */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <Image
            src="/assets/images/kaabah.jpg"
            alt="Kaabah"
            layout="fill"
            objectFit="cover"
            className="brightness-40"
            priority
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto relative z-10 flex-1">
          {/* Header Section */}
          <div 
            className="relative z-10 top-[65px] xl:top-[70px] text-center px-4"
          >
            {/* <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              Asmaul Husna
            </h1> */}
            <p className="text-xl md:text-2xl text-white/90 mb-2 drop-shadow-lg arabic-text-header">
              اَسْمَاءُ الْحُسْنٰى
            </p>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              99 Nama Allah yang Maha Indah dan Agung
            </p>
            
            {/* Decorative line */}
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Swiper Section */}
          <div className="relative z-10 flex justify-center items-center top-[100px] md:top-24 lg:top-20">
            <div className="w-full max-w-7xl px-4">
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                centeredSlides={true}
                loop={false}
                navigation={false}
                pagination={false}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                modules={[Navigation, Pagination, Autoplay]}
                className="asmaul-husna-swiper"
                onSlideChange={handleSlideChange}
                onSwiper={setSwiperInstance}
                breakpoints={{
                  640: { slidesPerView: 1, spaceBetween: 20 },
                  768: { slidesPerView: 1, spaceBetween: 30 },
                  1024: { slidesPerView: 1, spaceBetween: 40 },
                  1280: { slidesPerView: 1, spaceBetween: 50 },
                }}
              >
                {husna.map((item, index) => (
                  <SwiperSlide key={item.id}>
                    <AsmaulHusnaCard 
                      item={item} 
                      index={index} 
                      isActive={index === currentSlide}
                    />
                  </SwiperSlide>
                ))}

                {/* Navigation Buttons - Desktop */}
                <div className="hidden md:block">
                  <SliderBtns
                    containerStyle="flex gap-2 sm:gap-4 absolute left-2 right-2 sm:left-4 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-auto justify-between pointer-events-none"
                    btnStyle="bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 text-white text-lg w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center transition-all duration-300 pointer-events-auto border border-white/30 shadow-lg touch-manipulation"
                    iconsStyle="text-lg sm:text-xl"
                  />
                </div>

                {/* Mobile Controls */}
                <div className="md:hidden">
                  <MobileSliderControls 
                    isAutoplayActive={isAutoplayActive}
                    onToggleAutoplay={toggleAutoplay}
                  />
                </div>
              </Swiper>

            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mt-16 md:mt-28 space-y-8 md:space-y-12 pb-24 md:pb-32">
            <QuickNavigation onNavigate={handleSlideTo} />

            {/* Reading Stats */}
            <ReadingStats currentSlide={currentSlide} totalSlides={husna.length} />

            {/* Info Section */}
            <AsmaulHusnaInfo currentSlide={currentSlide} totalSlides={husna.length} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="hidden sm:block bottom-0 w-full">
        <Footer />
      </div>
    </>
  )
}
