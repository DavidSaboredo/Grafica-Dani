import { connection } from 'next/server'
import Catalogo from './components/Catalogo'
import { obtenerProductosPublicos, type ProductoPublico } from '../lib/productos'
import { linkWhatsapp } from '../lib/contacto'

export default async function Home() {
  // Se arma en cada visita (no en la compilación), pero los productos salen de la
  // caché de datos: el panel /admin la renueva cada vez que se guarda un cambio.
  await connection()

  let productos: ProductoPublico[] = []
  let categorias: string[] = []
  let error = false
  try {
    const datos = await obtenerProductosPublicos()
    productos = datos.productos
    categorias = datos.categorias
  } catch (err) {
    console.error('No se pudieron leer los productos de la base:', err)
    error = true
  }

  return (
    <Catalogo
      productos={productos}
      categorias={categorias}
      error={error}
      whatsappUrl={linkWhatsapp('¡Hola! Vengo de la demo de D-Print Digital (David.dev) y quiero hacer una consulta.')}
    />
  )
}
