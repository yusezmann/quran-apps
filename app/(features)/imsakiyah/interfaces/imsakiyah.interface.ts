export interface Imsakiyah {
  provinsi: string
  kabkota: string
  hijriah: string
  masehi: string
  imsakiyah: [ImsakiyahDetail]
}

export interface ImsakiyahDetail {
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

export interface ImsakiyahData {
  tanggal: string
  imsak: string
  subuh: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
}

export interface ImsakiyahHeaderData {
  hijriah: string
  kabkota: string
  masehi: string
  provinsi: string
}

export type City = {
  id: string
  lokasi: string
}

export type PrayerSchedule = {
  tanggal: string // Format: "DayName, DD/MM/YYYY"
  imsak: string
  subuh: string
  terbit: string
  dhuha: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
}

export type ScheduleResponse = {
  id: string
  lokasi: string
  daerah: string
  koordinat: {
    lat: number
    lon: number
  }
  jadwal: PrayerSchedule[]
}
