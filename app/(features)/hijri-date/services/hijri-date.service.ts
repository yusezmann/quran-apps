export async function getHijriDate(date: Date): Promise<string> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/cal/hijr/${
      date.toISOString().split("T")[0]
    }`,
  )
  const data = await res.json()

  return data.data
}
