import '../styles/globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Mi Energía en Casa - Calculadora de Consumo Energético Chile',
  description: 'Calcula, analiza y optimiza el consumo energético de tu hogar en Chile. Herramienta gratuita con datos reales de costos por región.',
  keywords: 'energía, consumo eléctrico, Chile, calculadora, ahorro energético, electrodomésticos',
  authors: [{ name: 'Mi Energía en Casa' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Mi Energía en Casa - Calculadora de Consumo Energético',
    description: 'Optimiza el consumo energético de tu hogar con datos reales de Chile',
    type: 'website',
    locale: 'es_CL',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen">
        <div className="container">
          <header className="py-6 lg:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-brand to-success flex items-center justify-center">
                  <span className="text-white text-lg lg:text-xl">⚡</span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold gradient-text">
                    Mi Energía en Casa
                  </h1>
                  <p className="text-xs lg:text-sm text-white/60">
                    Optimiza tu consumo energético
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <span>🇨🇱</span>
                  <span>Chile</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🌱</span>
                  <span>Eco-friendly</span>
                </div>
              </div>
            </div>
          </header>
          
          <main className="pb-8">
            {children}
          </main>
          
          <footer className="border-t border-white/10 py-8 mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>⚡</span>
                  Mi Energía en Casa
                </h3>
                <p className="text-white/70 text-xs leading-relaxed">
                  Herramienta gratuita para calcular y optimizar el consumo energético 
                  de tu hogar usando datos reales de Chile.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-white/90">Características</h4>
                <ul className="space-y-1 text-white/70 text-xs">
                  <li>• Cálculos precisos por región</li>
                  <li>• Comparador de eficiencia</li>
                  <li>• Análisis de ROI</li>
                  <li>• Recomendaciones personalizadas</li>
                  <li>• Historial de escenarios</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-white/90">Datos</h4>
                <ul className="space-y-1 text-white/70 text-xs">
                  <li>• Costos energéticos actualizados</li>
                  <li>• Factores de emisión CO₂</li>
                  <li>• Información por región</li>
                  <li>• Privacidad garantizada</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-8 pt-6 text-center">
              <p className="text-white/50 text-xs">
                © {new Date().getFullYear()} Mi Energía en Casa. 
                Desarrollado con 💚 para un futuro más sostenible.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 