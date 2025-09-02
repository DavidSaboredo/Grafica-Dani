# 🎨 D-Print Digital - Tienda Online de Productos Gráficos

Una moderna tienda online desarrollada con Next.js 14 que permite gestionar productos gráficos con sincronización en tiempo real desde Google Sheets.

## ✨ Características Principales

- 🛒 **Carrito de Compras Inteligente**: Sistema completo con gestión de inventario en tiempo real
- 📊 **Sincronización con Google Sheets**: Los productos se actualizan automáticamente desde una hoja de cálculo
- 🎯 **Control de Stock**: Verificación automática de disponibilidad y prevención de sobreventa
- 📱 **Diseño Responsivo**: Optimizado para dispositivos móviles y desktop
- ⚡ **Rendimiento Optimizado**: Carga rápida con Next.js 14 y App Router
- 🔄 **Actualizaciones en Tiempo Real**: Sin necesidad de recargar la página
- 💳 **Proceso de Pedido**: Sistema completo de checkout con validación

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Google Sheets API
- **Estado**: Context API de React
- **Deployment**: Vercel (recomendado)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Google Cloud Platform
- Google Sheets configurado

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/d-print-digital.git
cd d-print-digital
   ```
   2. 1.
   Instalar dependencias
   
   ```
   npm install
   ```
3. 2.
   Configurar variables de entorno
   
   ```
   cp .env.example .env.local
   ```
   Completa las variables en .env.local :
   
   ```
   GOOGLE_PROJECT_ID=tu-project-id
   GOOGLE_PRIVATE_KEY_ID=tu-private-key-id
   GOOGLE_PRIVATE_KEY=tu-private-key
   GOOGLE_CLIENT_EMAIL=tu-client-email
   GOOGLE_CLIENT_ID=tu-client-id
   GOOGLE_SHEET_ID=tu-sheet-id
   ```
4. 3.
   Configurar Google Sheets
   
   - Crear una hoja de cálculo con las columnas: ID, Nombre, Precio, Stock, Categoría, Imagen
   - Configurar las credenciales de la API de Google Sheets
   - Compartir la hoja con el email del service account
5. 4.
   Ejecutar en desarrollo
   
   ```
   npm run dev
   ```
   La aplicación estará disponible en http://localhost:3000
## 📊 Configuración de Google Sheets
La hoja de cálculo debe tener la siguiente estructura:

ID Nombre Precio Stock Categoría Imagen 1 Tarjetas de Presentación 12000 75 Papelería url_imagen 2 Flyers A4 8000 50 Marketing url_imagen

## 🚀 Deployment

### Vercel (Recomendado)
1. 1.
   Conectar con GitHub
   
   - Hacer push del código a GitHub
   - Conectar el repositorio en Vercel
2. 2.
   Configurar variables de entorno
   
   - Agregar todas las variables de .env.local en Vercel
3. 3.
   Deploy automático
   
   - Vercel desplegará automáticamente en cada push

### Otras plataformas
- Netlify : Compatible con build estático
- Railway : Para deployment con base de datos
- DigitalOcean : Para VPS personalizado

## 📁 Estructura del Proyecto
```
d-print-digital/
├── src/
│   ├── app/
│   │   ├── api/products/          # API de productos
│   │   ├── carrito/               # Página del carrito
│   │   ├── components/            # Componentes reutilizables
│   │   ├── pedido/               # Proceso de checkout
│   │   └── page.tsx              # Página principal
│   └── lib/
│       └── sheets.ts             # Configuración Google Sheets
├── public/                       # Archivos estáticos
├── .env.example                  # Variables de entorno ejemplo
└── README.md
```
## 🔧 Scripts Disponibles
```
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
```
## 🤝 Contribuir
1. 1.
   Fork el proyecto
2. 2.
   Crear una rama para tu feature ( git checkout -b feature/AmazingFeature )
3. 3.
   Commit tus cambios ( git commit -m 'Add some AmazingFeature' )
4. 4.
   Push a la rama ( git push origin feature/AmazingFeature )
5. 5.
   Abrir un Pull Request
## 📝 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 📞 Contacto
- Desarrollador : David Saboredo
- Email : laruzo_da@hotmail.com
- Proyecto : 
- Demo : 


⭐ ¡No olvides dar una estrella al proyecto si te fue útil!