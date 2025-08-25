"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { IoClose, IoHome, IoTime, IoHeart, IoStar, IoBook, IoSearch, IoChevronDown } from "react-icons/io5"
import "./mobile-menu.css"

export default function MobileMenu({
  isOpen,
  toggleMenu,
}: {
  isOpen: boolean
  toggleMenu: () => void
}) {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const links = [
    { 
      path: "/", 
      label: "Home", 
      icon: IoHome,
      description: "Beranda aplikasi",
      category: "main"
    },
    { 
      path: "/imsakiyah", 
      label: "Imsakiyah", 
      icon: IoTime,
      description: "Jadwal waktu shalat",
      category: "worship"
    },
    { 
      path: "/doa", 
      label: "Doa", 
      icon: IoHeart,
      description: "Kumpulan doa harian",
      category: "worship"
    },
    { 
      path: "/asmaulhusna", 
      label: "Asmaul Husna", 
      icon: IoStar,
      description: "99 nama Allah yang indah",
      category: "knowledge"
    },
    { 
      path: "/hadits", 
      label: "Hadits", 
      icon: IoBook,
      description: "Kumpulan hadits pilihan",
      category: "knowledge"
    },
  ]

  const categories = {
    main: "Menu Utama",
    worship: "Ibadah",
    knowledge: "Pengetahuan"
  }

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      toggleMenu()
    }
  }

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleMenu()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, toggleMenu])

  // Reset search when menu closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setActiveCategory(null)
    }
  }, [isOpen])

  const filteredLinks = links.filter(link => 
    link.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = []
    }
    acc[link.category].push(link)
    return acc
  }, {} as Record<string, typeof links>)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`mobile-menu-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      />
      
      {/* Menu Panel */}
      <div
        ref={menuRef}
        className={`mobile-menu-panel fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-green-600 via-green-700 to-green-800 z-50 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="mobile-menu-header flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <IoStar className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Al Quran</h2>
              <p className="text-white/70 text-sm">Mobile Menu</p>
            </div>
          </div>
          <button
            onClick={toggleMenu}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200 active:scale-95"
            aria-label="Tutup menu"
          >
            <IoClose className="text-white text-xl" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/20">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-menu-input w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
              aria-label="Cari menu"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mobile-menu-content flex-1 overflow-y-auto p-4 space-y-4 mobile-menu-scroll">
          {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-white/80 font-medium text-sm uppercase tracking-wider">
                  {categories[category as keyof typeof categories]}
                </h3>
                <button
                  onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                  className="p-1 hover:bg-white/20 rounded transition-colors duration-200 active:scale-95"
                  aria-label={`Toggle ${categories[category as keyof typeof categories]} category`}
                >
                  <IoChevronDown 
                    className={`text-white/60 text-sm transition-transform duration-200 ${
                      activeCategory === category ? "rotate-180" : ""
                    }`} 
                  />
                </button>
              </div>

              {/* Category Links */}
              <div className={`space-y-2 transition-all duration-300 ${
                activeCategory === category || activeCategory === null ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              }`}>
                {categoryLinks.map((link) => {
                  const isActive = pathname === link.path
                  return (
                    <div
                      key={link.path}
                      className="mobile-menu-item transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Link
                        href={link.path}
                        onClick={toggleMenu}
                        className={`block p-4 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white border-l-4 border-white shadow-lg"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                        aria-label={`Buka ${link.label}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isActive ? "bg-white/20" : "bg-white/10"
                          }`}>
                            <link.icon className={`text-xl ${isActive ? "text-white" : "text-white/70"}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${isActive ? "text-white" : "text-white/90"}`}>
                              {link.label}
                            </h3>
                            <p className={`text-sm ${isActive ? "text-white/80" : "text-white/60"}`}>
                              {link.description}
                            </p>
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* No Results */}
          {filteredLinks.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-white/60 text-sm">Tidak ada menu yang ditemukan</p>
              <p className="text-white/40 text-xs mt-1">Coba kata kunci lain</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mobile-menu-footer p-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">Versi 1.0.0</p>
            <p className="text-white/40 text-xs">
              © 2024 Al Quran Apps. Semua hak dilindungi.
            </p>
          </div>
        </div>

        {/* Swipe Indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/40 text-xs">
          <div className="flex flex-col items-center space-y-1">
            <span>←</span>
            <span>Swipe</span>
            <span>←</span>
          </div>
        </div>
      </div>
    </>
  )
}
