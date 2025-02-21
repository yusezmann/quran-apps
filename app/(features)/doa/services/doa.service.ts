import type { ApiResponse } from "../interfaces/doa.interface"

export const fetchDuas = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/doa/semua`,
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching duas:", error)
    throw error
  }
}
