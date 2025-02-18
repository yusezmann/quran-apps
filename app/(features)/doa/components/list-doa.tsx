// import React, { useEffect } from "react"
// import { useDoa } from "../hooks/useDoa"
// import { useDoaStore } from "../store/doa-store"
// import { List, Spin, message } from "antd"
// import { Book } from "lucide-react"

// // Komponen Daftar Doa
// export const DoaList = (onSelect: any) => {
//   const { data, isLoading, error } = useDoa()
//   const setDoaList = useDoaStore((state) => state.setDoaList)

//   useEffect(() => {
//     if (data && Array.isArray(data)) {
//       setDoaList(data)
//     } else {
//       console.error("Data doa bukan array atau kosong")
//     }
//   }, [data, setDoaList])

//   useEffect(() => {
//     if (error) {
//       message.error("Gagal memuat daftar doa!")
//     }
//   }, [error])

//   if (isLoading)
//     return (
//       <Spin
//         size="large"
//         className="flex justify-center items-center h-screen"
//       />
//     )

//   return (
//     <div className="bg-white rounded-lg shadow overflow-hidden relative z-10 top-28">
//       <div className="bg-green-600 text-white p-4">
//         <h2 className="text-xl font-semibold flex items-center">
//           <Book className="mr-2" />
//           Daftar Doa
//         </h2>
//       </div>
//       <List
//         dataSource={data}
//         renderItem={(item) => (
//           <List.Item
//             className="cursor-pointer hover:bg-gray-100 p-4"
//             onClick={() => onSelect(item)}
//           >
//             <div>
//               {/* <h3 className="text-gray-800 font-semibold">{item.name}</h3>
//               <p className="text-sm text-gray-600">{item.translation}</p> */}
//               Doa Page
//             </div>
//           </List.Item>
//         )}
//       />
//     </div>
//   )
// }
