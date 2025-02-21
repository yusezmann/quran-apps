"use client"

import type React from "react"

import { useState } from "react"
import { Button, Input, List, Modal } from "antd"
import { Loader2, MapPin } from "lucide-react"
import type {
  City,
  LocationSelectorProps,
} from "@/app/(features)/prayer-times/interfaces/prayer-time.interface"
import {
  getCities,
  getPrayerTimesByCoords,
} from "@/app/(features)/prayer-times/services/prayer-time.service"
import { toast } from "sonner"

const LocationSelector: React.FC<LocationSelectorProps> = ({
  isOpen,
  onClose,
  onSelectCity,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<City[]>([])
  const [searching, setSearching] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  const handleLocationSearch = async () => {
    if (searchQuery.length < 3) {
      toast.error("Masukkan minimal 3 karakter")
      return
    }

    setSearching(true)
    try {
      const results = await getCities(searchQuery)
      setSearchResults(results || [])
    } catch (error: any) {
      console.error("Failed to search cities:", error)
      toast.error("Gagal mencari kota")
    } finally {
      setSearching(false)
    }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung di browser Anda")
      return
    }

    setIsDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        if (latitude && longitude) {
          toast.success(
            `Lokasi berhasil dideteksi: (${latitude}, ${longitude})`,
          )

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_LOCATION_API_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            )
            const data = await response.json()
            const locationName =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.county

            if (locationName) {
              const results = await getCities(
                locationName.replace(/city/gi, ""),
              )

              if (results && results.length > 0) {
                setSearchResults(results || [])
              } else {
                toast.error("Kota tidak ditemukan pada API")
              }
            } else {
              toast.error("Nama kota tidak ditemukan dari koordinat")
            }
          } catch (error) {
            console.error("Gagal mendapatkan daftar kota:", error)
            toast.error("Gagal mendapatkan daftar kota dari koordinat")
          }
        } else {
          toast.error("Gagal mendeteksi lokasi: koordinat tidak valid")
        }
        setIsDetectingLocation(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        let errorMessage = "Gagal mendapatkan lokasi"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += ": Izin akses lokasi ditolak"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += ": Informasi lokasi tidak tersedia"
            break
          case error.TIMEOUT:
            errorMessage += ": Waktu permintaan lokasi habis"
            break
          default:
            errorMessage += ": " + error.message
        }
        toast.error(errorMessage)
        setIsDetectingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000,
      },
    )
  }

  return (
    <Modal open={isOpen} onCancel={onClose} footer={null}>
      <div>
        <h2 className="text-lg font-semibold">Pilih Lokasi</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Cari kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
            />
            <Button onClick={handleLocationSearch} disabled={searching}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cari"
              )}
            </Button>
          </div>
          <Button
            variant="link"
            className="w-full"
            onClick={detectLocation}
            disabled={isDetectingLocation}
          >
            {isDetectingLocation ? (
              <span className="flex items-center gap-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendeteksi Lokasi...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MapPin className="mr-2 h-4 w-4" />
                Deteksi Lokasi
              </span>
            )}
          </Button>
          {searchResults && searchResults.length > 0 && (
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              <List
                dataSource={searchResults}
                renderItem={(city) => (
                  <List.Item>
                    <Button
                      type="text"
                      className="w-full justify-start"
                      onClick={() => onSelectCity(city)}
                    >
                      {city.lokasi}, {city.daerah}
                    </Button>
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default LocationSelector
