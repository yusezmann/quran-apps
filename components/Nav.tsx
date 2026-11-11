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

/** Navigasi bawah untuk mobile & tablet: ikon garis seragam + label teks. */
const Nav = () => {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-between px-1">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ label, path }) => {
          const Icon = ICONS[path]
          const active = isNavActive(path, pathname)
          return (
            <li key={path} className="flex-auto">
              <Link
                href={path}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[10px] min-[400px]:text-[11px] font-medium tracking-tight transition-colors ${
                  active ? "text-green-700" : "text-gray-500 hover:text-green-700"
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-green-100" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className="px-0.5 text-center leading-none whitespace-nowrap">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Nav
