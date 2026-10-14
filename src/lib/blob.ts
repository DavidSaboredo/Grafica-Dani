import { put, del } from '@vercel/blob'

// Fotos de productos en Vercel Blob. Necesita BLOB_READ_WRITE_TOKEN
// (Vercel lo crea solo al conectar un Blob Store al proyecto).
export function fotosHabilitadas(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

export const TIPOS_DE_FOTO = ['image/jpeg', 'image/png', 'image/webp']
export const PESO_MAXIMO_FOTO = 4 * 1024 * 1024

function esFotoDelBlob(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

export async function subirFoto(archivo: File, nombreProducto: string): Promise<string> {
  const extension = archivo.type === 'image/webp' ? 'webp' : archivo.type === 'image/png' ? 'png' : 'jpg'
  const { url } = await put(`productos/${slug(nombreProducto) || 'producto'}.${extension}`, archivo, {
    access: 'public',
    addRandomSuffix: true,
    contentType: archivo.type,
    // El nombre cambia en cada subida, así que se puede cachear por un año
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  })
  return url
}

// Borra una foto vieja del Blob. Las fotos de ejemplo (/demo/...) no se tocan.
// Si falla, solo se registra: no tiene que frenar el guardado del producto.
export async function borrarFoto(url: string | null | undefined) {
  if (!url || !esFotoDelBlob(url) || !fotosHabilitadas()) return
  try {
    await del(url)
  } catch (error) {
    console.error('No se pudo borrar la foto del Blob:', error)
  }
}
