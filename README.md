# BiblioMarket 📚

Marketplace de libros usados para Argentina. Comprá y vendé libros de forma segura con MercadoPago y envíos por OCA.

## Stack

- **Framework**: Next.js 14 (App Router + React Server Components)
- **Base de datos**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (email/password + Google OAuth)
- **Pagos**: MercadoPago API v2 (Checkout Pro + Marketplace)
- **Envíos**: OCA e-Pak Web Service (SOAP)
- **Imágenes**: Cloudinary
- **Estilos**: TailwindCSS

## Inicio rápido

```bash
# 1. Clonar e instalar
git clone https://github.com/tu-usuario/bibliomarket.git
cd bibliomarket
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Configurar base de datos
npm run db:generate
npm run db:push
npm run db:seed

# 4. Iniciar en desarrollo
npm run dev
```

Abrir http://localhost:3000

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── auth/           # NextAuth + registro
│   │   ├── books/          # CRUD libros + favoritos
│   │   ├── orders/         # Órdenes de compra
│   │   ├── payments/       # Webhook MercadoPago
│   │   ├── reviews/        # Calificaciones
│   │   ├── shipping/       # Tarifas OCA
│   │   ├── upload/         # Subida de imágenes
│   │   └── users/          # Perfil de usuario
│   ├── auth/               # Login / Registro
│   ├── calificar/          # Calificar vendedor post-compra
│   ├── checkout/           # Success / Failure / Pending
│   ├── dashboard/          # Panel del usuario
│   │   ├── compras/        # Historial de compras
│   │   ├── favoritos/      # Libros guardados
│   │   ├── mis-libros/     # Publicaciones propias
│   │   ├── perfil/         # Configuración de perfil
│   │   └── ventas/         # Gestión de ventas
│   ├── libros/             # Listado y detalle de libros
│   ├── vendedor/           # Perfil público de vendedores
│   └── vender/             # Publicar / editar libros
├── components/             # Componentes React
│   ├── books/              # BookCard, BookDetail, etc.
│   ├── dashboard/          # Componentes del panel
│   ├── home/               # Hero, CategoryGrid, etc.
│   └── layout/             # Navbar, Footer
├── lib/                    # Utilidades y servicios
│   ├── auth.ts             # Configuración NextAuth
│   ├── mercadopago.ts      # Integración MP
│   ├── oca.ts              # Integración OCA
│   └── prisma.ts           # Cliente Prisma
└── types/                  # TypeScript types
prisma/
├── schema.prisma           # Esquema de base de datos
└── seed.ts                 # Datos iniciales
docs/
└── GUIA-IMPLEMENTACION.md  # Guía completa de deploy
```

## Flujo de pago

```
Usuario → Comprar → POST /api/orders → MercadoPago Preference
→ Redirect MP → Pago → Webhook /api/payments/webhook
→ Actualizar DB → Notificar → Redirect /checkout/success
```

## Comisión de la plataforma

La plataforma cobra un **8%** sobre el precio de venta (configurable en `NEXT_PUBLIC_PLATFORM_FEE_PERCENT`). Se descuenta automáticamente del pago recibido via MercadoPago Marketplace.

## Variables de entorno requeridas

Ver `.env.example` para la lista completa. Las mínimas para desarrollo:

```env
DATABASE_URL=           # PostgreSQL connection string
NEXTAUTH_SECRET=        # String aleatorio ≥32 chars
NEXTAUTH_URL=           # http://localhost:3000
MP_ACCESS_TOKEN=        # MercadoPago access token
MP_PUBLIC_KEY=          # MercadoPago public key
CLOUDINARY_CLOUD_NAME=  # Cloudinary cloud name
CLOUDINARY_API_KEY=     # Cloudinary API key
CLOUDINARY_API_SECRET=  # Cloudinary API secret
```

## Deploy

Ver `docs/GUIA-IMPLEMENTACION.md` para instrucciones detalladas de:
- PostgreSQL (Railway / Supabase / VPS)
- Deploy en Vercel
- Deploy en VPS con Nginx + PM2
- Configuración de MercadoPago webhooks
- Integración OCA e-Pak

## Licencia

MIT
