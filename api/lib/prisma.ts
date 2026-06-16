import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const TMP_DB_PATH = '/tmp/dev.db'
const BUNDLED_DB_PATH = path.join(process.cwd(), 'prisma/dev.db')

// Vercel Serverless Functions 没有持久化磁盘，使用 /tmp 存放 SQLite
if (process.env.VERCEL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${TMP_DB_PATH}`
}

// 冷启动时把构建阶段生成并打包进来的数据库复制到可写的 /tmp
if (process.env.VERCEL) {
  try {
    if (!fs.existsSync(TMP_DB_PATH) && fs.existsSync(BUNDLED_DB_PATH)) {
      fs.copyFileSync(BUNDLED_DB_PATH, TMP_DB_PATH)
    }
  } catch (e) {
    console.error('Failed to copy bundled database', e)
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
