import Header from "@/components/Header"
import Image from "next/image"

const Hadits = () => {
  return (
    <div>
      <Header />
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image
          src="/assets/images/kaabah.jpg"
          alt="Kaabah"
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
      </div>
    </div>
  )
}

export default Hadits
