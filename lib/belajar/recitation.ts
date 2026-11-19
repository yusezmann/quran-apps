/**
 * Data bacaan per kata untuk hafalan anak (sumber: Quran.com).
 * - Teks ayat dipecah per kata (rasm Utsmani) → bisa di-highlight satu per satu.
 * - Audio per surat + waktu mulai/selesai setiap kata (milidetik) → kata yang sedang dibaca menyala.
 *
 * Hanya qari yang punya data waktu per kata LENGKAP untuk 17 surat hafalan anak (diuji: semua ayat cocok).
 */
export interface HafalanQari {
  /** id reciter Quran.com (qdc) */
  id: number
  name: string
  short: string
  note?: string
}

export const HAFALAN_QARI: HafalanQari[] = [
  { id: 7, name: "Misyari Rasyid Al-Afasi", short: "Al-Afasi" },
  { id: 12, name: "Mahmud Khalil Al-Husary (Mu'allim)", short: "Al-Husary Mengajar", note: "pelan, untuk belajar" },
  { id: 3, name: "Abdurrahman As-Sudais", short: "As-Sudais" },
  { id: 6, name: "Mahmud Khalil Al-Husary", short: "Al-Husary" },
  { id: 9, name: "Muhammad Shiddiq Al-Minshawi", short: "Al-Minshawi" },
  { id: 2, name: "Abdul Basit Abdus Shamad", short: "Abdul Basit" },
  { id: 10, name: "Sa'ud Asy-Syuraim", short: "Asy-Syuraim" },
  { id: 4, name: "Abu Bakar Asy-Syatri", short: "Asy-Syatri" },
]
export const DEFAULT_HAFALAN_QARI = 7

export interface VerseWords {
  /** kata-kata ayat (tanpa tanda akhir ayat) */
  words: string[]
  /** nomor akhir ayat dalam angka Arab, mis. "١" */
  end: string
}

/** Kata-kata setiap ayat dalam satu surat, kunci = nomor ayat. */
export async function fetchChapterWords(chapter: number): Promise<Record<number, VerseWords>> {
  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${chapter}?words=true&word_fields=text_uthmani&per_page=300`,
  )
  if (!res.ok) throw new Error(`Gagal memuat kata ayat (${res.status})`)
  const data = (await res.json()) as {
    verses: Array<{ verse_number: number; words: Array<{ char_type_name: string; text_uthmani: string }> }>
  }
  return Object.fromEntries(
    data.verses.map((v) => [
      v.verse_number,
      {
        words: v.words.filter((w) => w.char_type_name === "word").map((w) => w.text_uthmani),
        end: v.words.find((w) => w.char_type_name === "end")?.text_uthmani ?? "",
      },
    ]),
  )
}

export interface VerseTiming {
  /** awal & akhir ayat dalam audio surat (ms) */
  from: number
  to: number
  /** per kata: [posisi kata (1..n), mulai ms, selesai ms] */
  segments: Array<[number, number, number]>
}

export interface ChapterAudio {
  url: string
  verses: Record<number, VerseTiming>
}

/** Audio satu surat + waktu setiap kata untuk qari tertentu. */
export async function fetchChapterAudio(reciterId: number, chapter: number): Promise<ChapterAudio> {
  const res = await fetch(
    `https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${chapter}&segments=true`,
  )
  if (!res.ok) throw new Error(`Gagal memuat audio qari (${res.status})`)
  const data = (await res.json()) as {
    audio_files: Array<{
      audio_url: string
      verse_timings: Array<{ verse_key: string; timestamp_from: number; timestamp_to: number; segments: number[][] }>
    }>
  }
  const file = data.audio_files[0]
  if (!file) throw new Error("Audio surat tidak tersedia untuk qari ini")
  const verses: Record<number, VerseTiming> = {}
  for (const vt of file.verse_timings) {
    const ayah = Number(vt.verse_key.split(":")[1])
    verses[ayah] = {
      from: vt.timestamp_from,
      to: vt.timestamp_to,
      segments: (vt.segments ?? [])
        .filter((s) => s.length >= 3)
        .map((s) => [s[0], s[1], s[2]] as [number, number, number])
        .sort((a, b) => a[1] - b[1]),
    }
  }
  return { url: file.audio_url, verses }
}
