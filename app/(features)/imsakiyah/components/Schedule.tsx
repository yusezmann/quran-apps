"use client"

import type React from "react"
import { Table, Select, Button, Spin, Alert, Empty } from "antd"
import { useScheduleStore } from "../store/scheduleStore"
import { useSchedule } from "../hooks/useSchedule"
import { format, isValid, setMonth, parse, parseISO, isSameDay } from "date-fns"
import { id } from "date-fns/locale"
import { useState, useMemo } from "react"
import type { City, PrayerSchedule } from "../interfaces/imsakiyah.interface"
import CitySelector from "./CitySelector"
import Link from "next/link"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Download, Calendar, MapPin, RefreshCw, Compass, ChevronRight } from "lucide-react"
import KaabaIcon from "@/components/KaabaIcon"
import { useDetectCity } from "@/app/(features)/prayer-times/hooks/useDetectCity"
import { useHijriOffset } from "@/app/(features)/hijri-date/hooks/useHijriOffset"
import { formatHijri } from "@/lib/hijri"

const { Option } = Select

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
  { key: "imsak", label: "Imsak" },
  { key: "subuh", label: "Subuh" },
  { key: "terbit", label: "Terbit" },
  { key: "dhuha", label: "Dhuha" },
  { key: "dzuhur", label: "Dzuhur" },
  { key: "ashar", label: "Ashar" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isya", label: "Isya" },
] as const

type PrayerKey = (typeof prayerNames)[number]["key"]

interface ScheduleRow extends PrayerSchedule {
  key: string
  date: Date
  isToday: boolean
  hijri: string
}

const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date(NaN)

  // Hapus nama hari jika ada (format "Sabtu, 01/03/2025")
  const cleanedDate = dateString.replace(/^[A-Za-z]+,\s*/, "")

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) return parseISO(cleanedDate)

  for (const formatStr of ["d/M/yyyy", "dd/MM/yyyy", "yyyy-MM-dd"]) {
    const date = parse(cleanedDate, formatStr, new Date())
    if (isValid(date)) return date
  }
  return new Date(NaN)
}

/** Grid jam sholat untuk satu hari (dipakai kartu "Hari ini" & kartu harian mobile). */
const PrayerTimesGrid = ({
  row,
  size = "sm",
}: {
  row: ScheduleRow
  size?: "sm" | "lg"
}) => (
  <dl
    className={`grid grid-cols-4 text-center ${
      size === "lg" ? "md:grid-cols-8 gap-3" : "gap-x-2 gap-y-2"
    }`}
  >
    {prayerNames.map(({ key, label }) => {
      const highlight = key === "imsak" || key === "maghrib"
      return (
        <div
          key={key}
          className={size === "lg" ? "rounded-xl bg-white/70 py-2 px-1" : ""}
        >
          <dt
            className={`text-[11px] md:text-xs leading-tight ${
              highlight ? "text-green-700 font-semibold" : "text-gray-500"
            }`}
          >
            {label}
          </dt>
          <dd
            className={`tabular-nums font-semibold text-gray-900 leading-tight ${
              size === "lg" ? "text-base md:text-lg" : "text-sm"
            }`}
          >
            {row[key as PrayerKey]}
          </dd>
        </div>
      )
    })}
  </dl>
)

