import type { Metadata, Viewport } from "next"

/**
 * "Belajar Mengaji" — aplikasi PWA khusus anak (dipasang terpisah dari Quran Apps, mis. di tablet anak
 * yang diawasi Family Link). Manifest & ikon sendiri, cakupan hanya /anak.
 */
export const metadata: Metadata = {
  title: "Belajar Mengaji",
  description: "Belajar huruf hijaiyah, main game, dan hafalan surat pendek untuk anak",
  manifest: "/anak/manifest.webmanifest",
  icons: {
    icon: "/anak/icons/icon-192.png",
    apple: "/anak/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "Belajar Mengaji", statusBarStyle: "black-translucent" },
}

export const viewport: Viewport = {
  themeColor: "#059669",
  // Anak sering mencubit layar tanpa sengaja: kunci zoom agar tampilan tidak berantakan
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AnakLayout({ children }: { children: React.ReactNode }) {
  return children
}
