"use client"

import { useState } from "react"

interface QuickNavigationProps {
  onNavigate: (index: number) => void
}

const QuickNavigation = ({ onNavigate }: QuickNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Kategori Asmaul Husna
  const categories = [
    { name: "Ar-Rahman", start: 1, end: 10 },
    { name: "Al-Malik", start: 11, end: 20 },
    { name: "Al-Quddus", start: 21, end: 30 },
    { name: "As-Salam", start: 31, end: 40 },
    { name: "Al-Mu'min", start: 41, end: 50 },
    { name: "Al-Muhaymin", start: 51, end: 60 },
    { name: "Al-Aziz", start: 61, end: 70 },
    { name: "Al-Jabbar", start: 71, end: 80 },
    { name: "Al-Mutakabbir", start: 81, end: 90 },
    { name: "Al-Ghaffar", start: 91, end: 99 }
  ]

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative z-10 text-center px-4 mb-6 md:mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/20 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 text-white font-medium border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300 text-sm md:text-base"
      >
        {isOpen ? 'Tutup Navigasi Cepat' : 'Buka Navigasi Cepat'}
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out mt-3 md:mt-4 ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 max-w-4xl mx-auto border border-white/20">
          <h3 className="text-white text-base md:text-lg font-semibold mb-3 md:mb-4">
            Navigasi Cepat ke Kategori
          </h3>
          
          {/* Search Input */}
          <div className="mb-4 md:mb-6">
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-3 md:px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
            {filteredCategories.map((category, index) => (
              <button
                key={category.name}
                onClick={() => onNavigate(category.start - 1)}
                className="bg-white/10 rounded-lg p-2 md:p-3 text-white text-xs md:text-sm hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20"
              >
                <div className="font-medium mb-1 text-xs md:text-sm">{category.name}</div>
                <div className="text-xs text-white/70">
                  {category.start}-{category.end}
                </div>
              </button>
            ))}
          </div>

          {/* Quick Numbers */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/20">
            <h4 className="text-white font-medium mb-2 md:mb-3 text-sm md:text-base">Lompat ke Nomor:</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99].map((num) => (
                <button
                  key={num}
                  onClick={() => onNavigate(num - 1)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full text-white font-bold hover:bg-white/30 hover:scale-110 transition-all duration-300 border border-white/30 text-sm md:text-base"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickNavigation
