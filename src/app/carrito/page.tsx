'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrecioOpcional } from '../../lib/format'
import {
  CANTIDAD_MAXIMA,
  guardarCarrito,
  leerCarrito,
  subtotalItem,
  textoTotal,
  totalesCarrito,
  type ItemCarrito,
} from '../../lib/carrito'

export default function CarritoPage() {
  const [cart, setCart] = useState<ItemCarrito[]>([])
  // Evita mostrar "carrito vacío" antes de leer localStorage
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Cargar carrito desde localStorage
    setCart(leerCarrito())
    setIsLoaded(true)
  }, [])

  const updateCart = (updatedCart: ItemCarrito[]) => {
    setCart(updatedCart)
    guardarCarrito(updatedCart)
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    updateCart(cart.map(item =>
      item.id === productId
        ? { ...item, cantidad: Math.min(CANTIDAD_MAXIMA, newQuantity) }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    updateCart(cart.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    updateCart([])
  }

  const { aCotizar } = totalesCarrito(cart)

  if (!isLoaded) {
    return (
      <div className="cart-container">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Carrito de Compras</h1>
            <p className="hero-subtitle">Cargando tu carrito...</p>
          </div>
        </section>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Carrito de Compras</h1>
            <p className="hero-subtitle">Gestioná tus productos seleccionados</p>
          </div>
        </section>

        <div className="empty-cart-container">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">
              <svg className="empty-cart-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="empty-cart-title">Tu carrito está vacío</h2>
            <p className="empty-cart-description">Explorá nuestro catálogo y agregá productos profesionales de impresión</p>
            <Link href="/" className="btn-gradient-primary">
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Carrito de Compras</h1>
          <p className="hero-subtitle">Revisá y gestioná tus productos seleccionados</p>
        </div>
      </section>

      <div className="cart-content">
        <div className="cart-header">
          <div className="cart-title-section">
            <h2 className="cart-main-title">Productos Seleccionados</h2>
            <div className="cart-items-count">
              {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
            </div>
          </div>
          <button onClick={clearCart} className="btn-clear-cart">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Vaciar Carrito
          </button>
        </div>

        <div className="cart-layout">
          {/* Lista de productos */}
          <div className="cart-products">
            {cart.map(product => (
              <div key={product.id} className="cart-product-card">
                <div className="cart-product-content">
                  {/* Imagen del producto */}
                  <div className="cart-product-image">
                    {product.foto ? (
                      <Image
                        src={product.foto}
                        alt={product.nombre}
                        width={80}
                        height={80}
                        className="cart-product-photo"
                        unoptimized={product.foto.endsWith('.svg')}
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Información del producto */}
                  <div className="cart-product-info">
                    <h3 className="cart-product-name">{product.nombre}</h3>
                    <div className="cart-product-category">
                      <svg className="category-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {product.categoria}
                    </div>
                    <div className={`cart-product-price ${product.precio === null ? 'price-consultar' : ''}`}>{formatPrecioOpcional(product.precio)}</div>
                  </div>
                  
                  {/* Controles de cantidad */}
                  <div className="cart-quantity-controls">
                    <div className="quantity-label">Cantidad</div>
                    <div className="quantity-selector">
                      <button 
                        onClick={() => updateQuantity(product.id, (product.cantidad || 1) - 1)}
                        className="quantity-btn quantity-btn-decrease"
                        disabled={(product.cantidad || 1) <= 1}
                      >
                        <svg className="quantity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <div className="quantity-display">{product.cantidad || 1}</div>
                      <button 
                        onClick={() => updateQuantity(product.id, (product.cantidad || 1) + 1)}
                        className="quantity-btn quantity-btn-increase"
                        disabled={(product.cantidad || 1) >= CANTIDAD_MAXIMA}
                      >
                        <svg className="quantity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Subtotal y eliminar */}
                  <div className="cart-product-actions">
                    <div className="cart-product-subtotal">
                      <div className="subtotal-label">Subtotal</div>
                      <div className="subtotal-amount">{subtotalItem(product)}</div>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="btn-remove-product"
                      aria-label={`Quitar ${product.nombre} del carrito`}
                    >
                      <svg className="remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="cart-summary">
            <div className="cart-summary-card">
              <div className="summary-header">
                <h3 className="summary-title">Resumen del Pedido</h3>
                <div className="summary-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              
              <div className="summary-items">
                {cart.map(product => (
                  <div key={product.id} className="summary-item">
                    <div className="summary-item-info">
                      <span className="summary-item-name">{product.nombre}</span>
                      <span className="summary-item-quantity">x{product.cantidad || 1}</span>
                    </div>
                    <span className="summary-item-price">{subtotalItem(product)}</span>
                  </div>
                ))}
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-total">
                <div className="total-row">
                  <span className="total-label">{aCotizar > 0 ? 'Total estimado:' : 'Total a Pagar:'}</span>
                  <span className="total-amount">{textoTotal(cart)}</span>
                </div>
                {aCotizar > 0 && (
                  <p className="total-note">
                    Los productos sin precio se cotizan por WhatsApp según cantidad y terminación.
                  </p>
                )}
              </div>
              
              <div className="summary-actions">
                <Link href="/" className="btn-continue-shopping">
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Seguir Comprando
                </Link>
                <Link href="/pedido" className="btn-gradient-primary">
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  Proceder al Pedido
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}