'use client'

import { useFormStatus } from 'react-dom'

// Botón de formulario que se deshabilita y cambia el texto mientras se envía
export default function BotonEnviar({
  children,
  textoEnviando,
  className = 'admin-btn admin-btn-primario',
}: {
  children: React.ReactNode
  textoEnviando: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? textoEnviando : children}
    </button>
  )
}
