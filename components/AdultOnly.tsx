"use client"

import { usePathname } from "next/navigation"

/**
 * Komponen global orang dewasa (adzan, lokasi otomatis) tidak dijalankan di aplikasi anak (/anak):
 * tablet anak tidak perlu jadwal adzan & tidak boleh tiba-tiba meminta izin lokasi.
 */
export default function AdultOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith("/anak")) return null
  return <>{children}</>
}
