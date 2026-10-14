'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PedidoError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error en pedido:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">📦❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error en el Pedido</h2>
        <p className="text-gray-600 mb-6">
          Hubo un problema al procesar tu pedido. Por favor, revisá tus datos e intentá de nuevo.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="btn-primary w-full"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/carrito"
            className="btn-secondary w-full inline-block"
          >
            Volver al carrito
          </Link>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm inline-block"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}