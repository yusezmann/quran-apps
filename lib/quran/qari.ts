/** Qari yang tersedia di API equran (kunci = id audio per ayat). */
export const QARI_OPTIONS = [
  { value: "05", label: "Misyari Rasyid Al-Afasi", short: "Al-Afasi" },
  { value: "01", label: "Abdullah Al-Juhany", short: "Al-Juhany" },
  { value: "02", label: "Abdul Muhsin Al-Qasim", short: "Al-Qasim" },
  { value: "03", label: "Abdurrahman As-Sudais", short: "As-Sudais" },
  { value: "04", label: "Ibrahim Al-Dossari", short: "Al-Dossari" },
] as const

export type QariId = (typeof QARI_OPTIONS)[number]["value"]
