/**
 * Angka Arab (angka hijaiyah) 0–10 untuk "Belajar".
 * Dibaca bentuk lengkap bertanwin (mis. ثَلَاثَةٌ = "Salasatun"); ejaan latin sesuai pilihan orang tua.
 */
export interface NumberItem {
  n: number
  /** angka Arab, mis. "٣" */
  numeral: string
  /** nama angka berharakat (dibacakan) */
  nameAr: string
  /** cara baca latin untuk orang tua */
  latin: string
}

export const NUMBERS: NumberItem[] = [
  { n: 0, numeral: "٠", nameAr: "صِفْرْ", latin: "Sifr" },
  { n: 1, numeral: "١", nameAr: "وَاحِدٌ", latin: "Wahidun" },
  { n: 2, numeral: "٢", nameAr: "اِثْنَانِ", latin: "Isnani" },
  { n: 3, numeral: "٣", nameAr: "ثَلَاثَةٌ", latin: "Salasatun" },
  { n: 4, numeral: "٤", nameAr: "أَرْبَعَةٌ", latin: "Arba'atun" },
  { n: 5, numeral: "٥", nameAr: "خَمْسَةٌ", latin: "Khamsatun" },
  { n: 6, numeral: "٦", nameAr: "سِتَّةٌ", latin: "Sittatun" },
  { n: 7, numeral: "٧", nameAr: "سَبْعَةٌ", latin: "Sab'atun" },
  { n: 8, numeral: "٨", nameAr: "ثَمَانِيَةٌ", latin: "Samaniatun" },
  { n: 9, numeral: "٩", nameAr: "تِسْعَةٌ", latin: "Tis'atun" },
  { n: 10, numeral: "١٠", nameAr: "عَشَرَةٌ", latin: "'Asyratun" },
]

/** Nama file suara (bila sudah dibuat), mis. "angka-3" → /assets/belajar/audio/angka-3.mp3 */
export const numberAudioId = (n: number) => `angka-${n}`

/** Benda untuk latihan menghitung (tanpa makhluk bernyawa). */
export const COUNT_OBJECTS = ["🍎", "⭐", "🎈", "🌸", "🍓", "🌙", "🍊", "🍇"]
