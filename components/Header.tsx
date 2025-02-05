import Link from "next/link"
import { Search } from "lucide-react"
import { LoginOutlined } from "@ant-design/icons"
import { Button } from "antd"

export default function Header() {
  return (
    <header className="bg-green-600 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Al Qur'an
        </Link>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari surah atau ayat"
              className="py-1 px-3 pr-10 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <Button
            type="default"
            icon={<LoginOutlined />}
            size="middle"
            shape="round"
          >
            Login
          </Button>
        </div>
      </div>
    </header>
  )
}
