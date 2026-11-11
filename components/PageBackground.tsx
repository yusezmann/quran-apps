/**
 * Latar halaman konten (Imsakiyah, Doa, Hadits, Asmaul Husna).
 * Menggantikan foto keramaian Masjidil Haram yang membuat teks sulit dibaca:
 * - "light": pita hijau di atas (untuk header putih) lalu latar abu-abu terang.
 * - "dark":  gradien hijau tua penuh, untuk halaman yang kontennya berwarna putih.
 * Pola geometris tipis memberi nuansa Islami tanpa mengganggu kontras.
 */
export default function PageBackground({ variant = "light" }: { variant?: "light" | "dark" }) {
  const pattern = (
    <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
      <defs>
        <pattern id={`islamic-${variant}`} width="56" height="56" patternUnits="userSpaceOnUse">
          <path
            d="M28 4 L34 22 L52 28 L34 34 L28 52 L22 34 L4 28 L22 22 Z"
            fill="none"
            stroke="white"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#islamic-${variant})`} />
    </svg>
  )

  if (variant === "dark") {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950" aria-hidden="true">
        {pattern}
      </div>
    )
  }

  return (
    <div className="absolute inset-0 -z-10 bg-gray-100" aria-hidden="true">
      <div className="relative h-[340px] xl:h-[380px] overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-600">
        {pattern}
      </div>
    </div>
  )
}
