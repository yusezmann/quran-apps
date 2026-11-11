"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenText, CalendarClock, HandHeart, House, Sparkles, type LucideIcon } from "lucide-react"

const links: { label: string; path: string; icon: LucideIcon }[] = [
  { label: "Imsakiyah", path: "/imsakiyah", icon: CalendarClock },
  { label: "Doa", path: "/doa", icon: HandHeart },
  { label: "Beranda", path: "/", icon: House },
  { label: "Asmaul Husna", path: "/asmaulhusna", icon: Sparkles },
  { label: "Hadits", path: "/hadits", icon: BookOpenText },
]

/** Navigasi bawah untuk mobile & tablet: ikon garis seragam + label teks. */
const Nav = () => {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-between px-2">
        {links.map(({ label, path, icon: Icon }) => {
          const active = pathname === path
          return (
            <li key={path} className="flex-1">
              <Link
                href={path}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
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
                <span className="leading-none whitespace-nowrap">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Nav
