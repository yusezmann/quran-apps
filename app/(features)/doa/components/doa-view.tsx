import { Card, Typography } from "antd"
import type { Dua } from "../interfaces/doa.interface"

const { Title, Paragraph } = Typography

interface DuaDetailsProps {
  dua: Dua | undefined
}

export default function DuaDetails({ dua }: DuaDetailsProps) {
  if (!dua) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-500">No dua selected</p>
      </div>
    )
  }

  return (
    <div className="relative z-10">
      <Card className="w-full">
        <Title level={2}>{dua.judul}</Title>

        <div className="space-y-4">
          <div>
            <Paragraph className="text-2xl font-secondary mt-8" dir="rtl">
              {dua.arab}
            </Paragraph>
          </div>

          <div>
            <Title level={4}>Artinya</Title>
            <Paragraph>{dua.indo}</Paragraph>
          </div>
        </div>
      </Card>
    </div>
  )
}
