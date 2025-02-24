"use client"

import type React from "react"
import { Table } from "antd"
import { useScheduleStore } from "../store/scheduleStore"
import { useSchedule } from "../hooks/useSchedule"
import { format, isValid } from "date-fns"
import { id } from "date-fns/locale"
import { toHijri } from "hijri-converter"

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

type ScheduleProps = {
  cityId: string
}

const Schedule: React.FC<ScheduleProps> = ({ cityId }) => {
  const { currentDate } = useScheduleStore()
  const { data: schedule, isLoading, error } = useSchedule(cityId, currentDate)

  if (isLoading) return <div>Loading schedule...</div>
  if (error) return <div>Error loading schedule</div>

  const today = new Date()

  const parseDate = (dateString: string): Date => {
    const cleanDateString = dateString.replace(/^[A-Za-z]+,\s*/, "").trim()
    const [day, month, year] = cleanDateString.split("/")
    return new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      Number.parseInt(day),
    )
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
        className: isToday ? "bg-yellow-100" : "",
      }
    }) || []

  return (
    <div style={{ overflowX: "auto" }}>
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
