'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function CarritoError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error en carrito:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">🛒❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error en el Carrito</h2>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un problema al cargar tu carrito. Esto puede deberse a datos corruptos en el almacenamiento local.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              // Limpiar localStorage y reintentar
              localStorage.removeItem('carrito')
              localStorage.removeItem('cart')
              reset()
            }}
            className="btn-primary w-full"
          >
            Limpiar carrito y reintentar
          </button>
          <Link
            href="/"
            className="btn-secondary w-full inline-block"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}