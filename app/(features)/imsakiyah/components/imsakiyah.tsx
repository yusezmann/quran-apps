"use client"

import { Card, Select, Table, Spin } from "antd"
import { useEffect, useState, useCallback } from "react"
import {
  fetchImsakiyah,
  getListKabkota,
  getListProvinces,
} from "../services/imsakiyah.service"
import {
  ImsakiyahData,
  ImsakiyahHeaderData,
} from "../interfaces/imsakiyah.interface"

const DEFAULT_PROVINCE = "D.K.I Jakarta"
const DEFAULT_KABKOTA = "Kota Jakarta"

const ImsakiyahComponent = () => {
  const [provinces, setProvinces] = useState<string[]>([])
  const [kabkota, setKabKota] = useState<string[]>([])
  const [selectedProvince, setSelectedProvince] =
    useState<string>(DEFAULT_PROVINCE)
  const [selectedKabkota, setSelectedKabkota] =
    useState<string>(DEFAULT_KABKOTA)
  const [data, setData] = useState<ImsakiyahData[]>([])
  const [headerData, setHeaderData] = useState<ImsakiyahHeaderData[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false)
  const [loadingKabKota, setLoadingKabKota] = useState<boolean>(false)
  const [loadingData, setLoadingData] = useState<boolean>(false)

  const { Option } = Select

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const data = await getListProvinces()
        setProvinces(data)
      } catch (error) {
        console.error("Failed to fetch provinces:", error)
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchProvinces()
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      getKabKota(selectedProvince)
      getImsakiyah()
    }
  }, [selectedProvince])

  const getImsakiyah = useCallback(async () => {
    setLoadingData(true)
    try {
      const result = await fetchImsakiyah(selectedProvince, selectedKabkota)
      setData(result?.[0]?.imsakiyah || [])
      setHeaderData(result || [])
    } catch (error) {
      console.error("Failed to fetch imsakiyah:", error)
    } finally {
      setLoadingData(false)
    }
  }, [selectedProvince, selectedKabkota])

  const getKabKota = useCallback(async (prov: string) => {
    setLoadingKabKota(true)
    try {
      const data = await getListKabkota(prov)
      setKabKota(data)
    } catch (error) {
      console.error("Failed to fetch kabkota:", error)
    } finally {
      setLoadingKabKota(false)
    }
  }, [])

  const handleKabkotaChange = async (value: string) => {
    setSelectedKabkota(value)
    setLoadingData(true)
    try {
      const result = await fetchImsakiyah(selectedProvince, value)
      setData(result?.[0]?.imsakiyah || [])
      setHeaderData(result || [])
    } catch (error) {
      console.error("Failed to fetch imsakiyah:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value)
    setSelectedKabkota("") // Reset kabupaten/kota saat provinsi berubah
    setData([]) // Reset tabel
    setHeaderData([]) // Reset tabel
  }

  const columns = [
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    { title: "Imsak", dataIndex: "imsak", key: "imsak" },
    { title: "Subuh", dataIndex: "subuh", key: "subuh" },
    { title: "Dzuhur", dataIndex: "dzuhur", key: "dzuhur" },
    { title: "Ashar", dataIndex: "ashar", key: "ashar" },
    { title: "Maghrib", dataIndex: "maghrib", key: "maghrib" },
    { title: "Isya", dataIndex: "isya", key: "isya" },
  ]

  return (
    <section className="mt-24 mb-0">
      <Card size="small" style={{ width: "100%" }}>
        <div className="flex flex-col xl:flex-row justify-center items-center p-6 mb-12">
          <h1 className="text-2xl font-bold text-center">
            Jadwal Imsakiyah
            <span className="ml-2">{headerData?.[0]?.masehi}</span>
          </h1>
          <h2 className="text-2xl font-bold flex flex-col xl:flex-row justify-between items-center">
            <span className="ml-2">({headerData?.[0]?.hijriah} Hijriah) -</span>
            <span className="ml-2">{headerData?.[0]?.kabkota}</span>
          </h2>
          <h2 className="text-2xl font-bold justify-center items-center ml-2">
            Provinsi {headerData?.[0]?.provinsi}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Provinsi:</label>
            <Select
              className="w-full min-w-[150px] mb-4"
              placeholder="Pilih Provinsi"
              value={selectedProvince || undefined}
              onChange={handleProvinceChange}
              showSearch
              loading={loadingProvinces}
            >
              {provinces.map((province, index) => (
                <Option key={index} value={province}>
                  {province}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Kab/Kota:</label>
            <Select
              className="w-full min-w-[150px] mb-4"
              placeholder="Pilih Kabupaten/Kota"
              value={selectedKabkota || undefined}
              onChange={handleKabkotaChange}
              showSearch
              loading={loadingKabKota}
              disabled={!selectedProvince}
            >
              {kabkota.map((kab, index) => (
                <Option key={index} value={kab}>
                  {kab}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          {loadingData ? (
            <Spin size="large" className="flex justify-center" />
          ) : (
            <Table
              className="w-full"
              columns={columns}
              dataSource={data.map((item, index) => ({ ...item, key: index }))}
              pagination={{ pageSize: 31, position: ["none"] }}
            />
          )}
        </div>
      </Card>
    </section>
  )
}

export default ImsakiyahComponent
