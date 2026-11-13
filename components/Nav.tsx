"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Compass, HandHeart, House, Sparkles, type LucideIcon } from "lucide-react"
import { NAV_ITEMS, isNavActive } from "./nav-items"

const ICONS: Record<string, LucideIcon> = {
  "/": House,
  "/quran": BookOpen,
  "/kiblat": Compass,
  "/doa": HandHeart,
  "/asmaulhusna": Sparkles,
}

/**
 * Navigasi bawah (mobile & tablet): kapsul melayang dengan ikon + label.
 * Menu aktif ditandai kapsul hijau solid; label tetap tampil agar ikon tidak perlu ditebak.
 */
const Nav = () => {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      // Melayang 12px dari tepi; ikut naik di atas gesture bar Android/iOS
      className="fixed inset-x-2 min-[360px]:inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-40 mx-auto max-w-md rounded-[28px] border border-gray-200/80 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md"
    >
      <ul className="flex h-16 items-stretch justify-between gap-0.5 p-1.5">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ label, path }) => {
          const Icon = ICONS[path]
          const active = isNavActive(path, pathname)
          return (
            <li key={path} className="flex-auto">
              <Link
                href={path}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 text-[10px] min-[400px]:text-[11px] font-medium tracking-tight transition-colors ${
                  active
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {/* Layar sangat sempit (<360px): label panjang boleh 2 baris agar tidak keluar dari kapsul */}
                <span className="text-center leading-[1.1] whitespace-normal min-[360px]:whitespace-nowrap min-[360px]:leading-none">
                  {label.replace("-", "‑") /* tanda hubung tak-terputus: "Al-Qur'an" tetap utuh */}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Nav
