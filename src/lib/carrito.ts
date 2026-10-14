import { formatPrice } from './format'

// Carrito guardado en el navegador (localStorage). Los precios son de referencia:
// al enviar el pedido, el servidor vuelve a leer nombre y precio desde la base.
export interface ItemCarrito {
  id: string
  nombre: string
  precio: number | null
  categoria: string
  foto: string | null
  cantidad: number
}

const CLAVE = 'carrito-v2'
// Clave de la versión con Google Sheets (productos de ejemplo que ya no existen)
const CLAVE_VIEJA = 'carrito'

export const CANTIDAD_MAXIMA = 999

function esItemValido(item: unknown): item is ItemCarrito {
  const i = item as ItemCarrito
  return Boolean(
    i &&
      typeof i.id === 'string' &&
      typeof i.nombre === 'string' &&
      (i.precio === null || typeof i.precio === 'number') &&
      Number.isInteger(i.cantidad) &&
      i.cantidad > 0
  )
}

export function leerCarrito(): ItemCarrito[] {
  try {
    localStorage.removeItem(CLAVE_VIEJA)
    const datos = JSON.parse(localStorage.getItem(CLAVE) || '[]')
    return Array.isArray(datos) ? datos.filter(esItemValido) : []
  } catch {
    return []
  }
}

export function guardarCarrito(items: ItemCarrito[]) {
  if (items.length === 0) {
    localStorage.removeItem(CLAVE)
  } else {
    localStorage.setItem(CLAVE, JSON.stringify(items))
  }
}

export function totalesCarrito(items: ItemCarrito[]) {
  let total = 0
  let aCotizar = 0
  let unidades = 0
  for (const item of items) {
    unidades += item.cantidad
    if (typeof item.precio === 'number') {
      total += item.precio * item.cantidad
    } else {
      aCotizar++
    }
  }
  return { total, aCotizar, unidades }
}

// "$45.000", "$45.000 + a cotizar" o "A cotizar"
export function textoTotal(items: ItemCarrito[]): string {
  const { total, aCotizar } = totalesCarrito(items)
  if (aCotizar === 0) return formatPrice(total)
  if (aCotizar === items.length) return 'A cotizar'
  return `${formatPrice(total)} + a cotizar`
}

export function subtotalItem(item: ItemCarrito): string {
  return typeof item.precio === 'number' ? formatPrice(item.precio * item.cantidad) : 'A cotizar'
}
