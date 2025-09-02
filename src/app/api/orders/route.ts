import { NextRequest, NextResponse } from 'next/server'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface OrderData {
  cliente: string
  telefono: string
  email: string
  direccion: string
  productos: OrderItem[]
  total: number
  notas?: string
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json()
    
    // Formatear mensaje para WhatsApp
    const message = formatWhatsAppMessage(orderData)
    
    // Generar enlace de WhatsApp
    const whatsappNumber = '543442462463' // Tu número
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    
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
    minute: '2-digit'
  })
  
  let message = `🎨 *NUEVO PEDIDO - D-Print Digital*\n\n`
  message += `👤 *Cliente:* ${orderData.cliente}\n`
  message += `📞 *Teléfono:* ${orderData.telefono}\n`
  message += `📧 *Email:* ${orderData.email}\n`
  message += `📍 *Dirección:* ${orderData.direccion}\n\n`
  
  message += `🛍️ *Productos:*\n`
  orderData.productos.forEach(producto => {
    message += `• ${producto.name} (${producto.quantity}x) - $${producto.price * producto.quantity}\n`
  })
  
  message += `\n💰 *Total:* $${orderData.total}\n`
  
  if (orderData.notas) {
    message += `\n📝 *Notas:* ${orderData.notas}\n`
  }
  
  message += `\n🕐 *Pedido recibido:* ${fecha}`
  
  return message
}