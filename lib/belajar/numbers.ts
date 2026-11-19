/**
 * Angka Arab (angka hijaiyah) 0–10 untuk "Belajar".
 * `nameAr` berharakat & diakhiri sukun agar dibaca bentuk berhenti (waqaf), mis. ثَلَاثَةْ = "tsalātsah".
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
  { n: 0, numeral: "٠", nameAr: "صِفْرْ", latin: "shifr" },
  { n: 1, numeral: "١", nameAr: "وَاحِدْ", latin: "wāḥid" },
  { n: 2, numeral: "٢", nameAr: "اِثْنَانْ", latin: "itsnān" },
  { n: 3, numeral: "٣", nameAr: "ثَلَاثَةْ", latin: "tsalātsah" },
  { n: 4, numeral: "٤", nameAr: "أَرْبَعَةْ", latin: "arba'ah" },
  { n: 5, numeral: "٥", nameAr: "خَمْسَةْ", latin: "khamsah" },
  { n: 6, numeral: "٦", nameAr: "سِتَّةْ", latin: "sittah" },
  { n: 7, numeral: "٧", nameAr: "سَبْعَةْ", latin: "sab'ah" },
  { n: 8, numeral: "٨", nameAr: "ثَمَانِيَةْ", latin: "tsamāniyah" },
  { n: 9, numeral: "٩", nameAr: "تِسْعَةْ", latin: "tis'ah" },
  { n: 10, numeral: "١٠", nameAr: "عَشَرَةْ", latin: "'asyarah" },
]

/** Nama file suara (bila sudah dibuat), mis. "angka-3" → /assets/belajar/audio/angka-3.mp3 */
export const numberAudioId = (n: number) => `angka-${n}`

/** Benda untuk latihan menghitung (tanpa makhluk bernyawa). */
export const COUNT_OBJECTS = ["🍎", "⭐", "🎈", "🌸", "🍓", "🌙", "🍊", "🍇"]
