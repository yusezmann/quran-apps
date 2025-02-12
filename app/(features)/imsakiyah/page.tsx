import PrayerTimeComponent from "@/components/prayer-times"
import ImsakiyahComponent from "./components/imsakiyah"
import Header from "@/components/header"

const Imsakiyah = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* <PrayerTimeComponent /> */}
        <ImsakiyahComponent />
      </div>
    </div>
  )
}

export default Imsakiyah
