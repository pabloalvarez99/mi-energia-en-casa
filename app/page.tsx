'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { validateRut, normalizeRut, formatRut } from '@/lib/rut'
import { REGIONS } from '@/lib/constants'

export default function HomePage() {
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [region, setRegion] = useState('RM')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mec_profile') : null
    if (saved) {
      const data = JSON.parse(saved)
      if (data?.rut && data?.region) {
        setRut(formatRut(data.rut))
        setRegion(data.region)
      }
    }
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const normalized = normalizeRut(rut)
    if (!validateRut(normalized)) {
      setError('RUT inválido. Ejemplo: 12.345.678-5')
      return
    }
    const profile = { rut: normalized, region }
    localStorage.setItem('mec_profile', JSON.stringify(profile))
    router.push('/dashboard')
  }

  return (
    <main className="grid md:grid-cols-2 gap-6 items-start">
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Ingresa con tu RUT y región</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">RUT</label>
            <input
              className="input"
              placeholder="12.345.678-5"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              inputMode="text"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Región</label>
            <select
              className="input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {Object.entries(REGIONS).map(([code, r]) => (
                <option key={code} value={code}>{r.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" className="btn w-full">Entrar</button>
        </form>
      </section>
      <section className="card">
        <h3 className="text-lg font-semibold mb-2">¿Qué puedes hacer aquí?</h3>
        <ul className="list-disc pl-5 space-y-1 text-white/90">
          <li>Calcular consumo y costo estimado de tus electrodomésticos</li>
          <li>Ver ranking de aparatos más costosos (semáforo)</li>
          <li>Recibir recomendaciones personalizadas de ahorro</li>
          <li>Comparar eficiencia y retorno de inversión</li>
        </ul>
        <p className="text-white/70 mt-3 text-sm">Tus datos se guardan localmente. Si configuras Firebase, también se pueden sincronizar.</p>
      </section>
    </main>
  )
} 