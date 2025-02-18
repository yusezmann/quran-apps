"use client"

import { useEffect } from "react"
import { List, Spin, message } from "antd"
import { useDoa } from "../hooks/useDoa"
import useStore from "../store/doa-store"
import { Book, Hexagon } from "lucide-react"

const DoaComponent = () => {
  const { data, isLoading, error } = useDoa()
  const setDoaList = useStore((state: any) => state.setDoaList)
  const doaList = useStore((state: any) => state.doaList)

  // Memastikan data dalam bentuk array
  useEffect(() => {
    if (data) {
      const doaArray = data.data
        ? Array.isArray(data.data)
          ? data.data
          : [data.data]
        : []
      setDoaList(doaArray)
    }
  }, [data, setDoaList])

  // Handle error
  useEffect(() => {
    if (error) {
      message.error("Terjadi kesalahan saat mengambil data doa.")
    }
  }, [error])

  if (isLoading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center h-screen"
      />
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden relative z-10 top-28">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Book className="mr-2" />
          Daftar Doa
        </h2>
      </div>

      {/* List Doa */}
      <ul className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
        {doaList?.map((doa: any, index: number) => (
          <li key={index} className="cursor-pointer hover:bg-gray-100 p-4">
            <div className="flex items-center">
              {/* Nomor urut */}
              {/* <div className="relative w-10 h-10 flex items-center justify-center bg-green-600 rounded-full">
                <Hexagon className="w-10 h-10 text-white" />
                <span className="absolute text-gray-50 text-sm font-bold">
                  {index + 1}
                </span>
              </div> */}

              {/* Detail Doa */}
              <div className="ml-4">
                <h3 className="text-gray-800 font-semibold">{doa.judul}</h3>
                <p className="text-xl text-gray-900 mb-2">{doa.arab}</p>
                <p className="text-sm text-gray-600">{doa.indo}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DoaComponent
