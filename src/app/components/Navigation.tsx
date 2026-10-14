'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathname = usePathname()
  // next.config usa trailingSlash: true, así que "/carrito/" se compara como "/carrito"
  const currentPath = pathname?.replace(/\/+$/, '') || '/'

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