'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { APPLIANCES, REGIONS, carbonFactorKgPerKwhByRegion, electricityCostCLPPerKwhByRegion } from '@/lib/constants'
import { calculateMonthlyKwh, calculateCostCLP, calculateEmissionsKg } from '@/lib/calculations'
import type { ApplianceDefinition, ApplianceEntry } from '@/lib/types'
import { formatCurrencyCLP, formatNumber } from '@/lib/format'
import { getFirebase, maybeSaveScenario } from '@/lib/firebase'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ rut: string; region: keyof typeof REGIONS } | null>(null)
  const [entries, setEntries] = useState<ApplianceEntry[]>([])
  const [selectedKey, setSelectedKey] = useState<string>('refrigerator')
  const [potencia, setPotencia] = useState<number>(APPLIANCES['refrigerator'].watts)
  const [horas, setHoras] = useState<number>(8)
  const [count, setCount] = useState<number>(1)
  const [compareA, setCompareA] = useState<string>('incandescent_bulb')
  const [compareB, setCompareB] = useState<string>('led_bulb')

  useEffect(() => {
    const saved = localStorage.getItem('mec_profile')
    if (!saved) {
      router.replace('/')
      return
    }
    const p = JSON.parse(saved)
    setProfile(p)
    const savedEntries = localStorage.getItem('mec_entries')
    if (savedEntries) setEntries(JSON.parse(savedEntries))
  }, [router])

  useEffect(() => {
    localStorage.setItem('mec_entries', JSON.stringify(entries))
  }, [entries])

  const regionCode = profile?.region ?? 'RM'
  const costKwh = electricityCostCLPPerKwhByRegion[regionCode]
  const cf = carbonFactorKgPerKwhByRegion[regionCode]

  const total = useMemo(() => {
    const kwh = entries.reduce((sum, e) => sum + calculateMonthlyKwh(e.watts, e.hoursPerDay, e.quantity), 0)
    const cost = calculateCostCLP(kwh, costKwh)
    const co2 = calculateEmissionsKg(kwh, cf)
    return { kwh, cost, co2 }
  }, [entries, costKwh, cf])

  const ranked = useMemo(() => {
    return [...entries].map((e) => {
      const kwh = calculateMonthlyKwh(e.watts, e.hoursPerDay, e.quantity)
      const cost = calculateCostCLP(kwh, costKwh)
      return { ...e, kwh, cost }
    }).sort((a, b) => b.cost - a.cost)
  }, [entries, costKwh])

  const addEntry = () => {
    const def = APPLIANCES[selectedKey]
    const entry: ApplianceEntry = {
      key: selectedKey,
      name: def.name,
      watts: potencia,
      hoursPerDay: horas,
      quantity: count,
    }
    setEntries((prev) => [...prev, entry])
  }

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  const severityColor = (kwh: number) => {
    if (kwh < 10) return 'text-success'
    if (kwh < 30) return 'text-warning'
    return 'text-danger'
  }

  const onSaveScenario = async () => {
    const name = prompt('Nombre del escenario (ej: Marzo 2025)')
    if (!name) return
    const scenario = {
      name,
      region: regionCode,
      entries,
      totals: total,
      createdAt: new Date().toISOString(),
    }
    const scenarios = JSON.parse(localStorage.getItem('mec_scenarios') || '[]')
    scenarios.push(scenario)
    localStorage.setItem('mec_scenarios', JSON.stringify(scenarios))

    try {
      const fb = await getFirebase()
      if (fb && profile?.rut) await maybeSaveScenario(fb, profile.rut, scenario)
      alert('Escenario guardado')
    } catch (e) {
      console.warn('No se pudo sincronizar con Firebase:', e)
    }
  }

  const compareDef = (key: string): ApplianceDefinition => APPLIANCES[key]

  const compareMonthlyKwh = (key: string, hours = 4) => calculateMonthlyKwh(APPLIANCES[key].watts, hours, 1)

  const investmentRecoveryMonths = (priceDeltaCLP: number, keyA: string, keyB: string, hours = 4) => {
    const kwhA = compareMonthlyKwh(keyA, hours)
    const kwhB = compareMonthlyKwh(keyB, hours)
    const monthlySavingCLP = calculateCostCLP(kwhA - kwhB, costKwh)
    if (monthlySavingCLP <= 0) return Infinity
    return priceDeltaCLP / monthlySavingCLP
  }

  const signOut = () => {
    localStorage.removeItem('mec_profile')
    router.replace('/')
  }

  if (!profile) return null

  return (
    <main className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm mb-1">Aparato</label>
            <select className="input" value={selectedKey} onChange={(e) => {
              const k = e.target.value
              setSelectedKey(k)
              setPotencia(APPLIANCES[k].watts)
            }}>
              {Object.entries(APPLIANCES).map(([key, a]) => (
                <option key={key} value={key}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Potencia (W)</label>
            <input className="input w-32" type="number" value={potencia} onChange={(e) => setPotencia(parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Horas/día</label>
            <input className="input w-28" type="number" value={horas} onChange={(e) => setHoras(parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Cantidad</label>
            <input className="input w-24" type="number" value={count} onChange={(e) => setCount(parseInt(e.target.value))} />
          </div>
          <button className="btn" onClick={addEntry}>Agregar</button>
          <div className="ml-auto text-right">
            <div className="text-xs text-white/60">Sesión</div>
            <div className="font-medium text-sm">{profile.rut}</div>
            <div className="text-xs text-white/60">Región: {REGIONS[regionCode].name}</div>
            <button className="text-sm text-white/70 hover:text-white underline mt-1" onClick={signOut}>Cerrar sesión</button>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="text-lg font-semibold mb-3">Lista y ranking</h3>
        {entries.length === 0 ? (
          <p className="text-white/70">Agrega aparatos para comenzar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-white/70">
                <tr>
                  <th className="text-left p-2">Aparato</th>
                  <th className="text-right p-2">Potencia (W)</th>
                  <th className="text-right p-2">Horas/día</th>
                  <th className="text-right p-2">Cant.</th>
                  <th className="text-right p-2">kWh/mes</th>
                  <th className="text-right p-2">Costo/mes</th>
                  <th className="text-right p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((e, idx) => {
                  const kwh = calculateMonthlyKwh(e.watts, e.hoursPerDay, e.quantity)
                  const cost = calculateCostCLP(kwh, costKwh)
                  return (
                    <tr key={idx} className="border-t border-white/10">
                      <td className="p-2">{e.name}</td>
                      <td className="p-2 text-right">{formatNumber(e.watts)}</td>
                      <td className="p-2 text-right">{formatNumber(e.hoursPerDay)}</td>
                      <td className="p-2 text-right">{e.quantity}</td>
                      <td className={`p-2 text-right ${severityColor(kwh)}`}>{formatNumber(kwh)}</td>
                      <td className="p-2 text-right">{formatCurrencyCLP(cost)}</td>
                      <td className="p-2 text-right">
                        <button className="text-danger hover:underline" onClick={() => removeEntry(entries.indexOf(e))}>Eliminar</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card grid md:grid-cols-3 gap-4 items-center">
        <div>
          <div className="text-sm text-white/70">Total estimado mensual</div>
          <div className="text-3xl font-semibold">{formatNumber(total.kwh)} kWh</div>
        </div>
        <div>
          <div className="text-sm text-white/70">Costo estimado mensual</div>
          <div className="text-3xl font-semibold">{formatCurrencyCLP(total.cost)}</div>
        </div>
        <div>
          <div className="text-sm text-white/70">Emisiones estimadas</div>
          <div className="text-3xl font-semibold">{formatNumber(total.co2)} kg CO₂</div>
        </div>
        <div className="md:col-span-3">
          <button className="btn" onClick={onSaveScenario}>Guardar escenario</button>
        </div>
      </section>

      <section className="card">
        <h3 className="text-lg font-semibold mb-3">Comparador de eficiencia</h3>
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div className="min-w-[220px]">
            <label className="block text-sm mb-1">Opción A</label>
            <select className="input" value={compareA} onChange={(e) => setCompareA(e.target.value)}>
              {Object.entries(APPLIANCES).map(([key, a]) => (
                <option key={key} value={key}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[220px]">
            <label className="block text-sm mb-1">Opción B</label>
            <select className="input" value={compareB} onChange={(e) => setCompareB(e.target.value)}>
              {Object.entries(APPLIANCES).map(([key, a]) => (
                <option key={key} value={key}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="card">
            <div className="font-medium mb-1">{compareDef(compareA).name}</div>
            <div>Potencia: {formatNumber(compareDef(compareA).watts)} W</div>
            <div>kWh/mes (4h/día): {formatNumber(compareMonthlyKwh(compareA))}</div>
            <div>Costo/mes: {formatCurrencyCLP(calculateCostCLP(compareMonthlyKwh(compareA), costKwh))}</div>
          </div>
          <div className="card">
            <div className="font-medium mb-1">{compareDef(compareB).name}</div>
            <div>Potencia: {formatNumber(compareDef(compareB).watts)} W</div>
            <div>kWh/mes (4h/día): {formatNumber(compareMonthlyKwh(compareB))}</div>
            <div>Costo/mes: {formatCurrencyCLP(calculateCostCLP(compareMonthlyKwh(compareB), costKwh))}</div>
          </div>
          <div className="card">
            <div className="font-medium mb-1">Retorno de inversión</div>
            <div>Ejemplo: si el equipo B cuesta $20.000 más</div>
            <div>
              Recuperación: {
                (() => {
                  const months = investmentRecoveryMonths(20000, compareA, compareB)
                  return Number.isFinite(months) ? `${formatNumber(months)} meses` : 'No aplica'
                })()
              }
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="text-lg font-semibold mb-2">Recomendaciones</h3>
        <ul className="list-disc pl-5 space-y-1 text-white/90 text-sm">
          <li>Reemplaza ampolletas incandescentes por LED: ahorras hasta 80% en iluminación.</li>
          <li>Desconecta aparatos en standby o usa regletas con interruptor.</li>
          <li>Ajusta el termostato del refrigerador (4°C) y del freezer (-18°C).</li>
          <li>Prefiere hervidores eficientes y evita hervir más agua de la necesaria.</li>
          <li>Usa temporizadores o programación para optimizar horas de uso.</li>
        </ul>
      </section>
    </main>
  )
} 