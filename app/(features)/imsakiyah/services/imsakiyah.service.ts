const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchImsakiyah(
  provinsi: string,
  kabkota: string,
): Promise<any> {
  if (!provinsi || !kabkota) {
    console.error("Provinsi dan kabkota harus diisi!")
    return null
  }

  try {
    const res = await fetch(`${BASE_URL}/imsakiyah`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ provinsi, kabkota }), // Kirim data dalam format JSON
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(
        `Error ${res.status}: ${errorData.message || "Bad Request"}`,
      )
    }

    const data = await res.json()
    return data.data
  } catch (error) {
    console.error("Failed to fetch imsakiyah:", error)
    return null
  }
}

export const getListProvinces = async () => {
  const res = await fetch(`${BASE_URL}/imsakiyah/provinsi`)
  const data = await res.json()
  return data.data
}

export const getListKabkota = async (provinsi: string) => {
  try {
    const response = await fetch(`${BASE_URL}/imsakiyah/kabkota`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ provinsi }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Error ${response.status}: ${errorData.message || "Bad Request"}`,
      )
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Failed to fetch kabkota:", error)
    return null
  }
}
