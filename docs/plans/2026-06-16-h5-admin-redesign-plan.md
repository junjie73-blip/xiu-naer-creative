# H5 与后台管理系统改造实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 升级 H5 报修体验，并新增独立后台管理子系统，实现标准版物业工单管理功能。

**Architecture:** 在现有仓库新增 `admin/` 独立子项目（Vite + Vue 3 + Naive UI），复用 Express 后端；后端扩展 Prisma 数据模型与 API；H5 按 UI/流程/字段/交互四方面改造。

**Tech Stack:** Vite 5, Vue 3, TypeScript, Naive UI, Pinia, Vue Router, Express, Prisma, SQLite

---

## Phase 1: 后端数据模型与 API 扩展

### Task 1: 扩展 Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: 添加 User 模型并扩展 RepairOrder/Community/TimelineEvent**

```prisma
model User {
  id            String   @id @default(uuid())
  username      String   @unique
  passwordHash  String
  role          String   // admin | staff
  name          String
  phone         String?
  status        String   @default("active")
  createdAt     DateTime @default(now())
  assignedOrders RepairOrder[]
}

model Community {
  id          String   @id @default(cuid())
  name        String
  address     String?
  contactName String?
  contactPhone String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      RepairOrder[]
}

model RepairOrder {
  id              String   @id @default(cuid())
  communityId     String
  community       Community @relation(fields: [communityId], references: [id])
  reporterPhone   String
  contactName     String?
  building        String?
  unit            String?
  location        String?
  preferredTime   DateTime?
  isUrgent        Boolean  @default(false)
  category        String
  severity        String
  status          String
  description     String?
  lat             Float?
  lng             Float?
  handlerId       String?
  handler         User?    @relation(fields: [handlerId], references: [id])
  deadline        DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  timeline        TimelineEvent[]
  attachments     RepairAttachment[]
  review          Review?
}

model TimelineEvent {
  id            String   @id @default(cuid())
  orderId       String
  order         RepairOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status        String
  remark        String?
  operatorId    String?
  operatorName  String?
  createdAt     DateTime @default(now())
}

model RepairAttachment {
  id            String   @id @default(cuid())
  orderId       String
  order         RepairOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  url           String
  thumbnailUrl  String?
  type          String   @default("reporter") // reporter | handler
  createdAt     DateTime @default(now())
}
```

**Step 2: 运行迁移命令**

Run: `npx prisma migrate dev --name h5_admin_redesign`

Expected: 迁移成功，Prisma Client 重新生成。

**Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): extend schema for admin and h5 redesign"
```

---

### Task 2: 更新种子数据

**Files:**
- Modify: `api/scripts/seed.ts`

**Step 1: 在种子脚本中创建测试社区和管理员账号**

```typescript
await prisma.user.createMany({
  data: [
    { username: 'admin', passwordHash: '$2b$10$...', role: 'admin', name: '系统管理员' },
    { username: 'staff1', passwordHash: '$2b$10$...', role: 'staff', name: '张师傅' },
  ],
  skipDuplicates: true,
})
```

**Step 2: 运行种子**

Run: `npm run db:seed`

Expected: 输出 `Seeded admin user...`

**Step 3: Commit**

```bash
git add api/scripts/seed.ts
git commit -m "chore(seed): add admin and staff accounts"
```

---

### Task 3: 创建认证路由

**Files:**
- Create: `api/routes/auth.ts`

**Step 1: 实现管理员登录接口**

```typescript
import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.post('/login', async (req, res): Promise<void> => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || user.passwordHash !== password) {
    res.status(401).json({ code: 401, message: '账号或密码错误', data: null })
    return
  }
  res.json({
    code: 0,
    message: 'success',
    data: { id: user.id, username: user.username, role: user.role, name: user.name },
  })
})

export default router
```

**Step 2: 在 app.ts 注册路由**

Modify `api/app.ts`:

```typescript
import authRoutes from './routes/auth.js'
app.use('/api/auth', authRoutes)
```

**Step 3: 测试登录接口**

Run: `curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}'`

