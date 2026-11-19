/** Surat pendek untuk anak: Al-Fatihah lalu juz 30 dari yang terpendek. [nomor, nama, jumlah ayat] */
export const SHORT_SURAHS: Array<[number, string, number]> = [
  [1, "Al-Fatihah", 7],
  [114, "An-Nas", 6],
  [113, "Al-Falaq", 5],
  [112, "Al-Ikhlas", 4],
  [111, "Al-Lahab", 5],
  [110, "An-Nasr", 3],
  [109, "Al-Kafirun", 6],
  [108, "Al-Kautsar", 3],
  [107, "Al-Ma'un", 7],
  [106, "Quraisy", 4],
  [105, "Al-Fil", 5],
  [104, "Al-Humazah", 9],
  [103, "Al-'Asr", 3],
  [102, "At-Takatsur", 8],
  [101, "Al-Qari'ah", 11],
  [100, "Al-'Adiyat", 11],
  [99, "Az-Zalzalah", 8],
]

export const surahName = (n: number) => SHORT_SURAHS.find(([num]) => num === n)?.[1] ?? `Surat ${n}`
