'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      icon: '📋',
      text: 'Catálogo',
      isActive: pathname === '/'
    },
    {
      href: '/carrito',
      icon: '🛒',
      text: 'Carrito',
      isActive: pathname === '/carrito'
    },
    {
      href: '/pedido',
      icon: '📦',
      text: 'Pedidos',
      isActive: pathname === '/pedido'
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