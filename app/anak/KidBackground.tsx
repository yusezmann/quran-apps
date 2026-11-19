/**
 * Latar aplikasi anak: langit malam yang tenang bernuansa Islami (semua vektor, tajam di tablet).
 * Gradasi hijau toska → biru, pola bintang delapan tipis yang memudar ke bawah, bulan sabit & bintang
 * berkelip pelan, serta bukit berlapis dengan siluet masjid sebagai bingkai bawah.
 */
const STARS: Array<[number, number, number, number]> = [
  // [x %, y %, ukuran px, jeda animasi s]
  [8, 9, 6, 0],
  [18, 22, 4, 1.1],
  [27, 6, 5, 2.2],
  [41, 15, 3, 0.6],
  [58, 7, 4, 1.7],
  [66, 20, 3, 2.6],
  [74, 11, 5, 0.3],
  [92, 26, 4, 1.4],
  [12, 38, 3, 2.9],
  [88, 44, 3, 0.9],
  [5, 58, 4, 1.9],
  [95, 62, 3, 2.4],
]

function Sparkle({ size }: { size: number }) {
  return (
    <svg width={size * 2} height={size * 2} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="white" />
    </svg>
  )
}

export default function KidBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      {/* Langit */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-700 via-teal-600 to-sky-500" />
      {/* Cahaya lembut */}
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute -right-16 top-10 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl" />

      {/* Pola bintang delapan Islami, memudar ke bawah */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.09] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      >
        <defs>
          <pattern id="kid-islamic" width="64" height="64" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1.2">
              <rect x="18" y="18" width="28" height="28" />
              <rect x="18" y="18" width="28" height="28" transform="rotate(45 32 32)" />
              <circle cx="32" cy="32" r="5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kid-islamic)" />
      </svg>

      {/* Bulan sabit */}
      <svg className="absolute right-[7%] top-[5%] h-16 w-16 drop-shadow-[0_0_18px_rgba(253,230,138,0.55)] sm:h-20 sm:w-20" viewBox="0 0 64 64">
        <defs>
          <mask id="kid-crescent">
            <rect width="64" height="64" fill="white" />
            <circle cx="42" cy="24" r="22" fill="black" />
          </mask>
        </defs>
        <circle cx="30" cy="32" r="24" fill="#fde68a" mask="url(#kid-crescent)" />
      </svg>

      {/* Bintang berkelip */}
      {STARS.map(([x, y, s, delay], i) => (
        <span
          key={i}
          className="absolute motion-safe:animate-twinkle"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s`, opacity: 0.8 }}
        >
          <Sparkle size={s} />
        </span>
      ))}

      {/* Bukit berlapis + siluet masjid */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[26vh] min-h-[160px] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path d="M0 210 C 240 150 420 250 720 200 C 1020 150 1200 230 1440 180 L1440 320 L0 320 Z" fill="white" fillOpacity="0.08" />
        <path d="M0 250 C 300 200 520 290 820 245 C 1080 205 1260 270 1440 235 L1440 320 L0 320 Z" fill="white" fillOpacity="0.1" />
      </svg>
      <svg
        className="absolute bottom-[6vh] right-[6%] h-[16vh] min-h-[90px] w-auto opacity-[0.16]"
        viewBox="0 0 220 140"
      >
        <g fill="white">
          {/* menara */}
          <rect x="18" y="40" width="12" height="100" />
          <polygon points="18,40 24,18 30,40" />
          <rect x="190" y="40" width="12" height="100" />
          <polygon points="190,40 196,18 202,40" />
          {/* bangunan & kubah */}
          <rect x="45" y="85" width="130" height="55" />
          <path d="M65 85 Q110 15 155 85 Z" />
          <rect x="108" y="22" width="4" height="16" />
          <circle cx="110" cy="20" r="4" />
          <path d="M45 95 Q55 72 65 95 Z" />
          <path d="M155 95 Q165 72 175 95 Z" />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-[6vh] bg-white/10" />
    </div>
  )
}
