import { useState, useEffect, useRef } from "react"
import { Hexagon, Search, BookOpen, X, ChevronDown } from "lucide-react"
import { HadithListProps } from "../interfaces/hadits.interface"

const HadithList: React.FC<HadithListProps> = ({
  hadiths,
  selectedHadithId,
  setSelectedHadithId,
  isMobile = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredHadiths = hadiths.filter(
    (hadith: any) =>
      hadith.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hadith.arab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hadith.no.toString().includes(searchTerm) ||
      hadith.indo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedHadith = hadiths.find(
    (hadith) => hadith.no === selectedHadithId,
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredHadiths.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setFocusedIndex((prev) =>
            prev < filteredHadiths.length - 1 ? prev + 1 : 0,
          )
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredHadiths.length - 1,
          )
        } else if (e.key === "Enter" && focusedIndex >= 0) {
          e.preventDefault()
          setSelectedHadithId(filteredHadiths[focusedIndex].no)
          setFocusedIndex(-1)
        } else if (e.key === "Escape") {
          setFocusedIndex(-1)
          searchInputRef.current?.blur()
        } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault()
          searchInputRef.current?.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [filteredHadiths, focusedIndex, setSelectedHadithId])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[
        focusedIndex
      ] as HTMLElement
      if (focusedElement) {
        focusedElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [focusedIndex])

  // Mobile version
  if (isMobile) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden relative z-10 border border-white/20">
        {/* Mobile Collapsed Header */}
        <div
          className="bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white p-4 cursor-pointer"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-3 border border-white/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {selectedHadith
                    ? `Hadits ${selectedHadith.no}: ${selectedHadith.judul}`
                    : "Pilih Hadits"}
                </h3>
                <p className="text-white/80 text-xs">
                  {hadiths.length} hadits tersedia • Tap untuk ganti
                </p>
              </div>
            </div>
            <div
              className={`transition-transform duration-300 ${
                isMobileExpanded ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Mobile Expandable Content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Search Bar */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari hadits..."
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white shadow-sm transition-all duration-200 text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setFocusedIndex(-1)
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    searchInputRef.current?.focus()
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-2 text-xs text-gray-500">
                {filteredHadiths.length} hadits ditemukan
              </div>
            )}
          </div>

          {/* Mobile Hadith List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredHadiths.length > 0 ? (
              <div ref={listRef} className="divide-y divide-gray-100">
                {filteredHadiths.map((hadith: any, index: number) => (
                  <div
                    key={hadith.no}
                    className={`cursor-pointer transition-all duration-200 hover:bg-green-50 ${
                      selectedHadithId === hadith.no
                        ? "bg-green-100 border-r-4 border-green-500"
                        : ""
                    } ${
                      focusedIndex === index ? "ring-2 ring-green-500 ring-inset" : ""
                    }`}
                    onClick={() => {
                      setSelectedHadithId(hadith.no)
                      setIsMobileExpanded(false)
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                  >
                    <div className="p-3 flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 text-xs font-semibold ${
                          selectedHadithId === hadith.no
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {hadith.no}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm truncate ${
                            selectedHadithId === hadith.no
                              ? "text-green-800"
                              : "text-gray-800"
                          }`}
                        >
                          {hadith.judul || "Hadits Tanpa Judul"}
                        </h4>
                      </div>
                      {selectedHadithId === hadith.no && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Tidak ada hadits yang ditemukan</p>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    )
  }

  // Desktop version
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden h-[435px] xl:h-[80vh] relative z-10 border border-white/20">
      {/* Header dengan design modern */}
      <div className="bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4 border border-white/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Hadits Arbain Nawawi</h2>
              <p className="text-white/80 text-sm">40 Hadits Pilihan</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
            <span className="text-sm font-medium">{hadiths.length}</span>
          </div>
        </div>
      </div>

      {/* Search Bar dengan design premium */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-green-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari hadits yang diinginkan..."
            className="w-full pl-12 pr-20 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white shadow-sm transition-all duration-200 text-gray-700 placeholder-gray-400 hover:shadow-md"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setFocusedIndex(-1)
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("")
                searchInputRef.current?.focus()
              }}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
        {searchTerm && (
          <div className="mt-2 text-xs text-gray-500">
            {filteredHadiths.length} hadits ditemukan
          </div>
        )}
      </div>

      {/* List dengan design premium */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
        {filteredHadiths.length > 0 ? (
          <div ref={listRef} className="divide-y divide-gray-100">
            {filteredHadiths.map((hadith: any, index: number) => (
              <div
                key={hadith.no}
                className={`cursor-pointer group relative transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 ${
                  selectedHadithId === hadith.no
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-r-4 border-green-500 shadow-sm"
                    : ""
                } ${
                  focusedIndex === index
                    ? "ring-2 ring-green-500 ring-inset bg-green-50/30"
                    : ""
                }`}
                onClick={() => {
                  setSelectedHadithId(hadith.no)
                  setFocusedIndex(-1)
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                onMouseLeave={() => setFocusedIndex(-1)}
                tabIndex={0}
                role="button"
                aria-label={`Pilih hadits: ${hadith.judul}`}
              >
                <div className="p-5 flex items-center relative">
                  {/* Number badge dengan design premium */}
                  <div
                    className={`relative flex items-center justify-center w-12 h-12 rounded-2xl mr-4 transition-all duration-200 ${
                      selectedHadithId === hadith.no
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25 scale-105"
                        : "bg-gradient-to-r from-gray-400 to-gray-500 group-hover:from-green-400 group-hover:to-emerald-400 group-hover:shadow-md"
                    }`}
                  >
                    <Hexagon className="w-8 h-8 text-white" />
                    <span className="absolute text-white font-bold text-xs">
                      {hadith.no}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 ml-2">
                    <h3
                      className={`font-semibold transition-colors duration-200 truncate ${
                        selectedHadithId === hadith.no
                          ? "text-green-800"
                          : "text-gray-800 group-hover:text-green-700"
                      }`}
                    >
                      {hadith.judul || "Hadits Tanpa Judul"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {hadith.indo.substring(0, 60)}...
                    </p>
                  </div>

                  {/* Arrow indicator dengan animasi */}
                  <div
                    className={`transition-all duration-200 ${
                      selectedHadithId === hadith.no
                        ? "text-green-600 transform translate-x-1 scale-110"
                        : "text-gray-300 group-hover:text-green-500 group-hover:transform group-hover:translate-x-1"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <div className="bg-gradient-to-r from-gray-100 to-slate-100 p-6 rounded-2xl mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-600 mb-2">
              Tidak ada hadits yang ditemukan
            </h4>
            <p className="text-center text-sm text-gray-400 max-w-xs">
              Coba gunakan kata kunci yang berbeda atau periksa ejaan pencarian
              Anda
            </p>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
      `}</style>
    </div>
  )
}

export default HadithList
