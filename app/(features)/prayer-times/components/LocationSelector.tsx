"use client"

import type React from "react"

import { useState } from "react"
import { Button, Input, List, Modal, Switch } from "antd"
import { Loader2, MapPin } from "lucide-react"
import type {
  City,
  LocationSelectorProps,
} from "@/app/(features)/prayer-times/interfaces/prayer-time.interface"
import { getCities } from "@/app/(features)/prayer-times/services/prayer-time.service"
import { toast } from "sonner"
import { useDetectCity } from "@/app/(features)/prayer-times/hooks/useDetectCity"
import { useAutoLocation } from "@/lib/auto-location"
import { enableAutoLocation, turnOffAutoLocationForManualChoice } from "@/lib/auto-location-run"

const LocationSelector: React.FC<LocationSelectorProps> = ({
  isOpen,
  onClose,
  onSelectCity,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<City[]>([])
  const [searching, setSearching] = useState(false)
  const { detectCity, isDetecting: isDetectingLocation } = useDetectCity()
  const autoMode = useAutoLocation((s) => s.mode)
  const setAutoMode = useAutoLocation((s) => s.setMode)
  const [enablingAuto, setEnablingAuto] = useState(false)

  const toggleAuto = async (on: boolean) => {
    if (!on) {
      setAutoMode("off")
      return
    }
    setEnablingAuto(true)
    const ok = await enableAutoLocation() // meminta izin lokasi di saat ini (aksi pengguna)
    setEnablingAuto(false)
    if (ok) onClose()
  }

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
    const city = await detectCity()
    if (city) {
      setSearchResults([city])
      onSelectCity(city)
      onClose()
    }
  }

  return (
    <Modal open={isOpen} onCancel={onClose} footer={null}>
      <div>
        <h2 className="text-lg font-semibold">Pilih Lokasi</h2>
        <div className="space-y-4">
          {/* Lokasi otomatis: kota mengikuti GPS setiap aplikasi dibuka */}
          <label className="flex items-center justify-between gap-4 rounded-xl bg-green-50 p-3">
            <span className="leading-snug">
              <span className="block font-semibold text-gray-900">Lokasi otomatis</span>
              <span className="text-sm text-gray-600">
                Jadwal sholat, kiblat & adzan mengikuti lokasi Anda setiap aplikasi dibuka
              </span>
            </span>
            <Switch
              checked={autoMode === "on"}
              loading={enablingAuto}
              onChange={toggleAuto}
              aria-label="Lokasi otomatis"
            />
          </label>

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
                      onClick={() => {
                        turnOffAutoLocationForManualChoice()
                        onSelectCity(city)
                      }}
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
