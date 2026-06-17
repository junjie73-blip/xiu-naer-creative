# HTML 交互 Demo 设计文档

## 背景

原项目采用 Vue 3 + Express + Prisma + SQLite 全栈架构，部署链路较长（GitHub Pages 前端 + Vercel 后端），在创意比赛 Demo 场景下显得过重。为降低部署和维护成本，决定把所有前后端代码替换为一个**单文件 HTML 交互原型**，直接托管在 GitHub Pages 上。

## 目标

1. 删除所有 Vue/Express/Admin/Prisma 相关代码与配置。
2. 创建 `index.html`，在浏览器内独立运行居民端 + 管理端交互 Demo。
3. 保留 `.github/workflows/deploy-frontend.yml`，简化为纯静态文件部署。
4. 保留原创意展示页 `xiu-naer-creative.html` 与 README。
5. 数据用浏览器 `localStorage` 存储，刷新不丢失。

## 最终目录结构

```
xiu-naer-creative/
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml      # 简化为静态部署
├── docs/
│   └── plans/
│       └── 2026-06-16-html-interactive-demo-design.md
├── .gitignore
├── index.html                        # 交互 Demo（单文件）
├── README.md
└── xiu-naer-creative.html            # 原创意展示页
```

## 页面与交互设计

### 1. 入口 / 首页

- 保留原展示页核心信息：Hero、痛点、流程、数据、价值。
- 新增两个角色入口：
  - **我是居民** → 居民端
  - **我是物业/管理员** → 管理端
- 无登录认证，点击直接切换角色。

### 2. 居民端

- **我要报修**
  - 表单字段：问题类型（下拉）、所在位置（输入）、问题描述（文本域）、图片占位（emoji 图标，不上传真实文件）。
  - 提交时显示 0.8s "AI 识别中..." 动画，然后自动写入分类结果。
  - 提交成功后自动跳转到"我的报修"。

- **我的报修**
  - 列表展示：工单编号、状态、问题类型、提交时间。
  - 顶部状态筛选：全部 / 待处理 / 处理中 / 已完成。
  - 点击进入详情。

- **报修详情**
  - 快递式时间线：已提交 → 已受理 → 已派单 → 处理中 → 已完成。
  - 当前状态高亮，其他状态灰色。
  - 操作按钮：催单（仅非完成状态）、评价（仅完成状态，弹出星级评分）。

### 3. 管理端

- **数据看板**
  - 四个核心指标卡片：工单总数、待处理、处理中、已完成。
  - 使用简单数字动画增强演示效果。

- **工单管理**
  - 表格/卡片列表，支持按状态筛选。
  - 操作：查看详情、派单（选择维修员）、改状态。

- **工单详情**
  - 展示报修内容、居民信息、当前状态。
  - 状态下拉：待处理 / 已派单 / 处理中 / 已完成。
  - 维修员下拉：张三 / 李四 / 王五。
  - 备注输入框。
  - 保存后同步更新时间线。

## 数据模型

全部数据以 JSON 形式存储在 `localStorage` 的 `xiuNaerDemoData` 键中。

```ts
interface RepairOrder {
  id: string              // 工单编号，如 "R202606160001"
  reporterName: string
  phone: string
  type: string
  location: string
  description: string
  status: 'pending' | 'assigned' | 'processing' | 'completed'
  assignee: string
  rating: number | null
  comment: string
  createdAt: number
  updatedAt: number
  timeline: TimelineEvent[]
}

interface TimelineEvent {
  time: number
  title: string
  description: string
}
```

首次加载时，如果 `localStorage` 中没有数据，自动 seed 5 条示例工单。

## 技术方案

- **单 HTML 文件**：所有 HTML、CSS、JavaScript 内联在 `index.html` 中，零外部依赖。
- **Hash 路由**：通过 `location.hash` 切换页面，避免多文件。
- **CSS**：自定义变量 + 响应式布局，移动端优先。
- **图标**：使用 emoji 和 CSS 图形，不引用外部字体/图标库。
- **存储**：`localStorage` 持久化，内存中维护当前数据副本，操作后写回。

## GitHub Actions 部署

保留 `.github/workflows/deploy-frontend.yml`，但移除所有 build、lint、typecheck 步骤，直接上传当前目录中的静态文件：

- `index.html`
- `xiu-naer-creative.html`
- `README.md`

部署目标：`https://junjie73-blip.github.io/xiu-naer-creative/`

## 保留文件

- `xiu-naer-creative.html`：原创意展示页，不动。
- `README.md`：更新为说明当前 Demo 的入口和用途。
- `.gitignore`：保留，新增忽略临时文件。

## 删除文件

- `admin/`、`api/`、`prisma/`、`src/`、`public/`、`server/`
- `package.json`、`package-lock.json`、`vercel.json`
- `vite.config.ts`、`tsconfig.json`、`tailwind.config.js`、`postcss.config.js`、`nodemon.json`
- `.eslintrc.cjs`
- `.github/workflows/ci.yml`
- `.trae/specs/` 下与 Vue/Express 相关的旧规格文件

## 成功标准

1. `index.html` 用浏览器直接打开即可完整交互。
2. 居民端可以提交报修，管理端可以看到并处理。
3. 数据刷新后仍然存在。
4. GitHub Pages 部署成功，首页可访问。
