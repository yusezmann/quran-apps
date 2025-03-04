"use client"

import type React from "react"
import { Table, Select } from "antd"
import { useScheduleStore } from "../store/scheduleStore"
import { useSchedule } from "../hooks/useSchedule"
import { format, isValid, setMonth, parse, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { toHijri } from "hijri-converter"
import { useState } from "react"
import { City } from "../interfaces/imsakiyah.interface"
import CitySelector from "./CitySelector"

const { Option } = Select

const hijriMonths = [
  "Muharram",
  "Safar",
  "Rabi'ul Awwal",
  "Rabi'ul Akhir",
  "Jumadil Awwal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
]

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

const Schedule: React.FC = () => {
  const { currentDate } = useScheduleStore()
  const [selectedCity, setSelectedCity] = useState<City>({
    id: "1301",
    lokasi: "KOTA JAKARTA",
  })
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  )

  const selectedDate = setMonth(new Date(currentDate), selectedMonth)
  const {
    data: schedule,
    isLoading,
    error,
  } = useSchedule(selectedCity.id, selectedDate)

  if (isLoading) return <div>Loading schedule...</div>
  if (error) return <div>Error loading schedule</div>

  const today = new Date()

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date(NaN)

    // Hapus nama hari jika ada (format "Sabtu, 01/03/2025")
    const cleanedDate = dateString.replace(/^[A-Za-z]+,\s*/, "")

    // Jika formatnya YYYY-MM-DD, gunakan parseISO
    if (cleanedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return parseISO(cleanedDate)
    }

    const formats = ["d/M/yyyy", "dd/MM/yyyy", "yyyy-MM-dd"] // Tambahkan kemungkinan format lain
    for (const formatStr of formats) {
      const date = parse(cleanedDate, formatStr, new Date())
      if (isValid(date)) return date
    }

    console.warn("Invalid Date:", cleanedDate) // Debugging jika gagal
    return new Date(NaN)
  }

  const columns = [
    {
      title: "Hari",
      dataIndex: "tanggal",
      key: "hari",
      render: (text: string) => {
        const date = parseDate(text)
        return isValid(date)
          ? format(date, "EEEE", { locale: id })
          : "Invalid Date"
      },
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (text: string) => {
        const date = parseDate(text)
        return isValid(date)
          ? format(date, "d MMMM yyyy", { locale: id })
          : "Invalid Date"
      },
    },
    {
      title: "Tanggal Hijriah",
      dataIndex: "tanggal",
      key: "tanggal_hijriah",
      render: (text: string) => {
        const date = parseDate(text)
        if (isValid(date)) {
          const hijriDate = toHijri(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
          )
          return `${hijriDate.hd} ${hijriMonths[hijriDate.hm - 1]} ${
            hijriDate.hy
          }H`
        }
        return "Invalid Date"
      },
    },
    { title: "Imsak", dataIndex: "imsak", key: "imsak" },
    { title: "Subuh", dataIndex: "subuh", key: "subuh" },
    { title: "Terbit", dataIndex: "terbit", key: "terbit" },
    { title: "Dhuha", dataIndex: "dhuha", key: "dhuha" },
    { title: "Dzuhur", dataIndex: "dzuhur", key: "dzuhur" },
    { title: "Ashar", dataIndex: "ashar", key: "ashar" },
    { title: "Maghrib", dataIndex: "maghrib", key: "maghrib" },
    { title: "Isya", dataIndex: "isya", key: "isya" },
  ]

  const dataSource =
    schedule?.jadwal.map((day) => {
      const date = parseDate(day.tanggal)
      const isToday =
        isValid(date) && date.toDateString() === today.toDateString()
      return {
        ...day,
        key: day.tanggal,
        className: isToday ? "bg-green-300" : "",
      }
    }) || []

  return (
    <div style={{ overflowX: "auto" }}>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 xl:gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="city-selector" className="font-light text-gray-400">
            Pilih Kota
          </label>
          <CitySelector onCityChange={setSelectedCity} />
        </div>
        <div className="flex flex-col">
          <label htmlFor="month-selector" className="font-light text-gray-400">
            Pilih Bulan
          </label>
          <Select
            id="month-selector"
            value={selectedMonth}
            onChange={setSelectedMonth}
            className="w-full md:w-1/2"
            aria-label="Pilih Bulan"
          >
            {months.map((monthName, index) => (
              <Option key={index} value={index}>
                {monthName}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowClassName={(record) => record.className}
        bordered
        pagination={false}
        scroll={{ x: "max-content" }}
      />
    </div>
  )
}

export default Schedule
