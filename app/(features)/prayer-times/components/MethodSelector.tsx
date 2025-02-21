import type React from "react"
import { Button, Modal } from "antd"
import { MethodSelectorProps } from "../interfaces/prayer-time.interface"

const MethodSelector: React.FC<MethodSelectorProps> = ({
  isOpen,
  onClose,
  methods,
  onSelectMethod,
}) => {
  return (
    <Modal open={isOpen} onCancel={onClose} footer={null}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <h2>Pilih Metode Perhitungan</h2>
        </div>
        <div className="space-y-2">
          {methods.map((method) => (
            <Button
              key={method.id}
              variant="link"
              className="w-full justify-start h-16"
              onClick={() => {
                onSelectMethod(method)
                onClose()
              }}
            >
              <div className="flex flex-col items-start">
                <span>{method.name}</span>
                <span className="text-sm text-muted-foreground">
                  Subuh: {method.params.subuh}°, Isya: {method.params.isya}°
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default MethodSelector
