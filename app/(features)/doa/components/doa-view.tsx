import { Card, Typography } from "antd"
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
        <Card className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-20 px-8 text-gray-500">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-2xl mb-6 border border-green-200">
              <BookOpen className="w-12 h-12 text-green-600" />
            </div>
            <Title level={3} className="!text-gray-600 text-center !mb-4">
              Pilih Doa untuk Dibaca
            </Title>
            <Paragraph className="text-center text-gray-500 max-w-md">
              Klik pada salah satu doa dari daftar untuk menampilkan teks Arab dan terjemahannya
            </Paragraph>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative z-10">
      <Card className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
        {/* Header dengan gradient modern yang konsisten */}
        <div className="bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 -mx-6 -mt-6 px-8 py-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 flex items-center">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4 border border-white/30">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <Title level={2} className="!text-white !mb-1 !font-bold">
                {dua.judul}
              </Title>
              <p className="text-white/80 text-sm">Doa Harian</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-2">
          {/* Teks Arab dengan design elegant yang konsisten */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-right">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  النص العربي
                </span>
              </div>
              <Paragraph
                className="!text-3xl xl:!text-4xl !leading-[2.4] xl:!leading-[3.0] !text-gray-800 !mb-0 font-tertiary"
                dir="rtl"
                style={{
                  letterSpacing: "0.015em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {dua.arab}
              </Paragraph>
            </div>
          </div>

          {/* Divider dengan ornamen yang konsisten */}
          <div className="flex items-center justify-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="px-6">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          {/* Terjemahan dengan design yang konsisten */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></div>
              <Title level={4} className="!text-blue-800 !mb-0 !font-semibold">
                Terjemahan & Makna
              </Title>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/50">
              <Paragraph className="!text-gray-700 !text-lg !leading-relaxed !mb-0 italic">
                "{dua.indo}"
              </Paragraph>
            </div>
          </div>

          {/* Footer dengan doa penutup yang konsisten */}
          <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center">
            <div className="space-y-3">
              <Paragraph className="!text-lg !text-emerald-700 !mb-0 font-tertiary" dir="rtl">
                آمِيْنَ يَا رَبَّ الْعَالَمِيْنَ
              </Paragraph>
              <Paragraph className="!text-sm !text-emerald-600 !mb-0 font-medium">
                Aamiin Ya Rabbal 'Aalamiin
              </Paragraph>
              <Paragraph className="!text-xs !text-emerald-500 !mb-0">
                (Kabulkanlah ya Tuhan semesta alam)
              </Paragraph>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}