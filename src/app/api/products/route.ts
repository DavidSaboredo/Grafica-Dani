import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen: string;
}

// Función para autenticar con Google Sheets
async function getGoogleSheetsInstance() {
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// Función para generar imagen placeholder
function generatePlaceholderImage(productName: string): string {
  const encodedName = encodeURIComponent(productName);
  return `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            fill="#6b7280" text-anchor="middle" dy=".3em">
        📦 ${productName}
      </text>
    </svg>
  `).toString('base64')}`;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const sheets = await getGoogleSheetsInstance();
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!sheetId) {
      console.error('GOOGLE_SHEET_ID no está configurado');
      return NextResponse.json(getFallbackProducts());
    }

    const sheetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Hoja 1!A2:F', // Leer todas las filas desde A2 hasta la columna F
    });

    const rows = sheetsResponse.data.values;
    
    console.log('📊 Datos recibidos de Google Sheets:', JSON.stringify(rows, null, 2));
    
    if (!rows || rows.length === 0) {
      console.log('No se encontraron datos en Google Sheets, usando datos de respaldo');
      const fallbackResponse = NextResponse.json(getFallbackProducts());
      fallbackResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      fallbackResponse.headers.set('Pragma', 'no-cache');
      fallbackResponse.headers.set('Expires', '0');
      return fallbackResponse;
    }

    // Filtrar filas vacías o incompletas antes de procesar
    const validRows = rows.filter(row => {
      // Una fila es válida si tiene al menos ID y nombre
      return row && row.length >= 2 && row[0] && row[1] && row[1].trim() !== '';
    });
    
    console.log(`📋 Filas válidas encontradas: ${validRows.length} de ${rows.length} total`);
    
    if (validRows.length === 0) {
      console.log('No se encontraron filas válidas en Google Sheets, usando datos de respaldo');
      const fallbackResponse = NextResponse.json(getFallbackProducts());
      fallbackResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      fallbackResponse.headers.set('Pragma', 'no-cache');
      fallbackResponse.headers.set('Expires', '0');
      return fallbackResponse;
    }

    let products: Product[] = validRows.map((row, index) => ({
      id: row[0] || `${index + 1}`,
      nombre: row[1] || 'Producto sin nombre',
      precio: parseFloat(row[2]) || 0,
      stock: parseInt(row[3]) || 0,
      categoria: row[4] || 'Sin categoría',
      imagen: row[5] || generatePlaceholderImage(row[1] || 'Producto')
    }));

    // Filtrar por categoría si se especifica
    if (category) {
      products = products.filter(product => 
        product.categoria.toLowerCase() === category.toLowerCase()
      );
    }

    // Filtrar por búsqueda si se especifica
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.categoria.toLowerCase().includes(searchTerm)
      );
    }

    console.log(`✅ Productos cargados desde Google Sheets: ${products.length}`);
    
    // Configurar headers para evitar caché
    const response = NextResponse.json(products);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
    
  } catch (error) {
    console.error('Error al obtener productos de Google Sheets:', error);
    console.log('Usando productos de respaldo');
    
    // Configurar headers para evitar caché también en caso de error
    const errorResponse = NextResponse.json(getFallbackProducts());
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
}