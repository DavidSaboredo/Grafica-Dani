'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Algo salió mal!</h2>
        <p className="text-gray-600 mb-6">
          Ocurrió un error inesperado. Por favor, intentá de nuevo.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="btn-primary w-full"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="btn-secondary w-full inline-block"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}