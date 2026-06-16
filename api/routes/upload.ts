import { Router, type Request, type Response } from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads')

/**
 * 将 base64 图片数据保存为本地文件。
 * Demo 阶段使用本地文件系统，生产环境可替换为对象存储。
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, type = 'reporter' } = req.body as { image?: string; type?: string }

    if (!image || typeof image !== 'string') {
      res.status(400).json({ code: 400, message: '缺少图片数据', data: null })
      return
    }

    const match = image.match(/^data:image\/(\w+);base64,/)
    if (!match) {
      res.status(400).json({ code: 400, message: '图片格式不正确', data: null })
      return
    }

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    await fs.writeFile(filePath, buffer)

    res.json({
      code: 0,
      message: 'success',
      data: {
        url: `/uploads/${fileName}`,
        type,
      },
    })
  } catch (error) {
    console.error('Upload failed:', error)
    res.status(500).json({ code: 500, message: '图片保存失败', data: null })
  }
})

export default router
