// Catálogo de ejemplo de la demo (D-Print Digital es una imprenta ficticia).
// Corre en cada compilación de Vercel después de las migraciones, pero solo carga
// productos si la tabla está vacía: nunca pisa ni duplica lo cargado desde /admin.
// Las fotos son de Unsplash (licencia libre, créditos en public/demo/CREDITOS.md) y no se borran desde el panel.
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Número cualquiera y fijo: evita que dos compilaciones a la vez carguen el catálogo dos veces
const BLOQUEO_SEMILLA = 72_026_001

interface ProductoDeEjemplo {
  nombre: string
  descripcion: string
  // Pesos enteros (precios de referencia 2026). null = "Consultá precio"
  precio: number | null
  categoria: string
  foto: string | null
  destacado?: boolean
  visible?: boolean
}

// El orden de la lista es el orden del catálogo (y de las categorías)
const productos: ProductoDeEjemplo[] = [
  {
    nombre: 'Tarjetas personales x100',
    descripcion: 'Papel ilustración 300 g, impresas a color de ambos lados. Medida estándar de 9 x 5 cm.',
    precio: 24500,
    categoria: 'Tarjetas personales',
    foto: '/demo/tarjetas-personales.webp',
    destacado: true,
  },
  {
    nombre: 'Tarjetas premium con laminado mate x100',
    descripcion: 'Laminado mate de ambos lados y laca sectorizada sobre el logo. Terminación suave al tacto.',
    precio: 41000,
    categoria: 'Tarjetas personales',
    foto: '/demo/tarjetas-premium.webp',
  },
  {
    nombre: 'Volantes A6 x1000',
    descripcion: 'Formato 10,5 x 14,8 cm en papel obra 90 g, color de un lado. Ideales para repartir o dejar en el mostrador.',
    precio: 52000,
    categoria: 'Volantes y folletos',
    foto: '/demo/volantes-a6.webp',
    destacado: true,
  },
  {
    nombre: 'Volantes A5 x500',
    descripcion: 'Formato 14,8 x 21 cm en papel ilustración 115 g, color de ambos lados.',
    precio: 63000,
    categoria: 'Volantes y folletos',
    foto: '/demo/volantes-a5.webp',
  },
  {
    nombre: 'Folletos trípticos A4 x100',
    descripcion: 'Ilustración 150 g, color de ambos lados, plegados y listos para entregar.',
    precio: 78000,
    categoria: 'Volantes y folletos',
    foto: '/demo/tripticos.webp',
  },
  {
    nombre: 'Stickers troquelados x100',
    descripcion: 'Vinilo blanco con laminado brillante, cortados con la forma de tu logo. Resisten agua y sol.',
    precio: 36000,
    categoria: 'Stickers y etiquetas',
    foto: '/demo/stickers.webp',
    destacado: true,
  },
  {
    nombre: 'Etiquetas en rollo x1000',
    descripcion: 'Autoadhesivas de 5 x 3 cm para frascos, envases y packaging de tu emprendimiento.',
    precio: 48000,
    categoria: 'Stickers y etiquetas',
    foto: '/demo/etiquetas.webp',
  },
  {
    nombre: 'Banner roll-up 85 x 200 cm',
    descripcion: 'Lona impresa en alta calidad con estructura de aluminio y bolso para transportarlo. Se arma en un minuto.',
    precio: 128000,
    categoria: 'Banners y cartelería',
    foto: '/demo/rollup.webp',
  },
  {
    nombre: 'Lona impresa con ojales (por m²)',
    descripcion: 'Gran formato para frentes de local, eventos y obras. Con ojales y refuerzo en los bordes.',
    precio: 19500,
    categoria: 'Banners y cartelería',
    foto: '/demo/lona.webp',
  },
  {
    nombre: 'Vinilo para vidriera',
    descripcion: 'Tu logo, horarios o promociones en vinilo de corte o impreso. El precio depende de la medida.',
    precio: null,
    categoria: 'Banners y cartelería',
    foto: '/demo/vidriera.webp',
  },
  {
    nombre: 'Talonarios de remitos x10',
    descripcion: 'Duplicado autocopiativo, 50 juegos por talonario, numerados y con los datos de tu negocio.',
    precio: 56000,
    categoria: 'Talonarios',
    foto: '/demo/talonarios-remitos.webp',
  },
  {
    nombre: 'Talonarios de facturas con CAI',
    descripcion: 'Facturas A, B o C con CAI de ARCA. El precio depende de la cantidad y del tipo de comprobante.',
    precio: null,
    categoria: 'Talonarios',
    foto: '/demo/talonarios-facturas.webp',
  },
  {
    nombre: 'Imanes publicitarios x100',
    descripcion: 'Imán flexible de 7 x 5 cm impreso a color. El clásico para delivery, inmobiliarias y servicios.',
    precio: 47000,
    categoria: 'Imanes',
    foto: '/demo/imanes.webp',
  },
  {
    nombre: 'Sello automático 38 x 14 mm',
    descripcion: 'Se entinta solo, con hasta 4 líneas de texto. Ideal para firmas, CUIT y datos del comercio.',
    precio: 27000,
    categoria: 'Sellos',
    foto: '/demo/sello-automatico.webp',
  },
  {
    nombre: 'Sello redondo de 40 mm',
    descripcion: 'Para logos, firmas institucionales o la marca de tu emprendimiento.',
    precio: 34000,
    categoria: 'Sellos',
    foto: '/demo/sello-redondo.webp',
  },
  {
    nombre: 'Almanaques de bolsillo 2027 x200',
    descripcion: 'El regalo de fin de año para tus clientes: 7 x 10 cm, con tu logo y datos al dorso.',
    precio: 42000,
    categoria: 'Almanaques y agendas',
    foto: '/demo/almanaques-bolsillo.webp',
    destacado: true,
  },
  {
    nombre: 'Almanaques de pared 2027 x50',
    descripcion: 'Tamaño A4 con espiral y 12 hojas a color con fotos de tus productos.',
    precio: 165000,
    categoria: 'Almanaques y agendas',
    foto: '/demo/almanaques-pared.webp',
  },
  {
    // Oculto a propósito: muestra en el panel cómo queda un producto que no se ve en la tienda
    nombre: 'Agendas 2027 personalizadas',
    descripcion: 'Tapa dura con tu logo. Disponibles desde noviembre.',
    precio: null,
    categoria: 'Almanaques y agendas',
    foto: '/demo/agendas.webp',
    visible: false,
  },
]

