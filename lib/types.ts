export type ApplianceDefinition = {
  name: string
  watts: number
}

export type ApplianceEntry = {
  key: string
  name: string
  watts: number
  hoursPerDay: number
  quantity: number
}

export type ScenarioDoc = {
  id?: string
  name: string
  region: string
  entries: ApplianceEntry[]
  totals: { kwh: number; cost: number; co2: number }
  createdAt: string
} 