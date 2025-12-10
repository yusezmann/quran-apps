export interface Hadith {
  no: string
  arab: string
  indo: string
  judul: string
}

// Zustand store untuk menyimpan data hadits
export interface HadithStore {
  hadiths: Hadith[]
  setHadiths: (hadiths: Hadith[]) => void
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
