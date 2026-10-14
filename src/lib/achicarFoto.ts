// Achica la foto en el navegador antes de subirla: lado mayor de 1200 px en WebP
// (o JPG si el navegador no sabe generar WebP). Una foto de celular de 4 MB queda en ~150 KB.
const LADO_MAXIMO = 1200

function cargarImagen(archivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo)
    const imagen = new Image()
    imagen.onload = () => {
      URL.revokeObjectURL(url)
      resolve(imagen)
    }
    imagen.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    imagen.src = url
  })
}

function canvasABlob(canvas: HTMLCanvasElement, tipo: string, calidad: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, calidad))
}

export async function achicarFoto(archivo: File): Promise<File> {
  const imagen = await cargarImagen(archivo)
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.naturalWidth, imagen.naturalHeight))
  const ancho = Math.max(1, Math.round(imagen.naturalWidth * escala))
  const alto = Math.max(1, Math.round(imagen.naturalHeight * escala))

  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('El navegador no pudo procesar la foto')

  // Fondo blanco para las imágenes con transparencia (PNG)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ancho, alto)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(imagen, 0, 0, ancho, alto)

  let blob = await canvasABlob(canvas, 'image/webp', 0.82)
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasABlob(canvas, 'image/jpeg', 0.85)
  }
  if (!blob) throw new Error('El navegador no pudo procesar la foto')

  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg'
  return new File([blob], `foto.${extension}`, { type: blob.type })
}
