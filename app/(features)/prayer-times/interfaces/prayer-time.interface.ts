export interface Method {
  id: string
  name: string
  params: { subuh: number; isya: number }
}

export interface MethodSelectorProps {
  isOpen: boolean
  onClose: () => void
  methods: Method[]
  onSelectMethod: (method: Method) => void
}

export interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectCity: (city: City) => void
}

export interface NextPrayerCardProps {
  nextPrayer: { name: string; time: string } | null
  countdown: string
  currentTime: Date
}

export interface PrayerTime {
  id: string
  lokasi: string
  daerah: string
  koordinat: {
    lat: number
    lon: number
  }
  jadwal: {
    tanggal: string
    imsak: string
    subuh: string
    terbit: string
    dhuha: string
    dzuhur: string
    ashar: string
    maghrib: string
    isya: string
  }
}

export interface PrayerTimeResponse {
  jadwalSholat: {
    subuh: string
    dzuhur: string
    ashar: string
    maghrib: string
    isya: string
  }
}

export interface City {
  id: string
  lokasi: string
  daerah: string
}

export interface PrayerTimesListProps {
  prayerTimes: PrayerTime
  nextPrayer: { name: string; time: string } | null
  countdown: string
  currentTime: Date
}
