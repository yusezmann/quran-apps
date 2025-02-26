import { useQuery } from "@tanstack/react-query"
import { fetchAsmaulHusna } from "../services/asmaulhusna.service"

export const useHusna = () => {
  return useQuery({
    queryKey: ["asmaulhusna"],
    queryFn: fetchAsmaulHusna,
    staleTime: 1000 * 60 * 5, // Cache 5 menit
  })
}
