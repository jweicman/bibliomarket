# BiblioMarket — Guía Completa de Implementación

## Índice

1. [Arquitectura del sistema](#1-arquitectura-del-sistema)
2. [Configuración de la base de datos](#2-configuración-de-la-base-de-datos)
3. [Variables de entorno](#3-variables-de-entorno)
4. [MercadoPago: configuración y flujo](#4-mercadopago-configuración-y-flujo)
5. [OCA e-Pak: integración de envíos](#5-oca-e-pak-integración-de-envíos)
6. [Cloudinary: gestión de imágenes](#6-cloudinary-gestión-de-imágenes)
7. [Despliegue en producción (Vercel + Railway)](#7-despliegue-en-producción-vercel--railway)
8. [Despliegue alternativo (VPS / servidor propio)](#8-despliegue-alternativo-vps--servidor-propio)
9. [Configuración de dominio y SSL](#9-configuración-de-dominio-y-ssl)
10. [Checklist pre-lanzamiento](#10-checklist-pre-lanzamiento)

---

## 1. Arquitectura del sistema

```
┌─────────────────────────────────────────────────┐
│                  CLIENTE (Browser)               │
│           Next.js 14 (React Server Components)   │
└────────────────────┬────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────┐
│              SERVIDOR (Vercel / VPS)             │
│  Next.js API Routes  │  NextAuth.js              │
│  /api/books          │  /api/auth/[...nextauth]  │
│  /api/orders         │  /api/upload              │
│  /api/payments       │  /api/shipping            │
└────┬───────────┬─────┴──────────────────────────┘
     │           │
     ▼           ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│PostgreSQL│  │Cloudinary│  │  Redis   │
│(Railway /│  │(Imágenes)│  │(Caché /  │
│Supabase) │  └──────────┘  │ Sesiones)│
└─────────┘                 └──────────┘
     │
     ▼ webhooks
┌──────────────────────────────────┐
│  MercadoPago API  │  OCA API     │
│  (Pagos)          │  (Envíos)    │
└──────────────────────────────────┘
```

**Stack tecnológico:**

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14, React, TailwindCSS |
| Backend | Next.js API Routes (Node.js) |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | NextAuth.js |
| Pagos | MercadoPago API v2 |
| Envíos | OCA e-Pak Web Service (SOAP) |
| Imágenes | Cloudinary |
| Hosting | Vercel (app) + Railway (DB) |

---

## 2. Configuración de la base de datos

### 2.1 PostgreSQL local (desarrollo)

**Requisitos:** PostgreSQL 15+

```bash
# Instalar PostgreSQL en Ubuntu/Debian
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Iniciar el servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql
```

```sql
-- Dentro de psql
CREATE USER bibliomarket WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE bibliomarket OWNER bibliomarket;
GRANT ALL PRIVILEGES ON DATABASE bibliomarket TO bibliomarket;
\q
```

```bash
# En macOS con Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb bibliomarket
```

### 2.2 PostgreSQL en la nube (producción)

**Opción A: Railway (recomendado)**

1. Ir a https://railway.app y crear cuenta
2. Nuevo proyecto → "Add a service" → "Database" → "PostgreSQL"
3. Copiar la variable `DATABASE_URL` desde el panel
4. Formato: `postgresql://postgres:PASSWORD@HOST:5432/railway`

**Opción B: Supabase (gratuito hasta 500MB)**

1. Ir a https://supabase.com y crear proyecto
2. Settings → Database → Connection String → URI mode
3. Reemplazar `[YOUR-PASSWORD]` con tu contraseña

**Opción C: Neon (serverless, plan gratuito generoso)**

1. Ir a https://neon.tech
2. Crear proyecto → copiar connection string
3. El string incluye pooling para serverless

### 2.3 Ejecutar migraciones

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (copiar de .env.example)
cp .env.example .env
# Editar .env con tus valores

# 3. Generar el cliente de Prisma
npm run db:generate

# 4. Crear las tablas en la DB
npm run db:migrate
# O en producción (sin crear archivos de migración):
npm run db:push

# 5. Cargar datos iniciales (categorías, admin, etc.)
npm run db:seed

# 6. Verificar las tablas
npm run db:studio
# Abre una interfaz web en localhost:5555
```

### 2.4 Esquema de tablas (resumen)

```
users               → Usuarios, perfil, dirección, MercadoPago tokens
books               → Publicaciones de libros
book_images         → Fotos de cada libro (multi-imagen)
categories          → Categorías de libros
orders              → Órdenes de compra
reviews             → Calificaciones post-venta
favorites           → Libros guardados por usuarios
conversations       → Chats entre usuarios
messages            → Mensajes del chat
notifications       → Notificaciones del sistema
accounts            → OAuth accounts (Google, etc.)
sessions            → Sesiones de NextAuth
verification_tokens → Tokens de verificación de email
```

### 2.5 Queries SQL útiles para administración

```sql
-- Ver estadísticas generales
SELECT 
  (SELECT COUNT(*) FROM users) AS total_usuarios,
  (SELECT COUNT(*) FROM books WHERE status = 'ACTIVE') AS libros_activos,
  (SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED') AS ventas_completadas,
  (SELECT SUM(total) FROM orders WHERE payment_status = 'APPROVED') AS facturacion_total;

-- Ver libros más vistos
SELECT title, author, price, views, status
FROM books 
ORDER BY views DESC 
LIMIT 20;

-- Ver ventas por categoría
SELECT c.name, COUNT(o.id) as ventas, SUM(o.total) as total
FROM orders o
JOIN books b ON o.book_id = b.id
JOIN categories c ON b.category_id = c.id
WHERE o.payment_status = 'APPROVED'
GROUP BY c.name
ORDER BY ventas DESC;

-- Ver usuarios con más ventas
SELECT u.name, u.email, COUNT(o.id) as ventas, u.rating
FROM users u
JOIN orders o ON o.seller_id = u.id
WHERE o.status = 'DELIVERED'
GROUP BY u.id, u.name, u.email, u.rating
ORDER BY ventas DESC
LIMIT 20;
```

---

## 3. Variables de entorno

Creá el archivo `.env` en la raíz del proyecto con estos valores:

```env
# ─── DATABASE ────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/bibliomarket?schema=public"

# ─── NEXTAUTH ─────────────────────────────────────────────────────────────────
NEXTAUTH_URL="https://tu-dominio.com.ar"
NEXTAUTH_SECRET="genera-con: openssl rand -base64 32"

# Google OAuth (opcional pero recomendado)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# ─── MERCADO PAGO ─────────────────────────────────────────────────────────────
MP_ACCESS_TOKEN="APP_USR-xxxx"
MP_PUBLIC_KEY="APP_USR-xxxx"
MP_CLIENT_ID="xxxxxxx"
MP_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_MP_PUBLIC_KEY="APP_USR-xxxx"

# ─── CLOUDINARY ───────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="xxxxxxxxxxxx"
CLOUDINARY_API_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"

# ─── OCA ──────────────────────────────────────────────────────────────────────
OCA_USERNAME="tu-usuario"
OCA_PASSWORD="tu-contraseña"
OCA_CUENTA_CORRIENTE="xxxxxxxx"
OCA_OPERATIVA="xxxxxx"
OCA_CUIT="xx-xxxxxxxx-x"

# ─── EMAIL ────────────────────────────────────────────────────────────────────
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="xxxx-xxxx-xxxx-xxxx"  # App password de Google
EMAIL_FROM="BiblioMarket <noreply@bibliomarket.com.ar>"

# ─── APP CONFIG ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://tu-dominio.com.ar"
NEXT_PUBLIC_PLATFORM_FEE_PERCENT="8"
```

---

## 4. MercadoPago: configuración y flujo

### 4.1 Crear aplicación en MercadoPago

1. Ir a https://www.mercadopago.com.ar/developers/
2. "Tus aplicaciones" → "Crear aplicación"
3. Nombre: `BiblioMarket`
4. Solución de pago: **Marketplace** (importante para cobrar comisiones)
5. Producto: Checkout Pro

### 4.2 Obtener credenciales

En el panel de la app:
- **Credentials → Production credentials**
  - `Access Token` → variable `MP_ACCESS_TOKEN`
  - `Public Key` → variable `MP_PUBLIC_KEY`

Para testing usar **Test credentials**.

### 4.3 Flujo de pago

```
Comprador hace clic en "Comprar"
         ↓
POST /api/orders  (crea la orden en nuestra DB)
         ↓
MercadoPago Preference creada
         ↓
Redirect → checkout.mercadopago.com/...
         ↓
Comprador paga (tarjeta, débito, efectivo, etc.)
         ↓
MP llama POST /api/payments/webhook
         ↓
Verificamos el pago → actualizamos DB
         ↓
Notificamos a vendedor y comprador
         ↓
Redirect → /checkout/success (o failure/pending)
```

### 4.4 Configurar webhooks en el panel de MP

1. Panel MP → Tu App → Webhooks
2. URL: `https://tu-dominio.com.ar/api/payments/webhook`
3. Eventos: `payment` ✓

### 4.5 Modo Marketplace (para cobrar comisión)

Para cobrar la comisión del 8% automáticamente necesitás:

1. Habilitar el modo **Marketplace** en tu app
2. Cada vendedor debe autorizar a tu app con OAuth
3. En el código, pasar el `access_token` del vendedor al crear la preferencia

```typescript
// Flujo OAuth para vendedores:
// 1. Redirigir al vendedor a:
const authUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=https://tu-dominio.com.ar/api/auth/mp/callback`

// 2. En el callback, intercambiar código por tokens:
// POST https://api.mercadopago.com/oauth/token
// con grant_type=authorization_code, code=XXX

// 3. Guardar access_token y refresh_token del vendedor en la tabla users
```

**Para comenzar (simplificado):** podés usar tu propio access_token para todos los pagos y distribuir manualmente. Cuando escales, implementar OAuth por vendedor.

---

## 5. OCA e-Pak: integración de envíos

### 5.1 Registrarse como cliente OCA

1. Ir a https://www.oca.com.ar/envios-empresa/oca-e-pak/
2. Contactar a OCA para cuenta corporativa de e-Pak
3. Te darán:
   - Usuario y contraseña del Web Service
   - Número de cuenta corriente
   - Operativa (código de servicio)

### 5.2 Consulta de tarifas (ya implementada)

```typescript
// La función getOCARate en src/lib/oca.ts hace:
// GET /api/shipping/oca-rate?cpOrigen=1234&cpDestino=5678&peso=1

// Ejemplo de uso en el frontend:
const rates = await fetch(
  `/api/shipping/oca-rate?cpOrigen=${sellerCP}&cpDestino=${buyerCP}&peso=1`
).then(r => r.json())
```

### 5.3 Dimensiones estándar para libros

```typescript
// Configuración por defecto para libros
const BOOK_PACKAGE = {
  alto: 20,    // cm
  ancho: 20,   // cm  
  largo: 5,    // cm (para 1-2 libros)
  peso: 1,     // kg
}
// Para packs de libros, ajustar dinámicamente
```

### 5.4 Flujo de envío OCA

```
Pago confirmado por MP webhook
         ↓
createOCAShipment() llamado automáticamente
         ↓
OCA genera número de guía
         ↓
Guardamos guía en order.ocaGuideNumber
         ↓
Vendedor imprime etiqueta en oca.com.ar
         ↓
Vendedor lleva el paquete a sucursal OCA
         ↓
Comprador puede trackear en oca.com.ar con el número
```

### 5.5 Imprimir etiqueta

Dirigir al vendedor a:
```
https://www.oca.com.ar/ocaepak/TrackingWebSite/ImprimirEtiqueta.asp?nroguia=NUMERO_GUIA
```

---

## 6. Cloudinary: gestión de imágenes

### 6.1 Crear cuenta

1. Ir a https://cloudinary.com (plan Free: 25GB storage, 25GB bandwidth/mes)
2. Dashboard → API Keys → copiar Cloud name, API Key, API Secret

### 6.2 Configurar transformaciones automáticas

Las imágenes de libros se optimizan automáticamente al subir:

```typescript
// En src/app/api/upload/route.ts ya está configurado:
transformation: [
  { width: 1200, height: 1600, crop: 'limit' },   // Max size
  { quality: 'auto', fetch_format: 'auto' },       // Auto WebP/AVIF
]
```

### 6.3 Política de seguridad

Configura en Cloudinary → Settings → Upload:
- Upload preset: `restricted` (no permite uploads sin autenticación)
- Folder structure: `bibliomarket/books/{userId}/`

---

## 7. Despliegue en producción (Vercel + Railway)

### 7.1 Railway (base de datos)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway new

# 4. Agregar PostgreSQL
railway add --plugin postgresql

# 5. Ver URL de conexión
railway variables
```

### 7.2 Vercel (aplicación Next.js)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. En la raíz del proyecto
vercel

# Seguir las instrucciones:
# - Linked to project: bibliomarket
# - Framework: Next.js (auto-detectado)

# 3. Configurar variables de entorno
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... (todas las variables del .env)

# 4. Deployar a producción
vercel --prod
```

También podés conectar tu repositorio de GitHub a Vercel para deploys automáticos:
1. https://vercel.com/new
2. Import Git Repository
3. Configurar env variables en el panel

### 7.3 Ejecutar migraciones en producción

```bash
# Con Railway CLI
railway run npm run db:push
railway run npm run db:seed

# O directo con psql:
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npx prisma db seed
```

---

## 8. Despliegue alternativo (VPS / servidor propio)

Para hostear en un servidor Ubuntu propio (DigitalOcean, Linode, etc.):

### 8.1 Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (process manager)
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx
```

### 8.2 Configurar PostgreSQL

```bash
sudo -u postgres psql

CREATE USER bibliomarket WITH PASSWORD 'password_muy_seguro_123!';
CREATE DATABASE bibliomarket OWNER bibliomarket;
GRANT ALL PRIVILEGES ON DATABASE bibliomarket TO bibliomarket;
\q
```

### 8.3 Clonar y configurar la app

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/bibliomarket.git /var/www/bibliomarket
cd /var/www/bibliomarket

# Instalar dependencias
npm install

# Copiar y configurar .env
cp .env.example .env
nano .env  # editar con los valores correctos

# Generar Prisma client y migrar DB
npm run db:generate
npm run db:push
npm run db:seed

# Build de producción
npm run build
```

### 8.4 Configurar PM2

```bash
# Iniciar la aplicación
pm2 start npm --name "bibliomarket" -- start

# Configurar para reinicio automático
pm2 startup
pm2 save

# Ver logs
pm2 logs bibliomarket

# Reiniciar
pm2 restart bibliomarket
```

### 8.5 Configurar Nginx como reverse proxy

```bash
sudo nano /etc/nginx/sites-available/bibliomarket
```

```nginx
server {
    listen 80;
    server_name bibliomarket.com.ar www.bibliomarket.com.ar;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bibliomarket.com.ar www.bibliomarket.com.ar;

    # SSL (configurar con Certbot)
    ssl_certificate /etc/letsencrypt/live/bibliomarket.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bibliomarket.com.ar/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Max upload size (para fotos de libros)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/bibliomarket /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. Configuración de dominio y SSL

### 9.1 DNS (en tu registrador de dominio)

Agregar estos registros DNS:

```
Tipo    Nombre    Valor
A       @         IP-DE-TU-SERVIDOR
A       www       IP-DE-TU-SERVIDOR
CNAME   www       bibliomarket.com.ar  (alternativa)
```

Si usás Vercel, agregar el CNAME que te proporciona:
```
CNAME   @         cname.vercel-dns.com
```

### 9.2 SSL con Let's Encrypt (servidor propio)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d bibliomarket.com.ar -d www.bibliomarket.com.ar

# Renovación automática (ya configurada por Certbot)
sudo crontab -l
# 0 0 * * * /usr/bin/certbot renew --quiet
```

### 9.3 Email corporativo (recomendado)

Para usar `soporte@bibliomarket.com.ar`:
1. Registrar en Google Workspace (~$6/mes) o Zoho Mail (gratis)
2. Configurar registros MX en tu dominio
3. Crear App Password para SMTP y usar en `EMAIL_SERVER_PASSWORD`

---

## 10. Checklist pre-lanzamiento

### Base de datos
- [ ] PostgreSQL configurado y accesible
- [ ] Migraciones ejecutadas (`db:push`)
- [ ] Categorías creadas (`db:seed`)
- [ ] Backup automático configurado

### Variables de entorno
- [ ] `.env` completo en producción
- [ ] `NEXTAUTH_SECRET` generado (≥32 caracteres)
- [ ] `NEXTAUTH_URL` apunta al dominio real
- [ ] Todas las claves de APIs configuradas

### MercadoPago
- [ ] Cuenta MP verificada con CUIT/CUIL
- [ ] App creada en el panel de developers
- [ ] Credenciales de PRODUCCIÓN cargadas (no test)
- [ ] Webhook configurado apuntando a tu dominio
- [ ] Probado con una compra real de bajo monto

### OCA
- [ ] Cuenta corporativa activa
- [ ] Credenciales del Web Service recibidas
- [ ] Número de cuenta corriente configurado
- [ ] Probado con una consulta de tarifa

### Cloudinary
- [ ] Cuenta creada
- [ ] Credenciales configuradas
- [ ] Probada la subida de una imagen

### Seguridad
- [ ] HTTPS habilitado
- [ ] Headers de seguridad configurados en Nginx
- [ ] Rate limiting en las APIs
- [ ] Validación de webhooks de MP implementada

### Google OAuth (opcional)
- [ ] Proyecto en Google Cloud Console
- [ ] API de OAuth configurada
- [ ] Dominio agregado a los origins autorizados
- [ ] Redirect URI: `https://tu-dominio.com.ar/api/auth/callback/google`

### SEO y legales
- [ ] Términos y condiciones redactados
- [ ] Política de privacidad (requerida por MercadoPago)
- [ ] robots.txt configurado
- [ ] sitemap.xml generado
- [ ] Google Analytics / Search Console configurado

### Performance
- [ ] Build de producción (`npm run build`) sin errores
- [ ] Imágenes optimizadas con Next.js Image
- [ ] CDN para assets estáticos (Vercel lo hace automáticamente)
- [ ] Tiempo de carga < 3s en mobile

---

## Comandos de referencia rápida

```bash
# Desarrollo
npm run dev              # Iniciar en modo dev (puerto 3000)
npm run db:studio        # Interfaz visual de la DB

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Aplicar schema sin migraciones
npm run db:migrate       # Crear y aplicar migración
npm run db:seed          # Cargar datos iniciales

# Producción
npm run build            # Build optimizado
npm run start            # Iniciar servidor de producción
pm2 restart bibliomarket # Reiniciar en VPS
vercel --prod            # Deploy a Vercel

# Logs y monitoreo
pm2 logs bibliomarket    # Ver logs en tiempo real
pm2 monit                # Monitor de recursos
```

---

*Generado por BiblioMarket Dev Setup — Versión 1.0*
