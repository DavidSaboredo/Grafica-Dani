// WhatsApp que recibe los pedidos. En la demo es el número de laruzo-dev;
// se puede cambiar con la variable WHATSAPP_NUMBER (solo números, con código de país).
const WHATSAPP_POR_DEFECTO = '5493442462463'

export function numeroWhatsapp(): string {
  const numero = (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '')
  return numero || WHATSAPP_POR_DEFECTO
}

export function linkWhatsapp(texto: string): string {
  return `https://wa.me/${numeroWhatsapp()}?text=${encodeURIComponent(texto)}`
}
