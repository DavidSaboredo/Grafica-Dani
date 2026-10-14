'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ProductoPublico } from '../../lib/productos'
import { formatPrice, formatPrecioOpcional } from '../../lib/format'
import { CANTIDAD_MAXIMA, guardarCarrito, leerCarrito, totalesCarrito, type ItemCarrito } from '../../lib/carrito'

interface Props {
  productos: ProductoPublico[]
  categorias: string[]
  error: boolean
  whatsappUrl: string
}

const COLORES = ['blue', 'green', 'orange', 'purple']

// Ícono según el nombre de la categoría (las categorías se escriben en el panel)
function iconoCategoria(nombre: string): string {
  const n = nombre.toLowerCase()
  if (n.includes('tarjeta')) return '📇'
  if (n.includes('volante') || n.includes('folleto') || n.includes('flyer')) return '📄'
  if (n.includes('sticker') || n.includes('etiqueta') || n.includes('calco')) return '🏷️'
  // Talonarios va antes que banners: "talonario" contiene "lona"
  if (n.includes('talonario') || n.includes('factura')) return '🧾'
  if (n.includes('banner') || n.includes('cartel') || n.includes('lona')) return '📢'
  if (n.includes('imán') || n.includes('iman')) return '🧲'
  if (n.includes('sello')) return '🔖'
  if (n.includes('almanaque') || n.includes('calendario') || n.includes('agenda')) return '📅'
  return '🖨️'
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function Catalogo({ productos, categorias, error, whatsappUrl }: Props) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [cart, setCart] = useState<ItemCarrito[]>([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [recienAgregado, setRecienAgregado] = useState<string | null>(null)

  // Cargar carrito desde localStorage
  useEffect(() => {
    setCart(leerCarrito())
    setCartLoaded(true)
  }, [])

  // Guardar carrito en localStorage (recién después de leerlo, para no pisarlo)
  useEffect(() => {
    if (cartLoaded) guardarCarrito(cart)
  }, [cart, cartLoaded])

  // Aviso "Agregado" en el botón durante un momento
  useEffect(() => {
    if (!recienAgregado) return
    const timer = setTimeout(() => setRecienAgregado(null), 1800)
    return () => clearTimeout(timer)
  }, [recienAgregado])

  // Filtro por categoría y búsqueda (en el navegador, sin volver a pedir datos)
  const filteredProducts = useMemo(() => {
    const busqueda = normalizar(searchTerm.trim())
    return productos.filter((p) => {
      if (selectedCategory !== 'todas' && p.categoria !== selectedCategory) return false
      if (!busqueda) return true
      return normalizar(`${p.nombre} ${p.descripcion || ''} ${p.categoria}`).includes(busqueda)
    })
  }, [productos, searchTerm, selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Cierra el teclado en el celular: el filtro ya se aplica mientras se escribe
    ;(document.activeElement as HTMLElement | null)?.blur()
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('todas')
  }

  const addToCart = (product: ProductoPublico, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: Math.min(CANTIDAD_MAXIMA, item.cantidad + quantity) }
            : item
        )
      }
      return [
        ...prevCart,
        {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          categoria: product.categoria,
          foto: product.foto,
          cantidad: quantity,
        },
      ]
    })

    // Resetear la cantidad seleccionada después de agregar
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
    setRecienAgregado(product.id)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity >= 1 && quantity <= CANTIDAD_MAXIMA) {
      setQuantities((prev) => ({ ...prev, [productId]: quantity }))
    }
  }

  const getSelectedQuantity = (productId: string): number => quantities[productId] || 1

  const getCartQuantity = (productId: string): number =>
    cart.find((item) => item.id === productId)?.cantidad || 0

  const cartItemCount = totalesCarrito(cart).unidades

  return (
    <div className="catalog-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Catálogo D-Print Digital</h1>
          <p className="hero-subtitle">
            Tarjetas, volantes, stickers, banners, talonarios y sellos. Armá tu pedido online y confirmalo por
            WhatsApp.
          </p>
        </div>
      </section>

      {/* Estado de error: la base de datos no respondió */}
      {error && (
        <section className="products-section">
          <div className="error-state-optimized">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">No pudimos cargar el catálogo</h3>
            <p className="error-message">Probá de nuevo en un momento o consultanos directamente por WhatsApp.</p>
            <div className="empty-actions">
              <button onClick={() => router.refresh()} className="error-retry-btn">
                🔄 Reintentar
              </button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Catálogo vacío: todavía no hay productos cargados */}
      {!error && productos.length === 0 && (
        <section className="products-section">
          <div className="empty-state-optimized catalog-empty">
            <div className="empty-icon">🖨️</div>
            <h3 className="empty-title">Estamos preparando el catálogo</h3>
            <p className="empty-message">
              Mientras tanto, escribinos por WhatsApp y te pasamos precios y opciones para tu trabajo.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              Consultar por WhatsApp
            </a>
          </div>
        </section>
      )}

      {!error && productos.length > 0 && (
        <>
          {/* Barra de búsqueda optimizada */}
          <section className="search-section">
            <form className="search-container-optimized" onSubmit={handleSearch} role="search">
              <div className="search-input-group">
                <div className="search-icon-container">
                  <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Buscar productos de impresión..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-optimized"
                  aria-label="Buscar productos"
                />
                <button type="submit" className="search-button-optimized">
                  <span>Buscar</span>
                </button>
              </div>
            </form>
          </section>

          {/* Filtros de categoría */}
          {categorias.length > 1 && (
            <section className="categories-section">
              <h2 className="categories-title">Categorías de Productos</h2>
              <div className="categories-grid">
                {[{ key: 'todas', name: 'Todos los Productos', icon: '📋' }, ...categorias.map((c) => ({ key: c, name: c, icon: iconoCategoria(c) }))].map(
                  (category, index) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`category-card ${
                        selectedCategory === category.key ? 'category-active' : ''
                      } category-${index === 0 ? 'purple' : COLORES[(index - 1) % COLORES.length]}`}
                      aria-pressed={selectedCategory === category.key}
                    >
                      <div className="category-icon">{category.icon}</div>
                      <div className="category-name">{category.name}</div>
                      <div className="category-indicator"></div>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {/* Grid de productos optimizado */}
          <section className="products-section">
            <div className="products-grid-optimized">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const cantidad = getSelectedQuantity(product.id)
                  const enCarrito = getCartQuantity(product.id)
                  return (
                    <article key={product.id} className="product-card-optimized">
                      {/* Imagen del producto */}
                      <div className="product-image-wrapper">
                        {product.foto ? (
                          <Image
                            src={product.foto}
                            alt={product.nombre}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                            className="product-image-optimized"
                            unoptimized={product.foto.endsWith('.svg')}
                          />
                        ) : (
                          <div className="product-placeholder-optimized">
                            <span className="placeholder-icon">{iconoCategoria(product.categoria)}</span>
                            <span className="placeholder-text">{product.categoria}</span>
                          </div>
                        )}
                        <div className="product-overlay">
                          <span className="product-category-tag">{product.categoria}</span>
                        </div>
                        {product.destacado && <span className="product-featured-tag">★ Destacado</span>}
                      </div>

                      {/* Contenido del producto */}
                      <div className="product-content">
                        <h3 className="product-title">{product.nombre}</h3>
                        {product.descripcion && <p className="product-description">{product.descripcion}</p>}

                        <div className="product-info">
                          <div className="price-container">
                            <span className="price-label">Precio</span>
                            <span className={`price-value ${product.precio === null ? 'price-consultar' : ''}`}>
                              {formatPrecioOpcional(product.precio)}
                            </span>
                          </div>
                          {enCarrito > 0 && <span className="cart-info">{enCarrito} en el carrito</span>}
                        </div>

                        {/* Selector de cantidad */}
                        <div className="quantity-selector-optimized">
                          <label className="quantity-label">Cantidad:</label>
                          <div className="quantity-controls">
                            <button
                              onClick={() => updateQuantity(product.id, cantidad - 1)}
                              className="quantity-btn-optimized quantity-decrease"
                              disabled={cantidad <= 1}
                              aria-label="Disminuir cantidad"
                            >
                              <svg className="quantity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>

                            <div className="quantity-display">
                              <span className="quantity-number">{cantidad}</span>
                              <span className="quantity-unit">unid.</span>
                            </div>

                            <button
                              onClick={() => updateQuantity(product.id, cantidad + 1)}
                              className="quantity-btn-optimized quantity-increase"
                              disabled={cantidad >= CANTIDAD_MAXIMA}
                              aria-label="Aumentar cantidad"
                            >
                              <svg className="quantity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Botón de agregar al carrito */}
                        <button
                          onClick={() => addToCart(product, cantidad)}
                          className={`add-to-cart-btn-optimized ${recienAgregado === product.id ? 'btn-added' : ''}`}
                        >
                          <span className="btn-icon">{recienAgregado === product.id ? '✓' : '🛒'}</span>
                          <span className="btn-text">
                            {recienAgregado === product.id ? '¡Agregado al carrito!' : `Agregar ${cantidad} al Carrito`}
                          </span>
                          {recienAgregado !== product.id && (
                            <span className="btn-price">
                              {product.precio !== null ? formatPrice(product.precio * cantidad) : 'A cotizar'}
                            </span>
                          )}
                        </button>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="empty-state-optimized">
                  <div className="empty-icon">🔍</div>
                  <h3 className="empty-title">No se encontraron productos</h3>
                  <p className="empty-message">Probá con otra búsqueda o categoría, o consultanos por lo que necesitás.</p>
                  <div className="empty-actions">
                    <button onClick={resetFilters} className="empty-reload-btn">
                      Ver todo el catálogo
                    </button>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                      Consultar por WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Carrito flotante optimizado */}
      {cart.length > 0 && (
        <div className="floating-cart-optimized">
          <a href="/carrito" className="cart-button-optimized">
            <div className="cart-icon-container">
              <svg className="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
              </svg>
              <span className="cart-badge">{cartItemCount}</span>
            </div>
            <div className="cart-text">
              <span className="cart-label">Mi Carrito</span>
              <span className="cart-count">{cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'}</span>
            </div>
          </a>
        </div>
      )}
    </div>
  )
}
