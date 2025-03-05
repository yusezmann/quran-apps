"use client"

import { useEffect } from "react"
import { useHusna } from "../asmaulhusna/hooks/useHusna"
import { useHusnaStore } from "../asmaulhusna/store/husnaStore"
import Header from "@/components/Header"
import Image from "next/image"
import { Alert, Card, Spin } from "antd"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import SliderBtns from "./components/SliderBtns"
import { Footer } from "@/components/footer"

export default function AsmaulHusnaPage() {
  const { husna, setHusna } = useHusnaStore()
  const { data, error, isLoading } = useHusna()

  useEffect(() => {
    if (data && data !== husna) {
      setHusna(data)
    }
  }, [data, husna, setHusna])

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

  const handleSlideChange = (swiper: { activeIndex: number }) => {
    const currentIndex = swiper.activeIndex
    console.log("Current slide index:", currentIndex)
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-100px)]">
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <Image
            src="/assets/images/kaabah.jpg"
            alt="Kaabah"
            layout="fill"
            objectFit="cover"
            className="brightness-50"
          />
        </div>
        <div className="container mx-auto p-6 relative z-10">
          <div className="relative z-10 top-[100px] md:top-24">
            <h1 className="text-2xl font-bold text-center text-white mb-6 bg-black/50 p-2 rounded-md">
              Asmaul Husna
            </h1>
          </div>
          <div className="relative z-10 top-[200px] md:top-24">
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-28">
              {husna.map((item) => (
                <Card
                  key={item.id}
                  className="text-center shadow-lg p-4 bg-white/90 rounded-xl"
                  bordered
                >
                  <h2 className="text-xl font-bold text-gray-800">
                    {item.id}. {item.latin}
                  </h2>
                  <p className="text-2xl font-arabic font-bold mt-2 text-green-600">
                    {item.arab}
                  </p>
                  <p className="text-gray-800/60 mt-1 italic">{item.indo}</p>
                </Card>
              ))}
            </div>
            <div className="md:hidden px-4">
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                className="xl:h-[520px] mb-12"
                onSlideChange={handleSlideChange}
              >
                {husna.map((item) => (
                  <SwiperSlide key={item.id} className="w-full">
                    <Card
                      className="text-center shadow-lg p-2 bg-white/90 rounded-xl"
                      bordered
                    >
                      <h2 className="text-xl font-bold text-gray-800">
                        {item.id}. {item.latin}
                      </h2>
                      <p className="text-2xl font-arabic font-bold mt-2 text-green-600">
                        {item.arab}
                      </p>
                      <p className="text-gray-800/60 mt-1 italic">
                        {item.indo}
                      </p>
                    </Card>
                  </SwiperSlide>
                ))}

                <SliderBtns
                  containerStyle="flex gap-2 absolute right-0 bottom-[calc(50%_-_22px)] xl:bottom-0 z-20 w-full justify-between xl:w-max xl:justify-none"
                  btnStyle="bg-accent rounded-full hover:bg-accent-hover hover:text-white/60 text-primary text-[12px] w-[24px] h-[24px] flex justify-center items-center transition-all"
                />
              </Swiper>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden xl:block">
        <Footer />
      </div>
    </>
  )
}
