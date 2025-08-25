"use client"
import { AsmaulHusna } from "../interfaces/asmaulhusna.interface"

interface AsmaulHusnaCardProps {
  item: AsmaulHusna
  index: number
  isActive: boolean
}

const AsmaulHusnaCard = ({ item, index, isActive }: AsmaulHusnaCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-8">
      {/* Nomor dan Nama Latin */}
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 drop-shadow-lg">
          {item.id}. {item.latin}
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full shadow-lg"></div>
      </div>
     
      {/* Kartu Utama dengan Tulisan Arab */}
      <div className="mb-6 relative">
        <div
          className={`
            w-80 h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem]
            flex flex-col items-center justify-center
            shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl
            border-2 border-white/20
            ${isActive ? 'ring-4 ring-green-400/50 shadow-green-400/25' : ''}
            transition-all duration-300 ease-in-out
            hover:shadow-3xl hover:bg-white/98 hover:scale-105
            p-8 relative overflow-visible
          `}
        >
          {/* Teks Arab */}
          <div className="flex-1 flex items-center justify-center w-full">
            <p className="
              text-4xl md:text-5xl lg:text-6xl xl:text-7xl
              font-bold text-transparent bg-clip-text
              bg-gradient-to-br from-green-600 via-blue-600 to-purple-600
              leading-relaxed select-none
              break-words hyphens-auto
              max-w-full overflow-visible
              font-arabic
              text-center
            "
            style={{
              direction: 'rtl',
              unicodeBidi: 'embed',
              textAlign: 'center',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.3',
              letterSpacing: '0.025em'
            }}>
              {item.arab}
            </p>
          </div>
          
          {/* Arti Bahasa Indonesia - dipindah ke bawah */}
          <div className="mt-4 text-center max-w-xs md:max-w-sm lg:max-w-md">
            <p className="text-gray-700 text-sm md:text-base lg:text-lg italic leading-relaxed bg-white/60 px-4 py-2 rounded-xl backdrop-blur-sm border border-gray-200/50">
              {item.indo}
            </p>
          </div>
           
          {/* Efek glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl -z-10 pointer-events-none"></div>
        </div>
       
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-400/30 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-400/30 rounded-full blur-sm animate-pulse"></div>
      </div>
     
      {/* Progress indicator */}
      <div className="mt-8">
        <div className="flex items-center space-x-2">
          <span className="text-white/60 text-sm">Progress:</span>
          <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${(item.id / 99) * 100}%` }}
            />
          </div>
          <span className="text-white/60 text-sm">{item.id}/99</span>
        </div>
      </div>
    </div>
  )
}

export default AsmaulHusnaCard