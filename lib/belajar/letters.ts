/**
 * Huruf hijaiyah untuk "Belajar" (tingkat Iqro' 1: huruf tunggal & berharakat fathah).
 * Isi disusun sendiri (urutan abjad hijaiyah standar), tidak menyalin buku Iqro'/Ummi/Tilawati.
 */
export interface Letter {
  /** id file audio, mis. "ba" → /assets/belajar/audio/ba.mp3 & ba-fathah.mp3 */
  id: string
  /** huruf tunggal */
  char: string
  /** nama huruf berharakat (dibacakan TTS), mis. "بَاءْ" */
  nameAr: string
  /** nama latin untuk orang tua, mis. "Ba" */
  latin: string
  /** bacaan berharakat fathah dalam latin, mis. "ba" */
  fathahLatin: string
  /** warna kartu (bergantian) */
  color: string
}

const FATHAH = "َ"

const RAW: Array<[string, string, string, string, string]> = [
  ["alif", "ا", "أَلِفْ", "Alif", "a"],
  ["ba", "ب", "بَاءْ", "Ba", "ba"],
  ["ta", "ت", "تَاءْ", "Ta", "ta"],
  ["tsa", "ث", "ثَاءْ", "Tsa", "tsa"],
  ["jim", "ج", "جِيمْ", "Jim", "ja"],
  ["ha", "ح", "حَاءْ", "Ha", "ha"],
  ["kho", "خ", "خَاءْ", "Kho", "kho"],
  ["dal", "د", "دَالْ", "Dal", "da"],
  ["dzal", "ذ", "ذَالْ", "Dzal", "dza"],
  ["ro", "ر", "رَاءْ", "Ro", "ro"],
  ["zai", "ز", "زَايْ", "Zai", "za"],
  ["sin", "س", "سِينْ", "Sin", "sa"],
  ["syin", "ش", "شِينْ", "Syin", "sya"],
  ["shod", "ص", "صَادْ", "Shod", "sho"],
  ["dhod", "ض", "ضَادْ", "Dhod", "dho"],
  ["tho", "ط", "طَاءْ", "Tho", "tho"],
  ["zho", "ظ", "ظَاءْ", "Zho", "zho"],
  ["ain", "ع", "عَيْنْ", "'Ain", "'a"],
  ["ghoin", "غ", "غَيْنْ", "Ghoin", "gho"],
  ["fa", "ف", "فَاءْ", "Fa", "fa"],
  ["qof", "ق", "قَافْ", "Qof", "qo"],
  ["kaf", "ك", "كَافْ", "Kaf", "ka"],
  ["lam", "ل", "لَامْ", "Lam", "la"],
  ["mim", "م", "مِيمْ", "Mim", "ma"],
  ["nun", "ن", "نُونْ", "Nun", "na"],
  ["wau", "و", "وَاوْ", "Wau", "wa"],
  ["ha2", "ه", "هَاءْ", "Ha'", "ha"],
  ["ya", "ي", "يَاءْ", "Ya", "ya"],
]

const COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#14b8a6"]

export const LETTERS: Letter[] = RAW.map(([id, char, nameAr, latin, fathahLatin], i) => ({
  id,
  char,
  nameAr,
  latin,
  fathahLatin,
  color: COLORS[i % COLORS.length],
}))

/** Huruf berharakat fathah. Alif berharakat ditulis dengan hamzah: أَ */
export const withFathah = (l: Letter) => (l.id === "alif" ? "أَ" : l.char + FATHAH)

/** 7 pelajaran × 4 huruf */
export interface Lesson {
  index: number
  title: string
  letters: Letter[]
}

export const LESSONS: Lesson[] = Array.from({ length: 7 }, (_, i) => {
  const letters = LETTERS.slice(i * 4, i * 4 + 4)
  return { index: i, title: letters.map((l) => l.char).join(" "), letters }
})

/** Huruf yang sudah dipelajari sampai pelajaran ke-i (untuk soal & latihan sambung). */
export const lettersUpTo = (i: number) => LESSONS.slice(0, i + 1).flatMap((l) => l.letters)

/**
 * Pasangan 2 huruf berharakat fathah dari huruf yang sudah dipelajari (latihan membaca sambung).
 * Deterministik agar setiap kali dibuka sama. Alif tidak dipakai di tengah kata.
 */
export function syllablePairs(lessonIndex: number, count = 6): Array<[Letter, Letter]> {
  const pool = lettersUpTo(lessonIndex).filter((l) => l.id !== "alif")
  const current = LESSONS[lessonIndex].letters.filter((l) => l.id !== "alif")
  const pairs: Array<[Letter, Letter]> = []
  for (let k = 0; pairs.length < count && k < 60; k++) {
    const a = current[k % current.length]
    const b = pool[(k * 5 + 3) % pool.length]
    if (a.id !== b.id && !pairs.some(([x, y]) => x.id === a.id && y.id === b.id)) pairs.push([a, b])
  }
  return pairs
}

/** Gabungkan bentuk sambung: huruf Arab otomatis menyambung bila ditulis berdampingan. */
export const joinSyllables = (letters: Letter[]) => letters.map(withFathah).join("")
