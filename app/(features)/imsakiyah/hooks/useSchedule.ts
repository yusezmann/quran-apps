import { useQuery } from "@tanstack/react-query"
import { fetchSchedule } from "../services/imsakiyah.service"
import type { ScheduleResponse } from "../interfaces/imsakiyah.interface"

export const useSchedule = (cityId: string, date: Date) => {
  return useQuery<ScheduleResponse, Error>({
    queryKey: ["schedule", cityId, date.getFullYear(), date.getMonth() + 1],
    queryFn: () =>
      fetchSchedule(cityId, date.getFullYear(), date.getMonth() + 1),
  })
}
