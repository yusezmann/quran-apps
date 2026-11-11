"use client"

import { useQuery } from "@tanstack/react-query"
import { geocodeCity } from "@/lib/qibla"

/** Koordinat sebuah kota (di-cache permanen; koordinat kota tidak berubah). */
export function useCityCoords(lokasi: string | undefined) {
  return useQuery({
    queryKey: ["city-coords", lokasi?.toUpperCase()],
    queryFn: () => geocodeCity(lokasi!),
    enabled: !!lokasi,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  })
}
