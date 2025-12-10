"use client"

import type React from "react"
import { Table, Select, Button, Card, Spin, Alert, Empty } from "antd"
import { useScheduleStore } from "../store/scheduleStore"
import { useSchedule } from "../hooks/useSchedule"
import { format, isValid, setMonth, parse, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { toHijri } from "hijri-converter"
import { useState, useMemo } from "react"
import { City } from "../interfaces/imsakiyah.interface"
import CitySelector from "./CitySelector"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Download, Calendar, Clock, MapPin, RefreshCw } from "lucide-react"

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

const prayerNames = [
  { key: "imsak", label: "Imsak", icon: "🌙" },
  { key: "subuh", label: "Subuh", icon: "🌅" },
  { key: "terbit", label: "Terbit", icon: "☀️" },
  { key: "dhuha", label: "Dhuha", icon: "🌤️" },
  { key: "dzuhur", label: "Dzuhur", icon: "☀️" },
  { key: "ashar", label: "Ashar", icon: "🌆" },
  { key: "maghrib", label: "Maghrib", icon: "🌇" },
  { key: "isya", label: "Isya", icon: "🌙" },
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

  const years = new Date().getFullYear()

  const selectedDate = setMonth(new Date(currentDate), selectedMonth)
  const {
    data: schedule,
    isLoading,
    error,
    refetch,
  } = useSchedule(selectedCity.id, selectedDate)

  const today = new Date()

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date(NaN)

    // Hapus nama hari jika ada (format "Sabtu, 01/03/2025")
    const cleanedDate = dateString.replace(/^[A-Za-z]+,\s*/, "")

    // Jika formatnya YYYY-MM-DD, gunakan parseISO
    if (cleanedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return parseISO(cleanedDate)
    }

    const formats = ["d/M/yyyy", "dd/MM/yyyy", "yyyy-MM-dd"]
    for (const formatStr of formats) {
      const date = parse(cleanedDate, formatStr, new Date())
      if (isValid(date)) return date
    }

    return new Date(NaN)
  }

  // Find today's schedule
  const todaySchedule = useMemo(() => {
    if (!schedule?.jadwal) return null
    return schedule.jadwal.find((day) => {
      const date = parseDate(day.tanggal)
      return isValid(date) && date.toDateString() === today.toDateString()
    })
  }, [schedule, today])

  const downloadPDF = () => {
    if (!schedule?.jadwal) return
    const doc = new jsPDF()
    doc.text(
      `Jadwal Shalat - ${selectedCity.lokasi} - ${months[selectedMonth]} ${years}`,
      10,
      10,
    )
    autoTable(doc, {
      head: [
        [
          "Tanggal",
          "Imsak",
          "Subuh",
          "Terbit",
          "Dhuha",
          "Dzuhur",
          "Ashar",
          "Maghrib",
          "Isya",
        ],
      ],
      body: schedule.jadwal.map((day) => [
        day.tanggal,
        day.imsak,
        day.subuh,
        day.terbit,
        day.dhuha,
        day.dzuhur,
        day.ashar,
        day.maghrib,
        day.isya,
      ]),
    })
    doc.save(
      `jadwal-shalat-${selectedCity.lokasi}-${months[selectedMonth]}.pdf`,
    )
  }

  const columns = [
    {
      title: "Hari",
      dataIndex: "tanggal",
      key: "hari",
      width: 100,
      fixed: "left" as const,
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
      width: 150,
      render: (text: string) => {
        const date = parseDate(text)
        return isValid(date)
          ? format(date, "d MMMM yyyy", { locale: id })
          : "Invalid Date"
      },
    },
    {
      title: "Hijriah",
      dataIndex: "tanggal",
      key: "tanggal_hijriah",
      width: 150,
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
    { title: "Imsak", dataIndex: "imsak", key: "imsak", width: 80 },
    { title: "Subuh", dataIndex: "subuh", key: "subuh", width: 80 },
    { title: "Terbit", dataIndex: "terbit", key: "terbit", width: 80 },
    { title: "Dhuha", dataIndex: "dhuha", key: "dhuha", width: 80 },
    { title: "Dzuhur", dataIndex: "dzuhur", key: "dzuhur", width: 80 },
    { title: "Ashar", dataIndex: "ashar", key: "ashar", width: 80 },
    { title: "Maghrib", dataIndex: "maghrib", key: "maghrib", width: 80 },
    { title: "Isya", dataIndex: "isya", key: "isya", width: 80 },
  ]

  const dataSource =
    schedule?.jadwal.map((day) => {
      const date = parseDate(day.tanggal)
      const isToday =
        isValid(date) && date.toDateString() === today.toDateString()
      return {
        ...day,
        key: day.tanggal,
        isToday,
      }
    }) || []

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-gray-500">Memuat jadwal shalat...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="py-4">
        <Alert
          message="Gagal Memuat Jadwal"
          description="Tidak dapat memuat jadwal shalat. Silakan coba lagi."
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

  if (!schedule?.jadwal || schedule.jadwal.length === 0)
    return (
      <Empty
        description="Jadwal tidak tersedia"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="city-selector"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Pilih Kota
          </label>
          <CitySelector onCityChange={setSelectedCity} />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="month-selector"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Pilih Bulan
          </label>
          <Select
            id="month-selector"
            value={selectedMonth}
            onChange={setSelectedMonth}
            className="w-full"
            size="large"
            suffixIcon={<Calendar className="w-4 h-4 text-gray-400" />}
          >
            {months.map((monthName, index) => (
              <Option key={index} value={index}>
                {monthName} {years}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Today's Schedule Card */}
      {todaySchedule && (
        <Card
          className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Jadwal Hari Ini
                </h3>
                <p className="text-sm text-gray-600">
                  {format(today, "EEEE, d MMMM yyyy", { locale: id })}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            {prayerNames.map((prayer) => (
              <div
                key={prayer.key}
                className="bg-white rounded-lg p-3 text-center border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-1">{prayer.icon}</div>
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {prayer.label}
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {todaySchedule[prayer.key as keyof typeof todaySchedule]}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Download Button */}
      <div className="flex justify-end">
        <Button
          type="primary"
          size="large"
          icon={<Download className="w-4 h-4" />}
          onClick={downloadPDF}
          className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
        >
          Unduh PDF
        </Button>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowClassName={(record) =>
            record.isToday
              ? "bg-gradient-to-r from-green-100 to-emerald-100 font-semibold"
              : ""
          }
          bordered
          pagination={{
            pageSize: 31,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} hari`,
          }}
          scroll={{ x: "max-content" }}
          size="middle"
        />
      </div>
    </div>
  )
}

export default Schedule
