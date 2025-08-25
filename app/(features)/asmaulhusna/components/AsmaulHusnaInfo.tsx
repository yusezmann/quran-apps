"use client"
import { useState } from "react"

interface AsmaulHusnaInfoProps {
  currentSlide: number
  totalSlides: number
}

const AsmaulHusnaInfo = ({ currentSlide, totalSlides }: AsmaulHusnaInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const infoItems = [
    {
      title: "Keutamaan",
      content: "Membaca Asmaul Husna dapat mendekatkan diri kepada Allah dan mendapatkan pahala yang besar."
    },
    {
      title: "Waktu Terbaik",
      content: "Pagi hari setelah shalat subuh dan sore hari sebelum maghrib adalah waktu yang utama."
    },
    {
      title: "Cara Membaca",
      content: "Bacalah dengan penuh penghayatan dan pemahaman makna setiap nama Allah."
    }
  ]

  return (
    <div className="relative z-10 w-full px-3 sm:px-4 md:px-6 mt-6 md:mt-8 mb-8 md:mb-12">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 w-full max-w-4xl mx-auto border border-white/20">
        <h3
          className="text-white text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-6 cursor-pointer hover:scale-105 transition-transform duration-300 flex items-center justify-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Tentang Asmaul Husna
          <span className="ml-2 text-xs sm:text-sm text-white/60">
            {isExpanded ? '▼' : '▶'}
          </span>
        </h3>
       
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-[800px] sm:max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Grid untuk cards info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-left mb-4 md:mb-6">
            {infoItems.map((item, index) => (
              <div
                key={item.title}
                className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 border border-white/10 hover:bg-white/10 transition-colors duration-300"
              >
                <h4 className="text-green-400 font-semibold mb-2 text-sm md:text-base">
                  {item.title}
                </h4>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
         
          {/* Deskripsi lengkap */}
          <div className="pt-3 sm:pt-4 md:pt-6 border-t border-white/20">
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed text-center px-2 sm:px-4">
              Asmaul Husna adalah 99 nama Allah yang Maha Indah dan Agung.
              Setiap nama memiliki makna dan keutamaan yang dalam.
              Dengan membaca dan memahami Asmaul Husna, kita dapat lebih mengenal
              dan mendekatkan diri kepada Allah SWT. Semoga dengan mempelajari
              Asmaul Husna, kita dapat meningkatkan iman dan taqwa kepada-Nya.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AsmaulHusnaInfo