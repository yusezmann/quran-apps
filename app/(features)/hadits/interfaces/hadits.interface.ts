export interface Hadith {
  no: string
  arab: string
  indo: string
  judul: string
}

export interface ApiResponse {
  code: number
  message: string
  data: Hadith[]
}

export interface HadithStore {
  hadiths: Hadith[]
  selectedHadithId: string | null
  isLoading: boolean
  setHadiths: (hadiths: Hadith[]) => void
  setSelectedHadithId: (id: string | null) => void
  setIsLoading: (isLoading: boolean) => void
}

export interface HadithListProps {
  hadiths: Hadith[]
  selectedHadithId: string | null
  setSelectedHadithId: (id: string | null) => void
  isMobile?: boolean
}

export interface HadithDetailsProps {
  hadith: Hadith | undefined
}
