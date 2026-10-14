'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '../../lib/format'

interface Product {
  id: string
  nombre: string
  precio: number
  stock?: number
  categoria: string
  imagen: string
  cantidad?: number
}

interface OrderForm {
  nombre: string
  telefono: string
  email: string
  direccion: string
  notas: string
}

export default function PedidoPage() {
  const [cart, setCart] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [orderForm, setOrderForm] = useState<OrderForm>({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [submitError, setSubmitError] = useState('')
  // Evita mostrar "carrito vacío" antes de leer localStorage
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem('carrito')
    if (savedCart) {
      const cartItems = JSON.parse(savedCart)
      setCart(cartItems)
      const totalAmount = cartItems.reduce((sum: number, item: Product) => {
        return sum + (item.precio * (item.cantidad || 1))
      }, 0)
      setTotal(totalAmount)
    }
    setIsLoaded(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Preparar datos del pedido para WhatsApp
      const orderData = {
        cliente: orderForm.nombre,
        telefono: orderForm.telefono,
        email: orderForm.email,
        direccion: orderForm.direccion,
        productos: cart.map(product => ({
          id: product.id,
          name: product.nombre,
          quantity: product.cantidad || 1,
          price: product.precio
        })),
        total: total,
        notas: orderForm.notas
      }

      // Enviar pedido a la API de WhatsApp
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (result.success) {
        // Abrir WhatsApp con el mensaje pre-formateado. Algunos celulares
        // bloquean la ventana nueva: queda el botón "Abrir WhatsApp" de respaldo.
        setWhatsappUrl(result.whatsappUrl)
        window.open(result.whatsappUrl, '_blank')

        // Limpiar carrito después del pedido exitoso
        localStorage.removeItem('carrito')
        setOrderSubmitted(true)
      } else {
        throw new Error(result.error || 'Error al procesar el pedido')
      }
    } catch (error) {
      console.error('Error al enviar pedido:', error)
      setSubmitError('No pudimos preparar tu pedido. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Finalizar Pedido</h1>
            <p className="hero-subtitle">Cargando tu pedido...</p>
          </div>
        </section>
      </div>
    )
  }

  if (cart.length === 0 && !orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Finalizar Pedido</h1>
            <p className="hero-subtitle">Completá tu pedido de impresión</p>
          </div>
        </section>

        {/* Empty State */}
        <div className="order-empty-state">
          <div className="order-empty-content">
            <div className="order-empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M9 21C9.6 21 10 20.6 10 20S9.6 19 9 19 8 19.4 8 20 8.4 21 9 21ZM20 21C20.6 21 21 20.6 21 20S20.6 19 20 19 19 19.4 19 20 19.4 21 20 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="order-empty-title">Tu carrito está vacío</h2>
            <p className="order-empty-description">
              Agregá productos a tu carrito antes de hacer un pedido
            </p>
            <Link href="/" className="btn-primary order-empty-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 21L12 17L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Pedido Listo</h1>
            <p className="hero-subtitle">Solo falta confirmarlo por WhatsApp</p>
          </div>
        </section>

        {/* Success State */}
        <div className="order-success-state">
          <div className="order-success-content">
            <div className="order-success-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12C21.99 16.1 19.73 19.84 16.19 21.64C12.65 23.44 8.37 22.97 5.32 20.43C2.27 17.89 0.87 13.91 1.56 10.03C2.25 6.15 5.06 2.95 8.86 1.67C12.66 0.39 16.89 1.23 19.93 3.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="order-success-title">¡Tu pedido está listo!</h2>
            <p className="order-success-description">
              Abrimos WhatsApp con el detalle de tu pedido: tocá <strong>Enviar</strong> en el chat para confirmarlo. Después, el equipo de D-Print Digital se va a contactar con vos para coordinar la producción y la entrega.
            </p>
            <div className="order-success-actions">
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-gradient-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 11.5C21 16.19 16.97 20 12 20C10.6 20 9.27 19.7 8.09 19.15L3 20.5L4.4 16.3C3.52 14.9 3 13.26 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Abrir WhatsApp
                </a>
              )}
              <Link href="/" className="btn-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5 20.5 21 20 21H4C3.5 21 3 20.5 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Finalizar Pedido</h1>
          <p className="hero-subtitle">Completá tus datos para enviar tu pedido</p>
        </div>
      </section>

      {/* Order Content */}
      <div className="order-container">
        <div className="order-content">
          <div className="order-grid">
            {/* Formulario de pedido */}
            <div className="order-form-card">
              <div className="order-form-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h2>Información de Contacto</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="order-form">
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    value={orderForm.nombre}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono" className="form-label">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    required
                    value={orderForm.telefono}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Tu número de teléfono"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={orderForm.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="direccion" className="form-label">
                    Dirección de Entrega
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={orderForm.direccion}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Dirección completa (opcional)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notas" className="form-label">
                    Notas Adicionales
                  </label>
                  <textarea
                    id="notas"
                    name="notas"
                    rows={4}
                    value={orderForm.notas}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Comentarios, instrucciones especiales, preferencias de diseño..."
                  />
                </div>

                {submitError && (
                  <p className="order-submit-error" role="alert">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`order-submit-btn ${isSubmitting ? 'loading' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                        <path fill="currentColor" className="opacity-75" d="M4 12C4 16.4 7.6 20 12 20V18C8.7 18 6 15.3 6 12H4Z"/>
                      </svg>
                      Procesando Pedido...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Enviar Pedido
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Resumen del pedido */}
            <div className="order-summary-card">
              <div className="order-summary-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H15M9 15H15M17 21H7C5.9 21 5 20.1 5 19V5C5 3.9 5.9 3 7 3H12.6C13.1 3 13.6 3.2 13.9 3.5L18.4 8C18.8 8.4 19 8.9 19 9.4V19C19 20.1 18.1 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2>Resumen del Pedido</h2>
              </div>
              
              <div className="order-items">
                {cart.map(product => (
                  <div key={product.id} className="order-item">
                    <div className="order-item-info">
                      <h4 className="order-item-name">{product.nombre}</h4>
                      <p className="order-item-details">
                        {product.cantidad || 1} × {formatPrice(product.precio)}
                      </p>
                    </div>
                    <span className="order-item-total">
                      {formatPrice((product.cantidad || 1) * product.precio)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="order-total">
                <div className="order-total-row">
                  <span className="order-total-label">Total:</span>
                  <span className="order-total-amount">{formatPrice(total)}</span>
                </div>
              </div>
              
              <div className="order-actions">
                <Link href="/carrito" className="btn-secondary order-back-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Volver al Carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}