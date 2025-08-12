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