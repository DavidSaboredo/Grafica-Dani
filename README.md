# 🎨 D-Print Digital

**Tienda online para gráficas e imprentas: tu catálogo se actualiza desde una planilla de Google Sheets y los pedidos te llegan por WhatsApp.**

![Vista previa de D-Print Digital](docs/preview.jpg)

🔗 [Ver en vivo](https://grafica-dani.vercel.app)

## ¿Qué problema resuelve?

Manejar precios y stock en una planilla y después tener que pasárselos a mano a la web (o mandar listas de precios por chat) es lento y lleno de errores. Con D-Print Digital editás tu planilla de Google Sheets como siempre y la tienda se actualiza sola: sin panel complicado y sin depender de un programador para cambiar un precio. El cliente arma su pedido y te lo envía listo por WhatsApp.

## Funcionalidades

- Catálogo de productos cargado desde Google Sheets (nombre, precio, stock, categoría e imagen).
- Categorías y buscador de productos.
- Carrito de compras con control de stock para no vender de más.
- Formulario de pedido que genera un mensaje listo para enviar por WhatsApp.
- Diseño adaptable a celular y escritorio.

## Tecnologías

Next.js, React, TypeScript, Tailwind CSS, Google Sheets API (googleapis) y desplegado en Vercel.

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env.local   # credenciales de Google, GOOGLE_SHEET_ID y WHATSAPP_NUMBER
npm run dev
```

Se abre en http://localhost:3000. La hoja de cálculo debe tener las columnas: ID, Nombre, Precio, Stock, Categoría, Imagen, y estar compartida con el email de la cuenta de servicio de Google.

## ¿Querés una web así para tu negocio?

Desarrollo webs y sistemas a medida para comercios y emprendimientos. Escribime o mirá mis otros proyectos en [github.com/DavidSaboredo](https://github.com/DavidSaboredo).
