"use client"

import { useQuery } from "@tanstack/react-query"
import { DEFAULT_HIJRI_OFFSET, toLocalISODate } from "@/lib/hijri"
import { fetchHijriOffset } from "../services/hijri-date.service"

/** Offset Hijriah bersama (di-cache per hari) untuk semua komponen. */
export function useHijriOffset(): number {
  const today = toLocalISODate(new Date())
  const { data } = useQuery({
    queryKey: ["hijri-offset", today],
    queryFn: () => fetchHijriOffset(),
    staleTime: 12 * 60 * 60 * 1000,
    retry: 1,
  })
  return data ?? DEFAULT_HIJRI_OFFSET
}
