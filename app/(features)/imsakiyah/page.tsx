import PrayerTimeComponent from "@/components/prayer-times"
import ImsakiyahComponent from "./components/imsakiyah"
import Header from "@/components/header"
import Image from "next/image"

const Imsakiyah = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Image
        src="/assets/images/kaabah.jpg"
        alt="Kaabah"
        fill
        sizes="(max-width: 768px) 100vw"
        className="object-cover brightness-50 rounded-b-2xl"
      />
      <div className="container mx-auto px-4 py-8">
        {/* <PrayerTimeComponent /> */}
        <ImsakiyahComponent />
      </div>
    </div>
  )
}

export default Imsakiyah
