interface Surah {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

interface SurahDetail extends Surah {
  ayahs: any[]
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
