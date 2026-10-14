import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import { requireSession } from '../../../../lib/auth.server'
import { fotosHabilitadas } from '../../../../lib/blob'
import FormularioProducto from '../../componentes/FormularioProducto'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession()
  const { id } = await params

  const [producto, categorias] = await Promise.all([
    prisma.producto.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        categoria: true,
        foto: true,
        visible: true,
        destacado: true,
      },
    }),
    prisma.producto.findMany({ distinct: ['categoria'], select: { categoria: true }, orderBy: { categoria: 'asc' } }),
  ])

  if (!producto) notFound()

  return (
    <div className="admin-page admin-page-form">
      <Link href="/admin/" className="admin-volver">← Volver a productos</Link>
      <h1 className="admin-title">Editar producto</h1>
      <FormularioProducto
        producto={producto}
        categorias={categorias.map((c) => c.categoria)}
        fotosHabilitadas={fotosHabilitadas()}
      />
    </div>
  )
}
