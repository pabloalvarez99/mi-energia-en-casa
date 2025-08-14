'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { COMMON_APPLIANCES, REGIONS, CO2_FACTOR, ELECTRICITY_RATES, REGIONAL_CONTEXT, SEASONAL_RECOMMENDATIONS, REGIONAL_PROGRAMS, REGIONAL_CONSUMPTION_PATTERNS, CLIMATE_ZONES, ENERGY_SAVING_TIPS, GOVERNMENT_PROGRAMS } from '@/lib/constants'
import { calculateMonthlyKwh, calculateCostCLP, calculateEmissionsKg } from '@/lib/calculations'
import type { ApplianceDefinition, ApplianceEntry, ScenarioDoc } from '@/lib/types'
import { formatCurrencyCLP, formatNumber } from '@/lib/format'
import { getFirebase, maybeSaveScenario, listScenariosByRut, deleteScenarioById, maybeGetRegionAverage } from '@/lib/firebase'
import ConsumptionChart from '@/components/ConsumptionChart'
import SavingsCalculator from '@/components/SavingsCalculator'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ rut: string; region: keyof typeof REGIONS } | null>(null)
  const [entries, setEntries] = useState<ApplianceEntry[]>([])
  const [selectedKey, setSelectedKey] = useState<string>('0') // Index del array
  const [potencia, setPotencia] = useState<number>(COMMON_APPLIANCES[0].watts)
  const [horas, setHoras] = useState<number>(8)
  const [count, setCount] = useState<number>(1)

  // Estados para los comparadores
  const [compareA, setCompareA] = useState<string>('0')
  const [compareB, setCompareB] = useState<string>('1')
  const [compareHours, setCompareHours] = useState<number>(4)
  const [priceDelta, setPriceDelta] = useState<number>(50000)
  const [history, setHistory] = useState<ScenarioDoc[]>([])
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false)
  const [regionAvg, setRegionAvg] = useState<{ avgKwh: number; count: number } | null>(null)
  const [savingScenario, setSavingScenario] = useState<boolean>(false)
  const [showMobileTable, setShowMobileTable] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('mec_profile')
    if (!saved) {
      router.replace('/')
      return
    }
    try {
      const p = JSON.parse(saved)
      if (p?.rut && p?.region && typeof p.rut === 'string' && typeof p.region === 'string') {
        setProfile(p)
      } else {
        throw new Error('Invalid profile structure')
      }
    } catch (error) {
      console.warn('Error parsing profile:', error)
      localStorage.removeItem('mec_profile')
      router.replace('/')
      return
    }
    
    const savedEntries = localStorage.getItem('mec_entries')
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries)
        if (Array.isArray(parsedEntries)) {
          setEntries(parsedEntries)
        }
      } catch (error) {
        console.warn('Error parsing saved entries:', error)
        localStorage.removeItem('mec_entries')
      }
    }
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
  const costKwh = ELECTRICITY_RATES[regionCode as keyof typeof ELECTRICITY_RATES]
  const cf = CO2_FACTOR

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
    const selectedIndex = parseInt(selectedKey)
    const def = COMMON_APPLIANCES[selectedIndex]
    const entry: ApplianceEntry = {
      key: selectedKey,
      name: def.name,
      watts: potencia,
      hoursPerDay: horas,
      quantity: count
    }
    setEntries([...entries, entry])
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

  const getSeverityIndicator = (kwh: number) => {
    if (kwh < 10) return 'Bajo'
    if (kwh < 30) return 'Medio'
    return 'Alto'
  }

  const onSaveScenario = async () => {
    const name = prompt('Ingrese un nombre para el escenario:')
    if (!name) return
    
    setSavingScenario(true)
    try {
      const scenario = {
        name,
        region: regionCode,
        entries,
        totals: total,
        createdAt: new Date().toISOString(),
      }
      const scenarios = JSON.parse(localStorage.getItem('mec_scenarios') || '[]')
      if (Array.isArray(scenarios)) {
        scenarios.push(scenario)
        localStorage.setItem('mec_scenarios', JSON.stringify(scenarios))
      } else {
        localStorage.setItem('mec_scenarios', JSON.stringify([scenario]))
      }

      const fb = await getFirebase()
      if (fb && profile?.rut) {
        await maybeSaveScenario(fb, profile.rut, scenario)
        const updatedHistory = await listScenariosByRut(fb, profile.rut, 20)
        setHistory(updatedHistory)
      }
      alert('Escenario guardado exitosamente')
    } catch (e) {
      console.warn('No se pudo sincronizar con Firebase:', e)
      alert('Escenario guardado localmente')
    } finally {
      setSavingScenario(false)
    }
  }

  const loadScenario = (item: any) => {
    if (!item) return
    setEntries(item.entries)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    alert(`Escenario "${item.name}" cargado correctamente`)
  }

  const deleteScenario = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de eliminar el escenario "${name}"?`)) return
    const fb = await getFirebase()
    if (fb && profile?.rut) {
      await deleteScenarioById(fb, profile.rut, id)
      setHistory(await listScenariosByRut(fb, profile.rut, 20))
      alert('Escenario eliminado')
    }
  }

  const compareDef = (key: string): ApplianceDefinition => {
    const index = parseInt(key)
    return COMMON_APPLIANCES[index]
  }

  const compareMonthlyKwh = (key: string, hours = 4) => {
    const index = parseInt(key)
    return calculateMonthlyKwh(COMMON_APPLIANCES[index].watts, hours, 1)
  }

  const investmentRecoveryMonths = (priceDeltaCLP: number, keyA: string, keyB: string, hours = 4) => {
    const indexA = parseInt(keyA)
    const indexB = parseInt(keyB)
    const kwhA = calculateMonthlyKwh(COMMON_APPLIANCES[indexA].watts, hours, 1)
    const kwhB = calculateMonthlyKwh(COMMON_APPLIANCES[indexB].watts, hours, 1)
    const diffKwh = Math.abs(kwhA - kwhB)
    const diffCost = calculateCostCLP(diffKwh, costKwh)
    if (diffCost <= 0) return Infinity
    return priceDeltaCLP / diffCost
  }

  const signOut = () => {
    localStorage.removeItem('mec_profile')
    router.replace('/')
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading text-2xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <main className="space-y-8 fade-in">
        {/* Header with user info */}
        <section className="card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">
                Panel de Control Energético
              </h1>
              <p className="text-white/70">
                Análisis y optimización del consumo residencial
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-white/60">Usuario</div>
                <div className="font-medium">{profile.rut}</div>
                <div className="text-xs text-white/60">
                  {REGIONS[regionCode].name}
                </div>
              </div>
              <button 
                className="btn-secondary text-sm px-4 py-2" 
                onClick={signOut}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </section>

        {/* Add appliance form */}
        <section className="card">
          <h2 className="text-xl font-semibold mb-4">
            Agregar Electrodoméstico
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Aparato</label>
              <select 
                className="input" 
                value={selectedKey} 
                onChange={(e) => {
                  const k = e.target.value
                  setSelectedKey(k)
                  setPotencia(COMMON_APPLIANCES[parseInt(k)].watts)
                }}
              >
                {COMMON_APPLIANCES.map((a, index) => (
                  <option key={index} value={index}>{a.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Potencia (W)</label>
              <input 
                className="input" 
                type="number" 
                value={potencia} 
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value) && value > 0) {
                    setPotencia(value)
                  }
                }}
                min="1"
                max="10000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Horas/día</label>
              <input 
                className="input" 
                type="number" 
                value={horas} 
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value) && value >= 0.1 && value <= 24) {
                    setHoras(value)
                  }
                }}
                min="0.1"
                max="24"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cantidad</label>
              <input 
                className="input" 
                type="number" 
                value={count} 
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (!isNaN(value) && value >= 1 && value <= 50) {
                    setCount(value)
                  }
                }}
                min="1"
                max="50"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                className="btn w-full" 
                onClick={addEntry}
                disabled={!potencia || !horas || !count}
              >
                Agregar
              </button>
            </div>
          </div>
        </section>

        {/* Appliances list and ranking */}
        <section className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              Listado de Consumo ({entries.length} elementos)
            </h3>
            {entries.length > 0 && (
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button 
                  className="btn text-sm px-4 py-2" 
                  onClick={onSaveScenario}
                  disabled={savingScenario}
                >
                  {savingScenario ? 'Guardando...' : 'Guardar Escenario'}
                </button>
              </div>
            )}
          </div>
          
          {entries.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <p className="text-lg mb-2">No hay electrodomésticos registrados</p>
              <p className="text-sm">Agregue electrodomésticos para comenzar el análisis</p>
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-white/70">
                      <th className="text-left p-3">Aparato</th>
                      <th className="text-center p-3">Consumo</th>
                      <th className="text-right p-3">Potencia (W)</th>
                      <th className="text-right p-3">Horas/día</th>
                      <th className="text-right p-3">Cant.</th>
                      <th className="text-right p-3">kWh/mes</th>
                      <th className="text-right p-3">Costo/mes</th>
                      <th className="text-center p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranked.map((e) => {
                      const kwh = calculateMonthlyKwh(e.watts, e.hoursPerDay, e.quantity)
                      const cost = calculateCostCLP(kwh, costKwh)
                      return (
                        <tr key={e.index} className="border-t border-white/10 hover:bg-white/5">
                          <td className="p-3 font-medium">{e.name}</td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-medium ${severityColor(kwh)}`}>
                              {getSeverityIndicator(kwh)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <input 
                              className="input w-20 text-right text-xs" 
                              type="number" 
                              value={e.watts} 
                              onChange={(ev) => {
                                const value = parseFloat(ev.target.value)
                                if (!isNaN(value) && value > 0) {
                                  updateEntry(e.index, { watts: value })
                                }
                              }} 
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input 
                              className="input w-16 text-right text-xs" 
                              type="number" 
                              value={e.hoursPerDay} 
                              onChange={(ev) => {
                                const value = parseFloat(ev.target.value)
                                if (!isNaN(value) && value >= 0.1 && value <= 24) {
                                  updateEntry(e.index, { hoursPerDay: value })
                                }
                              }} 
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input 
                              className="input w-14 text-right text-xs" 
                              type="number" 
                              value={e.quantity} 
                              onChange={(ev) => {
                                const value = parseInt(ev.target.value)
                                if (!isNaN(value) && value >= 1) {
                                  updateEntry(e.index, { quantity: value })
                                }
                              }} 
                            />
                          </td>
                          <td className={`p-3 text-right font-medium ${severityColor(kwh)}`}>
                            {formatNumber(kwh)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrencyCLP(cost)}
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              className="text-danger hover:underline text-sm"
                              onClick={() => removeEntry(e.index)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile/tablet card view */}
              <div className="lg:hidden space-y-4">
                {ranked.map((e) => {
                  const kwh = calculateMonthlyKwh(e.watts, e.hoursPerDay, e.quantity)
                  const cost = calculateCostCLP(kwh, costKwh)
                  return (
                    <div key={e.index} className="card bg-white/3 border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{e.name}</h4>
                          <p className="text-xs text-white/60">
                            {formatNumber(kwh)} kWh/mes · {formatCurrencyCLP(cost)}
                          </p>
                          <span className={`text-xs font-medium ${severityColor(kwh)}`}>
                            Consumo: {getSeverityIndicator(kwh)}
                          </span>
                        </div>
                        <button 
                          className="text-danger hover:underline text-sm"
                          onClick={() => removeEntry(e.index)}
                        >
                          Eliminar
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Potencia (W)</label>
                          <input 
                            className="input text-xs" 
                            type="number" 
                            value={e.watts} 
                            onChange={(ev) => {
                              const value = parseFloat(ev.target.value)
                              if (!isNaN(value) && value > 0) {
                                updateEntry(e.index, { watts: value })
                              }
                            }} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Horas/día</label>
                          <input 
                            className="input text-xs" 
                            type="number" 
                            value={e.hoursPerDay} 
                            onChange={(ev) => {
                              const value = parseFloat(ev.target.value)
                              if (!isNaN(value) && value >= 0.1 && value <= 24) {
                                updateEntry(e.index, { hoursPerDay: value })
                              }
                            }} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Cantidad</label>
                          <input 
                            className="input text-xs" 
                            type="number" 
                            value={e.quantity} 
                            onChange={(ev) => {
                              const value = parseInt(ev.target.value)
                              if (!isNaN(value) && value >= 1) {
                                updateEntry(e.index, { quantity: value })
                              }
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>

        {/* Summary cards and Chart */}
        <section className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Mi Consumo Energético</h2>
              <p className="text-white/60 text-sm">Análisis personalizado para Chile</p>
            </div>
            {profile && CLIMATE_ZONES[profile.region as keyof typeof CLIMATE_ZONES] && (
              <div className="text-right">
                <div className="text-sm text-green-400 bg-green-900/20 px-3 py-1 rounded-full">
                  Zona {CLIMATE_ZONES[profile.region as keyof typeof CLIMATE_ZONES].zone}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {CLIMATE_ZONES[profile.region as keyof typeof CLIMATE_ZONES].type}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{formatNumber(total.kwh)}</div>
                <div className="text-sm text-white/60 mb-2">kWh/mes</div>
                <div className="text-xs text-white/40">
                  Promedio Chile: 180 kWh/mes
                </div>
                <div className={`text-xs mt-1 ${total.kwh > 180 ? 'text-red-400' : 'text-green-400'}`}>
                  {total.kwh > 180 ? 
                    `+${Math.round(((total.kwh / 180) - 1) * 100)}% sobre promedio` : 
                    `-${Math.round((1 - (total.kwh / 180)) * 100)}% bajo promedio`
                  }
                </div>
              </div>
            </div>
            
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{formatCurrencyCLP(total.cost)}</div>
                <div className="text-sm text-white/60 mb-2">CLP/mes</div>
                {profile && (
                  <>
                    <div className="text-xs text-white/40">
                      Tarifa: ${ELECTRICITY_RATES[profile.region as keyof typeof ELECTRICITY_RATES]} CLP/kWh
                    </div>
                    <div className="text-xs text-blue-400 mt-1">
                      Región {profile.region}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-1">{formatNumber(total.co2)}</div>
                <div className="text-sm text-white/60 mb-2">kg CO₂/mes</div>
                <div className="text-xs text-white/40">
                  Factor SEN: 0.31 kg/kWh
                </div>
                <div className="text-xs text-green-400 mt-1">
                  Equivale a {Math.round(total.co2 / 21)} días de respiración
                </div>
              </div>
            </div>
          </div>

          {/* Barra de comparación con consumo promedio chileno */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/70">Comparación con promedio nacional</span>
              <span className="text-sm text-blue-400">{Math.round((total.kwh / 180) * 100)}%</span>
            </div>
            <div className="bg-gray-600 rounded-full h-3 overflow-hidden">
              <div className="flex h-full">
                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min((total.kwh / 180) * 100, 100)}%` }}></div>
                {total.kwh > 180 && (
                  <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${Math.min(((total.kwh - 180) / 180) * 100, 100)}%` }}></div>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-2">
              <span>0 kWh</span>
              <span>180 kWh (promedio)</span>
              <span>{total.kwh > 360 ? `${Math.round(total.kwh)} kWh` : '360+ kWh'}</span>
            </div>
          </div>

          {/* Proyección anual */}
          {profile && CLIMATE_ZONES[profile.region as keyof typeof CLIMATE_ZONES] && (
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
              <h4 className="text-white font-medium mb-3">Proyección Anual Estimada</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-purple-400">
                    {formatNumber(total.kwh * 12)}
                  </div>
                  <div className="text-xs text-white/60">kWh/año</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-400">
                    {formatCurrencyCLP(total.cost * 12)}
                  </div>
                  <div className="text-xs text-white/60">CLP/año</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-400">
                    {formatNumber(total.co2 * 12)}
                  </div>
                  <div className="text-xs text-white/60">kg CO₂/año</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {Math.round(total.co2 * 12 / 11.5)}
                  </div>
                  <div className="text-xs text-white/60">árboles necesarios</div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Consumption Chart */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConsumptionChart 
            data={ranked.map(e => ({
              name: e.name,
              kwh: e.kwh,
              cost: e.cost
            }))}
            title="Top 5 Consumidores de Energía"
          />
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Análisis de Consumo</h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/70 mb-1">Consumo diario promedio</div>
                <div className="text-xl font-semibold">{formatNumber(total.kwh / 30)} kWh</div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/70 mb-1">Mayor consumidor</div>
                {ranked.length > 0 && (
                  <>
                    <div className="text-lg font-semibold">{ranked[0].name}</div>
                    <div className="text-xs text-white/60">
                      {formatNumber(ranked[0].kwh)} kWh/mes ({((ranked[0].kwh / total.kwh) * 100).toFixed(1)}% del total)
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/70 mb-1">Potencial de ahorro</div>
                <div className="text-lg font-semibold text-success">
                  {formatCurrencyCLP(total.cost * 0.2)}/mes
                </div>
                <div className="text-xs text-white/60">
                  Implementando medidas de eficiencia energética
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white/70 mb-1">Clasificación de consumo</div>
                <div className={`text-lg font-semibold ${
                  total.kwh < 200 ? 'text-success' : 
                  total.kwh < 400 ? 'text-warning' : 
                  'text-danger'
                }`}>
                  {total.kwh < 200 ? 'Eficiente' : 
                   total.kwh < 400 ? 'Moderado' : 
                   'Alto'}
                </div>
                <div className="text-xs text-white/60">
                  Basado en promedio residencial
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional info cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h4 className="font-semibold mb-2">
              Datos Regionales
            </h4>
            <div className="text-sm text-white/80">
              <p>Tarifa: {formatCurrencyCLP(costKwh)}/kWh</p>
              <p>Factor CO₂: {formatNumber(cf)} kg/kWh</p>
            </div>
          </div>
          
          <div className="card">
            <h4 className="font-semibold mb-2">
              Promedio Regional
            </h4>
            <div className="text-sm text-white/80">
              {regionAvg ? (
                <>
                  <p>{formatNumber(regionAvg.avgKwh)} kWh/mes</p>
                  <p className="text-xs text-white/60">
                    Basado en {regionAvg.count} usuarios
                  </p>
                </>
              ) : (
                <p className="text-white/60">No disponible</p>
              )}
            </div>
          </div>
          
          <div className="card">
            <h4 className="font-semibold mb-2">
              Comparación
            </h4>
            <div className="text-sm text-white/80">
              {regionAvg && total.kwh > 0 ? (
                <>
                  <p className={total.kwh > regionAvg.avgKwh ? 'text-warning' : 'text-success'}>
                    {total.kwh > regionAvg.avgKwh ? 'Sobre' : 'Bajo'} el promedio
                  </p>
                  <p className="text-xs text-white/60">
                    {Math.abs(((total.kwh - regionAvg.avgKwh) / regionAvg.avgKwh * 100)).toFixed(1)}% diferencia
                  </p>
                </>
              ) : (
                <p className="text-white/60">Sin datos para comparar</p>
              )}
            </div>
          </div>
        </section>

        {/* Comparator section */}
        <section className="card">
          <h3 className="text-xl font-semibold mb-4">
            Comparador de Eficiencia Energética
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Opción A</label>
              <select 
                className="input" 
                value={compareA} 
                onChange={(e) => setCompareA(e.target.value)}
              >
                {COMMON_APPLIANCES.map((a, index) => (
                  <option key={index} value={index}>{a.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Opción B</label>
              <select 
                className="input" 
                value={compareB} 
                onChange={(e) => setCompareB(e.target.value)}
              >
                {COMMON_APPLIANCES.map((a, index) => (
                  <option key={index} value={index}>{a.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Horas/día</label>
              <input 
                className="input" 
                type="number" 
                value={compareHours} 
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value) && value >= 0.1 && value <= 24) {
                    setCompareHours(value)
                  }
                }}
                min="0.1"
                max="24"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Diferencia precio (CLP)</label>
              <input 
                className="input" 
                type="number" 
                value={priceDelta} 
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value) && value >= 0) {
                    setPriceDelta(value)
                  }
                }}
                min="0"
                step="1000"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-white/3 border-white/5">
              <div className="mb-3">
                <span className="text-xs text-danger font-medium">OPCIÓN A</span>
                <h4 className="font-semibold mt-1">{compareDef(compareA).name}</h4>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <p>Potencia: <span className="font-medium">{formatNumber(compareDef(compareA).watts)} W</span></p>
                <p>Consumo: <span className="font-medium">{formatNumber(compareMonthlyKwh(compareA, compareHours))} kWh/mes</span></p>
                <p>Costo: <span className="font-medium text-warning">{formatCurrencyCLP(calculateCostCLP(compareMonthlyKwh(compareA, compareHours), costKwh))}/mes</span></p>
              </div>
            </div>
            
            <div className="card bg-white/3 border-white/5">
              <div className="mb-3">
                <span className="text-xs text-success font-medium">OPCIÓN B</span>
                <h4 className="font-semibold mt-1">{compareDef(compareB).name}</h4>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <p>Potencia: <span className="font-medium">{formatNumber(compareDef(compareB).watts)} W</span></p>
                <p>Consumo: <span className="font-medium">{formatNumber(compareMonthlyKwh(compareB, compareHours))} kWh/mes</span></p>
                <p>Costo: <span className="font-medium text-success">{formatCurrencyCLP(calculateCostCLP(compareMonthlyKwh(compareB, compareHours), costKwh))}/mes</span></p>
              </div>
            </div>
            
            <div className="card bg-gradient-to-r from-brand/10 to-success/10 border-brand/30">
              <div className="mb-3">
                <h4 className="font-semibold">Análisis de Retorno de Inversión</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-white/80">
                  Inversión extra: <span className="font-medium">{formatCurrencyCLP(priceDelta)}</span>
                </p>
                <p className="text-white/80">
                  Ahorro mensual: <span className="font-medium text-success">
                    {formatCurrencyCLP(calculateCostCLP(compareMonthlyKwh(compareA, compareHours) - compareMonthlyKwh(compareB, compareHours), costKwh))}
                  </span>
                </p>
                <div className="pt-2 border-t border-white/10">
                  <p className="font-medium">
                    Tiempo de recuperación: {
                      (() => {
                        const months = investmentRecoveryMonths(priceDelta, compareA, compareB, compareHours)
                        return Number.isFinite(months) ? (
                          <span className={months <= 12 ? 'text-success' : months <= 24 ? 'text-warning' : 'text-danger'}>
                            {formatNumber(months)} meses
                          </span>
                        ) : (
                          <span className="text-white/60">No aplica</span>
                        )
                      })()
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* History section */}
        <section className="card">
          <h3 className="text-xl font-semibold mb-4">
            Historial de Escenarios ({history.length})
          </h3>
          
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="loading text-lg mb-2">Cargando...</div>
              <p className="text-white/70 text-sm">Cargando historial...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <p className="text-lg mb-2">No hay escenarios guardados</p>
              <p className="text-sm">Guarde un escenario para comenzar el historial</p>
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-white/70">
                      <th className="text-left p-3">Escenario</th>
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-right p-3">Consumo</th>
                      <th className="text-right p-3">Costo mensual</th>
                      <th className="text-center p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-3">
                          <div className="font-medium">{h.name}</div>
                          <div className="text-xs text-white/60">
                            {h.entries.length} aparatos
                          </div>
                        </td>
                        <td className="p-3 text-white/80">
                          {new Date(h.createdAt).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-medium">{formatNumber(h.totals.kwh)} kWh/mes</div>
                          <div className="text-xs text-white/60">
                            {formatNumber(h.totals.co2)} kg CO₂
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium text-warning">
                          {formatCurrencyCLP(h.totals.cost)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="btn-secondary text-xs px-3 py-1 hover:bg-brand hover:text-white" 
                              onClick={() => loadScenario(h)}
                              title="Cargar escenario"
                            >
                              Cargar
                            </button>
                            <button 
                              className="text-danger hover:underline text-xs" 
                              onClick={() => deleteScenario(h.id!, h.name)}
                              title="Eliminar escenario"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="md:hidden space-y-4">
                {history.map((h) => (
                  <div key={h.id} className="card bg-white/3 border-white/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{h.name}</h4>
                        <p className="text-xs text-white/60">
                          {new Date(h.createdAt).toLocaleDateString('es-CL')} • {h.entries.length} aparatos
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="btn-secondary text-xs px-2 py-1" 
                          onClick={() => loadScenario(h)}
                        >
                          Cargar
                        </button>
                        <button 
                          className="text-danger hover:underline text-xs" 
                          onClick={() => deleteScenario(h.id!, h.name)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/60 text-xs">Consumo mensual</p>
                        <p className="font-medium">{formatNumber(h.totals.kwh)} kWh</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Costo mensual</p>
                        <p className="font-medium text-warning">{formatCurrencyCLP(h.totals.cost)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Savings Calculator */}
        {entries.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SavingsCalculator 
              currentMonthlyKwh={total.kwh}
              costPerKwh={costKwh}
            />
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Tips de Ahorro Rápido</h3>
              <div className="space-y-3">
                {[
                  { title: 'Horario Valle', desc: 'Use electrodomésticos de alto consumo en horarios de menor tarifa', saving: '15%' },
                  { title: 'Temperatura Óptima', desc: 'Configure el aire acondicionado en 24°C en verano', saving: '10%' },
                  { title: 'Mantenimiento', desc: 'Limpie filtros de aire acondicionado mensualmente', saving: '5%' },
                  { title: 'Aislamiento', desc: 'Selle puertas y ventanas para evitar fugas térmicas', saving: '20%' },
                  { title: 'Electrodomésticos', desc: 'Prefiera modelos con certificación A++ o superior', saving: '30%' },
                ].map((tip, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                        <p className="text-xs text-white/70">{tip.desc}</p>
                      </div>
                      <span className="text-xs font-medium text-success ml-3">
                        -{tip.saving}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recommendations section */}
        <section className="card">
          <h3 className="text-xl font-semibold mb-4">
            Recomendaciones de Ahorro Energético
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Iluminación Eficiente',
                tip: 'Reemplace ampolletas incandescentes por LED',
                saving: 'Ahorro estimado: hasta 80% en iluminación',
                color: 'text-success'
              },
              {
                title: 'Modo Standby',
                tip: 'Desconecte aparatos o use regletas con interruptor',
                saving: 'Ahorro estimado: 5-10% del consumo total',
                color: 'text-warning'
              },
              {
                title: 'Refrigeración Óptima',
                tip: 'Ajuste termostato: refrigerador 4°C, freezer -18°C',
                saving: 'Ahorro estimado: hasta 15% en refrigeración',
                color: 'text-brand'
              },
              {
                title: 'Uso Eficiente del Agua Caliente',
                tip: 'Hierva solo el agua necesaria y use hervidor eficiente',
                saving: 'Ahorro estimado: 30-50% en calentamiento',
                color: 'text-success'
              },
              {
                title: 'Programación Horaria',
                tip: 'Use temporizadores para optimizar horas de uso',
                saving: 'Ahorro variable según tarifa horaria',
                color: 'text-warning'
              },
              {
                title: 'Aislamiento Térmico',
                tip: 'Mejore ventanas y puertas para reducir pérdidas',
                saving: 'Ahorro estimado: hasta 30% en climatización',
                color: 'text-brand'
              }
            ].map((rec, index) => (
              <div key={index} className="card bg-white/3 border-white/5 hover:bg-white/5 transition-colors">
                <div>
                  <h4 className="font-semibold mb-2">{rec.title}</h4>
                  <p className="text-sm text-white/80 mb-3">{rec.tip}</p>
                  <p className={`text-xs font-medium ${rec.color}`}>
                    {rec.saving}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-success/10 to-brand/10 border border-success/20">
            <h4 className="font-semibold text-success mb-2">Impacto Ambiental</h4>
            <p className="text-sm text-white/90">
              Cada kWh ahorrado evita aproximadamente <span className="font-medium">{formatNumber(cf)} kg de CO₂</span> en su región. 
              Los pequeños cambios contribuyen significativamente a la reducción de emisiones.
            </p>
          </div>
        </section>

        {/* Consejos de Eficiencia Energética */}
        <section className="card">
          <h3 className="text-xl font-semibold mb-4">
            Consejos de Eficiencia Energética
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENERGY_SAVING_TIPS.map((section) => (
              <div key={section.category} className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <span className="mr-2">
                    {section.category === 'Vivienda' && '🏠'}
                    {section.category === 'Cocina' && '🍳'}
                    {section.category === 'Baño' && '🚿'}
                    {section.category === 'Iluminación' && '💡'}
                    {section.category === 'Electrodomésticos' && '📱'}
                    {section.category === 'Transporte' && '🚗'}
                  </span>
                  {section.category}
                </h3>
                <ul className="space-y-2">
                  {section.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-white/80 leading-snug flex items-start">
                      <span className="mr-2 text-green-400 flex-shrink-0 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Programas Gubernamentales */}
        <section className="card">
          <h3 className="text-xl font-semibold mb-4">
            Programas de Apoyo del Gobierno
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOVERNMENT_PROGRAMS.map((program) => (
              <div key={program.name} className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-500/20">
                <h3 className="font-semibold text-white mb-2">{program.name}</h3>
                <p className="text-sm text-white/70 mb-3">{program.description}</p>
                <div className="flex flex-col space-y-2">
                  <span className="text-xs text-blue-400">{program.institution}</span>
                  <a 
                    href={program.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-green-400 hover:text-green-300 underline"
                  >
                    Más información →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Información sobre Etiquetas de Eficiencia */}
        <section className="card">
          <h3 className="text-xl font-semibold mb-4">
            Etiquetas de Eficiencia Energética
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_APPLIANCES.map((app, index) => (
                  <span 
                    key={index} 
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      index < 3 ? 'bg-green-600 text-white' :
                      index < 5 ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}
                  >
                    {app.name}
                  </span>
                ))}
              </div>
              <p className="text-sm text-white/70">
                Basado en los electrodomésticos más comunes en tu región.
              </p>
            </div>
            <div className="text-right">
              <a 
                href="https://www.energysavingtips.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
              >
                Más consejos de ahorro →
              </a>
            </div>
          </div>
        </section>

        {/* Información Específica por Región */}
        {profile && REGIONAL_CONTEXT[profile.region as keyof typeof REGIONAL_CONTEXT] && (
          <section className="card">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Información para {REGIONS[profile.region as keyof typeof REGIONS].name}
            </h2>
            
            {/* Contexto Regional */}
            <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-6 mb-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Contexto Energético Regional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Clima</h4>
                  <p className="text-sm text-white/80 mb-3">
                    {REGIONAL_CONTEXT[profile.region as keyof typeof REGIONAL_CONTEXT].climate}
                  </p>
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Perfil Energético</h4>
                  <p className="text-sm text-white/80">
                    {REGIONAL_CONTEXT[profile.region as keyof typeof REGIONAL_CONTEXT].energyProfile}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Desafíos Principales</h4>
                  <ul className="text-sm text-white/80 mb-3">
                    {REGIONAL_CONTEXT[profile.region as keyof typeof REGIONAL_CONTEXT].mainChallenges.map((challenge, index) => (
                      <li key={index} className="flex items-center mb-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 flex-shrink-0"></span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Contexto Económico</h4>
                  <p className="text-sm text-white/80">
                    {REGIONAL_CONTEXT[profile.region as keyof typeof REGIONAL_CONTEXT].economicContext}
                  </p>
                </div>
              </div>
            </div>

            {/* Recomendaciones Estacionales */}
            {SEASONAL_RECOMMENDATIONS[profile.region as keyof typeof SEASONAL_RECOMMENDATIONS] && (
              <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-lg p-6 mb-6 border border-green-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Recomendaciones Estacionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-orange-900/10 rounded-lg p-4 border border-orange-500/20">
                    <h4 className="text-sm font-medium text-orange-300 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Verano
                    </h4>
                    <ul className="text-sm text-white/80">
                      {SEASONAL_RECOMMENDATIONS[profile.region as keyof typeof SEASONAL_RECOMMENDATIONS].verano.map((rec, index) => (
                        <li key={index} className="flex items-start mb-2">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-900/10 rounded-lg p-4 border border-blue-500/20">
                    <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      </svg>
                      Invierno
                    </h4>
                    <ul className="text-sm text-white/80">
                      {SEASONAL_RECOMMENDATIONS[profile.region as keyof typeof SEASONAL_RECOMMENDATIONS].invierno.map((rec, index) => (
                        <li key={index} className="flex items-start mb-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-purple-900/10 rounded-lg p-4 border border-purple-500/20">
                  <h4 className="text-sm font-medium text-purple-300 mb-3">Consejos Específicos para tu Región</h4>
                  <ul className="text-sm text-white/80">
                    {SEASONAL_RECOMMENDATIONS[profile.region as keyof typeof SEASONAL_RECOMMENDATIONS].tips.map((tip, index) => (
                      <li key={index} className="flex items-start mb-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Programas Específicos por Región */}
            {REGIONAL_PROGRAMS[profile.region as keyof typeof REGIONAL_PROGRAMS] && (
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 mb-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Programas Disponibles en tu Región</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REGIONAL_PROGRAMS[profile.region as keyof typeof REGIONAL_PROGRAMS].map((program, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-white/90 font-medium">{program}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-300">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Para más información sobre estos programas, contacta al Ministerio de Energía o la Agencia de Sostenibilidad Energética.
                  </p>
                </div>
              </div>
            )}

            {/* Patrones de Consumo Regional */}
            {REGIONAL_CONSUMPTION_PATTERNS[profile.region as keyof typeof REGIONAL_CONSUMPTION_PATTERNS] && (
              <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 rounded-lg p-6 border border-teal-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Patrones de Consumo en tu Región</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-teal-300 mb-2">Consumo Promedio</h4>
                    <p className="text-2xl font-bold text-white mb-1">
                      {REGIONAL_CONSUMPTION_PATTERNS[profile.region as keyof typeof REGIONAL_CONSUMPTION_PATTERNS].averageMonthly}
                    </p>
                    <p className="text-xs text-white/60">kWh/mes</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-teal-300 mb-2">Temporada Pico</h4>
                    <p className="text-lg font-semibold text-white capitalize">
                      {REGIONAL_CONSUMPTION_PATTERNS[profile.region as keyof typeof REGIONAL_CONSUMPTION_PATTERNS].peakSeason}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-teal-300 mb-2">Meses Críticos</h4>
                    <p className="text-sm text-white/80">
                      {REGIONAL_CONSUMPTION_PATTERNS[profile.region as keyof typeof REGIONAL_CONSUMPTION_PATTERNS].challengeMonths.join(', ')}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-teal-300 mb-2">Hora Pico</h4>
                    <p className="text-sm text-white/80">
                      {REGIONAL_CONSUMPTION_PATTERNS[profile.region as keyof typeof REGIONAL_CONSUMPTION_PATTERNS].tipicalHour}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-teal-300 mb-3">Principales Usos de Energía</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {REGIONAL_CONSUMPTION_PATTERNS[profile.region as keyof typeof REGIONAL_CONSUMPTION_PATTERNS].mainUses.map((use, index) => (
                      <div key={index} className="flex items-center bg-white/3 rounded-lg p-3">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          index === 0 ? 'bg-red-400' : 
                          index === 1 ? 'bg-orange-400' : 
                          index === 2 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <p className="text-sm text-white/80">{use}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  )
} 