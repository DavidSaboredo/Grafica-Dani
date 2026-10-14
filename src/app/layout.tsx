import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'D-Print Digital - Soluciones de Impresión Profesional',
  description: 'Catálogo de productos de impresión digital - D-Print Digital',
  metadataBase: new URL('https://grafica-dani.vercel.app'),
  openGraph: {
    title: 'D-Print Digital - Soluciones de Impresión Profesional',
    description: 'Tarjetas, flyers, banners y más. Armá tu pedido online y confirmalo por WhatsApp.',
    url: '/',
    siteName: 'D-Print Digital',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Header optimizado */}
        <header className="header-optimized">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo profesional */}
              <div className="logo-container">
                <h1 className="logo-professional">
                  D-Print Digital
                </h1>
                <p className="logo-tagline">Soluciones de Impresión</p>
              </div>
              
              {/* Navegación profesional */}
              <Navigation />
            </div>
          </div>
        </header>
        
        <main className="main-content">
          {children}
        </main>
        
        {/* Footer profesional */}
        <footer className="footer-professional">
          <div className="container mx-auto px-6 py-8 text-center">
            <p className="text-gradient font-semibold">© {new Date().getFullYear()} D-Print Digital · Diseñado y desarrollado por David Saboredo</p>
          </div>
        </footer>
      </body>
    </html>
  )
}