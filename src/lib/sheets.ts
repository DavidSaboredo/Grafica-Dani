export interface Product {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen: string;
  cantidad?: number;
}

// Función para obtener productos desde la API
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return getFallbackProducts();
  }
}

// Función para obtener productos por categoría
export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error('Error al obtener productos por categoría');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    return getFallbackProducts();
  }
}

// Función para buscar productos
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Error al buscar productos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return getFallbackProducts();
  }
}

// Función para generar imagen placeholder
function generatePlaceholderImage(productName: string): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            fill="#6b7280" text-anchor="middle" dy=".3em">
        📦 ${productName}
      </text>
    </svg>
  `)}`;
}

// Productos de respaldo
function getFallbackProducts(): Product[] {
  return [
    {
      id: '1',
      nombre: 'Tarjetas de Presentación',
      precio: 25.99,
      stock: 100,
      categoria: 'Papelería',
      imagen: generatePlaceholderImage('Tarjetas de Presentación')
    },
    {
      id: '2',
      nombre: 'Flyers A5',
      precio: 15.50,
      stock: 50,
      categoria: 'Publicidad',
      imagen: generatePlaceholderImage('Flyers A5')
    },
    {
      id: '3',
      nombre: 'Banners Publicitarios',
      precio: 45.00,
      stock: 25,
      categoria: 'Publicidad',
      imagen: generatePlaceholderImage('Banners Publicitarios')
    },
    {
      id: '4',
      nombre: 'Carpetas Corporativas',
      precio: 18.75,
      stock: 75,
      categoria: 'Papelería',
      imagen: generatePlaceholderImage('Carpetas Corporativas')
    },
    {
      id: '5',
      nombre: 'Catálogos A4',
      precio: 32.00,
      stock: 30,
      categoria: 'Publicidad',
      imagen: generatePlaceholderImage('Catálogos A4')
    },
    {
      id: '6',
      nombre: 'Sobres Personalizados',
      precio: 12.50,
      stock: 200,
      categoria: 'Papelería',
      imagen: generatePlaceholderImage('Sobres Personalizados')
    }
  ];
}