'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '../../lib/prisma'
import { TAG_PRODUCTOS } from '../../lib/productos'
import {
  SESSION_COOKIE,
  SESSION_COOKIE_PATH,
  SESSION_MAX_AGE,
  createSessionToken,
  isAuthConfigured,
  safeEqual,
} from '../../lib/auth'
import { requireSession } from '../../lib/auth.server'
import { PESO_MAXIMO_FOTO, TIPOS_DE_FOTO, borrarFoto, fotosHabilitadas, subirFoto } from '../../lib/blob'

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ===== Ingreso y salida =====

export async function ingresar(formData: FormData) {
  const username = String(formData.get('usuario') || '').trim().toLowerCase()
  const password = String(formData.get('clave') || '').trim()

  // Solo variables de entorno: sin usuario ni contraseña por defecto en el código
  if (!isAuthConfigured()) {
    console.error('[Panel] Faltan ADMIN_USERNAME, ADMIN_PASSWORD o AUTH_SECRET (mínimo 32 caracteres)')
    redirect('/admin/ingresar/?error=config')
  }

  const validUsername = (process.env.ADMIN_USERNAME || '').trim().toLowerCase()
  const validPassword = (process.env.ADMIN_PASSWORD || '').trim()

  const usernameOk = await safeEqual(username, validUsername)
  const passwordOk = await safeEqual(password, validPassword)

  if (!usernameOk || !passwordOk) {
    // Demora ante datos incorrectos: frena a quien quiera probar contraseñas
    await esperar(1000 + Math.floor(Math.random() * 500))
    redirect('/admin/ingresar/?error=datos')
  }

  const token = await createSessionToken(validUsername)
  if (!token) {
    redirect('/admin/ingresar/?error=config')
  }

  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE, // 7 días
    path: SESSION_COOKIE_PATH,
  })
  redirect('/admin/')
}

export async function salir() {
  ;(await cookies()).delete({ name: SESSION_COOKIE, path: SESSION_COOKIE_PATH })
  redirect('/admin/ingresar/')
}

// ===== Productos =====

export type ResultadoAccion = { error: string } | undefined

// Renueva la tienda y el panel después de cada cambio
function revalidarCatalogo() {
  revalidateTag(TAG_PRODUCTOS)
  revalidatePath('/')
  revalidatePath('/admin')
}

function textoDe(formData: FormData, campo: string, largoMaximo: number): string {
  return String(formData.get(campo) || '').replace(/\s+/g, ' ').trim().slice(0, largoMaximo)
}

// "4500", "4.500" o "$ 4.500" -> 4500. Vacío -> null ("Consultá precio")
function leerPrecio(valor: string): number | null | 'invalido' {
  const limpio = valor.replace(/[$\s.]/g, '')
  if (!limpio) return null
  if (!/^\d{1,9}$/.test(limpio)) return 'invalido'
  const precio = parseInt(limpio, 10)
  return precio > 0 && precio <= 100_000_000 ? precio : 'invalido'
}

export async function guardarProducto(formData: FormData): Promise<ResultadoAccion> {
  await requireSession()

  const id = String(formData.get('id') || '').trim()
  const nombre = textoDe(formData, 'nombre', 120)
  const descripcion = String(formData.get('descripcion') || '').trim().slice(0, 1000) || null
  let categoria = textoDe(formData, 'categoria', 60)
  const precio = leerPrecio(String(formData.get('precio') || ''))
  const visible = formData.get('visible') === 'on'
  const destacado = formData.get('destacado') === 'on'
  const foto = formData.get('foto')
  const quitarFoto = formData.get('quitarFoto') === '1'

  if (!nombre) return { error: 'Escribí el nombre del producto.' }
  if (!categoria) return { error: 'Elegí o escribí una categoría.' }
  if (precio === 'invalido') {
    return { error: 'El precio tiene que ser un número en pesos, sin centavos (por ejemplo 4500). Dejalo vacío para mostrar "Consultá precio".' }
  }

  const anterior = id ? await prisma.producto.findUnique({ where: { id }, select: { foto: true } }) : null
  if (id && !anterior) return { error: 'Este producto ya no existe. Volvé a la lista de productos.' }

  // Si ya existe la categoría con otras mayúsculas, se usa la que ya está ("papelería" -> "Papelería")
  const existente = await prisma.producto.findFirst({
    where: { categoria: { equals: categoria, mode: 'insensitive' } },
    select: { categoria: true },
  })
  if (existente) categoria = existente.categoria

  // undefined = la foto no cambia; null = se quita; texto = foto nueva
  let fotoNueva: string | null | undefined = undefined
  if (foto instanceof File && foto.size > 0) {
    if (!fotosHabilitadas()) {
      return { error: 'No se pueden subir fotos porque falta conectar el Blob Store al proyecto en Vercel. Podés guardar el producto sin foto y agregarla después.' }
    }
    if (!TIPOS_DE_FOTO.includes(foto.type)) return { error: 'La foto tiene que ser JPG, PNG o WebP.' }
    if (foto.size > PESO_MAXIMO_FOTO) return { error: 'La foto pesa demasiado. Probá con otra.' }
    try {
      fotoNueva = await subirFoto(foto, nombre)
    } catch (error) {
      console.error('Error subiendo la foto:', error)
      return { error: 'No se pudo subir la foto. Revisá la conexión y probá de nuevo.' }
    }
  } else if (quitarFoto) {
    fotoNueva = null
  }

  const datos = {
    nombre,
    descripcion,
    precio,
    categoria,
    visible,
    destacado,
    ...(fotoNueva !== undefined && { foto: fotoNueva }),
  }

  try {
    if (id) {
      await prisma.producto.update({ where: { id }, data: datos })
    } else {
      // Los productos nuevos van al final del catálogo
      const { _max } = await prisma.producto.aggregate({ _max: { orden: true } })
      await prisma.producto.create({ data: { ...datos, orden: (_max.orden ?? 0) + 1 } })
    }
  } catch (error) {
    console.error('Error guardando el producto:', error)
    // La foto recién subida queda huérfana: se borra
    if (fotoNueva) await borrarFoto(fotoNueva)
    return { error: 'No se pudo guardar el producto. Probá de nuevo en un momento.' }
  }

  // Foto reemplazada o quitada: se borra la vieja del Blob
  if (fotoNueva !== undefined && anterior?.foto && anterior.foto !== fotoNueva) {
    await borrarFoto(anterior.foto)
  }

  revalidarCatalogo()
  redirect(`/admin/?ok=${id ? 'editado' : 'creado'}`)
}

export async function cambiarVisible(id: string, visible: boolean): Promise<ResultadoAccion> {
  await requireSession()
  try {
    await prisma.producto.update({ where: { id }, data: { visible: Boolean(visible) } })
  } catch (error) {
    console.error('Error cambiando la visibilidad:', error)
    return { error: 'No se pudo cambiar. Probá de nuevo.' }
  }
  revalidarCatalogo()
}

export async function borrarProducto(id: string): Promise<ResultadoAccion> {
  await requireSession()
  try {
    const producto = await prisma.producto.delete({ where: { id }, select: { foto: true } })
    await borrarFoto(producto.foto)
  } catch (error) {
    console.error('Error borrando el producto:', error)
    return { error: 'No se pudo borrar el producto. Probá de nuevo.' }
  }
  revalidarCatalogo()
}
