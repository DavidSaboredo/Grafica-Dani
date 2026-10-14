import { ImageResponse } from 'next/og'

export const alt = 'D-Print Digital - Soluciones de Impresión Profesional'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Imagen de vista previa al compartir el link (WhatsApp, redes)
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em' }}>D-Print Digital</div>
        <div style={{ fontSize: 40, marginTop: 16, opacity: 0.95 }}>Soluciones de Impresión Profesional</div>
        <div style={{ fontSize: 30, marginTop: 48, opacity: 0.9 }}>Tarjetas · Flyers · Banners · Papelería</div>
      </div>
    ),
    size
  )
}
