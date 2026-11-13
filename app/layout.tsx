import { Toaster } from "sonner"
import type { Metadata } from "next"
import { Poppins, Scheherazade_New, Reem_Kufi, Noto_Nastaliq_Urdu, Noto_Sans_Arabic, Amiri, Cairo } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/components/providers/query-provider"
import { AntdProvider } from "@/components/providers/antd-provider"
import AdzanManager from "@/app/(features)/adzan/components/AdzanManager"
import AdzanBanner from "@/app/(features)/adzan/components/AdzanBanner"
import AdzanSettingsModal from "@/app/(features)/adzan/components/AdzanSettingsModal"
import AutoLocationManager from "@/components/AutoLocationManager"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

const reemkufi = Reem_Kufi({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-reem-kufi",
})

const amiriQuran = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-amiri",
})

// Font khusus untuk Asmaul Husna - lebih jelas dan mudah dibaca
const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-noto-nastaliq",
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-arabic",
})

// Font Amiri - sangat bagus untuk teks Arab, lebih jelas dan mudah dibaca
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri-husna",
})

// Font Cairo - sangat jelas dan mudah dibaca untuk teks Arab
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "Quran Apps",
  description: "Aplikasi Al-Quran Digital dan Jadwal Sholat",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/assets/logo/logo.png",
    apple: "/assets/logo/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body
        className={`${poppins.variable} ${reemkufi.variable} ${amiriQuran.variable} ${notoNastaliq.variable} ${notoSansArabic.variable} ${amiri.variable} ${cairo.variable} bg-gray-100 dark:bg-[#1c1c22]`}
      >
        <QueryProvider>
          <AntdProvider>
            {children}
            {/* Adzan aktif di semua halaman: penjadwal, banner saat adzan, dan pengaturan */}
            <AdzanManager />
            <AdzanBanner />
            <AdzanSettingsModal />
            <AutoLocationManager />
          </AntdProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}