Expected: 返回管理员信息或 401。

**Step 4: Commit**

```bash
git add api/routes/auth.ts api/app.ts
git commit -m "feat(api): add admin login route"
```

---

### Task 4: 扩展工单创建接口字段

**Files:**
- Modify: `api/routes/repairOrders.ts`

**Step 1: 在 POST /api/repair-orders 中接收新字段**

```typescript
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
} = req.body
```

**Step 2: 写入数据库时增加新字段**

```typescript
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
```

**Step 3: Commit**

```bash
git add api/routes/repairOrders.ts
git commit -m "feat(api): support new h5 report fields"
```

---

### Task 5: 扩展工单查询接口（分页/筛选/排序）

**Files:**
- Modify: `api/routes/repairOrders.ts`

**Step 1: 修改 GET /api/repair-orders 支持分页和筛选**

```typescript
const { phone, status, communityId, severity, page = '1', pageSize = '20', keyword } = req.query
const where: any = {}
if (phone) where.reporterPhone = phone
if (status) where.status = status
if (communityId) where.communityId = communityId
if (severity) where.severity = severity
if (keyword) {
  where.OR = [
    { description: { contains: keyword as string } },
    { reporterPhone: { contains: keyword as string } },
  ]
}

const skip = (Number(page) - 1) * Number(pageSize)
const [orders, total] = await Promise.all([
  prisma.repairOrder.findMany({
    where,
    include: { attachments: { take: 1 }, timeline: { orderBy: { createdAt: 'desc' }, take: 1 }, community: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take: Number(pageSize),
  }),
  prisma.repairOrder.count({ where }),
])

res.json({ code: 0, message: 'success', data: { list: orders, total, page: Number(page), pageSize: Number(pageSize) }})
```

**Step 2: Commit**

```bash
git add api/routes/repairOrders.ts
git commit -m "feat(api): paginate and filter repair orders"
```

---

### Task 6: 添加派单接口

**Files:**
- Modify: `api/routes/repairOrders.ts`

**Step 1: 实现 PATCH /api/repair-orders/:id/assign**

```typescript
router.patch('/:orderId/assign', async (req, res): Promise<void> => {
  const { orderId } = req.params
  const { handlerId } = req.body
  const staff = await prisma.user.findUnique({ where: { id: handlerId } })
  const updated = await prisma.repairOrder.update({
    where: { id: orderId },
    data: { handlerId, status: 'accepted' },
  })
  await prisma.timelineEvent.create({
    data: {
      orderId,
      status: 'accepted',
      remark: `派单给 ${staff?.name || handlerId}`,
      operatorName: '系统管理员',
    },
  })
  res.json({ code: 0, message: 'success', data: updated })
})
```

**Step 2: Commit**

```bash
git add api/routes/repairOrders.ts
git commit -m "feat(api): add assign order endpoint"
```

---

### Task 7: 添加上传处理照片接口

**Files:**
- Modify: `api/routes/upload.ts`

**Step 1: 扩展 upload 接口支持 type 参数**

```typescript
const { image, type = 'reporter' } = req.body
// ...保存逻辑
res.json({ code: 0, message: 'success', data: { url, type } })
```

**Step 2: 创建 POST /api/repair-orders/:id/handler-photos**

在 `repairOrders.ts` 中新增：

```typescript
router.post('/:orderId/handler-photos', async (req, res): Promise<void> => {
  const { orderId } = req.params
  const { images } = req.body as { images: string[] }
  await prisma.repairAttachment.createMany({
    data: images.map((url) => ({ orderId, url, type: 'handler' })),
  })
  res.json({ code: 0, message: 'success', data: null })
})
```

**Step 3: Commit**

```bash
git add api/routes/upload.ts api/routes/repairOrders.ts
git commit -m "feat(api): support handler photo uploads"
```

---

### Task 8: 添加看板与报表接口

**Files:**
- Create: `api/routes/admin.ts`

