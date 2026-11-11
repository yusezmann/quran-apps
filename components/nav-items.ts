/**
 * Satu sumber menu untuk navigasi bawah (mobile/tablet) dan menu atas (desktop).
 * Imsakiyah tidak ada di navigasi bawah: diakses dari Beranda ("Lihat jadwal sebulan")
 * dan muncul menonjol saat Ramadhan; di desktop tetap ada karena ruangnya cukup.
 */
export interface NavItem {
  label: string
  path: string
  mobile: boolean
  /** Path lain yang membuat menu ini aktif (mis. /hadits untuk "Doa & Hadits"). */
  alsoActiveOn?: string[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", path: "/", mobile: true },
  { label: "Al-Qur'an", path: "/quran", mobile: true },
  { label: "Kiblat", path: "/kiblat", mobile: true },
  { label: "Doa & Hadits", path: "/doa", mobile: true, alsoActiveOn: ["/hadits"] },
  { label: "Asmaul Husna", path: "/asmaulhusna", mobile: true },
  { label: "Imsakiyah", path: "/imsakiyah", mobile: false },
]

export function isNavActive(path: string, pathname: string | null): boolean {
  if (!pathname) return false
  const item = NAV_ITEMS.find((i) => i.path === path)
  return pathname === path || (item?.alsoActiveOn?.includes(pathname) ?? false)
}
