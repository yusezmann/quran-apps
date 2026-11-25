import { Toaster } from "sonner"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { QueryProvider } from "@/components/providers/query-provider"
import { AntdProvider } from "@/components/providers/antd-provider"
import AdzanManager from "@/app/(features)/adzan/components/AdzanManager"
import AdzanBanner from "@/app/(features)/adzan/components/AdzanBanner"
import AdzanSettingsModal from "@/app/(features)/adzan/components/AdzanSettingsModal"
import AutoLocationManager from "@/components/AutoLocationManager"
import AdultOnly from "@/components/AdultOnly"
import UpdatePrompt from "@/components/UpdatePrompt"

/*
 * Font disimpan di dalam proyek (app/fonts/google, lisensi OFL — lihat OFL-LICENSES.txt), bukan diunduh
 * dari Google Fonts saat build. Build jadi tidak gagal bila koneksi ke Google bermasalah.
 * Dibuat dengan fonttools: ketebalan sama seperti sebelumnya, hanya huruf Latin & Arab (fitur sambung huruf tetap).
 */
const poppins = localFont({
  src: [
    { path: "./fonts/google/Poppins-100.woff2", weight: "100", style: "normal" },
    { path: "./fonts/google/Poppins-200.woff2", weight: "200", style: "normal" },
    { path: "./fonts/google/Poppins-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/google/Poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/google/Poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/google/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/google/Poppins-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/google/Poppins-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
})

const reemkufi = localFont({
  src: [
    { path: "./fonts/google/ReemKufi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/google/ReemKufi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-reem-kufi",
  display: "swap",
})

const amiriQuran = localFont({
  src: "./fonts/google/ScheherazadeNew-400.woff2",
  weight: "400",
  variable: "--font-amiri",
  display: "swap",
})

// Font khusus untuk Asmaul Husna - lebih jelas dan mudah dibaca
const notoNastaliq = localFont({
  src: "./fonts/google/NotoNastaliqUrdu-400.woff2",
  weight: "400",
  variable: "--font-noto-nastaliq",
  display: "swap",
})

const notoSansArabic = localFont({
  src: "./fonts/google/NotoSansArabic-VF.woff2",
  weight: "400 700",
  variable: "--font-noto-sans-arabic",
  display: "swap",
})

// Font Amiri - sangat bagus untuk teks Arab, lebih jelas dan mudah dibaca
const amiri = localFont({
  src: [
    { path: "./fonts/google/Amiri-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/google/Amiri-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri-husna",
  display: "swap",
})

// Font Cairo - sangat jelas dan mudah dibaca untuk teks Arab
const cairo = localFont({
  src: "./fonts/google/Cairo-VF.woff2",
  weight: "400 700",
  variable: "--font-cairo",
  display: "swap",
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
            {/* Adzan aktif di semua halaman: penjadwal, banner saat adzan, dan pengaturan.
                Tidak dijalankan di aplikasi anak (/anak). */}
            <AdultOnly>
              <AdzanManager />
              <AdzanBanner />
              <AdzanSettingsModal />
              <AutoLocationManager />
              <UpdatePrompt />
            </AdultOnly>
          </AntdProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}
