"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { href: "/doa", label: "Doa Harian" },
  { href: "/hadits", label: "Hadits Arbain" },
]

/** Tab penghubung halaman Doa & Hadits (satu menu "Doa & Hadits" di navigasi). */
export default function DoaHaditsTabs() {
  const pathname = usePathname()

  return (
    <nav aria-label="Doa dan Hadits" className="mx-auto mb-6 flex w-fit rounded-full bg-white/15 p-1 ring-1 ring-white/25 backdrop-blur-sm">
      {tabs.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-5 py-2 text-sm font-semibold leading-none transition-colors ${
              active ? "bg-white text-green-800 shadow" : "text-white/90 hover:bg-white/10 hover:text-white"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
