export interface Dua {
  id: string
  judul: string // Changed from 'doa' to 'judul'
  arab: string
  latin: string
  indo: string
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
