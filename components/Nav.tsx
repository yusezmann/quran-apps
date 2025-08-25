"use client"

import Image from "next/image"
// next link
import Link from "next/link"
import { usePathname } from "next/navigation"

// icons
import {
  HiHome,
  HiViewColumns,
  HiRectangleGroup,
  HiArchiveBox,
  HiEnvelope,
} from "react-icons/hi2"

const links = [
  {
    name: "imsakiyah",
    path: "/imsakiyah",
    icon: "/assets/icons/time-call.png",
  },
  { name: "doa", path: "/doa", icon: "/assets/icons/praying.png" },
  { name: "home", path: "/", icon: "/assets/icons/home.png" },
  { name: "asmaulhusna", path: "/asmaulhusna", icon: "/assets/icons/99.png" },
  { name: "hadits", path: "/hadits", icon: "/assets/icons/islam.png" },
]

const Nav = () => {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col items-center xl:justify-center gap-y-4 fixed h-max bottom-0 mt-auto right-0 xl:right-[2%] z-40 top-0 w-full xl:w-16 xl:max-w-md xl:h-screen">
      {/* inner */}
      <div className="flex w-full xl:flex-col items-center justify-between xl:justify-center gap-y-10 px-4 md:px-40 xl:px-0 h-[80px] xl:h-max py-8 bg-green-500/95 backdrop-blur-sm text-3xl xl:text-xl xl:rounded-full z-40 shadow-lg">
        {links.map((link, index) => (
          <Link
            className={`${
              link.path === pathname && "bg-green-300/80 p-2 rounded-full shadow-lg"
            } relative flex items-center group hover:text-accent transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95`}
            href={link.path}
            key={index}
          >
            {/* tooltip - Only show on desktop */}
            <div className="absolute pr-14 right-0 hidden xl:group-hover:flex">
              <div className="bg-green-300 relative flex text-white items-center p-[6px] rounded-[3px] shadow-lg">
                <div className="text-[12px] leading-none font-semibold capitalize">
                  {link.name}
                </div>

                {/* triangle */}
                <div className="border-solid border-l-white border-l-8 border-y-transparent border-y-[6px] border-r-0 absolute -right-2"></div>
              </div>
            </div>

            {/* icon */}
            <Image
              src={link.icon}
              alt={link.name}
              className="w-10 h-10 xl:w-8 xl:h-8"
              width={24}
              height={24}
            />
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Nav
