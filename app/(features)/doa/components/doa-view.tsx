import { Card, Typography } from "antd"
import type { Dua } from "../interfaces/doa.interface"

const { Title, Paragraph } = Typography

interface DuaDetailsProps {
  dua: Dua | undefined
}

export default function DuaDetails({ dua }: DuaDetailsProps) {
  if (!dua) {
    return null
  }

  return (
    <div className="relative z-10">
      <Card className="w-full">
        <Title level={2}>{dua.judul}</Title>

        <div className="space-y-4">
          <div>
            <Paragraph
              className="text-2xl font-tertiary mt-8 leading-loose"
              dir="rtl"
            >
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
