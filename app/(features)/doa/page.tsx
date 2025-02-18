import Header from "@/components/header"
import Image from "next/image"
import DoaComponent from "./components/doa-view"

const Doa = () => {
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
        <DoaComponent />
      </div>
    </div>
  )
}

export default Doa
