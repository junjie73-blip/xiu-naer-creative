import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const communities = await prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json({ code: 0, message: 'success', data: communities })
  } catch (error) {
    console.error('List communities failed:', error)
    res.status(500).json({ code: 500, message: '查询社区失败', data: null })
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id },
    })
    if (!community) {
      res.status(404).json({ code: 404, message: '社区不存在', data: null })
      return
    }
    res.json({ code: 0, message: 'success', data: community })
  } catch (error) {
    console.error('Get community failed:', error)
    res.status(500).json({ code: 500, message: '查询社区失败', data: null })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, region, address, contactName, contactPhone, qrCode } = req.body
    if (!name) {
      res.status(400).json({ code: 400, message: '社区名称必填', data: null })
      return
    }

    const community = await prisma.community.create({
      data: { name, region, address, contactName, contactPhone, qrCode },
    })
    res.json({ code: 0, message: 'success', data: community })
  } catch (error) {
    console.error('Create community failed:', error)
    res.status(500).json({ code: 500, message: '创建社区失败', data: null })
  }
})

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, region, address, contactName, contactPhone, qrCode } = req.body
    const community = await prisma.community.update({
      where: { id: req.params.id },
      data: { name, region, address, contactName, contactPhone, qrCode },
    })
    res.json({ code: 0, message: 'success', data: community })
  } catch (error) {
    console.error('Update community failed:', error)
    res.status(500).json({ code: 500, message: '更新社区失败', data: null })
  }
})

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.community.delete({ where: { id: req.params.id } })
    res.json({ code: 0, message: 'success', data: null })
  } catch (error) {
    console.error('Delete community failed:', error)
    res.status(500).json({ code: 500, message: '删除社区失败', data: null })
  }
})

export default router
