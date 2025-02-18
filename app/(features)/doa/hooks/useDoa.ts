import { useQuery } from "@tanstack/react-query"
import { fetchDoa } from "../services/doa.service"

export const useDoa = () => {
  return useQuery({
    queryKey: ["doa"],
    queryFn: fetchDoa,
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
    retry: 3, // Coba ulang jika gagal
  })
}

// import { useQuery } from "@tanstack/react-query"
// import axios from "axios"

// export const useDoa = () => {
//   return useQuery({
//     queryKey: ["doaList"],
//     queryFn: async () => {
//       const response = await axios.get("https://api.myquran.com/v2/doa/semua")
//       const result = response.data.data
//       return Array.isArray(result) ? result : []
//     }
//   })
// }
