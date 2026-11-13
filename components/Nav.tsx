"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
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
/** Muncul kembali setelah scroll berhenti selama ini (ms). */
const SHOW_AFTER_IDLE_MS = 350
/** Abaikan gerakan kecil (jitter jari) di bawah ambang ini (px). */
const SCROLL_THRESHOLD = 8

/**
 * Sembunyikan navigasi saat pengguna scroll ke bawah (sedang membaca), tampilkan lagi
 * saat scroll ke atas, saat scroll berhenti, atau saat berada di paling atas halaman.
 */
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const idleTimer = useRef<number>()

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      if (Math.abs(delta) >= SCROLL_THRESHOLD) {
        setHidden(delta > 0 && y > 80) // turun = sembunyi; naik / dekat atas = tampil
        lastY.current = y
      }
      window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(() => setHidden(false), SHOW_AFTER_IDLE_MS)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.clearTimeout(idleTimer.current)
    }
  }, [])

  return hidden
}

const Nav = () => {
  const pathname = usePathname()
  const hidden = useHideOnScroll()

  return (
    <nav
      aria-label="Navigasi utama"
      // Melayang 12px dari tepi; ikut naik di atas gesture bar Android/iOS
      data-hidden={hidden}
      className={`fixed inset-x-2 min-[360px]:inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-40 mx-auto max-w-md rounded-[28px] border border-gray-200/80 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
        hidden ? "pointer-events-none translate-y-[calc(100%+24px)] opacity-0" : "translate-y-0 opacity-100"
      }`}
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
