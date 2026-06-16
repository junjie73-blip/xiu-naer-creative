import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { seedDatabase } from './seed.js'

// Vercel Serverless Functions 没有持久化磁盘，使用 /tmp 存放 SQLite
if (process.env.VERCEL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:/tmp/dev.db'
}

// 在 Vercel 冷启动时自动部署迁移并写入种子数据
if (process.env.VERCEL) {
  try {
    execSync('npx prisma migrate deploy', { stdio: 'ignore' })
  } catch (e) {
    console.error('Failed to deploy migrations', e)
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

if (process.env.VERCEL) {
  seedDatabase(prisma).catch((e) => console.error('Failed to seed database', e))
}
