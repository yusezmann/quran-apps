import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MobileMenu({
  isOpen,
  toggleMenu,
}: {
  isOpen: boolean
  toggleMenu: () => void
}) {
  const pathname = usePathname()
  const links = [
    { path: "/", label: "Home" },
    { path: "/imsakiyah", label: "Imsakiyah" },
    { path: "/doa", label: "Doa" },
    { path: "/asmaulhusna", label: "Asmaul Husna" },
    { path: "/hadits", label: "Hadits" },
  ]
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-black/70 transition-transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="bg-gray-100 w-64 h-full p-4">
        <button className="mb-4 text-gray-600 float-right" onClick={toggleMenu}>
          ✕
        </button>
        {links.map(({ path, label }) => (
          <Link
            key={path}
            href={path}
            className={`block py-2 ${
              pathname === path
                ? "text-green-500 font-bold border-b-2"
                : "text-gray-600"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
