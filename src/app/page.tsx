'use client'

import { useState, useEffect } from 'react'
import { fetchProducts, fetchProductsByCategory, searchProducts, Product } from '../lib/sheets'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [cart, setCart] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<{[key: string]: number}>({})

  // Cargar productos desde Google Sheets
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      setError('Error al cargar los productos. Por favor, intenta de nuevo.')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('carrito') // Cambiar de 'cart' a 'carrito'
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])
  
  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(cart)) // Cambiar de 'cart' a 'carrito'
  }, [cart])

  // Función para buscar productos
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadProducts()
      return
    }
    
    try {
      setLoading(true)
      const results = await searchProducts(searchTerm)
      setProducts(results)
    } catch (err) {
      setError('Error en la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  // Función para filtrar por categoría
  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category)
    
    if (category === 'todas') {
      loadProducts()
      return
    }
    
    try {
      setLoading(true)
      const results = await fetchProductsByCategory(category)
      setProducts(results)
    } catch (err) {
      setError('Error al filtrar productos')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, cantidad: (item.cantidad || 0) + quantity }
            : item
        )
      }
      return [...prevCart, { ...product, cantidad: quantity }]
    })
    
    // Resetear la cantidad seleccionada después de agregar
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity >= 1) {
      setQuantities(prev => ({ ...prev, [productId]: quantity }))
    }
  }

  const getSelectedQuantity = (productId: string): number => {
    return quantities[productId] || 1
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.cantidad || 1), 0)
  }

  // Función para obtener la cantidad de un producto específico en el carrito
  const getCartQuantity = (productId: string): number => {
    const cartItem = cart.find(item => item.id === productId)
    return cartItem ? (cartItem.cantidad || 0) : 0
  }

  // Función para calcular el stock disponible (stock total - cantidad en carrito)
  const getAvailableStock = (product: Product): number => {
    const cartQuantity = getCartQuantity(product.id)
    return Math.max(0, (product.stock || 0) - cartQuantity)
  }

  // Función para verificar si se puede agregar más cantidad al carrito
  const canAddToCart = (product: Product, requestedQuantity: number = 1): boolean => {
    const availableStock = getAvailableStock(product)
    return availableStock >= requestedQuantity && product.stock > 0
  }

  // Función para obtener el máximo que se puede seleccionar
  const getMaxSelectableQuantity = (product: Product): number => {
    return getAvailableStock(product)
  }

  return (
    <div className="catalog-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Catálogo D-Print Digital</h1>
          <p className="hero-subtitle">Soluciones de impresión</p>
        </div>
      </section>

      {/* Barra de búsqueda optimizada */}
      <section className="search-section">
        <div className="search-container-optimized">
          <div className="search-input-group">
            <div className="search-icon-container">
              <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar productos de impresión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-optimized"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="search-button-optimized"
            >
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filtros de categoría profesionales */}
      <section className="categories-section">
        <h2 className="categories-title">Categorías de Productos</h2>
        <div className="categories-grid">
          {[
            { key: 'todas', name: 'Todos los Productos', icon: '📋', color: 'purple' },
            { key: 'papelería', name: 'Papelería Corporativa', icon: '📄', color: 'blue' },
            { key: 'marketing', name: 'Material de Marketing', icon: '📈', color: 'green' },
            { key: 'publicidad', name: 'Publicidad Exterior', icon: '🏷️', color: 'orange' }
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategoryFilter(category.key)}
              className={`category-card ${
                selectedCategory === category.key ? 'category-active' : ''
              } category-${category.color}`}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-name">{category.name}</div>
              <div className="category-indicator"></div>
            </button>
          ))}
        </div>
      </section>

      {/* Estados de carga y error optimizados */}
      {loading && (
        <div className="loading-state-optimized">
          <div className="loading-spinner-optimized"></div>
          <p className="loading-text">Cargando catálogo de productos...</p>
        </div>
      )}

      {error && (
        <div className="error-state-optimized">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error al cargar productos</h3>
          <p className="error-message">{error}</p>
          <button onClick={loadProducts} className="error-retry-btn">
            🔄 Reintentar carga
          </button>
        </div>
      )}

      {/* Grid de productos optimizado */}
      {!loading && !error && (
        <section className="products-section">
          <div className="products-grid-optimized">
            {products.length > 0 ? (
              products.map((product) => (
                <article key={product.id} className="product-card-optimized">
                  {/* Imagen del producto */}
                  <div className="product-image-wrapper">
                    {product.imagen && product.imagen.startsWith('http') ? (
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        className="product-image-optimized"
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-placeholder-optimized">
                        <span className="placeholder-icon">🖨️</span>
                        <span className="placeholder-text">{product.categoria}</span>
                      </div>
                    )}
                    <div className="product-overlay">
                      <span className="product-category-tag">{product.categoria}</span>
                    </div>
                  </div>
                  
                  {/* Contenido del producto */}
                  <div className="product-content">
                    <h3 className="product-title">{product.nombre}</h3>
                    
                    {/* Stock e información */}
                    <div className="product-info">
                      {product.stock !== undefined && (
                        <div className={`stock-indicator ${
                          getAvailableStock(product) === 0 ? 'stock-out' : 
                          getAvailableStock(product) <= 3 ? 'stock-low' : 'stock-available'
                        }`}>
                          <span className="stock-icon">
                            {getAvailableStock(product) === 0 ? '❌' : 
                             getAvailableStock(product) <= 3 ? '⚠️' : '📦'}
                          </span>
                          <span className="stock-text">
                            {getAvailableStock(product) === 0 ? 'Sin stock' : 
                             `${getAvailableStock(product)} disponibles`}
                            {getCartQuantity(product.id) > 0 && (
                              <span className="cart-info"> ({getCartQuantity(product.id)} en carrito)</span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      <div className="price-container">
                        <span className="price-label">Precio:</span>
                        <span className="price-value">${product.precio.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Selector de cantidad optimizado */}
                    <div className="quantity-selector-optimized">
                      <label className="quantity-label">Cantidad:</label>
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(product.id, getSelectedQuantity(product.id) - 1)}
                          className="quantity-btn-optimized quantity-decrease"
                          disabled={getSelectedQuantity(product.id) <= 1}
                          aria-label="Disminuir cantidad"
                        >
                          <svg className="quantity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <div className="quantity-display">
                          <span className="quantity-number">{getSelectedQuantity(product.id)}</span>
                          <span className="quantity-unit">unid.</span>
                        </div>
                        
                        <button
                          onClick={() => updateQuantity(product.id, getSelectedQuantity(product.id) + 1)}
                          className="quantity-btn-optimized quantity-increase"
                          disabled={getSelectedQuantity(product.id) >= getMaxSelectableQuantity(product)}
                          aria-label="Aumentar cantidad"
                        >
                          <svg className="quantity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      
                      {getSelectedQuantity(product.id) >= getMaxSelectableQuantity(product) && getMaxSelectableQuantity(product) > 0 && (
                        <div className="quantity-warning">
                          <span className="warning-icon">⚠️</span>
                          <span className="warning-text">Stock disponible: {getMaxSelectableQuantity(product)}</span>
                        </div>
                      )}
                      
                      {getMaxSelectableQuantity(product) === 0 && (
                        <div className="quantity-warning quantity-out-of-stock">
                          <span className="warning-icon">❌</span>
                          <span className="warning-text">Sin stock disponible</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Botón de agregar al carrito optimizado */}
                    <button
                      onClick={() => addToCart(product, getSelectedQuantity(product.id))}
                      className={`add-to-cart-btn-optimized ${
                        !canAddToCart(product, getSelectedQuantity(product.id)) ? 'btn-disabled' : ''
                      }`}
                      disabled={!canAddToCart(product, getSelectedQuantity(product.id))}
                    >
                      <span className="btn-icon">
                        {getMaxSelectableQuantity(product) === 0 ? '❌' : '🛒'}
                      </span>
                      <span className="btn-text">
                        {getMaxSelectableQuantity(product) === 0 
                          ? 'Sin Stock Disponible'
                          : !canAddToCart(product, getSelectedQuantity(product.id))
                          ? `Solo quedan ${getMaxSelectableQuantity(product)} disponibles`
                          : `Agregar ${getSelectedQuantity(product.id)} al Carrito`
                        }
                      </span>
                      {canAddToCart(product, getSelectedQuantity(product.id)) && (
                        <span className="btn-price">${(product.precio * getSelectedQuantity(product.id)).toFixed(2)}</span>
                      )}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state-optimized">
                <div className="empty-icon">📦</div>
                <h3 className="empty-title">No se encontraron productos</h3>
                <p className="empty-message">Intenta ajustar los filtros de búsqueda o categorías.</p>
                <button onClick={loadProducts} className="empty-reload-btn">
                  🔄 Recargar catálogo
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Carrito flotante optimizado */}
      {cart.length > 0 && (
        <div className="floating-cart-optimized">
          <a href="/carrito" className="cart-button-optimized">
            <div className="cart-icon-container">
              <svg className="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
              </svg>
              <span className="cart-badge">{getCartItemCount()}</span>
            </div>
            <div className="cart-text">
              <span className="cart-label">Mi Carrito</span>
              <span className="cart-count">{getCartItemCount()} productos</span>
            </div>
          </a>
        </div>
      )}
    </div>
  )
}