import '../styles/globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Mi Energía en Casa - Sistema Nacional de Eficiencia Energética',
  description: 'Plataforma oficial para el análisis y optimización del consumo energético residencial en Chile. Herramienta con datos actualizados de tarifas por región.',
  keywords: 'energía, consumo eléctrico, Chile, eficiencia energética, ahorro energético, electrodomésticos',
  authors: [{ name: 'Sistema Nacional de Eficiencia Energética' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Mi Energía en Casa - Sistema Nacional de Eficiencia Energética',
    description: 'Optimice el consumo energético de su hogar con datos oficiales de Chile',
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
          <header className="py-6 lg:py-8 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-brand to-success flex items-center justify-center">
                  <span className="text-white text-lg lg:text-xl font-bold">E</span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold">
                    Mi Energía en Casa
                  </h1>
                  <p className="text-xs lg:text-sm text-white/60">
                    Sistema Nacional de Eficiencia Energética
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-6 text-sm text-white/70">
                <div>
                  República de Chile
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
                <h3 className="font-semibold mb-3">
                  Acerca del Sistema
                </h3>
                <p className="text-white/70 text-xs leading-relaxed">
                  Plataforma oficial para el cálculo y optimización del consumo 
                  energético residencial, con datos actualizados de tarifas eléctricas 
                  y factores de emisión por región.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-white/90">Funcionalidades</h4>
                <ul className="space-y-1 text-white/70 text-xs">
                  <li>• Cálculo preciso de consumo energético</li>
                  <li>• Análisis de eficiencia por electrodoméstico</li>
                  <li>• Estimación de retorno de inversión</li>
                  <li>• Recomendaciones de ahorro personalizadas</li>
                  <li>• Gestión de escenarios de consumo</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-white/90">Información</h4>
                <ul className="space-y-1 text-white/70 text-xs">
                  <li>• Tarifas eléctricas actualizadas 2024</li>
                  <li>• Factores de emisión CO₂ por región</li>
                  <li>• Base de datos de electrodomésticos</li>
                  <li>• Almacenamiento seguro de datos</li>
                  <li>• Compatibilidad nacional</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-8 pt-6 text-center">
              <p className="text-white/50 text-xs">
                © {new Date().getFullYear()} Sistema Nacional de Eficiencia Energética - República de Chile
              </p>
              <p className="text-white/40 text-xs mt-1">
                Todos los derechos reservados
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 