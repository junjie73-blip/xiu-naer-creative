import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { classifyRepairIssue } from '../services/aiClassifier.js'

const router = Router()

const STATUS_LABELS: Record<string, string> = {
  submitted: '已提交',
  accepted: '已受理',
  processing: '处理中',
  pending_review: '待验收',
  completed: '已完成',
  escalated: '已升级',
}

const SEVERITY_DEADLINE_HOURS: Record<string, number> = {
  general: 72,
  urgent: 24,
  critical: 4,
}

/**
 * 创建报修工单
 * POST /api/repair-orders
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      communityId,
      reporterPhone,
      contactName,
      building,
      unit,
      location,
      preferredTime,
      isUrgent,
      images,
      description,
      lat,
      lng,
    } = req.body as {
      communityId?: string
      reporterPhone?: string
      contactName?: string
      building?: string
      unit?: string
      location?: string
      preferredTime?: string
      isUrgent?: boolean
      images?: string[]
      description?: string
      lat?: number
      lng?: number
    }

    if (!communityId || !reporterPhone || !description) {
      res.status(400).json({
        code: 400,
        message: '缺少必要参数',
        data: null,
      })
      return
    }

    const aiResult = classifyRepairIssue(description)
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + SEVERITY_DEADLINE_HOURS[aiResult.severity])

    const order = await prisma.repairOrder.create({
      data: {
        communityId,
        reporterPhone,
        contactName,
        building,
        unit,
        location,
        preferredTime: preferredTime ? new Date(preferredTime) : null,
        isUrgent: !!isUrgent,
        category: aiResult.category,
        severity: isUrgent ? 'urgent' : aiResult.severity,
        status: 'submitted',
        description,
        lat,
        lng,
        deadline,
      },
    })

    await prisma.timelineEvent.create({
      data: {
        orderId: order.id,
        status: 'submitted',
        remark: `AI 识别为「${aiResult.category}」，严重度「${aiResult.severity}」`,
      },
    })

    if (images && images.length > 0) {
      await prisma.repairAttachment.createMany({
        data: images.map((url) => ({
          orderId: order.id,
          url,
        })),
      })
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        orderId: order.id,
        category: aiResult.category,
        severity: aiResult.severity,
        status: order.status,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error('Create order failed:', error)
    res.status(500).json({ code: 500, message: '创建工单失败', data: null })
  }
})

/**
 * 查询工单详情
 * GET /api/repair-orders/:orderId
 */
router.get('/:orderId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params

    const order = await prisma.repairOrder.findUnique({
      where: { id: orderId },
      include: {
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        review: true,
        community: true,
      },
    })

    if (!order) {
      res.status(404).json({ code: 404, message: '工单不存在', data: null })
      return
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        ...order,
        statusLabel: STATUS_LABELS[order.status] || order.status,
      },
    })
  } catch (error) {
    console.error('Get order failed:', error)
    res.status(500).json({ code: 500, message: '查询工单失败', data: null })
  }
})

/**
 * 派单
 * PATCH /api/repair-orders/:orderId/assign
 */
router.patch('/:orderId/assign', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { handlerId, operatorName } = req.body as { handlerId?: string; operatorName?: string }

    if (!handlerId) {
      res.status(400).json({ code: 400, message: '缺少处理人员', data: null })
      return
    }

    const staff = await prisma.user.findUnique({ where: { id: handlerId } })
    if (!staff) {
      res.status(404).json({ code: 404, message: '处理人员不存在', data: null })
      return
    }

    const updated = await prisma.repairOrder.update({
      where: { id: orderId },
      data: { handlerId, status: 'accepted' },
    })

    await prisma.timelineEvent.create({
      data: {
        orderId,
        status: 'accepted',
        remark: `已派单给 ${staff.name}`,
        operatorId: handlerId,
        operatorName: operatorName || '系统管理员',
      },
    })

    res.json({
      code: 0,
      message: 'success',
      data: updated,
    })
  } catch (error) {
    console.error('Assign order failed:', error)
    res.status(500).json({ code: 500, message: '派单失败', data: null })
  }
})

/**
 * 更新工单状态
 * PATCH /api/repair-orders/:orderId/status
 */
router.patch('/:orderId/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { status, remark } = req.body as { status?: string; remark?: string }

    if (!status) {
      res.status(400).json({ code: 400, message: '缺少状态参数', data: null })
      return
    }

    const updated = await prisma.repairOrder.update({
      where: { id: orderId },
      data: { status },
    })

    await prisma.timelineEvent.create({
      data: {
        orderId,
        status,
        remark: remark || `状态更新为${STATUS_LABELS[status] || status}`,
      },
    })

    res.json({
      code: 0,
      message: 'success',
      data: updated,
    })
  } catch (error) {
    console.error('Update status failed:', error)
    res.status(500).json({ code: 500, message: '更新状态失败', data: null })
  }
})

/**
 * 上传处理照片
 * POST /api/repair-orders/:orderId/handler-photos
 */
router.post('/:orderId/handler-photos', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { images } = req.body as { images?: string[] }

    if (!images || images.length === 0) {
      res.status(400).json({ code: 400, message: '缺少图片', data: null })
      return
    }

    await prisma.repairAttachment.createMany({
      data: images.map((url) => ({ orderId, url, type: 'handler' })),
    })

    res.json({ code: 0, message: 'success', data: null })
  } catch (error) {
    console.error('Upload handler photos failed:', error)
    res.status(500).json({ code: 500, message: '上传处理照片失败', data: null })
  }
})

/**
 * 提交评价
 * POST /api/repair-orders/:orderId/review
 */
router.post('/:orderId/review', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { rating, content } = req.body as { rating?: number; content?: string }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ code: 400, message: '评分必须在 1-5 之间', data: null })
      return
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        rating,
        content: content || '',
      },
    })

    res.json({
      code: 0,
      message: 'success',
      data: review,
    })
  } catch (error) {
    console.error('Create review failed:', error)
    res.status(500).json({ code: 500, message: '提交评价失败', data: null })
  }
})

/**
 * 查询我的报修列表
 * GET /api/repair-orders?phone=xxx&status=xxx
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      phone,
      status,
      communityId,
      severity,
      keyword,
      page = '1',
      pageSize = '20',
    } = req.query as {
      phone?: string
      status?: string
      communityId?: string
      severity?: string
      keyword?: string
      page?: string
      pageSize?: string
    }

    const where: Record<string, unknown> = {}
    if (phone) {
      where.reporterPhone = phone
    }
    if (status) {
      where.status = status
    }
    if (communityId) {
      where.communityId = communityId
    }
    if (severity) {
      where.severity = severity
    }
    if (keyword) {
      where.OR = [
        { description: { contains: keyword } },
        { reporterPhone: { contains: keyword } },
      ]
    }

    const skip = (Number(page) - 1) * Number(pageSize)

    const [orders, total] = await Promise.all([
      prisma.repairOrder.findMany({
        where,
        include: {
          community: true,
          handler: true,
          attachments: { take: 1 },
          timeline: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(pageSize),
      }),
      prisma.repairOrder.count({ where }),
    ])

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: orders.map((order) => ({
          ...order,
          statusLabel: STATUS_LABELS[order.status] || order.status,
        })),
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    })
  } catch (error) {
    console.error('List orders failed:', error)
    res.status(500).json({ code: 500, message: '查询列表失败', data: null })
  }
})

export default router
