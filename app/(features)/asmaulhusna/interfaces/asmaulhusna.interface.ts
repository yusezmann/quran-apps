export interface AsmaulHusna {
  id: number
  arab: string
  latin: string
  indo: string
}

export interface HusnaStore {
  husna: AsmaulHusna[]
  setHusna: (data: AsmaulHusna[]) => void
}
