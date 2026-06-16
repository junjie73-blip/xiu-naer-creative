import { prisma } from '../lib/prisma.js'

async function main() {
  await prisma.community.upsert({
    where: { id: 'demo-community' },
    update: {
      address: '阳光街 88 号',
      contactName: '王物业',
      contactPhone: '010-12345678',
    },
    create: {
      id: 'demo-community',
      name: '阳光花园小区',
      region: '北京市朝阳区',
      address: '阳光街 88 号',
      contactName: '王物业',
      contactPhone: '010-12345678',
      qrCode: '',
    },
  })

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: 'admin',
      role: 'admin',
      name: '系统管理员',
      phone: '13800000000',
    },
  })

  await prisma.user.upsert({
    where: { username: 'staff1' },
    update: {},
    create: {
      username: 'staff1',
      passwordHash: 'staff1',
      role: 'staff',
      name: '张师傅',
      phone: '13800000001',
    },
  })

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
