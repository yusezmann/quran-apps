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
