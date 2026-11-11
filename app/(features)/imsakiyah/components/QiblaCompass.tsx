"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Compass, AlertCircle } from "lucide-react"
import KaabaIcon from "@/components/KaabaIcon"

interface QiblaCompassProps {
  lat: number
  lon: number
  lokasi: string
}

const getQiblaDirection = (lat: number, lon: number) => {
  const PI = Math.PI
  const latK = 21.422487 * (PI / 180.0)
  const lonK = 39.826206 * (PI / 180.0)
  const phi = lat * (PI / 180.0)
  const lambda = lon * (PI / 180.0)

  let qibla = Math.atan2(
    Math.sin(lonK - lambda),
    Math.cos(phi) * Math.tan(latK) - Math.sin(phi) * Math.cos(lonK - lambda)
  )

  qibla = qibla * (180.0 / PI)
  return (qibla + 360) % 360
}

const QiblaCompass = ({ lat, lon, lokasi }: QiblaCompassProps) => {
  const [heading, setHeading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actualLat, setActualLat] = useState<number>(lat)
  const [actualLon, setActualLon] = useState<number>(lon)
  const [isLoadingCoords, setIsLoadingCoords] = useState<boolean>(lat === 0 && lon === 0)

  useEffect(() => {
    const fetchCoords = async () => {
      if (lat === 0 && lon === 0 && lokasi) {
        setIsLoadingCoords(true)
        try {
          // Clean up location name for better search results
          const cleanName = lokasi.replace(/KOTA|KAB\.|KABUPATEN/gi, "").trim()
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanName)}&format=json&limit=1`,
          )
          const data = await res.json()
          if (data && data.length > 0) {
            setActualLat(parseFloat(data[0].lat))
            setActualLon(parseFloat(data[0].lon))
          } else {
            // Default to Jakarta if not found
            setActualLat(-6.2088)
            setActualLon(106.8456)
            setError("Gagal mendapat koordinat akurat. Menggunakan default (Jakarta).")
          }
        } catch (err) {
          // Default to Jakarta
          setActualLat(-6.2088)
          setActualLon(106.8456)
          setError("Gagal mendapat koordinat. Menggunakan default (Jakarta).")
        } finally {
          setIsLoadingCoords(false)
        }
      } else {
        setActualLat(lat)
        setActualLon(lon)
      }
    }
    
    fetchCoords()
  }, [lat, lon, lokasi])

  const qiblaAngle = getQiblaDirection(actualLat, actualLon)

  // ---- Sensor kompas ----
  // Catatan penting: Chrome/WebView Android versi baru JUGA punya
  // DeviceOrientationEvent.requestPermission (dulu hanya iOS). Jadi kita:
  // 1. Selalu mendengarkan sensor sejak awal (Android langsung mengirim data).
  // 2. Hanya menampilkan tombol "Aktifkan kompas" bila fungsi izin ada DAN belum ada
  //    data heading yang masuk (kasus iOS, yang wajib izin lewat ketukan pengguna).
  const [canRequestPermission, setCanRequestPermission] = useState(false)
  const [waitedForSensor, setWaitedForSensor] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  // Rotasi "tanpa lompatan": 359° -> 1° diputar +2°, bukan -358° (jarum tidak berputar penuh)
  const [continuousHeading, setContinuousHeading] = useState<number | null>(null)
  const lastHeadingRef = useRef<number | null>(null)
  const hasAbsoluteRef = useRef(false)

  const handleOrientation = useCallback((e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    let h: number | null = null
    if (typeof e.webkitCompassHeading === "number") {
      // iOS: sudah berupa arah kompas (searah jarum jam dari utara)
      h = e.webkitCompassHeading
    } else if (e.alpha !== null && (e.type === "deviceorientationabsolute" || e.absolute)) {
      // Android: alpha absolut berlawanan arah jarum jam dari utara
      if (e.type === "deviceorientationabsolute") hasAbsoluteRef.current = true
      // Abaikan event relatif jika sumber absolut sudah tersedia
      if (e.type === "deviceorientation" && hasAbsoluteRef.current) return
      const screenAngle = window.screen?.orientation?.angle ?? 0
      h = (360 - e.alpha + screenAngle) % 360
    }
    if (h === null || Number.isNaN(h)) return

    const prev = lastHeadingRef.current
    lastHeadingRef.current = h
    setHeading(h)
    setContinuousHeading((current) => {
      if (current === null || prev === null) return h
      let delta = h - prev
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      return current + delta
    })
  }, [])

  const listen = useCallback(() => {
    window.addEventListener("deviceorientationabsolute" as any, handleOrientation, true)
    window.addEventListener("deviceorientation", handleOrientation, true)
  }, [handleOrientation])

  useEffect(() => {
    setIsTouchDevice(window.matchMedia?.("(pointer: coarse)").matches ?? false)
    setCanRequestPermission(
      typeof (window as any).DeviceOrientationEvent?.requestPermission === "function",
    )
    listen()
    const timer = window.setTimeout(() => setWaitedForSensor(true), 1500)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("deviceorientationabsolute" as any, handleOrientation, true)
      window.removeEventListener("deviceorientation", handleOrientation, true)
    }
  }, [listen, handleOrientation])

  const enableCompass = async () => {
    try {
      const permission = await (window as any).DeviceOrientationEvent.requestPermission()
      if (permission === "granted") {
        listen()
        setCanRequestPermission(false)
      } else {
        setError("Izin kompas ditolak")
      }
    } catch {
      setError("Gagal meminta izin kompas")
    }
  }

  const needsPermission = canRequestPermission && heading === null && waitedForSensor

  // Selisih arah perangkat terhadap kiblat (-180..180)
  const qiblaOffset = heading !== null ? ((qiblaAngle - heading + 540) % 360) - 180 : null
  const isFacingQibla = qiblaOffset !== null && Math.abs(qiblaOffset) <= 5

  // Muka kompas berputar berlawanan arah perangkat agar "U" selalu menunjuk utara
  const compassRotation = continuousHeading !== null ? -continuousHeading : 0

  // Jarum menunjuk kiblat relatif terhadap arah perangkat
  const pointerRotation = continuousHeading !== null ? qiblaAngle - continuousHeading : qiblaAngle

  return (
    <div className="flex flex-col items-center justify-center w-full py-4 relative">
      {isLoadingCoords && (
        <div className="absolute top-0 flex items-center justify-center w-full h-full bg-white/80 z-20">
          <span className="text-green-600 font-medium animate-pulse">Menghitung koordinat kota...</span>
        </div>
      )}
      
      {/* ---- Piringan kompas (SVG) ----
          Grup 1: piringan berskala, berputar -heading agar "U" selalu ke utara.
          Grup 2: pembawa Ka'bah, berputar (kiblat - heading) sehingga Ka'bah berada di tepi
                  pada arah kiblat; ikon di dalamnya diputar balik agar selalu tegak.
          Penanda di atas (tetap) = arah depan ponsel. */}
      <div className="relative mb-6 w-64 h-64 md:w-72 md:h-72">
        <svg viewBox="0 0 300 300" className="h-full w-full overflow-visible" role="img" aria-label={`Kompas kiblat, arah ${Math.round(qiblaAngle)} derajat dari utara`}>
          <defs>
            <radialGradient id="dialFace" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdf4" />
            </radialGradient>
            <filter id="kaabaGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cincin luar: hijau saat menghadap kiblat */}
          <circle
            cx="150"
            cy="150"
            r="146"
            fill="url(#dialFace)"
            stroke={isFacingQibla ? "#16a34a" : "#d1fae5"}
            strokeWidth={isFacingQibla ? 6 : 4}
            className="transition-[stroke] duration-300"
          />

          {/* Grup 1: piringan berskala */}
          <g
            className="transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${compassRotation}deg)`, transformOrigin: "150px 150px" }}
          >
            {Array.from({ length: 72 }, (_, i) => {
              const deg = i * 5
              const major = deg % 30 === 0
              const cardinal = deg % 90 === 0
              return (
                <line
                  key={deg}
                  x1="150"
                  y1={cardinal ? 12 : major ? 14 : 16}
                  x2="150"
                  y2={cardinal ? 34 : major ? 28 : 22}
                  stroke={deg === 0 ? "#dc2626" : major ? "#6b7280" : "#d1d5db"}
                  strokeWidth={major ? 2 : 1}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 150 150)`}
                />
              )
            })}
            {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
              <text
                key={deg}
                x="150"
                y="45"
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
                transform={`rotate(${deg} 150 150)`}
              >
                {deg}
              </text>
            ))}
            {[
              { label: "U", deg: 0, color: "#dc2626" },
              { label: "T", deg: 90, color: "#374151" },
              { label: "S", deg: 180, color: "#374151" },
              { label: "B", deg: 270, color: "#374151" },
            ].map(({ label, deg, color }) => (
              <text
                key={label}
                x="150"
                y="56"
                textAnchor="middle"
                fontSize="18"
                fontWeight="700"
                fill={color}
                transform={`rotate(${deg} 150 150)`}
              >
                {label}
              </text>
            ))}
          </g>

          {/* Grup 2: garis & Ka'bah pada arah kiblat */}
          <g
            className="transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${pointerRotation}deg)`, transformOrigin: "150px 150px" }}
          >
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="92"
              stroke="#16a34a"
              strokeWidth="3"
              strokeDasharray="5 5"
              strokeLinecap="round"
              opacity="0.7"
            />
            <g transform="translate(150 70)">
              <g
                className="transition-transform duration-500 ease-out"
                style={{
                  transform: `rotate(${-pointerRotation}deg)`,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
                filter={isFacingQibla ? "url(#kaabaGlow)" : undefined}
              >
                <circle r="21" fill="white" stroke={isFacingQibla ? "#16a34a" : "#e5e7eb"} strokeWidth="2" />
                <g transform="translate(-15 -16)">
                  <KaabaIcon size={30} />
                </g>
              </g>
            </g>
          </g>

          {/* Penanda arah ponsel (tetap di atas) */}
          <polygon
            points="140,-14 160,-14 150,2"
            fill={isFacingQibla ? "#16a34a" : "#374151"}
            className="transition-[fill] duration-300"
          />

          {/* Titik pusat */}
          <circle cx="150" cy="150" r="7" fill="#16a34a" stroke="white" strokeWidth="3" />
        </svg>
      </div>

      <div className="text-center leading-snug">
        <h4 className="text-3xl font-bold text-green-700 mb-1">
          {Math.round(qiblaAngle)}°
        </h4>
        <p className="text-gray-600 font-medium leading-snug">
          Arah Kiblat dari Utara untuk {lokasi}
        </p>
        {error && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}
        {heading !== null && (
          <p
            className={`mt-3 text-sm font-medium ${
              isFacingQibla ? "text-green-700" : "text-gray-600"
            }`}
            role="status"
          >
            {isFacingQibla
              ? "✓ Anda sudah menghadap kiblat"
              : "Putar ponsel hingga Ka'bah tepat di bawah penanda atas"}
          </p>
        )}
        {heading === null && needsPermission && isTouchDevice && !error && (
          <button
            type="button"
            onClick={enableCompass}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Compass className="w-4 h-4" /> Aktifkan kompas
          </button>
        )}
        {heading === null && !(needsPermission && isTouchDevice) && !error && (
          <p className="text-xs text-gray-500 mt-2">
            {isTouchDevice
              ? "Sensor kompas belum terbaca. Arah ditampilkan relatif terhadap utara."
              : "Arah ditampilkan relatif terhadap utara. Buka di ponsel untuk kompas langsung."}
          </p>
        )}
      </div>
    </div>
  )
}

export default QiblaCompass
