'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { validateRut, normalizeRut, formatRut } from '@/lib/rut'
import { REGIONS } from '@/lib/constants'
import { getFirebase, upsertUserByRut } from '@/lib/firebase'

export default function HomePage() {
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [region, setRegion] = useState('RM')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const normalized = normalizeRut(rut)
    if (!validateRut(normalized)) {
      setError('RUT inválido. Ejemplo: 12.345.678-5')
      setLoading(false)
      return
    }

    const profile = { rut: normalized, region }
    localStorage.setItem('mec_profile', JSON.stringify(profile))

    try {
      const fb = await getFirebase()
      if (fb) {
        try {
          await upsertUserByRut(fb, normalized, region)
        } catch (syncErr) {
          console.warn('No se pudo sincronizar con Firebase (se continuará en modo local):', syncErr)
        }
      }
      router.push('/dashboard')
    } catch (e) {
      console.error(e)
      setError('No se pudo crear/iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid md:grid-cols-2 gap-6 items-start">
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Ingresa o crea tu cuenta con RUT</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">RUT</label>
            <input
              className="input"
              placeholder="12.345.678-5"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              inputMode="text"
              required
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
          <button type="submit" className="btn w-full" disabled={loading}>{loading ? 'Ingresando…' : 'Entrar'}</button>
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
        <p className="text-white/70 mt-3 text-sm">Tus cálculos se guardan en tu navegador. Si hay Firebase configurado, tu cuenta por RUT se crea y tus escenarios se sincronizan.</p>
      </section>
    </main>
  )
} 