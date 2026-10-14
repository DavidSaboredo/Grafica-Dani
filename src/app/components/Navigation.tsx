'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { salir } from '../admin/acciones'

const Navigation = () => {
  const pathname = usePathname()
  // next.config usa trailingSlash: true, así que "/carrito/" se compara como "/carrito"
  const currentPath = pathname?.replace(/\/+$/, '') || '/'

  // Panel de administración: menú propio con botón para salir
  if (currentPath.startsWith('/admin')) {
    const enIngreso = currentPath === '/admin/ingresar'
    return (
      <nav className="nav-professional" aria-label="Panel">
        {!enIngreso && (
          <Link href="/admin/" className={`nav-item ${currentPath === '/admin' ? 'active' : ''}`}>
            <span className="nav-icon">📋</span>
            <span className="nav-text">Productos</span>
          </Link>
        )}
        <Link href="/" className="nav-item" target="_blank">
          <span className="nav-icon">🏪</span>
          <span className="nav-text">Ver tienda</span>
        </Link>
        {!enIngreso && (
          <form action={salir}>
            <button type="submit" className="nav-item nav-button">
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Salir</span>
            </button>
          </form>
        )}
      </nav>
    )
  }

  const navItems = [
    {
      href: '/',
      icon: '📋',
      text: 'Catálogo',
      isActive: currentPath === '/'
    },
    {
      href: '/carrito',
      icon: '🛒',
      text: 'Carrito',
      isActive: currentPath === '/carrito'
    },
    {
      href: '/pedido',
      icon: '📦',
      text: 'Pedidos',
      isActive: currentPath === '/pedido'
    }
  ]

  return (
    <nav className="nav-professional">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-item ${item.isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.text}</span>
        </Link>
      ))}
    </nav>
  )
}

export default Navigation