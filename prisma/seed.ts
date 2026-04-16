import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_SKU_PREFIX = 'SEED-';

/** Tiers: qty 1–11 → base price; 12–49 → −5%; 50+ → −10% (highest applicable tier wins at runtime). */
const STANDARD_VOLUME_TIERS = [
  { minQuantity: 12, discountRate: 0.05 },
  { minQuantity: 50, discountRate: 0.1 },
] as const;

async function main(): Promise<void> {
  await prisma.product.deleteMany({
    where: { sku: { startsWith: SEED_SKU_PREFIX } },
  });

  const valves = await prisma.category.upsert({
    where: { name: 'Válvulas' },
    create: { name: 'Válvulas' },
    update: {},
  });
  const connections = await prisma.category.upsert({
    where: { name: 'Conexiones' },
    create: { name: 'Conexiones' },
    update: {},
  });
  const pipes = await prisma.category.upsert({
    where: { name: 'Tuberías' },
    create: { name: 'Tuberías' },
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
      volumeDiscounts: { create: [...STANDARD_VOLUME_TIERS] },
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
      volumeDiscounts: { create: [...STANDARD_VOLUME_TIERS] },
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
      volumeDiscounts: { create: [...STANDARD_VOLUME_TIERS] },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Te PVC 90° 63 mm',
      sku: `${SEED_SKU_PREFIX}CONN-TE-63`,
      description: 'Derivación encolar, PN10.',
      basePrice: 5.4,
      stock: 900,
      categoryId: connections.id,
      volumeDiscounts: { create: [...STANDARD_VOLUME_TIERS] },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Unión americana hierro galvanizado 2"',
      sku: `${SEED_SKU_PREFIX}CONN-UNI-2`,
      description: 'Rosca NPT, incluye juntas.',
      basePrice: 18.75,
      stock: 260,
      categoryId: connections.id,
      volumeDiscounts: { create: [...STANDARD_VOLUME_TIERS] },
    },
  });

  console.log(
    'Seed completed: categories Válvulas, Conexiones, Tuberías; 5 products with volume tiers (12+ → 5%, 50+ → 10%).',
  );
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
