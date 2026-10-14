import Link from 'next/link'
import { prisma } from '../../../../lib/prisma'
import { requireSession } from '../../../../lib/auth.server'
import { fotosHabilitadas } from '../../../../lib/blob'
import FormularioProducto from '../../componentes/FormularioProducto'

export default async function NuevoProductoPage() {
  await requireSession()
  const categorias = await prisma.producto.findMany({
    distinct: ['categoria'],
    select: { categoria: true },
    orderBy: { categoria: 'asc' },
  })

  return (
    <div className="admin-page admin-page-form">
      <Link href="/admin/" className="admin-volver">← Volver a productos</Link>
      <h1 className="admin-title">Agregar producto</h1>
      <FormularioProducto
        categorias={categorias.map((c) => c.categoria)}
        fotosHabilitadas={fotosHabilitadas()}
      />
    </div>
  )
}
