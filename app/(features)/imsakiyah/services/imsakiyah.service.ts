import { City, ScheduleResponse } from "../interfaces/imsakiyah.interface"

const BASE_URL = process.env.NEXT_PUBLIC_PRAYER_API_URL

export const fetchCities = async (): Promise<City[]> => {
  const response = await fetch(`${BASE_URL}/sholat/kota/semua`)
  const data = await response.json()
  return data.data
}

export const fetchSchedule = async (
  cityId: string,
  year: number,
  month: number,
): Promise<ScheduleResponse> => {
  const response = await fetch(
    `${BASE_URL}/sholat/jadwal/${cityId}/${year}/${month}`,
  )
  const data = await response.json()

  return data.data
}
