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
  const [isFormValid, setIsFormValid] = useState(false)

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

  // Real-time form validation
  useEffect(() => {
    const normalized = normalizeRut(rut)
    setIsFormValid(rut.length > 0 && validateRut(normalized))
    if (error && rut.length > 8 && validateRut(normalized)) {
      setError(null)
    }
  }, [rut, error])

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRut(value)
    
    // Clear error when user starts typing after an error
    if (error && value.length > 0) {
      setError(null)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const normalized = normalizeRut(rut)
    if (!validateRut(normalized)) {
      setError('RUT inválido. Formato esperado: 12.345.678-5')
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
    <div className="min-h-screen flex items-center justify-center py-12">
      <main className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Mi Energía</span>
            <br />
            <span className="text-white">en Casa</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Calcula y optimiza el consumo energético de tu hogar en Chile
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Login Form */}
          <section className="card fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Acceso al Sistema</h2>
              <p className="text-white/60">Ingrese su información para continuar</p>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  RUT <span className="text-danger">*</span>
                </label>
                <input
                  className={`input ${error ? 'border-danger focus:ring-danger' : isFormValid ? 'border-success focus:ring-success' : ''}`}
                  placeholder="Ej: 12.345.678-5"
                  value={rut}
                  onChange={handleRutChange}
                  inputMode="text"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? 'rut-error' : undefined}
                />
                {error && (
                  <p id="rut-error" className="text-danger text-sm flex items-center gap-2" role="alert">
                    <span>⚠️</span>
                    {error}
                  </p>
                )}
                {isFormValid && !error && (
                  <p className="text-success text-sm flex items-center gap-2">
                    <span>✓</span>
                    RUT válido
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Región <span className="text-danger">*</span>
                </label>
                <select
                  className="input"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                >
                  {Object.entries(REGIONS).map(([code, r]) => (
                    <option key={code} value={code}>{r.name}</option>
                  ))}
                </select>
                <p className="text-white/50 text-xs">
                  Seleccione su región para cálculos precisos de costos energéticos
                </p>
              </div>
              
              <button 
                type="submit" 
                className="btn w-full text-lg py-4" 
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="loading">⏳</span>
                    Procesando...
                  </span>
                ) : (
                  'Ingresar al Sistema'
                )}
              </button>
            </form>
          </section>

          {/* Features Section */}
          <section className="space-y-6">
            <div className="card fade-in">
              <h3 className="text-xl font-semibold mb-4">
                Funcionalidades Principales
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: '📊', text: 'Cálculo detallado de consumo y costos mensuales' },
                  { icon: '⚡', text: 'Análisis de eficiencia energética por electrodoméstico' },
                  { icon: '💰', text: 'Estimación de ahorro y retorno de inversión' },
                  { icon: '📈', text: 'Comparación con promedios regionales' },
                  { icon: '🌱', text: 'Medición de huella de carbono' },
                  { icon: '📁', text: 'Gestión de múltiples escenarios de consumo' }
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-xl flex-shrink-0">{feature.icon}</span>
                    <span className="text-white/90">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card fade-in">
              <h3 className="text-lg font-semibold mb-3">
                Información del Sistema
              </h3>
              <div className="space-y-3 text-sm text-white/70">
                <p className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  Datos actualizados de tarifas eléctricas 2024
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  Factores de emisión CO₂ por región
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  Base de datos con más de 50 electrodomésticos
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  Almacenamiento seguro de información
                </p>
              </div>
            </div>

            <div className="card fade-in bg-gradient-to-r from-brand/10 to-success/10 border-brand/30">
              <h3 className="text-lg font-semibold mb-2">
                Sistema Nacional de Eficiencia Energética
              </h3>
              <p className="text-white/80 text-sm">
                Plataforma oficial para el análisis y optimización del consumo energético residencial 
                en Chile, con datos específicos por región.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
} 