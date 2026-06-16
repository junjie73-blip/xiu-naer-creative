import { prisma } from '../lib/prisma.js'
import { seedDatabase } from '../lib/seed.js'

async function main() {
  await seedDatabase(prisma)
  console.log('Seed completed: demo community, admin and staff created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
