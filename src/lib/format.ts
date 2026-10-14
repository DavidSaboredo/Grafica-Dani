// Formato de precios en pesos argentinos: $4.500 o $25,99
export function formatPrice(value: number): string {
  const amount = Number(value) || 0
  const decimals = Number.isInteger(Math.round(amount * 100) / 100) ? 0 : 2
  return '$' + amount.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
