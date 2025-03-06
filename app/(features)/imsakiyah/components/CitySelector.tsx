"use client"

import type React from "react"
import { useQuery } from "@tanstack/react-query"
import { Select, Spin, Alert } from "antd"
import { fetchCities } from "../services/imsakiyah.service"
import type { City } from "../interfaces/imsakiyah.interface"

type CityProps = {
  onCityChange: (city: City) => void
}

const CitySelector: React.FC<CityProps> = ({ onCityChange }) => {
  const {
    data: cities,
    isLoading,
    error,
  } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
  })

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert message="Terjadi kesalahan!" type="error" showIcon />
      </div>
    )

  return (
    <div className="mb-4">
      <Select
        showSearch
        className="w-full md:w-1/2"
        placeholder="Cari kota"
        optionFilterProp="children"
        onChange={(value) => {
          const selectedCity = cities?.find((city) => city.id === value)
          if (selectedCity) onCityChange(selectedCity)
        }}
        filterOption={(input, option) =>
          option?.label.toLowerCase().includes(input.toLowerCase()) || false
        }
        options={cities?.map((city) => ({
          label: city.lokasi,
          value: city.id,
        }))}
      />
    </div>
  )
}

export default CitySelector
