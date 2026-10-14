import { NextRequest, NextResponse } from 'next/server'
import { formatPrice } from '../../../lib/format'
import { prisma } from '../../../lib/prisma'
import { CANTIDAD_MAXIMA } from '../../../lib/carrito'
import { linkWhatsapp } from '../../../lib/contacto'

interface OrderItemRequest {
  id: string
  quantity: number
}

interface OrderItem {
  name: string
  quantity: number
  price: number | null
}

interface OrderData {
  cliente: string
  telefono: string
  email: string
  direccion: string
  productos: OrderItem[]
  notas?: string
}

const MAX_PRODUCTOS = 50

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const pedidos: OrderItemRequest[] = Array.isArray(body?.productos) ? body.productos : []
    const itemsValidos = pedidos.every(
      (p) => p && typeof p.id === 'string' && Number.isInteger(p.quantity) && p.quantity > 0 && p.quantity <= CANTIDAD_MAXIMA
    )

    if (!body?.cliente?.trim() || !body?.telefono?.trim() || pedidos.length === 0 || pedidos.length > MAX_PRODUCTOS || !itemsValidos) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos del pedido (nombre, teléfono o productos)' },
        { status: 400 }
      )
    }

    // Nombre y precio actuales desde la base (no se confía en lo que manda el navegador)
    const ids = Array.from(new Set(pedidos.map((p) => p.id)))
    const productos = await prisma.producto.findMany({
      where: { id: { in: ids }, visible: true },
      select: { id: true, nombre: true, precio: true },
    })
    const porId = new Map(productos.map((p) => [p.id, p]))

    // Productos borrados u ocultos mientras estaban en el carrito
    const faltantes = ids.filter((id) => !porId.has(id))
    if (faltantes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          faltantes,
          error: 'Algunos productos ya no están disponibles y los sacamos de tu carrito. Revisá el pedido y envialo de nuevo.',
        },
        { status: 409 }
      )
    }

    const texto = (valor: unknown, largo: number) => (typeof valor === 'string' ? valor.trim().slice(0, largo) : '')
    const orderData: OrderData = {
      cliente: texto(body.cliente, 100),
      telefono: texto(body.telefono, 40),
      email: texto(body.email, 120),
      direccion: texto(body.direccion, 200),
      notas: texto(body.notas, 1000),
      productos: pedidos.map((p) => {
        const producto = porId.get(p.id)!
        return { name: producto.nombre, quantity: p.quantity, price: producto.precio }
      }),
    }

    // Formatear mensaje para WhatsApp
    const message = formatWhatsAppMessage(orderData)
    
    // Generar enlace de WhatsApp (número en WHATSAPP_NUMBER, ver lib/contacto.ts)
    const whatsappUrl = linkWhatsapp(message)
    
    return NextResponse.json({
      success: true,
      whatsappUrl,
      message: 'Pedido procesado correctamente'
    })
    
  } catch (error) {
    console.error('Error procesando pedido:', error)
    return NextResponse.json(
      { success: false, error: 'Error procesando el pedido' },
      { status: 500 }
    )
  }
}

function formatWhatsAppMessage(orderData: OrderData): string {
  const fecha = new Date().toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    // El servidor de Vercel corre en UTC: mostrar siempre la hora de Argentina
    timeZone: 'America/Argentina/Buenos_Aires'
  })
  
  // Sitio de demostración: el pedido le llega a David.dev, no a una imprenta real
  let message = `🎨 *NUEVO PEDIDO - D-Print Digital (demo)*\n`
  message += `_Pedido de prueba enviado desde la demo de David.dev_\n\n`
  message += `👤 *Cliente:* ${orderData.cliente}\n`
  message += `📞 *Teléfono:* ${orderData.telefono}\n`
  if (orderData.email) {
    message += `📧 *Email:* ${orderData.email}\n`
  }
  if (orderData.direccion) {
    message += `📍 *Dirección:* ${orderData.direccion}\n`
  }
  message += `\n`
  
  message += `🛍️ *Productos:*\n`
  let total = 0
  let aCotizar = 0
  orderData.productos.forEach(producto => {
    if (producto.price !== null) {
      const subtotal = producto.price * producto.quantity
      total += subtotal
      message += `• ${producto.name} (${producto.quantity}x) - ${formatPrice(subtotal)}\n`
    } else {
      aCotizar++
      message += `• ${producto.name} (${producto.quantity}x) - a cotizar\n`
    }
  })

  // Sin precio = "a cotizar" (la imprenta lo cotiza por WhatsApp)
  if (aCotizar === 0) {
    message += `\n💰 *Total:* ${formatPrice(total)}\n`
  } else if (aCotizar === orderData.productos.length) {
    message += `\n💰 *Total:* a cotizar\n`
  } else {
    message += `\n💰 *Total:* ${formatPrice(total)} + productos a cotizar\n`
  }
  
  if (orderData.notas) {
    message += `\n📝 *Notas:* ${orderData.notas}\n`
  }
  
  message += `\n🕐 *Pedido recibido:* ${fecha}`
  
  return message
}