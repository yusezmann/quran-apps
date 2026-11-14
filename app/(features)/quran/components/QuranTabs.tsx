"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, GraduationCap } from "lucide-react"

const tabs = [
  { href: "/quran", label: "Baca", icon: BookOpen },
  { href: "/quran/belajar", label: "Belajar", icon: GraduationCap },
]

/** Tab di halaman Al-Qur'an: "Baca" (pembaca) dan "Belajar" (belajar mengaji untuk anak). */
export default function QuranTabs() {
  const pathname = usePathname()?.replace(/\/$/, "")

  return (
    <nav aria-label="Al-Qur'an" className="mx-auto mt-4 flex w-fit rounded-full bg-white/15 p-1 ring-1 ring-white/25 backdrop-blur-sm">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold leading-none transition-colors ${
              active ? "bg-white text-green-800 shadow" : "text-white/90 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
