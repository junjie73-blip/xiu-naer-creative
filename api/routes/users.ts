import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query as { role?: string }
    const where: Record<string, unknown> = {}
    if (role) {
      where.role = role
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json({ code: 0, message: 'success', data: users })
  } catch (error) {
    console.error('List users failed:', error)
    res.status(500).json({ code: 500, message: '查询人员失败', data: null })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) {
      res.status(404).json({ code: 404, message: '人员不存在', data: null })
      return
    }
    res.json({ code: 0, message: 'success', data: user })
  } catch (error) {
    console.error('Get user failed:', error)
    res.status(500).json({ code: 500, message: '查询人员失败', data: null })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role, name, phone, status } = req.body
    if (!username || !password || !name) {
      res.status(400).json({ code: 400, message: '缺少必要参数', data: null })
      return
    }

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: password,
        role: role || 'staff',
        name,
        phone,
        status: status || 'active',
      },
    })
    res.json({ code: 0, message: 'success', data: user })
  } catch (error) {
    console.error('Create user failed:', error)
    res.status(400).json({ code: 400, message: '用户名已存在或参数错误', data: null })
  }
})

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role, name, phone, status } = req.body
    const data: Record<string, unknown> = { username, role, name, phone, status }
    if (password) {
      data.passwordHash = password
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
    })
    res.json({ code: 0, message: 'success', data: user })
  } catch (error) {
    console.error('Update user failed:', error)
    res.status(500).json({ code: 500, message: '更新人员失败', data: null })
  }
})

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ code: 0, message: 'success', data: null })
  } catch (error) {
    console.error('Delete user failed:', error)
    res.status(500).json({ code: 500, message: '删除人员失败', data: null })
  }
})

export default router
