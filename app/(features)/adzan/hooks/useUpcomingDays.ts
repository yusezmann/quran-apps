"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { fetchSchedule } from "@/app/(features)/imsakiyah/services/imsakiyah.service"
import { CITY_CHANGED_EVENT, DEFAULT_CITY, getSavedCity, type SavedCity } from "@/lib/saved-city"
import { toLocalISODate } from "@/lib/hijri"
import type { DayTimes } from "@/lib/adzan/schedule"

/** Kota tersimpan yang reaktif (berubah saat pengguna mengganti kota di Beranda/Kiblat). */
export function useSavedCity(): SavedCity {
  const [city, setCity] = useState<SavedCity>(DEFAULT_CITY)
  useEffect(() => {
    const sync = () => setCity(getSavedCity() ?? DEFAULT_CITY)
    sync()
    window.addEventListener(CITY_CHANGED_EVENT, sync)
    window.addEventListener("storage", sync) // tab lain
    return () => {
      window.removeEventListener(CITY_CHANGED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])
  return city
}

/**
 * Jadwal sholat hari ini s.d. `daysAhead` hari ke depan untuk kota tersimpan.
 * Memakai jadwal bulanan (bulan ini + bulan depan) agar pergantian bulan tetap tercakup.
 */
export function useUpcomingDays(daysAhead: number, enabled = true): { city: SavedCity; days: DayTimes[] } {
  const city = useSavedCity()
  // Kunci per hari: data diperbarui otomatis saat tanggal berganti
  const today = toLocalISODate(new Date())

  const months = useMemo(() => {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return [
      { year: now.getFullYear(), month: now.getMonth() + 1 },
      { year: next.getFullYear(), month: next.getMonth() + 1 },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today])

  const results = useQueries({
    queries: months.map(({ year, month }) => ({
      queryKey: ["adzan-schedule", city.id, year, month],
      queryFn: () => fetchSchedule(city.id, year, month),
      enabled,
      staleTime: 6 * 60 * 60 * 1000,
      retry: 2,
    })),
  })

  const data = results.map((r) => r.data)
  const days = useMemo(() => {
    const from = today
    const to = toLocalISODate(addDays(new Date(), daysAhead))
    return data
      .flatMap((month) => (month?.jadwal ?? []) as unknown as Array<Partial<DayTimes>>)
      .filter((d): d is DayTimes => typeof d.date === "string" && d.date >= from && d.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data[0], data[1], today, daysAhead])

  return { city, days }
}
