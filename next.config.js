/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    // Fotos de productos subidas desde el panel (Vercel Blob)
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    serverActions: {
      // Las fotos se achican en el navegador (~200 KB), esto es un margen de seguridad
      bodySizeLimit: '4mb',
    },
  },
}

module.exports = nextConfig
