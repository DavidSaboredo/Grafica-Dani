import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

// Etiqueta de caché: el panel /admin la invalida cada vez que cambia un producto
export const TAG_PRODUCTOS = 'productos'

export interface ProductoPublico {
  id: string
  nombre: string
  descripcion: string | null
  precio: number | null
  categoria: string
  foto: string | null
  destacado: boolean
}

// Productos visibles de la tienda. Las categorías salen en el orden del catálogo
// y los destacados se muestran primero.
export const obtenerProductosPublicos = unstable_cache(
  async () => {
    const productos: ProductoPublico[] = await prisma.producto.findMany({
      where: { visible: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        categoria: true,
        foto: true,
        destacado: true,
      },
    })

    const categorias = Array.from(new Set(productos.map((p) => p.categoria)))
    const ordenados = [
      ...productos.filter((p) => p.destacado),
      ...productos.filter((p) => !p.destacado),
    ]

    return { productos: ordenados, categorias }
  },
  // La caché sobrevive a los deploys: si la semilla cambia productos que ya existen
  // (como el paso de ilustraciones SVG a fotos), subí la versión para no mostrar datos viejos.
  ['productos-publicos', 'v2'],
  { tags: [TAG_PRODUCTOS] }
)
