'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { guardarProducto } from '../acciones'
import { achicarFoto } from '../../../lib/achicarFoto'
import { formatPrecioOpcional } from '../../../lib/format'

export interface ProductoEditable {
  id: string
  nombre: string
  descripcion: string | null
  precio: number | null
  categoria: string
  foto: string | null
  visible: boolean
  destacado: boolean
}

interface Props {
  producto?: ProductoEditable
  categorias: string[]
  fotosHabilitadas: boolean
}

function formatearKb(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// Precio escrito -> número para la vista previa ("4.500" -> 4500)
function precioDeTexto(texto: string): number | null {
  const limpio = texto.replace(/[$\s.]/g, '')
  return /^\d{1,9}$/.test(limpio) && Number(limpio) > 0 ? Number(limpio) : null
}

export default function FormularioProducto({ producto, categorias, fotosHabilitadas }: Props) {
  const [categoria, setCategoria] = useState(producto?.categoria || '')
  const [precio, setPrecio] = useState(producto?.precio ? String(producto.precio) : '')
  const [fotoNueva, setFotoNueva] = useState<File | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(producto?.foto || null)
  const [quitarFoto, setQuitarFoto] = useState(false)
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const [infoFoto, setInfoFoto] = useState('')
  const [error, setError] = useState('')
  const [guardando, startTransition] = useTransition()
  const alerta = useRef<HTMLParagraphElement>(null)

  // Liberar la vista previa local al cambiarla o al salir
  useEffect(() => {
    return () => {
      if (vistaPrevia?.startsWith('blob:')) URL.revokeObjectURL(vistaPrevia)
    }
  }, [vistaPrevia])

  // Mostrar el error a la vista (en el celular el botón queda lejos)
  useEffect(() => {
    if (error) alerta.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [error])

  const elegirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir la misma foto
    if (!archivo) return
    setError('')

    if (!fotosHabilitadas) {
      setError('No se pueden subir fotos porque falta configurar BLOB_READ_WRITE_TOKEN en Vercel.')
      return
    }
    if (!archivo.type.startsWith('image/')) {
      setError('Ese archivo no es una imagen. Elegí una foto JPG o PNG.')
      return
    }

    setProcesandoFoto(true)
    try {
      const achicada = await achicarFoto(archivo)
      setFotoNueva(achicada)
      setQuitarFoto(false)
      setVistaPrevia(URL.createObjectURL(achicada))
      setInfoFoto(`Foto lista: ${formatearKb(achicada.size)} (era ${formatearKb(archivo.size)})`)
    } catch {
      setError('No pudimos leer esa foto. Probá con otra (JPG o PNG).')
    } finally {
      setProcesandoFoto(false)
    }
  }

  const sacarFoto = () => {
    setFotoNueva(null)
    setVistaPrevia(null)
    setInfoFoto('')
    // Si el producto ya tenía foto, se borra al guardar
    setQuitarFoto(Boolean(producto?.foto))
  }

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const datos = new FormData(e.currentTarget)
    if (fotoNueva) datos.set('foto', fotoNueva, fotoNueva.name)
    if (quitarFoto) datos.set('quitarFoto', '1')

    startTransition(async () => {
      try {
        const resultado = await guardarProducto(datos)
        if (resultado?.error) setError(resultado.error)
      } catch (err) {
        // redirect() de Next.js también "lanza": solo se muestran los errores reales
        if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
          setError('No se pudo guardar. Revisá la conexión y probá de nuevo.')
        }
      }
    })
  }

  const ocupado = guardando || procesandoFoto
  const categoriaNormalizada = categoria.trim().toLowerCase()

  return (
    <form onSubmit={enviar} className="admin-form" noValidate>
      {producto && <input type="hidden" name="id" value={producto.id} />}

      {error && (
        <p ref={alerta} className="admin-alerta admin-alerta-error" role="alert">{error}</p>
      )}

      {/* Foto */}
      <section className="admin-card admin-form-seccion">
        <h2 className="admin-form-titulo">Foto</h2>
        {!fotosHabilitadas && (
          <p className="admin-alerta admin-alerta-aviso">
            Las fotos están desactivadas: falta configurar <code>BLOB_READ_WRITE_TOKEN</code> en Vercel
            (Storage → Blob). Podés guardar el producto sin foto y agregarla después.
          </p>
        )}
        <div className="admin-foto">
          <div className="admin-foto-preview">
            {vistaPrevia ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vistaPrevia} alt="Vista previa de la foto del producto" />
            ) : (
              <span className="admin-foto-vacia">
                <span aria-hidden="true">📷</span>
                Sin foto
              </span>
            )}
            {procesandoFoto && <span className="admin-foto-procesando">Preparando foto...</span>}
          </div>
          <div className="admin-foto-botones">
            <input
              type="file"
              accept="image/*"
              onChange={elegirFoto}
              className="admin-input-oculto"
              id="foto"
              disabled={!fotosHabilitadas || ocupado}
            />
            <label
              htmlFor="foto"
              className={`admin-btn admin-btn-secundario ${!fotosHabilitadas || ocupado ? 'is-deshabilitado' : ''}`}
            >
              {vistaPrevia ? 'Cambiar foto' : 'Elegir o sacar foto'}
            </label>
            {vistaPrevia && (
              <button type="button" className="admin-btn admin-btn-texto" onClick={sacarFoto} disabled={ocupado}>
                Quitar foto
              </button>
            )}
          </div>
          {infoFoto && <p className="admin-ayuda">{infoFoto}</p>}
          {quitarFoto && <p className="admin-ayuda">La foto actual se va a borrar al guardar.</p>}
        </div>
      </section>

      {/* Datos */}
      <section className="admin-card admin-form-seccion">
        <h2 className="admin-form-titulo">Datos del producto</h2>

        <div className="form-group">
          <label htmlFor="nombre" className="form-label">Nombre *</label>
          <input
            id="nombre"
            name="nombre"
            className="form-input"
            defaultValue={producto?.nombre}
            maxLength={120}
            placeholder="Ej: Tarjetas personales x100"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            className="form-textarea"
            defaultValue={producto?.descripcion || ''}
            maxLength={1000}
            rows={3}
            placeholder="Papel, medidas, terminación... (opcional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="precio" className="form-label">Precio</label>
          <div className="admin-precio-input">
            <span aria-hidden="true">$</span>
            <input
              id="precio"
              name="precio"
              className="form-input"
              inputMode="numeric"
              autoComplete="off"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Vacío = Consultá precio"
            />
          </div>
          <p className="admin-ayuda">
            En pesos, sin centavos. Si el precio depende del pedido, dejalo vacío.{' '}
            En la tienda se va a ver: <strong>{formatPrecioOpcional(precioDeTexto(precio))}</strong>
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="categoria" className="form-label">Categoría *</label>
          <input
            id="categoria"
            name="categoria"
            className="form-input"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            list="categorias-existentes"
            maxLength={60}
            placeholder="Ej: Tarjetas personales"
            autoComplete="off"
            required
          />
          <datalist id="categorias-existentes">
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {categorias.length > 0 && (
            <div className="admin-chips admin-chips-form">
              {categorias.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`admin-chip ${categoriaNormalizada === c.toLowerCase() ? 'is-activo' : ''}`}
                  onClick={() => setCategoria(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <p className="admin-ayuda">Tocá una categoría existente o escribí una nueva.</p>
        </div>
      </section>

      {/* Opciones */}
      <section className="admin-card admin-form-seccion">
        <h2 className="admin-form-titulo">Opciones</h2>
        <label className="admin-check">
          <input type="checkbox" name="visible" defaultChecked={producto ? producto.visible : true} />
          <span className="admin-check-caja" aria-hidden="true" />
          <span>
            <strong>Mostrar en la tienda</strong>
            <small>Si lo desactivás, queda guardado pero los clientes no lo ven.</small>
          </span>
        </label>
        <label className="admin-check">
          <input type="checkbox" name="destacado" defaultChecked={producto?.destacado} />
          <span className="admin-check-caja" aria-hidden="true" />
          <span>
            <strong>Destacado</strong>
            <small>Aparece primero en la tienda, con una etiqueta.</small>
          </span>
        </label>
      </section>

      <div className="admin-form-acciones">
        <Link href="/admin/" className="admin-btn admin-btn-secundario">Cancelar</Link>
        <button type="submit" className="admin-btn admin-btn-primario" disabled={ocupado}>
          {guardando ? 'Guardando...' : producto ? 'Guardar cambios' : 'Agregar producto'}
        </button>
      </div>
    </form>
  )
}
