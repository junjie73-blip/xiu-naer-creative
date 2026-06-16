import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

/**
 * 看板统计
 * GET /api/admin/dashboard
 */
router.get('/dashboard', async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayCount, pendingCount, completedCount, totalCount, ratingAgg, staffCount] =
      await Promise.all([
        prisma.repairOrder.count({ where: { createdAt: { gte: today } } }),
        prisma.repairOrder.count({
          where: { status: { in: ['submitted', 'accepted', 'processing'] } },
        }),
        prisma.repairOrder.count({ where: { status: 'completed' } }),
        prisma.repairOrder.count(),
        prisma.review.aggregate({ _avg: { rating: true } }),
        prisma.user.count({ where: { role: 'staff', status: 'active' } }),
      ])

    res.json({
      code: 0,
      message: 'success',
      data: {
        todayCount,
        pendingCount,
        completedCount,
        totalCount,
        avgRating: Number(ratingAgg._avg.rating?.toFixed(1)) || 0,
        staffCount,
      },
    })
  } catch (error) {
    console.error('Dashboard failed:', error)
    res.status(500).json({ code: 500, message: '看板数据查询失败', data: null })
  }
})

/**
 * 工单趋势
 * GET /api/admin/reports/trend?days=7
 */
router.get('/reports/trend', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = Number(req.query.days) || 7
    const result: { date: string; count: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.repairOrder.count({
        where: { createdAt: { gte: date, lt: nextDate } },
      })

      result.push({
        date: date.toISOString().slice(0, 10),
        count,
      })
    }

    res.json({ code: 0, message: 'success', data: result })
  } catch (error) {
    console.error('Trend report failed:', error)
    res.status(500).json({ code: 500, message: '趋势报表查询失败', data: null })
  }
})

/**
 * 分类占比
 * GET /api/admin/reports/category
 */
router.get('/reports/category', async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.repairOrder.groupBy({
      by: ['category'],
      _count: { category: true },
    })

    res.json({
      code: 0,
      message: 'success',
      data: orders.map((item) => ({
        category: item.category,
        count: item._count.category,
      })),
    })
  } catch (error) {
    console.error('Category report failed:', error)
    res.status(500).json({ code: 500, message: '分类报表查询失败', data: null })
  }
})

/**
 * 满意度分布
 * GET /api/admin/reports/rating
 */
router.get('/reports/rating', async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.groupBy({
      by: ['rating'],
      _count: { rating: true },
    })

    const distribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews.find((r) => r.rating === rating)?._count.rating || 0,
    }))

    res.json({ code: 0, message: 'success', data: distribution })
  } catch (error) {
    console.error('Rating report failed:', error)
    res.status(500).json({ code: 500, message: '满意度报表查询失败', data: null })
  }
})

export default router
