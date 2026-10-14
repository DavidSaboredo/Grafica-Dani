'use client'

import { useState, useTransition } from 'react'
import { cambiarVisible } from '../acciones'

// Interruptor visible/oculto: cambia al toque y vuelve atrás si falla
export default function InterruptorVisible({ id, visible, nombre }: { id: string; visible: boolean; nombre: string }) {
  const [activo, setActivo] = useState(visible)
  const [error, setError] = useState('')
  const [pendiente, startTransition] = useTransition()

  const alternar = () => {
    const nuevo = !activo
    setActivo(nuevo)
    setError('')
    startTransition(async () => {
      const resultado = await cambiarVisible(id, nuevo)
      if (resultado?.error) {
        setActivo(!nuevo)
        setError(resultado.error)
      }
    })
  }

  return (
    <div className="admin-switch-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={`${nombre}: ${activo ? 'visible en la tienda' : 'oculto'}`}
        onClick={alternar}
        disabled={pendiente}
        className={`admin-switch ${activo ? 'is-on' : ''}`}
      >
        <span className="admin-switch-track" aria-hidden="true">
          <span className="admin-switch-thumb" />
        </span>
        <span className="admin-switch-text">{activo ? 'Visible' : 'Oculto'}</span>
      </button>
      {error && <span className="admin-error-mini" role="alert">{error}</span>}
    </div>
  )
}
