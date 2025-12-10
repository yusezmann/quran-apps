"use client"

import type React from "react"
import { useQuery } from "@tanstack/react-query"
import { Select, Spin, Alert, Button } from "antd"
import { fetchCities } from "../services/imsakiyah.service"
import type { City } from "../interfaces/imsakiyah.interface"
import { MapPin, RefreshCw } from "lucide-react"

type CityProps = {
  onCityChange: (city: City) => void
}

const CitySelector: React.FC<CityProps> = ({ onCityChange }) => {
  const {
    data: cities,
    isLoading,
    error,
    refetch,
  } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
    retry: 2,
  })

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex flex-col items-center gap-3">
          <Spin size="large" />
          <p className="text-gray-500 text-sm">Memuat daftar kota...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="py-4">
        <Alert
          message="Gagal Memuat Data"
          description="Tidak dapat memuat daftar kota. Silakan coba lagi."
          type="error"
          showIcon
          action={
            <Button
              size="small"
              danger
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => refetch()}
            >
              Coba Lagi
            </Button>
          }
        />
      </div>
    )

  return (
    <div className="w-full">
      <Select
        showSearch
        className="w-full"
        placeholder="Cari atau pilih kota..."
        optionFilterProp="children"
        size="large"
        suffixIcon={<MapPin className="w-4 h-4 text-gray-400" />}
        onChange={(value) => {
          const selectedCity = cities?.find((city) => city.id === value)
          if (selectedCity) onCityChange(selectedCity)
        }}
        filterOption={(input, option) =>
          (option?.label as string)
            ?.toLowerCase()
            .includes(input.toLowerCase()) || false
        }
        options={cities?.map((city) => ({
          label: city.lokasi,
          value: city.id,
        }))}
        notFoundContent={
          isLoading ? (
            <div className="py-4 text-center">
              <Spin size="small" /> <span className="ml-2">Memuat...</span>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Kota tidak ditemukan
            </div>
          )
        }
      />
    </div>
  )
}

export default CitySelector