**Step 1: 实现看板统计**

```typescript
router.get('/dashboard', async (_req, res): Promise<void> => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [todayCount, pendingCount, completedCount, totalCount, avgRating] = await Promise.all([
    prisma.repairOrder.count({ where: { createdAt: { gte: today } } }),
    prisma.repairOrder.count({ where: { status: { in: ['submitted', 'accepted', 'processing'] } } }),
    prisma.repairOrder.count({ where: { status: 'completed' } }),
    prisma.repairOrder.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ])
  res.json({
    code: 0,
    message: 'success',
    data: { todayCount, pendingCount, completedCount, totalCount, avgRating: avgRating._avg.rating || 0 },
  })
})
```

**Step 2: 实现趋势/分类/满意度报表**

```typescript
router.get('/reports/trend', async (req, res): Promise<void> => { ... })
router.get('/reports/category', async (_req, res): Promise<void> => { ... })
router.get('/reports/rating', async (_req, res): Promise<void> => { ... })
```

**Step 3: 在 app.ts 注册**

```typescript
import adminRoutes from './routes/admin.js'
app.use('/api/admin', adminRoutes)
```

**Step 4: Commit**

```bash
git add api/routes/admin.ts api/app.ts
git commit -m "feat(api): add admin dashboard and report endpoints"
```

---

## Phase 2: H5 前端改造

### Task 9: 统一 H5 设计令牌与全局样式

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/style.css`

**Step 1: 在 tailwind 配置中扩展颜色、圆角、阴影**

```javascript
colors: {
  primary: { DEFAULT: '#4F46E5', 50: '#EEF2FF', ... },
  secondary: { DEFAULT: '#06B6D4', ... },
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
}
borderRadius: {
  '2xl': '1rem',
  '3xl': '1.5rem',
}
```

**Step 2: Commit**

```bash
git add tailwind.config.js src/style.css
git commit -m "feat(h5): unify design tokens"
```

---

### Task 10: 改造报修页字段

**Files:**
- Modify: `src/utils/api.ts`
- Modify: `src/pages/ReportPage.vue`

**Step 1: 扩展 CreateOrderRequest 类型**

```typescript
export interface CreateOrderRequest {
  communityId: string
  reporterPhone: string
  contactName?: string
  building?: string
  unit?: string
  location?: string
  preferredTime?: string
  isUrgent?: boolean
  images: string[]
  description: string
  lat?: number
  lng?: number
}
```

**Step 2: 在 ReportPage.vue 新增表单项**

- 楼栋/单元/位置三级输入
- 联系人姓名
- 期望上门时间
- 是否紧急开关

**Step 3: Commit**

```bash
git add src/utils/api.ts src/pages/ReportPage.vue
git commit -m "feat(h5): add new report form fields"
```

---

### Task 11: 优化首页流程与 UI

**Files:**
- Modify: `src/pages/HomePage.vue`
- Create: `src/composables/useRecentOrders.ts`

**Step 1: 新增 composable 读取最近报修**

```typescript
export function useRecentOrders(phone: string) {
  const orders = ref<RepairOrder[]>([])
  onMounted(async () => {
    if (!phone) return
    orders.value = await getMyOrders(phone)
  })
  return { orders }
}
```

**Step 2: 首页增加最近报修卡片**

在 Hero 下方展示最近 1-2 条工单快捷入口。

**Step 3: Commit**

```bash
git add src/pages/HomePage.vue src/composables/useRecentOrders.ts
git commit -m "feat(h5): show recent orders on home"
```

---

### Task 12: 改造追踪页交互

**Files:**
- Modify: `src/pages/TrackPage.vue`

**Step 1: 新增催单/联系物业按钮**

```html
<div class="mt-4 flex gap-3">
  <button @click="urgeOrder" class="flex-1 rounded-full bg-warning py-2 text-white">催单</button>
  <button @click="callProperty" class="flex-1 rounded-full border py-2">联系物业</button>
