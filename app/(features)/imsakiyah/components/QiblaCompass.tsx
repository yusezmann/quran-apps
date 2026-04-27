"use client"

import { useEffect, useState } from "react"
import { Compass, Navigation, AlertCircle } from "lucide-react"

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
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${cleanName}&format=json&limit=1`, {
            headers: { 'User-Agent': 'QuranApps/1.0' }
          })
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

  useEffect(() => {
    const handleOrientation = (e: any) => {
      let h
      if (e.webkitCompassHeading) {
        // iOS
        h = e.webkitCompassHeading
      } else if (e.absolute && e.alpha !== null) {
        // Android with absolute orientation
        h = 360 - e.alpha
      }
      
      if (h !== undefined && h !== null) {
        setHeading(h)
      }
    }

    // Function to request permission (required for iOS 13+)
    const requestPermissionAndListen = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission()
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true)
          } else {
            setError("Izin kompas ditolak")
          }
        } catch (err) {
          setError("Gagal meminta izin kompas")
        }
      } else {
        // Non-iOS 13+ devices
        window.addEventListener('deviceorientationabsolute', handleOrientation, true)
        window.addEventListener('deviceorientation', handleOrientation, true)
      }
    }

    requestPermissionAndListen()

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  // The rotation of the compass face (North pointing up if heading is available)
  const compassRotation = heading !== null ? -heading : 0
  
  // The pointer rotation (points to Qibla relative to North)
  const pointerRotation = heading !== null ? qiblaAngle - heading : qiblaAngle

  return (
    <div className="flex flex-col items-center justify-center w-full py-4 relative">
      {isLoadingCoords && (
        <div className="absolute top-0 flex items-center justify-center w-full h-full bg-white/80 z-20 z-index-50">
          <span className="text-green-600 font-medium animate-pulse">Menghitung koordinat kota...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute top-0 right-0 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}
      
      <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full border-8 border-green-100 shadow-inner flex items-center justify-center bg-white overflow-hidden mb-6">
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
        {!heading && !error && (
          <p className="text-xs text-gray-400 mt-2">
            Kompas perangkat tidak aktif. Menampilkan arah statis.
          </p>
        )}
      </div>
    </div>
  )
}

export default QiblaCompass
