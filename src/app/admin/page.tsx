import Link from 'next/link'
import Image from 'next/image'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { requireSession } from '../../lib/auth.server'
import { formatPrecioOpcional } from '../../lib/format'
import InterruptorVisible from './componentes/InterruptorVisible'
import BotonBorrar from './componentes/BotonBorrar'

const AVISOS: Record<string, string> = {
  creado: '¡Listo! El producto se agregó al catálogo.',
  editado: '¡Listo! Los cambios se guardaron.',
}

function linkFiltro(q: string, categoria: string) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (categoria) params.set('categoria', categoria)
  const query = params.toString()
  return query ? `/admin/?${query}` : '/admin/'
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; ok?: string }>
}) {
  await requireSession()
  const params = await searchParams
  const q = (params.q || '').trim().slice(0, 80)
  const categoria = (params.categoria || '').trim()
  const aviso = params.ok ? AVISOS[params.ok] : null

  const filtros: Prisma.ProductoWhereInput[] = []
  if (q) {
    filtros.push({
      OR: [
        { nombre: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
        { categoria: { contains: q, mode: 'insensitive' } },
      ],
    })
  }
  if (categoria) filtros.push({ categoria })

  const [productos, categorias, total, visibles] = await Promise.all([
    prisma.producto.findMany({
      where: { AND: filtros },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    }),
    prisma.producto.findMany({ distinct: ['categoria'], select: { categoria: true }, orderBy: { categoria: 'asc' } }),
    prisma.producto.count(),
    prisma.producto.count({ where: { visible: true } }),
  ])

  const hayFiltros = Boolean(q || categoria)

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Productos</h1>
          <p className="admin-subtitle">
            {total === 0
              ? 'Todavía no cargaste productos.'
              : `${total} ${total === 1 ? 'producto' : 'productos'} · ${visibles} ${visibles === 1 ? 'visible' : 'visibles'} en la tienda`}
          </p>
        </div>
        <Link href="/admin/productos/nuevo/" className="admin-btn admin-btn-primario admin-btn-agregar">
          <span aria-hidden="true">＋</span> Agregar producto
        </Link>
      </div>

      {aviso && (
        <p className="admin-alerta admin-alerta-ok" role="status">
          {aviso} <Link href="/" target="_blank">Ver la tienda</Link>
        </p>
      )}

      {total > 0 && (
        <div className="admin-filtros">
          <form action="/admin/" method="get" className="admin-buscador" role="search">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre o descripción..."
              className="form-input"
              aria-label="Buscar productos"
            />
            <button type="submit" className="admin-btn admin-btn-secundario">Buscar</button>
          </form>

          {categorias.length > 1 && (
            <div className="admin-chips" aria-label="Filtrar por categoría">
              <Link href={linkFiltro(q, '')} className={`admin-chip ${!categoria ? 'is-activo' : ''}`}>
                Todas
              </Link>
              {categorias.map(({ categoria: c }) => (
                <Link key={c} href={linkFiltro(q, c)} className={`admin-chip ${categoria === c ? 'is-activo' : ''}`}>
                  {c}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {total === 0 ? (
        <div className="admin-card admin-vacio">
          <span className="admin-vacio-icono" aria-hidden="true">🖨️</span>
          <h2>Empezá cargando tu primer producto</h2>
          <p>Con nombre, precio y una foto sacada con el celular alcanza. Mientras no haya productos, la tienda muestra un botón para consultar por WhatsApp.</p>
          <Link href="/admin/productos/nuevo/" className="admin-btn admin-btn-primario">Agregar producto</Link>
        </div>
      ) : productos.length === 0 ? (
        <div className="admin-card admin-vacio">
          <span className="admin-vacio-icono" aria-hidden="true">🔍</span>
          <h2>No hay productos con ese filtro</h2>
          <Link href="/admin/" className="admin-btn admin-btn-secundario">Ver todos</Link>
        </div>
      ) : (
        <ul className="admin-lista">
          {productos.map((p) => (
            <li key={p.id} className={`admin-item ${p.visible ? '' : 'is-oculto'}`}>
              <div className="admin-item-foto">
                {p.foto ? (
                  <Image src={p.foto} alt="" width={72} height={72} unoptimized={p.foto.endsWith('.svg')} />
                ) : (
                  <span aria-hidden="true">📷</span>
                )}
              </div>
              <div className="admin-item-info">
                <h2 className="admin-item-nombre">{p.nombre}</h2>
                <p className="admin-item-meta">
                  <span>{p.categoria}</span>
                  <span className={p.precio === null ? 'admin-precio-consultar' : 'admin-precio'}>
                    {formatPrecioOpcional(p.precio)}
                  </span>
                </p>
                {p.destacado && <span className="admin-badge">★ Destacado</span>}
              </div>
              <div className="admin-item-acciones">
                <InterruptorVisible id={p.id} visible={p.visible} nombre={p.nombre} />
                <div className="admin-item-botones">
                  <Link href={`/admin/productos/${p.id}/`} className="admin-btn admin-btn-secundario admin-btn-chico">
                    Editar
                  </Link>
                  <BotonBorrar id={p.id} nombre={p.nombre} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hayFiltros && productos.length > 0 && (
        <p className="admin-pie-filtro">
          Mostrando {productos.length} de {total}. <Link href="/admin/">Quitar filtros</Link>
        </p>
      )}
    </div>
  )
}
