import { Typography } from "antd"
import { BookOpen, Heart } from "lucide-react"
import type { Dua } from "../interfaces/doa.interface"

const { Title, Paragraph } = Typography

interface DuaDetailsProps {
  dua: Dua | undefined
}

export default function DuaDetails({ dua }: DuaDetailsProps) {
  if (!dua) {
    return (
      <div className="relative z-10">
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-6 sm:px-8 text-gray-500">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 border border-green-200">
              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
            </div>
            <Title level={4} className="!text-gray-600 text-center !mb-2 sm:!mb-4 !text-base sm:!text-xl">
              Pilih Doa untuk Dibaca
            </Title>
            <Paragraph className="text-center text-gray-500 max-w-md !text-sm sm:!text-base !mb-0">
              Klik pada salah satu doa dari daftar untuk menampilkan teks Arab dan terjemahannya
            </Paragraph>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10">
      <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 px-4 sm:px-6 py-3 sm:py-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-12 translate-x-8 sm:translate-x-12"></div>

          <div className="relative z-10 flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 border border-white/30">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-bold text-sm sm:text-lg leading-tight line-clamp-2">
                {dua.judul}
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 lg:px-12 py-8 sm:py-10 lg:py-12 space-y-8 sm:space-y-10">
          {/* Teks Arab */}
          <div className="pb-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium bg-green-100 text-green-700 mb-4 sm:mb-6">
              النص العربي
            </span>
            <Paragraph
              className="!text-xl sm:!text-2xl md:!text-3xl !leading-[2.2] sm:!leading-[2.6] lg:!leading-[2.8] !text-gray-800 !mb-0 font-tertiary text-right"
              dir="rtl"
            >
              {dua.doa}
            </Paragraph>
          </div>

          {/* Divider */}
          <div className="flex items-center py-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="px-6">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Terjemahan */}
          <div className="pt-2">
            <div className="flex items-center mb-4 sm:mb-5">
              <div className="w-1 h-6 sm:h-7 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-blue-700 font-semibold text-sm sm:text-base">Terjemahan</span>
            </div>
            <Paragraph className="!text-gray-600 !text-base sm:!text-lg !leading-[1.9] sm:!leading-[2.0] !mb-0 italic pl-2">
              "{dua.artinya}"
            </Paragraph>
          </div>

          {/* Footer Aamiin */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-5 sm:px-8 py-5 sm:py-6 rounded-xl text-center border border-emerald-100 mt-4">
            <Paragraph className="!text-lg sm:!text-xl !text-emerald-700 !mb-2 font-tertiary" dir="rtl">
              آمِيْنَ يَا رَبَّ الْعَالَمِيْنَ
            </Paragraph>
            <span className="text-sm sm:text-base text-emerald-600">
              Aamiin Ya Rabbal 'Aalamiin
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
