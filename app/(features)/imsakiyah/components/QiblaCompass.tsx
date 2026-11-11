"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Compass, AlertCircle } from "lucide-react"

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
      
      <div className="relative w-52 h-52 md:w-56 md:h-56 rounded-full border-8 border-green-100 shadow-inner flex items-center justify-center bg-white overflow-hidden mb-6">
        {/* Compass markings (N, E, S, W) that rotate with the device */}
        <div 
          className="absolute w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${compassRotation}deg)` }}
        >
          {/* North */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-red-500 font-bold text-lg">U</div>
          {/* East */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">T</div>
          {/* South */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-400 font-bold text-lg">S</div>
          {/* West */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">B</div>
          
          {/* Dial lines */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div className="w-full h-3 bg-gray-200"></div>
              <div className="w-full h-3 bg-gray-200 absolute bottom-0"></div>
            </div>
          ))}
        </div>

        {/* Qibla Pointer */}
        <div 
          className="absolute w-full h-full transition-transform duration-500 ease-out flex items-center justify-center"
          style={{ transform: `rotate(${pointerRotation}deg)` }}
        >
          <div className="absolute top-6">
             {/* Use a large navigation arrow */}
             <svg width="40" height="100" viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M20 0L40 40L20 30L0 40L20 0Z" fill="#16a34a"/>
               <path d="M20 100L40 60L20 70L0 60L20 100Z" fill="#e5e7eb"/>
             </svg>
          </div>
        </div>
        
        {/* Center dot */}
        <div className="w-4 h-4 rounded-full bg-green-600 shadow-md z-10"></div>
      </div>
      
      <div className="text-center">
        <h4 className="text-3xl font-bold text-green-700 mb-1">
          {Math.round(qiblaAngle)}°
        </h4>
        <p className="text-gray-600 font-medium">
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
              : "Putar ponsel hingga panah hijau menunjuk lurus ke atas"}
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