// Las primeras versiones de la demo usaban ilustraciones SVG que ya no existen.
// Si la base todavía las tiene, se cambian por las fotos nuevas (las fotos subidas desde /admin no se tocan).
const ILUSTRACIONES_VIEJAS: Record<string, string> = {
  '/demo/tarjetas.svg': '/demo/tarjetas-personales.webp',
  '/demo/tarjetas-premium.svg': '/demo/tarjetas-premium.webp',
  '/demo/volantes.svg': '/demo/volantes-a6.webp',
  '/demo/tripticos.svg': '/demo/tripticos.webp',
  '/demo/stickers.svg': '/demo/stickers.webp',
  '/demo/etiquetas.svg': '/demo/etiquetas.webp',
  '/demo/rollup.svg': '/demo/rollup.webp',
  '/demo/lona.svg': '/demo/lona.webp',
  '/demo/vidriera.svg': '/demo/vidriera.webp',
  '/demo/talonarios.svg': '/demo/talonarios-remitos.webp',
  '/demo/imanes.svg': '/demo/imanes.webp',
  '/demo/sellos.svg': '/demo/sello-automatico.webp',
  '/demo/almanaques.svg': '/demo/almanaques-bolsillo.webp',
}


async function reemplazarIlustracionesViejas(tx: Prisma.TransactionClient) {
  const viejas = Object.keys(ILUSTRACIONES_VIEJAS)
  let cambiadas = 0
  // Primero por nombre, para que los productos que compartían ilustración queden con su propia foto
  for (const producto of productos) {
    if (!producto.foto) continue
    const { count } = await tx.producto.updateMany({
      where: { nombre: producto.nombre, foto: { in: viejas } },
      data: { foto: producto.foto },
    })
    cambiadas += count
  }
  // Lo que quede (por ejemplo, productos renombrados desde el panel) va por archivo
  for (const [vieja, nueva] of Object.entries(ILUSTRACIONES_VIEJAS)) {
    const { count } = await tx.producto.updateMany({ where: { foto: vieja }, data: { foto: nueva } })
    cambiadas += count
  }
  if (cambiadas > 0) console.log(`Semilla: se cambiaron ${cambiadas} ilustraciones viejas por fotos.`)
}

async function main() {
  const cargados = await prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BLOQUEO_SEMILLA}::bigint)`

      const existentes = await tx.producto.count()
      if (existentes > 0) {
        await reemplazarIlustracionesViejas(tx)
        console.log(`Semilla: la base ya tiene ${existentes} productos, no se carga nada.`)
        return 0
      }

      const { count } = await tx.producto.createMany({
        data: productos.map((producto, orden) => ({ ...producto, orden })),
      })
      return count
    },
    { timeout: 20_000 }
  )

  if (cargados > 0) console.log(`Semilla: se cargaron ${cargados} productos de ejemplo.`)
}

main()
  .catch((error) => {
    console.error('Semilla: no se pudo cargar el catálogo de ejemplo.', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
