export function calculateMonthlyKwh(watts: number, hoursPerDay: number, quantity: number = 1) {
  const kw = watts / 1000
  return kw * hoursPerDay * 30 * quantity
}

export function calculateCostCLP(kwh: number, priceCLPPerKwh: number) {
  return kwh * priceCLPPerKwh
}

export function calculateEmissionsKg(kwh: number, carbonFactorKgPerKwh: number) {
  return kwh * carbonFactorKgPerKwh
} 