</div>
```

**Step 2: 展示负责人员、处理照片、倒计时**

**Step 3: Commit**

```bash
git add src/pages/TrackPage.vue
git commit -m "feat(h5): improve track page interactions"
```

---

### Task 13: 优化我的报修列表交互

**Files:**
- Modify: `src/pages/MyOrdersPage.vue`

**Step 1: 支持下拉刷新/上拉加载**

```typescript
const page = ref(1)
const hasMore = ref(true)
async function loadMore() { ... }
```

**Step 2: Commit**

```bash
git add src/pages/MyOrdersPage.vue
git commit -m "feat(h5): pull refresh and infinite load for orders"
```

---

### Task 14: 新增 Toast/Loading 全局反馈

**Files:**
- Create: `src/composables/useToast.ts`
- Create: `src/components/AppToast.vue`
- Modify: `src/App.vue`

**Step 1: 实现简单 Toast 组件**

```vue
<template>
  <div v-if="visible" class="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white">
    {{ message }}
  </div>
</template>
```

**Step 2: 在 App.vue 中注册并全局使用**

**Step 3: Commit**

```bash
git add src/composables/useToast.ts src/components/AppToast.vue src/App.vue
git commit -m "feat(h5): add global toast feedback"
```

---

## Phase 3: Admin 后台子项目搭建

### Task 15: 初始化 admin 子项目

**Files:**
- Create: `admin/package.json`
- Create: `admin/vite.config.ts`
- Create: `admin/tsconfig.json`
- Create: `admin/index.html`
- Create: `admin/src/main.ts`
- Create: `admin/src/App.vue`

**Step 1: 复制基础配置**

```json
// admin/package.json
{
  "name": "xiu-naer-admin",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "check": "vue-tsc -b"
  },
  "dependencies": {
    "naive-ui": "^2.40.0",
    "vue": "^3.4.15",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.3",
    "typescript": "~5.3.3",
    "vite": "^5.0.12",
    "vue-tsc": "^1.8.27"
  }
}
```

**Step 2: 安装依赖**

Run: `cd admin && npm install`

Expected: 安装成功，生成 `admin/node_modules` 和 `admin/package-lock.json`。

**Step 3: Commit**

```bash
git add admin/
git commit -m "feat(admin): scaffold admin subproject"
```

---

### Task 16: 配置 Admin 路由与布局

**Files:**
- Create: `admin/src/router/index.ts`
- Create: `admin/src/layouts/AdminLayout.vue`
- Modify: `admin/src/App.vue`

**Step 1: 定义后台路由**

```typescript
const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue') },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'orders', component: () => import('../views/OrdersView.vue') },
      { path: 'orders/:id', component: () => import('../views/OrderDetailView.vue') },
      { path: 'communities', component: () => import('../views/CommunitiesView.vue') },
      { path: 'staff', component: () => import('../views/StaffView.vue') },
      { path: 'reports', component: () => import('../views/ReportsView.vue') },
    ],
  },
]
```

**Step 2: 实现 AdminLayout.vue**

包含侧边栏、顶部栏、内容区。

**Step 3: Commit**

```bash
git add admin/src/router/index.ts admin/src/layouts/AdminLayout.vue admin/src/App.vue
git commit -m "feat(admin): add router and layout"
```

---

### Task 17: 实现登录页

**Files:**
- Create: `admin/src/views/LoginView.vue`
- Create: `admin/src/stores/auth.ts`

**Step 1: 创建 Pinia auth store**

```typescript
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  async function login(username: string, password: string) { ... }
  function logout() { user.value = null }
  return { user, login, logout }
})
```

**Step 2: 实现登录表单 UI**

**Step 3: Commit**

```bash
git add admin/src/views/LoginView.vue admin/src/stores/auth.ts
git commit -m "feat(admin): add login page and auth store"
```

---

### Task 18: 实现数据看板

**Files:**
- Create: `admin/src/views/DashboardView.vue`
- Create: `admin/src/api/dashboard.ts`

**Step 1: 封装看板 API**

```typescript
export async function fetchDashboard() {
  return request<DashboardData>('/api/admin/dashboard')
}
```

**Step 2: 实现看板 UI（统计卡片 + 趋势图）**

**Step 3: Commit**

```bash
git add admin/src/views/DashboardView.vue admin/src/api/dashboard.ts
git commit -m "feat(admin): add dashboard view"
```

---

### Task 19: 实现工单列表与详情

**Files:**
- Create: `admin/src/views/OrdersView.vue`
- Create: `admin/src/views/OrderDetailView.vue`
- Create: `admin/src/api/orders.ts`

**Step 1: 封装工单 API（列表、详情、派单、状态更新）**

**Step 2: 实现列表：表格 + 筛选 + 分页**

**Step 3: 实现详情：信息展示 + 时间线 + 操作按钮**

**Step 4: Commit**

```bash
git add admin/src/views/OrdersView.vue admin/src/views/OrderDetailView.vue admin/src/api/orders.ts
git commit -m "feat(admin): add order list and detail"
```

---

### Task 20: 实现社区管理

**Files:**
- Create: `admin/src/views/CommunitiesView.vue`
- Create: `admin/src/api/communities.ts`

**Step 1: 封装社区 CRUD API**

**Step 2: 实现表格 + 新增/编辑弹窗**

**Step 3: Commit**

```bash
git add admin/src/views/CommunitiesView.vue admin/src/api/communities.ts
git commit -m "feat(admin): add community management"
```

---

### Task 21: 实现人员管理

**Files:**
- Create: `admin/src/views/StaffView.vue`
- Create: `admin/src/api/staff.ts`

**Step 1: 封装人员 CRUD API**

**Step 2: 实现表格 + 新增/编辑弹窗**

**Step 3: Commit**

```bash
git add admin/src/views/StaffView.vue admin/src/api/staff.ts
git commit -m "feat(admin): add staff management"
```

---

### Task 22: 实现数据报表

**Files:**
- Create: `admin/src/views/ReportsView.vue`
- Create: `admin/src/api/reports.ts`

**Step 1: 封装报表 API**

**Step 2: 使用简单 div/条形图展示趋势、分类占比、满意度分布**

**Step 3: Commit**

```bash
git add admin/src/views/ReportsView.vue admin/src/api/reports.ts
git commit -m "feat(admin): add reports view"
```

---

## Phase 4: 联调与部署

### Task 23: 后端托管 Admin 构建产物

**Files:**
- Modify: `api/app.ts`
- Modify: `vercel.json`（如需要）

**Step 1: 在生产环境托管 admin/dist**

```typescript
app.use('/admin', express.static(path.resolve(__dirname, '../admin/dist')))
app.get('/admin/*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../admin/dist/index.html'))
})
```

**Step 2: Commit**

```bash
git add api/app.ts vercel.json
git commit -m "feat(deploy): serve admin build from backend"
```

---

### Task 24: 端到端联调测试

**Files:**
- All changed files

**Step 1: 启动完整服务**

Run: `npm run dev`（H5 + 后端），另起一个终端 `cd admin && npm run dev`

**Step 2: 验证关键路径**

- H5 报修 → 后台查看工单 → 派单 → H5 查看进度 → 后台标记完成 → H5 评价
- 后台：登录 → 看板 → 工单列表 → 详情操作 → 社区/人员管理 → 报表

**Step 3: 修复问题并提交**

```bash
git add .
git commit -m "fix: e2e integration fixes"
```

---

## 验收标准

- [ ] H5 报修页新增字段全部生效
- [ ] H5 首页展示最近报修
- [ ] H5 追踪页支持催单/联系物业/倒计时
- [ ] H5 我的报修支持下拉刷新和上拉加载
- [ ] Admin 子项目可独立运行和构建
- [ ] Admin 登录后可进入看板、工单、社区、人员、报表页面
- [ ] 后台可操作工单状态流转（受理/派单/完成）
- [ ] H5 与 Admin 数据互通，全流程闭环
