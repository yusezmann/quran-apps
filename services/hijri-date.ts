interface HijriDate {
  day: number
  month: string
  year: number
}

const hijriMonths = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqaidah",
  "Dzulhijjah",
]

export function getHijriDate(date: Date): HijriDate {
  // This is a simplified version. For production, use a proper Hijri calendar library
  const timestamp = date.getTime() - date.getTimezoneOffset() * 60 * 1000
  const hijriYear = Math.floor(timestamp / (354.367 * 24 * 60 * 60 * 1000)) + 1389
  const daysPastHijriYear = Math.floor((timestamp % (354.367 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
  const hijriMonth = Math.floor(daysPastHijriYear / 29.5)
  const hijriDay = Math.floor(daysPastHijriYear % 29.5) + 1

  return {
    day: hijriDay,
    month: hijriMonths[hijriMonth],
    year: hijriYear,
  }
}

