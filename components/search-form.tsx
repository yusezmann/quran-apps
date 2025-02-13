"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function SearchForm() {
  const [query, setQuery] = useState("")
  const [isSearchVisible, setSearchVisible] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&page=1`)
    }
    toggleSearch()
    setQuery("")
  }

  const toggleSearch = () => {
    setSearchVisible(!isSearchVisible)
  }

  return (
    <div className="relative right-[260px]">
      {!isSearchVisible ? (
        <button
          onClick={toggleSearch}
          className="relative left-[260px] top-0 p-2 bg-transparent text-white/60 rounded-full hover:border-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-text-white/60"
          aria-label="Toggle Search"
        >
          <Search className="h-5 w-5" />
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="absolute top-[-18px] left-[110px] xl:left-[98px] rounded-md flex items-center w-56 bg-transparent" // Ubah w-72 menjadi w-56
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="px-4 py-0 rounded-3xl border border-white/60 bg-transparent text-white/80 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-text-white/60"
            style={{ width: "150px" }} // Tambahkan inline style untuk lebih presisi jika diperlukan
          />
          <button
            type="submit"
            className="relative right-[48px] top-[0.25px] ml-2 p-2 bg-transparent text-white/60 hover:text-white rounded-full hover:bg-slate-100  focus:outline-none focus:ring-2 focus:ring-text-white/60"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
      )}
    </div>
  )
}
