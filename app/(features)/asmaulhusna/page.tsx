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
      <div className="flex flex-col min-h-screen">
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <Image
            src="/assets/images/kaabah.jpg"
            alt="Kaabah"
            layout="fill"
            objectFit="cover"
            className="brightness-50"
          />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="relative z-10 top-[40px] md:top-24">
            <h1 className="text-2xl font-bold text-center text-white mb-6  p-2 rounded-md">
              Asmaul Husna ( اَسْمَاءُ الْحُسْنٰى )
            </h1>
          </div>
          <div className="relative z-10 flex justify-center items-center top-[200px] md:top-24">
            <div className="w-full flex justify-center">
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                className="flex justify-center items-center"
                onSlideChange={handleSlideChange}
              >
                {husna.map((item) => (
                  <SwiperSlide
                    key={item.id}
                    className="flex flex-col items-center justify-center w-full"
                  >
                    <h2 className="text-md font-bold text-white text-center mb-4">
                      {item.id}. {item.latin}
                    </h2>
                    <div className="flex justify-center">
                      <Card
                        key={item.id}
                        className="w-[280px] h-[280px] xl:w-[280px] xl:h-[280px] flex flex-col items-center justify-center text-center shadow-lg bg-white/90 rounded-full"
                        bordered
                      >
                        <p className="text-[70px] xl:text-[80px] font-secondary font-bold mt-2 text-green-600 text-center">
                          {item.arab}
                        </p>
                      </Card>
                    </div>
                    <p className="text-white italic  text-sm text-center mt-6">
                      {item.indo}
                    </p>
                  </SwiperSlide>
                ))}

                <SliderBtns
                  containerStyle="flex gap-2 absolute left-0 right-0 bottom-[calc(50%_-_22px)] xl:bottom-0 z-20 w-full justify-between xl:w-max xl:justify-none"
                  btnStyle="bg-accent rounded-full hover:bg-accent-hover hover:text-white/60 text-primary text-[12px] w-[24px] h-[24px] flex justify-center items-center transition-all"
                />
              </Swiper>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden xl:block absolute bottom-0 w-full">
        <Footer />
      </div>
    </>
  )
}
