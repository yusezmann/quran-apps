export interface Dua {
  id: string
  judul: string
  doa: string // Teks Arab dari API
  latin: string
  artinya: string // Terjemahan Indonesia dari API
  ayat?: string
  source?: string
}

export interface ApiResponse {
  code: number
  message: string
  data: Dua[]
}

export interface DuaListProps {
  duas: Dua[]
  selectedDuaId: string | null
  setSelectedDuaId: (id: string | null) => void
}
