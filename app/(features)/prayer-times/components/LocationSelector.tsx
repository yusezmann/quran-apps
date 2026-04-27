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
import { getCurrentLocation } from "@/lib/geolocation"

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

  const detectLocation = async () => {
    setIsDetectingLocation(true)

    try {
      const position = await getCurrentLocation()
      const { latitude, longitude } = position
      
      if (latitude && longitude) {
        toast.success(
          `Lokasi berhasil dideteksi: (${latitude}, ${longitude})`,
        )

        const city = await getPrayerTimesByCoords(latitude, longitude)
        if (city) {
          setSearchResults([city])
          handleSelect(city) // Langsung pilih dan tutup modal
        } else {
          toast.error("Kota tidak ditemukan pada API")
        }
      } else {
        toast.error("Gagal mendeteksi lokasi: koordinat tidak valid")
      }
    } catch (error: any) {
      console.error("Geolocation error:", error)
      toast.error("Gagal mendapatkan lokasi: " + (error.message || "Error tidak diketahui"))
    } finally {
      setIsDetectingLocation(false)
    }
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
