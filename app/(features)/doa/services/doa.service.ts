import axios from "axios"

export const fetchDoa = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/doa/sumber`,
  )
  if (!response.ok) throw new Error("Failed to fetch Doa")
  console.log(response.json())

  return response.json()
}

const fetchDoaList = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/doa/semua`,
  )
  return response.data // Pastikan ini adalah data yang diinginkan
}
