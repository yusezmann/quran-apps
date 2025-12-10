import { Card, Typography, Button, message } from "antd"
import { BookOpen, Copy, Share2, ArrowUp, Check, Scroll } from "lucide-react"
import { useState, useEffect } from "react"
import { HadithDetailsProps } from "../interfaces/hadits.interface"

const { Title, Paragraph } = Typography

const HadithDetails: React.FC<HadithDetailsProps> = ({ hadith }) => {
  const [copied, setCopied] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      message.success("Teks berhasil disalin!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      message.error("Gagal menyalin teks")
    }
  }

  const shareHadith = async () => {
    if (!hadith) return
    
    const shareText = `Hadits ${hadith.no}: ${hadith.judul}\n\n${hadith.arab}\n\n${hadith.indo}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hadits ${hadith.no}: ${hadith.judul}`,
          text: shareText,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(shareText)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!hadith) {
    return (
      <div className="relative z-10">
        <Card className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-20 px-8 text-gray-500">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-2xl mb-6 border border-green-200">
              <Scroll className="w-12 h-12 text-green-600" />
            </div>
            <Title level={3} className="!text-gray-600 text-center !mb-4">
              Pilih Hadits untuk Dibaca
            </Title>
            <Paragraph className="text-center text-gray-500 max-w-md">
              Klik pada salah satu hadits dari daftar untuk menampilkan teks Arab
              dan terjemahannya
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

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4 border border-white/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <Title level={2} className="!text-white !mb-1 !font-bold">
                  Hadits {hadith.no}: {hadith.judul}
                </Title>
                <p className="text-white/80 text-sm">Arbain Nawawi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                onClick={() =>
                  copyToClipboard(`${hadith.arab}\n\n${hadith.indo}`)
                }
                className="text-white hover:bg-white/20 border-white/30"
                title="Salin hadits"
              />
              <Button
                type="text"
                icon={<Share2 className="w-4 h-4" />}
                onClick={shareHadith}
                className="text-white hover:bg-white/20 border-white/30"
                title="Bagikan hadits"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 px-2">
          {/* Teks Arab dengan design elegant yang konsisten */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 xl:p-10 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-right">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  النص العربي
                </span>
              </div>
              <Paragraph
                className="!text-3xl xl:!text-4xl !leading-loose xl:!leading-[3.5] !text-gray-800 !mb-0 font-tertiary"
                dir="rtl"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {hadith.arab}
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
              <Paragraph className="!text-gray-700 !text-lg !leading-relaxed !mb-0">
                {hadith.indo}
              </Paragraph>
            </div>
          </div>

          {/* Footer dengan info hadits */}
          <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center">
            <div className="space-y-2">
              <Paragraph className="!text-sm !text-emerald-700 !mb-0 font-medium">
                Hadits ke-{hadith.no} dari 40 Hadits Arbain Nawawi
              </Paragraph>
              <Paragraph className="!text-xs !text-emerald-600 !mb-0">
                Kumpulan hadits pilihan yang mencakup berbagai aspek kehidupan
              </Paragraph>
            </div>
          </div>
        </div>
      </Card>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 xl:left-auto xl:right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-4"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default HadithDetails
