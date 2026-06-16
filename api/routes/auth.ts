import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

/**
 * 管理员/维修人员登录
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as { username?: string; password?: string }

    if (!username || !password) {
      res.status(400).json({ code: 400, message: '缺少账号或密码', data: null })
      return
    }

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user || user.passwordHash !== password || user.status !== 'active') {
      res.status(401).json({ code: 401, message: '账号或密码错误', data: null })
      return
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Login failed:', error)
    res.status(500).json({ code: 500, message: '登录失败', data: null })
  }
})

export default router
