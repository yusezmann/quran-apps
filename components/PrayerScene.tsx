import { useId } from "react"

export type PrayerSceneTime = "imsak" | "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya"

interface Palette {
  /** Gradien langit dari atas ke cakrawala */
  sky: [string, string, string]
  /** Bukit pasir belakang & depan */
  duneBack: string
  duneFront: string
  /** Siluet masjid */
  mosque: string
  stars: number
  sun?: { cx: number; cy: number; r: number; color: string; glow: string }
  moon?: { cx: number; cy: number; r: number; crescent: boolean }
  /** Pendar di cakrawala (fajar/senja) */
  horizonGlow?: string
}

/**
 * Warna & benda langit per waktu sholat, mengikuti kondisi langit sebenarnya:
 * Imsak malam pekat · Subuh fajar menyingsing · Dzuhur siang terik · Ashar sore keemasan ·
 * Maghrib matahari terbenam · Isya malam.
 */
const PALETTES: Record<PrayerSceneTime, Palette> = {
  imsak: {
    sky: ["#070b1f", "#121a3f", "#24305e"],
    duneBack: "#2a2546",
    duneFront: "#1b1731",
    mosque: "#0f0c1d",
    stars: 26,
    moon: { cx: 158, cy: 28, r: 10, crescent: true },
  },
  subuh: {
    sky: ["#1a2452", "#6a4f8f", "#f3a65c"],
    duneBack: "#5a4061",
    duneFront: "#3b2a45",
    mosque: "#271b30",
    stars: 8,
    horizonGlow: "#ffc27a",
  },
  dzuhur: {
    sky: ["#1f7fd6", "#58aef0", "#bfe4ff"],
    duneBack: "#f0c27a",
    duneFront: "#e0a656",
    mosque: "#a8692c",
    stars: 0,
    sun: { cx: 100, cy: 24, r: 11, color: "#fffbe0", glow: "#fff4b0" },
  },
  ashar: {
    sky: ["#4f9bd8", "#a9c9de", "#f6d28f"],
    duneBack: "#e8ad60",
    duneFront: "#d18f42",
    mosque: "#8a5224",
    stars: 0,
    sun: { cx: 52, cy: 50, r: 11, color: "#ffe39a", glow: "#ffd27a" },
  },
  maghrib: {
    sky: ["#3a1d4d", "#c2464a", "#f9a54a"],
    duneBack: "#7a3434",
    duneFront: "#4f2026",
    mosque: "#2a1016",
    stars: 0,
    sun: { cx: 64, cy: 92, r: 16, color: "#ffcf5c", glow: "#ff9f45" },
    horizonGlow: "#ffb35a",
  },
  isya: {
    sky: ["#03050f", "#0c1430", "#1b2550"],
    duneBack: "#1c2140",
    duneFront: "#11152b",
    mosque: "#080a17",
    stars: 34,
    moon: { cx: 48, cy: 30, r: 9, crescent: false },
  },
}

/** Bintang deterministik (tanpa Math.random) agar render server & klien identik. */
function starPositions(count: number): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = []
  for (let i = 0; i < count; i++) {
    const x = (i * 73 + 17) % 200
    const y = (i * 37 + 11) % 70
    const r = i % 5 === 0 ? 0.9 : 0.55
    out.push([x, y, r])
  }
  return out
}

/**
 * Ilustrasi latar kartu waktu sholat (SVG, beberapa KB, tajam di semua ukuran).
 * Gaya seragam untuk semua waktu: langit + benda langit + bukit pasir + siluet masjid.
 */
export default function PrayerScene({ time, className }: { time: PrayerSceneTime; className?: string }) {
  const p = PALETTES[time]
  const uid = useId().replace(/:/g, "")
  const skyId = `sky-${uid}`
  const glowId = `glow-${uid}`
  const horizonId = `hz-${uid}`

  return (
    <svg
      viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="60%" stopColor={p.sky[1]} />
          <stop offset="100%" stopColor={p.sky[2]} />
        </linearGradient>
        {p.sun && (
          <radialGradient id={glowId}>
            <stop offset="0%" stopColor={p.sun.glow} stopOpacity="0.9" />
            <stop offset="100%" stopColor={p.sun.glow} stopOpacity="0" />
          </radialGradient>
        )}
        {p.horizonGlow && (
          <radialGradient id={horizonId} cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor={p.horizonGlow} stopOpacity="0.85" />
            <stop offset="100%" stopColor={p.horizonGlow} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Langit */}
      <rect width="200" height="130" fill={`url(#${skyId})`} />
      {p.horizonGlow && <rect x="0" y="40" width="200" height="70" fill={`url(#${horizonId})`} />}

      {/* Bintang */}
      {starPositions(p.stars).map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={i % 3 === 0 ? 0.9 : 0.55} />
      ))}

      {/* Matahari */}
      {p.sun && (
        <g>
          <circle cx={p.sun.cx} cy={p.sun.cy} r={p.sun.r * 3} fill={`url(#${glowId})`} />
          <circle cx={p.sun.cx} cy={p.sun.cy} r={p.sun.r} fill={p.sun.color} />
        </g>
      )}

      {/* Bulan */}
      {p.moon && (
        <g>
          <circle cx={p.moon.cx} cy={p.moon.cy} r={p.moon.r} fill="#f4f1de" />
          {p.moon.crescent && (
            <circle cx={p.moon.cx + p.moon.r * 0.45} cy={p.moon.cy - p.moon.r * 0.2} r={p.moon.r * 0.9} fill={p.sky[0]} />
          )}
        </g>
      )}

      {/* Bukit pasir belakang */}
      <path d="M0 98 C30 84 55 86 85 94 C115 102 140 82 170 86 C185 88 195 92 200 94 V130 H0 Z" fill={p.duneBack} />

      {/* Siluet masjid: kubah, badan, dan menara */}
      <g fill={p.mosque}>
        <rect x="132" y="96" width="34" height="18" />
        <path d="M149 74 C138 78 134 88 135 96 H163 C164 88 160 78 149 74 Z" />
        <rect x="148.2" y="69" width="1.6" height="6" />
        <rect x="171" y="76" width="5" height="38" />
        <path d="M170 76 L173.5 68 L177 76 Z" />
        <rect x="124" y="84" width="4" height="30" />
        <path d="M123 84 L126 77 L129 84 Z" />
      </g>

      {/* Bukit pasir depan */}
      <path d="M0 108 C40 98 70 104 100 110 C130 116 160 104 200 106 V130 H0 Z" fill={p.duneFront} />
    </svg>
  )
}
