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

export function getHijriDate(date: Date, offsetDays: number = -2): HijriDate {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  const civilEpoch = Date.UTC(1970, 0, 1)
  const hijriEpoch = Date.UTC(622, 6, 16) // Approximate epoch for Hijri calendar

  const msPerDay = 86400000
  const daysSinceHijriEpoch = Math.floor(
    (localDate.getTime() - hijriEpoch) / msPerDay,
  )
  const hijriYear = Math.floor(daysSinceHijriEpoch / 354.367) + 1
  let remainingDays = daysSinceHijriEpoch % 354.367

  let hijriMonth = 0
  const hijriMonthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]

  while (remainingDays >= hijriMonthLengths[hijriMonth]) {
    remainingDays -= hijriMonthLengths[hijriMonth]
    hijriMonth++
  }

  const hijriDay = Math.floor(remainingDays) + 1 + offsetDays

  return {
    day: hijriDay,
    month: hijriMonths[hijriMonth],
    year: hijriYear,
  }
}