const Schedule: React.FC = () => {
  const { currentDate } = useScheduleStore()
  const [selectedCity, setSelectedCity] = useState<City>({
    id: "1301",
    lokasi: "KOTA JAKARTA",
  })
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const { detectCity, isDetecting: isDetectingLocation } = useDetectCity()
  const hijriOffset = useHijriOffset()

  const detectLocation = async () => {
    const city = await detectCity()
    // Simpan hanya field yang dipakai imsakiyah (id + nama kota)
    if (city) setSelectedCity({ id: city.id, lokasi: city.lokasi })
  }

  const year = new Date().getFullYear()
  const selectedDate = setMonth(new Date(currentDate), selectedMonth)
  const { data: schedule, isLoading, error, refetch } = useSchedule(
    selectedCity.id,
    selectedDate,
  )

  const rows: ScheduleRow[] = useMemo(() => {
    const today = new Date()
    return (schedule?.jadwal ?? []).map((day) => {
      const date = parseDate(day.tanggal)
      const valid = isValid(date)
      return {
        ...day,
        key: day.tanggal,
        date,
        isToday: valid && isSameDay(date, today),
        hijri: valid ? formatHijri(date, hijriOffset) : "-",
      }
    })
  }, [schedule, hijriOffset])

  const todayRow = rows.find((row) => row.isToday)

  const downloadPDF = () => {
    if (!rows.length) return
    const doc = new jsPDF()
    doc.text(`Jadwal Sholat - ${selectedCity.lokasi} - ${months[selectedMonth]} ${year}`, 10, 10)
    autoTable(doc, {
      head: [["Tanggal", "Hijriah", ...prayerNames.map((p) => p.label)]],
      body: rows.map((row) => [
        isValid(row.date) ? format(row.date, "EEE, d MMM yyyy", { locale: id }) : row.tanggal,
        row.hijri,
        ...prayerNames.map((p) => row[p.key as PrayerKey]),
      ]),
    })
    doc.save(`jadwal-sholat-${selectedCity.lokasi}-${months[selectedMonth]}.pdf`)
  }

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "tanggal",
      width: 190,
      render: (date: Date, row: ScheduleRow) =>
        isValid(date) ? (
          <div className="leading-tight">
            <div className="font-medium text-gray-900">
              {format(date, "EEEE, d MMMM", { locale: id })}
            </div>
            <div className="text-xs text-gray-500">{row.hijri}</div>
          </div>
        ) : (
          row.tanggal
        ),
    },
    ...prayerNames.map(({ key, label }) => ({
      title: label,
      dataIndex: key,
      key,
      align: "center" as const,
      render: (value: string) => <span className="tabular-nums">{value}</span>,
    })),
  ]

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex flex-col items-center gap-4 py-16">
          <Spin size="large" />
          <p className="text-gray-500">Memuat jadwal sholat...</p>
        </div>
      )

    if (error)
      return (
        <Alert
          message="Gagal Memuat Jadwal"
          description="Tidak dapat memuat jadwal sholat. Silakan coba lagi."
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
      )

    if (!rows.length)
      return <Empty description="Jadwal tidak tersedia" image={Empty.PRESENTED_IMAGE_SIMPLE} />

    return (
      <>
        {/* Ringkasan hari ini — informasi yang paling sering dicari */}
        {todayRow && (
          <section
            aria-label="Jadwal hari ini"
            className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-5"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-base md:text-lg font-bold text-gray-900">
                Hari ini · {format(todayRow.date, "EEEE, d MMMM yyyy", { locale: id })}
              </h3>
              <p className="text-sm text-green-800">{todayRow.hijri}</p>
            </div>
            <PrayerTimesGrid row={todayRow} size="lg" />
          </section>
        )}

        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            {months[selectedMonth]} {year}
            <span className="ml-2 text-sm font-normal text-gray-500">{rows.length} hari</span>
          </h3>
          <Button
            type="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={downloadPDF}
            className="bg-green-600 hover:!bg-green-700 border-green-600"
          >
            Unduh PDF
          </Button>
        </div>

        {/* Desktop/tablet: tabel lengkap */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={rows}
            rowClassName={(record) => (record.isToday ? "imsakiyah-today" : "")}
            bordered
            pagination={false}
            scroll={{ x: "max-content" }}
            size="middle"
          />
        </div>

        {/* Mobile: kartu per hari, semua jam sholat terlihat tanpa scroll ke samping */}
        <ul className="md:hidden space-y-3">
          {rows.map((row) => (
            <li
              key={row.key}
              className={`rounded-xl border p-3 ${
                row.isToday ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
              {/* flex-wrap + nowrap per elemen: di layar sempit tanggal Hijriah turun ke baris
                  berikutnya secara utuh, badge "Hari ini" tidak pernah terpotong */}
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 leading-snug">
                <span className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-900">
                  {isValid(row.date) ? format(row.date, "EEEE, d MMM", { locale: id }) : row.tanggal}
                  {row.isToday && (
                    <span className="shrink-0 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-semibold leading-none text-white">
                      Hari ini
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap text-xs text-gray-500">{row.hijri}</span>
              </div>
              <PrayerTimesGrid row={row} />
            </li>
          ))}
        </ul>

        {/* Arah kiblat kini halaman tersendiri (/kiblat); di sini cukup pintasan */}
        <Link
          href="/kiblat"
          className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-green-400 hover:bg-green-50"
        >
          <div className="rounded-xl bg-green-50 p-2 group-hover:bg-white">
            <KaabaIcon size={32} />
          </div>
          <div className="flex-1 leading-snug">
            <p className="font-semibold text-gray-900">Arah Kiblat</p>
            <p className="text-sm text-gray-500">Buka kompas kiblat untuk lokasi Anda</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
        </Link>
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter — selalu tampil, juga saat jadwal sedang dimuat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="city-selector"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Pilih Kota
            </label>
            <Button
              type="text"
              size="small"
              className="text-green-700 flex items-center gap-1 hover:!text-green-800 p-0"
              onClick={detectLocation}
              loading={isDetectingLocation}
            >
              {!isDetectingLocation && <Compass className="w-4 h-4" />}
              Deteksi Lokasi
            </Button>
          </div>
          <CitySelector value={selectedCity} onCityChange={setSelectedCity} />
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
                {monthName} {year}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {renderContent()}
    </div>
  )
}

export default Schedule
