/**
 * Ikon Ka'bah (SVG isometrik): kubus hitam dengan sabuk emas (hizam kiswah) dan pintu emas.
 * Murni vektor, tajam di semua ukuran, tanpa file gambar tambahan.
 */
export default function KaabaIcon({
  size = 24,
  className,
  title,
}: {
  size?: number
  className?: string
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* bayangan */}
      <ellipse cx="12" cy="21.4" rx="8.5" ry="1.4" fill="black" opacity="0.18" />
      {/* atap */}
      <polygon points="3.5,7 12,3 20.5,7 12,11" fill="#3f3f46" />
      {/* sisi kiri & kanan */}
      <polygon points="3.5,7 12,11 12,21 3.5,17" fill="#18181b" />
      <polygon points="12,11 20.5,7 20.5,17 12,21" fill="#27272a" />
      {/* sabuk emas (hizam) */}
      <polygon points="3.5,8.9 12,12.9 12,14.3 3.5,10.3" fill="#d4a72c" />
      <polygon points="12,12.9 20.5,8.9 20.5,10.3 12,14.3" fill="#e9bf45" />
      {/* pintu emas */}
      <polygon points="15.2,15.7 17.6,14.6 17.6,18.4 15.2,19.5" fill="#d4a72c" />
      {/* tepi atap */}
      <polyline points="3.5,7 12,11 20.5,7" fill="none" stroke="#52525b" strokeWidth="0.4" />
    </svg>
  )
}
