export function formatNumber(n: number, maxFractionDigits = 2) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: maxFractionDigits }).format(n)
}

export function formatCurrencyCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
} 