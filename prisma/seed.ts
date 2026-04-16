import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_SKU_PREFIX = 'SEED-';

async function main(): Promise<void> {
  await prisma.product.deleteMany({
    where: { sku: { startsWith: SEED_SKU_PREFIX } },
  });

  const valves = await prisma.category.upsert({
    where: { name: 'Válvulas' },
    create: { name: 'Válvulas' },
    update: {},
  });
  const pipes = await prisma.category.upsert({
    where: { name: 'Tuberías' },
    create: { name: 'Tuberías' },
    update: {},
  });
  const fittings = await prisma.category.upsert({
    where: { name: 'Accesorios' },
    create: { name: 'Accesorios' },
    update: {},
  });

  await prisma.product.create({
    data: {
      name: 'Válvula de compuerta 4" clase 125',
      sku: `${SEED_SKU_PREFIX}VAL-GATE-4`,
      description: 'Hierro dúctil, brida ANSI, uso agua potable.',
      basePrice: 420.0,
      stock: 80,
      categoryId: valves.id,
      volumeDiscounts: {
        create: [
          { minQuantity: 5, discountRate: 0.03 },
          { minQuantity: 15, discountRate: 0.07 },
          { minQuantity: 40, discountRate: 0.12 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Válvula de retención swing PVC 2"',
      sku: `${SEED_SKU_PREFIX}VAL-CHECK-2`,
      description: 'Retención horizontal/vertical, presión máx. 150 PSI.',
      basePrice: 48.5,
      stock: 200,
      categoryId: valves.id,
      volumeDiscounts: {
        create: [
          { minQuantity: 10, discountRate: 0.05 },
          { minQuantity: 50, discountRate: 0.1 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Tubería PVC presión 110 mm x 6 m',
      sku: `${SEED_SKU_PREFIX}PIPE-PVC-110`,
      description: 'Serie 7.5, extremo campana y empaque de goma.',
      basePrice: 62.0,
      stock: 350,
      categoryId: pipes.id,
      volumeDiscounts: {
        create: [
          { minQuantity: 20, discountRate: 0.04 },
          { minQuantity: 100, discountRate: 0.09 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Codo PVC 90° 63 mm',
      sku: `${SEED_SKU_PREFIX}FIT-ELB-63`,
      description: 'Encolar, presión PN10.',
      basePrice: 3.2,
      stock: 1200,
      categoryId: fittings.id,
      volumeDiscounts: {
        create: [
          { minQuantity: 50, discountRate: 0.06 },
          { minQuantity: 200, discountRate: 0.12 },
          { minQuantity: 500, discountRate: 0.18 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Unión americana hierro galvanizado 2"',
      sku: `${SEED_SKU_PREFIX}FIT-UNI-2`,
      description: 'Rosca NPT, incluye juntas.',
      basePrice: 18.75,
      stock: 260,
      categoryId: fittings.id,
      volumeDiscounts: {
        create: [
          { minQuantity: 8, discountRate: 0.025 },
          { minQuantity: 24, discountRate: 0.055 },
        ],
      },
    },
  });

  console.log('Seed completed: 3 categories (upsert) and 5 products with volume discounts.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
