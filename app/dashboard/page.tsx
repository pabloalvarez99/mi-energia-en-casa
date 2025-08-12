'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { APPLIANCES, REGIONS, carbonFactorKgPerKwhByRegion, electricityCostCLPPerKwhByRegion } from '@/lib/constants'
import { calculateMonthlyKwh, calculateCostCLP, calculateEmissionsKg } from '@/lib/calculations'
import type { ApplianceDefinition, ApplianceEntry } from '@/lib/types'
import { formatCurrencyCLP, formatNumber } from '@/lib/format'
import { getFirebase, maybeSaveScenario, listScenariosByRut, deleteScenarioById, maybeGetRegionAverage } from '@/lib/firebase'

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
  const [compareHours, setCompareHours] = useState<number>(4)
  const [priceDelta, setPriceDelta] = useState<number>(20000)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false)
  const [regionAvg, setRegionAvg] = useState<{ avgKwh: number; count: number } | null>(null)

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

  useEffect(() => {
    ;(async () => {
      const fb = await getFirebase()
      if (!fb || !profile?.rut) return
      setLoadingHistory(true)
      try {
        const items = await listScenariosByRut(fb, profile.rut, 20)
        setHistory(items)
        const avg = await maybeGetRegionAverage(fb, profile.region)
        if (avg) setRegionAvg(avg)
      } finally {
        setLoadingHistory(false)
      }
    })()
  }, [profile])

  const regionCode = profile?.region ?? 'RM'
  const costKwh = electricityCostCLPPerKwhByRegion[regionCode]
  const cf = carbonFactorKgPerKwhByRegion[regionCode]

  const total = useMemo(() => {
    const kwh = entries.reduce((sum, e) => sum + calculateMonthlyKwh(e.watts, e.hoursPerDay, e.quantity), 0)
    const cost = calculateCostCLP(kwh, costKwh)
    const co2 = calculateEmissionsKg(kwh, cf)
    return { kwh, cost, co2 }
  }, [entries, costKwh, cf])

  const totalAnnual = useMemo(() => ({
    kwh: total.kwh * 12,
    cost: total.cost * 12,
    co2: total.co2 * 12,
  }), [total])

  const ranked = useMemo(() => {
    return [...entries].map((e, index) => {
      const kwh = calculateMonthlyKwh(e.watts, e.hoursPerDay, e.quantity)
      const cost = calculateCostCLP(kwh, costKwh)
      return { index, ...e, kwh, cost }
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

  const updateEntry = (index: number, patch: Partial<ApplianceEntry>) => {
    setEntries((prev) => prev.map((e, i) => i === index ? { ...e, ...patch } : e))
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
      // Refresh history
      if (fb && profile?.rut) setHistory(await listScenariosByRut(fb, profile.rut, 20))
    } catch (e) {
      console.warn('No se pudo sincronizar con Firebase:', e)
    }
  }

  const loadScenario = (item: any) => {
    if (!item) return
    setEntries(item.entries)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteScenario = async (id: string) => {
    if (!confirm('¿Eliminar este escenario?')) return
    const fb = await getFirebase()
    if (fb && profile?.rut) {
      await deleteScenarioById(fb, profile.rut, id)
      setHistory(await listScenariosByRut(fb, profile.rut, 20))
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
                {ranked.map((e) => {
                  const kwh = calculateMonthlyKwh(e.watts, e.hoursPerDay, e.quantity)
                  const cost = calculateCostCLP(kwh, costKwh)
                  return (
                    <tr key={e.index} className="border-t border-white/10">
                      <td className="p-2">{e.name}</td>
                      <td className="p-2 text-right">
                        <input className="input w-24 text-right" type="number" value={e.watts} onChange={(ev) => updateEntry(e.index, { watts: parseFloat(ev.target.value) })} />
                      </td>
                      <td className="p-2 text-right">
                        <input className="input w-20 text-right" type="number" value={e.hoursPerDay} onChange={(ev) => updateEntry(e.index, { hoursPerDay: parseFloat(ev.target.value) })} />
                      </td>
                      <td className="p-2 text-right">
                        <input className="input w-16 text-right" type="number" value={e.quantity} onChange={(ev) => updateEntry(e.index, { quantity: parseInt(ev.target.value) })} />
                      </td>
                      <td className={`p-2 text-right ${severityColor(kwh)}`}>{formatNumber(kwh)}</td>
                      <td className="p-2 text-right">{formatCurrencyCLP(cost)}</td>
                      <td className="p-2 text-right">
                        <button className="text-danger hover:underline" onClick={() => removeEntry(e.index)}>Eliminar</button>
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
        <div className="md:col-span-3 grid md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-sm text-white/70">Total anual</div>
            <div className="font-semibold">{formatNumber(totalAnnual.kwh)} kWh</div>
            <div>{formatCurrencyCLP(totalAnnual.cost)} · {formatNumber(totalAnnual.co2)} kg CO₂</div>
          </div>
          <div className="card">
            <div className="text-sm text-white/70">Costo región</div>
            <div>{formatCurrencyCLP(costKwh)} / kWh · {formatNumber(cf)} kg CO₂/kWh</div>
          </div>
          <div className="card">
            <div className="text-sm text-white/70">Promedio regional (últimos)</div>
            <div>{regionAvg ? `${formatNumber(regionAvg.avgKwh)} kWh/mes · n=${regionAvg.count}` : '—'}</div>
          </div>
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
          <div>
            <label className="block text-sm mb-1">Horas/día</label>
            <input className="input w-24" type="number" value={compareHours} onChange={(e) => setCompareHours(parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Δ Precio (B vs A)</label>
            <input className="input w-32" type="number" value={priceDelta} onChange={(e) => setPriceDelta(parseFloat(e.target.value))} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="card">
            <div className="font-medium mb-1">{compareDef(compareA).name}</div>
            <div>Potencia: {formatNumber(compareDef(compareA).watts)} W</div>
            <div>kWh/mes ({compareHours}h/día): {formatNumber(compareMonthlyKwh(compareA, compareHours))}</div>
            <div>Costo/mes: {formatCurrencyCLP(calculateCostCLP(compareMonthlyKwh(compareA, compareHours), costKwh))}</div>
          </div>
          <div className="card">
            <div className="font-medium mb-1">{compareDef(compareB).name}</div>
            <div>Potencia: {formatNumber(compareDef(compareB).watts)} W</div>
            <div>kWh/mes ({compareHours}h/día): {formatNumber(compareMonthlyKwh(compareB, compareHours))}</div>
            <div>Costo/mes: {formatCurrencyCLP(calculateCostCLP(compareMonthlyKwh(compareB, compareHours), costKwh))}</div>
          </div>
          <div className="card">
            <div className="font-medium mb-1">Retorno de inversión</div>
            <div>Si B cuesta {formatCurrencyCLP(priceDelta)} más</div>
            <div>
              Recuperación: {
                (() => {
                  const months = investmentRecoveryMonths(priceDelta, compareA, compareB, compareHours)
                  return Number.isFinite(months) ? `${formatNumber(months)} meses` : 'No aplica'
                })()
              }
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="text-lg font-semibold mb-2">Historial de escenarios</h3>
        {loadingHistory ? (
          <p className="text-white/70 text-sm">Cargando…</p>
        ) : history.length === 0 ? (
          <p className="text-white/70 text-sm">Aún no tienes escenarios guardados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-white/70">
                <tr>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-right p-2">kWh/mes</th>
                  <th className="text-right p-2">Costo/mes</th>
                  <th className="text-right p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-white/10">
                    <td className="p-2">{h.name}</td>
                    <td className="p-2">{new Date(h.createdAt).toLocaleString('es-CL')}</td>
                    <td className="p-2 text-right">{formatNumber(h.totals.kwh)}</td>
                    <td className="p-2 text-right">{formatCurrencyCLP(h.totals.cost)}</td>
                    <td className="p-2 text-right space-x-2">
                      <button className="hover:underline" onClick={() => loadScenario(h)}>Cargar</button>
                      <button className="text-danger hover:underline" onClick={() => deleteScenario(h.id!)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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