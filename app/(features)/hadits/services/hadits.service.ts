import type { ApiResponse } from "../interfaces/hadits.interface"

export const fetchHadiths = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/hadits/arbain/all`,
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching hadiths:", error)
    throw error
  }
}
