import { useState } from "react"
import { Hexagon, Search } from "lucide-react"
import { DuaListProps } from "../interfaces/doa.interface"

const DuaList: React.FC<DuaListProps> = ({
  duas,
  selectedDuaId,
  setSelectedDuaId,
}) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDuas = duas.filter((dua: any) =>
    dua.judul.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-[435px] xl:h-[80vh] relative z-10">
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Hexagon className="mr-2" /> Daftar Doa
        </h2>
      </div>
      <div className="p-2 border-b border-gray-300 flex items-center bg-gray-100">
        <Search className="text-gray-500 ml-2" />
        <input
          type="text"
          placeholder="Cari doa..."
          className="ml-2 p-2 w-full border-none bg-transparent focus:outline-none text-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filteredDuas.length > 0 ? (
          filteredDuas.map((dua: any) => (
            <li
              key={dua.judul}
              className={`cursor-pointer flex hover:bg-gray-100 p-4 ${
                selectedDuaId === dua.judul ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedDuaId(dua.judul)}
            >
              <div className="relative w-10 h-10 flex items-center justify-center bg-green-600 rounded-full">
                <Hexagon className="w-10 h-10 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-800 font-semibold">
                  {dua.judul || "Unnamed Dua"}
                </h3>
              </div>
            </li>
          ))
        ) : (
          <li className="p-4 text-gray-500 text-center">
            Tidak ada doa yang ditemukan
          </li>
        )}
      </ul>
    </div>
  )
}

export default DuaList
