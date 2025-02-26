export const fetchHaditsArbain = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PRAYER_API_URL}/hadits/arbain/all`,
  )
  if (!response.ok) {
    throw new Error("Gagal mengambil data")
  }
  const data = await response.json()
  return data.data
}

// const fetchHadith = async ({ queryKey }) => {
//     const [_key, kitab, page] = queryKey;
//     const res = await fetch(`https://api.myquran.com/v2/hadits/${kitab}?page=${page}`);
//     if (!res.ok) throw new Error("Gagal mengambil data hadits");
//     return res.json();
//   };
