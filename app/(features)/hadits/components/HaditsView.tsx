import { Card, Typography } from "antd"
import { HadithDetailsProps } from "../interfaces/hadits.interface"

const { Title, Paragraph } = Typography

const HadithDetails: React.FC<HadithDetailsProps> = ({ hadith }) => {
  if (!hadith) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-500">No hadith selected</p>
      </div>
    )
  }

  return (
    <div className="relative z-10">
      <Card className="w-full">
        <Title level={2}>Hadits {hadith.judul}</Title>
        <div className="space-y-4">
          <div>
            <Paragraph className="text-2xl font-secondary mt-8" dir="rtl">
              {hadith.arab}
            </Paragraph>
          </div>
          <div>
            <Title level={4}>Artinya</Title>
            <Paragraph>{hadith.indo}</Paragraph>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default HadithDetails
