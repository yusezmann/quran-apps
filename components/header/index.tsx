import Link from "next/link"
import { Search } from "lucide-react"
import { LoginOutlined } from "@ant-design/icons"
import { Button } from "antd"
import Image from "next/image"

export default function Header() {
  return (
    <header className="bg-green-600 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex text-2xl font-bold items-center gap-2">
          <Image
            src="/assets/logo/logo.png"
            alt="logo"
            width={50}
            height={50}
          />
          <h2 className="hidden xl:block">Al Quran</h2>
        </Link>
        <nav className="hidden xl:flex gap-6">
          <Link href="/imsakiyah">
            <Button
              variant="text"
              color="default"
              className="text-white font-bold hover:text-white/60"
            >
              Imsakiyah
            </Button>
          </Link>
          <Link href="/doa">
            <Button
              variant="text"
              color="default"
              className="text-white font-bold hover:text-white/60"
            >
              Doa
            </Button>
          </Link>
          <Link href="/bookmarks">
            <Button
              variant="text"
              color="default"
              className="text-white font-bold hover:text-white/60"
            >
              Bookmarks
            </Button>
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari surah atau ayat"
              className="py-1 px-3 pr-1 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          {/* <Button
            type="default"
            icon={<LoginOutlined />}
            size="middle"
            shape="round"
          >
            Login
          </Button> */}
        </div>
      </div>
    </header>
  )
}
