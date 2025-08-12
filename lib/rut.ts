// Normaliza eliminando puntos y mayúsculas para el dígito verificador
export function normalizeRut(rut: string): string {
  const clean = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase()
  if (clean.length < 2) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  return `${body}-${dv}`
}

export function formatRut(rut: string): string {
  const [body, dv] = rut.split('-')
  if (!body || !dv) return rut
  let reversed = body.split('').reverse()
  const withDots = reversed.reduce<string[]>((acc, curr, idx) => {
    acc.push(curr)
    if ((idx + 1) % 3 === 0 && idx !== reversed.length - 1) acc.push('.')
    return acc
  }, []).reverse().join('')
  return `${withDots}-${dv}`
}

export function validateRut(rut: string): boolean {
  const clean = normalizeRut(rut)
  const [body, dv] = clean.split('-')
  if (!body || !dv) return false
  if (!/^\d+$/.test(body)) return false
  const dvCalc = computeDV(body)
  return dv === dvCalc
}

function computeDV(body: string): string {
  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const remainder = 11 - (sum % 11)
  if (remainder === 11) return '0'
  if (remainder === 10) return 'K'
  return String(remainder)
} 