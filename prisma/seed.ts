import { PrismaClient, BookCondition, ShippingMode } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Categories ────────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Derecho', slug: 'derecho', icon: '⚖️', color: '#1e3a5f' },
    { name: 'Medicina', slug: 'medicina', icon: '🏥', color: '#6b2f3e' },
    { name: 'Ingeniería', slug: 'ingenieria', icon: '⚙️', color: '#2d4a3e' },
    { name: 'Literatura', slug: 'literatura', icon: '📖', color: '#4a2d6b' },
    { name: 'Historia', slug: 'historia', icon: '🏛️', color: '#5c3d1e' },
    { name: 'Filosofía', slug: 'filosofia', icon: '🔍', color: '#2d3d5c' },
    { name: 'Economía', slug: 'economia', icon: '📊', color: '#1e4a2d' },
    { name: 'Psicología', slug: 'psicologia', icon: '🧠', color: '#4a1e4a' },
    { name: 'Ciencias', slug: 'ciencias', icon: '🔬', color: '#1e3d4a' },
    { name: 'Arte y Diseño', slug: 'arte-diseno', icon: '🎨', color: '#4a3d1e' },
    { name: 'Idiomas', slug: 'idiomas', icon: '🌍', color: '#1e4a3d' },
    { name: 'Informática', slug: 'informatica', icon: '💻', color: '#1e2d4a' },
    { name: 'Arquitectura', slug: 'arquitectura', icon: '🏗️', color: '#3d2d1e' },
    { name: 'Educación', slug: 'educacion', icon: '🎓', color: '#2d4a1e' },
    { name: 'Infantil', slug: 'infantil', icon: '🌈', color: '#4a1e2d' },
    { name: 'Otros', slug: 'otros', icon: '📚', color: '#3d3d3d' },
  ]

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log(`✅ ${categoryData.length} categorías creadas`)

  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12)
  await prisma.user.upsert({
    where: { email: 'admin@bibliomarket.com.ar' },
    update: {},
    create: {
      name: 'Admin BiblioMarket',
      email: 'admin@bibliomarket.com.ar',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      city: 'Buenos Aires',
      province: 'Buenos Aires',
    },
  })
  console.log('✅ Admin creado: admin@bibliomarket.com.ar / Admin1234!')

  // ─── Demo user ─────────────────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash('Demo1234!', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@bibliomarket.com.ar' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'demo@bibliomarket.com.ar',
      password: demoPassword,
      rating: 4.7,
      totalRatings: 23,
      city: 'Córdoba',
      province: 'Córdoba',
      postalCode: '5000',
      isVerified: true,
    },
  })
  console.log('✅ Demo creado: demo@bibliomarket.com.ar / Demo1234!')

  // ─── Demo books ────────────────────────────────────────────────────────────
  const derecho = await prisma.category.findUnique({ where: { slug: 'derecho' } })
  const literatura = await prisma.category.findUnique({ where: { slug: 'literatura' } })
  const informatica = await prisma.category.findUnique({ where: { slug: 'informatica' } })

  if (!derecho || !literatura || !informatica) {
    console.error('❌ No se encontraron las categorías necesarias')
    return
  }

  // Delete existing demo books to avoid duplicates
  await prisma.book.deleteMany({ where: { sellerId: demo.id } })

  const books = [
    {
      title: 'Código Civil y Comercial de la Nación',
      author: 'Ricardo Lorenzetti',
      price: 4500,
      originalPrice: 8900,
      condition: BookCondition.GOOD,
      categoryId: derecho.id,
      description: 'Edición 2023 comentada. Algunas páginas subrayadas con lápiz.',
      shippingModes: [ShippingMode.OCA_E_PAK, ShippingMode.OCA_SUCURSAL],
      shippingCost: 1800,
    },
    {
      title: 'El Aleph',
      author: 'Jorge Luis Borges',
      price: 1200,
      condition: BookCondition.LIKE_NEW,
      categoryId: literatura.id,
      description: 'Edición de Emecé. Estado impecable.',
      shippingModes: [ShippingMode.OCA_E_PAK, ShippingMode.PERSONAL_DELIVERY],
      shippingCost: 1200,
    },
    {
      title: 'Ficciones',
      author: 'Jorge Luis Borges',
      price: 1400,
      originalPrice: 2800,
      condition: BookCondition.GOOD,
      categoryId: literatura.id,
      description: 'Tapa dura. Algunas marcas de uso menores.',
      shippingModes: [ShippingMode.OCA_E_PAK],
      shippingCost: 1200,
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      price: 5500,
      originalPrice: 9000,
      condition: BookCondition.LIKE_NEW,
      categoryId: informatica.id,
      description: 'En inglés. Edición original. Casi sin uso.',
      shippingModes: [ShippingMode.OCA_E_PAK, ShippingMode.OCA_SUCURSAL],
      shippingCost: 1800,
    },
  ]

  for (const bookData of books) {
    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        price: bookData.price,
        originalPrice: bookData.originalPrice,
        condition: bookData.condition,
        description: bookData.description,
        shippingModes: bookData.shippingModes,
        shippingCost: bookData.shippingCost,
        city: demo.city,
        province: demo.province,
        seller: {
          connect: { id: demo.id },
        },
        category: {
          connect: { id: bookData.categoryId },
        },
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
              order: 0,
            },
          ],
        },
      },
    })
    console.log(`  📚 "${book.title}" creado`)
  }

  console.log('\n🎉 Seed completado!')
  console.log('─────────────────────────────────')
  console.log('Usuarios de prueba:')
  console.log('  Admin:  admin@bibliomarket.com.ar / Admin1234!')
  console.log('  Demo:   demo@bibliomarket.com.ar  / Demo1234!')
  console.log('─────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
