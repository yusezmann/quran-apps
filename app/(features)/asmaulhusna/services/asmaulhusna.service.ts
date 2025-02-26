export const fetchAsmaulHusna = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/husna/semua`,
  )
  if (!response.ok) {
    throw new Error("Gagal mengambil data")
  }
  const data = await response.json()
  return data.data
}
