import type { Metadata } from 'next'

// El panel no se indexa en Google (el middleware además manda X-Robots-Tag)
export const metadata: Metadata = {
  title: 'Panel | D-Print Digital',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-container">{children}</div>
}
