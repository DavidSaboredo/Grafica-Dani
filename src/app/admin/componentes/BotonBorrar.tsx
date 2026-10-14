'use client'

import { useEffect, useState, useTransition } from 'react'
import { borrarProducto } from '../acciones'

// Borrar con confirmación en una ventanita (pensada para el celular)
export default function BotonBorrar({ id, nombre }: { id: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState('')
  const [pendiente, startTransition] = useTransition()

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && !pendiente && setAbierto(false)
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto, pendiente])

  const confirmar = () => {
    setError('')
    startTransition(async () => {
      const resultado = await borrarProducto(id)
      if (resultado?.error) {
        setError(resultado.error)
      } else {
        setAbierto(false)
      }
    })
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-peligro admin-btn-chico" onClick={() => setAbierto(true)}>
        Borrar
      </button>

      {abierto && (
        <div className="admin-modal-fondo" onClick={() => !pendiente && setAbierto(false)}>
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`borrar-${id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={`borrar-${id}`} className="admin-modal-titulo">¿Borrar este producto?</h2>
            <p className="admin-modal-texto">
              <strong>{nombre}</strong> se va a borrar de la tienda junto con su foto. No se puede deshacer.
            </p>
            <p className="admin-modal-texto admin-modal-tip">
              Si solo querés que no se vea por un tiempo, usá el interruptor <strong>Visible / Oculto</strong>.
            </p>
            {error && <p className="admin-alerta admin-alerta-error" role="alert">{error}</p>}
            <div className="admin-modal-acciones">
              <button type="button" className="admin-btn admin-btn-secundario" onClick={() => setAbierto(false)} disabled={pendiente}>
                Cancelar
              </button>
              <button type="button" className="admin-btn admin-btn-peligro-lleno" onClick={confirmar} disabled={pendiente} autoFocus>
                {pendiente ? 'Borrando...' : 'Sí, borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
