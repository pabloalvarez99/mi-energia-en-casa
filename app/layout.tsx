import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Energía en Casa',
  description: 'Calcula y entiende la energía usada en tu hogar en Chile',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="container py-8">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold">Mi Energía en Casa</h1>
          </header>
          {children}
          <footer className="mt-12 text-center text-white/60 text-sm">© {new Date().getFullYear()} Mi Energía en Casa</footer>
        </div>
      </body>
    </html>
  )
} 