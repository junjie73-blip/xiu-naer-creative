# HTML 交互 Demo 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 删除原 Vue/Express 全栈代码，替换为单文件 HTML 交互 Demo，并保留 GitHub Pages 自动部署。

**Architecture：** 单 HTML 文件（`index.html`）内联所有样式与脚本，使用 `localStorage` 持久化数据，Hash 路由切换首页 / 居民端 / 管理端页面。

**Tech Stack：** 原生 HTML5 + CSS3 + ES6，零外部依赖。

---

### Task 1: 清理旧代码

**Files:**
- Delete: `admin/`
- Delete: `api/`
- Delete: `prisma/`
- Delete: `src/`
- Delete: `public/`
- Delete: `server/`
- Delete: `package.json`
- Delete: `package-lock.json`
- Delete: `vercel.json`
- Delete: `vite.config.ts`
- Delete: `tsconfig.json`
- Delete: `tailwind.config.js`
- Delete: `postcss.config.js`
- Delete: `nodemon.json`
- Delete: `.eslintrc.cjs`
- Delete: `.github/workflows/ci.yml`
- Delete: `.trae/specs/create-html-demo-from-source/` 之外与 Vue/Express 相关的旧 spec

**Step 1: 删除目录和文件**

```bash
# 使用 DeleteFile 工具删除以下路径（不通过 rm -rf）
admin
api
prisma
src
public
server
package.json
package-lock.json
vercel.json
vite.config.ts
tsconfig.json
tailwind.config.js
postcss.config.js
nodemon.json
.eslintrc.cjs
.github/workflows/ci.yml
```

**Step 2: 提交清理**

```bash
git add -A
git commit -m "chore: remove Vue/Express/Prisma full-stack code"
```

---

### Task 2: 创建单文件交互 Demo

**Files:**
- Create: `index.html`

**Step 1: 编写 HTML 骨架与 CSS**

在 `index.html` 中内联：

- CSS 变量（沿用橙/蓝渐变配色）
- 移动端优先的响应式布局
- 首页 Hero、居民端、管理端三个主要视图的样式
- Toast、Modal、Timeline 组件样式

**Step 2: 编写核心 JavaScript 模块**

```js
// 数据存储
const STORAGE_KEY = 'xiuNaerDemoData';
function loadData() { /* 从 localStorage 读取 */ }
function saveData(data) { /* 写入 localStorage */ }
function seedData() { /* 首次打开时写入 5 条示例工单 */ }

// 工具函数
function generateOrderId() { /* 生成 R202606160001 格式编号 */ }
function formatTime(ts) { /* 格式化时间 */ }
function getStatusLabel(status) { /* 状态中文映射 */ }

// 路由
function render() {
  const hash = location.hash || '#home';
  if (hash.startsWith('#resident')) renderResident();
  else if (hash.startsWith('#admin')) renderAdmin();
  else renderHome();
}
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => { seedData(); render(); });

// 居民端
function renderResident() { /* 渲染居民端导航 + 当前子页面 */ }
function renderReport() { /* 渲染报修表单 + AI 识别动画 */ }
function submitReport(formData) { /* 写入数据并跳转我的报修 */ }
function renderMyOrders(filter) { /* 列表 + 筛选 */ }
function renderOrderDetail(id) { /* 详情 + 时间线 + 催单/评价 */ }

// 管理端
function renderAdmin() { /* 渲染管理端导航 + 当前子页面 */ }
function renderDashboard() { /* 数据看板 */ }
function renderAdminOrders(filter) { /* 工单列表 */ }
function renderAdminOrderDetail(id) { /* 详情 + 改状态/派单/备注 */ }
```

**Step 3: 测试本地打开**

直接用浏览器打开 `index.html`，验证：
- 首页角色切换正常
- 居民端提交报修后列表有数据
- 管理端能看到新工单并修改状态
- 刷新页面数据不丢失

**Step 4: 提交**

```bash
git add index.html
git commit -m "feat: add single-file interactive HTML demo"
```

---

### Task 3: 简化 GitHub Pages 部署工作流

**Files:**
- Modify: `.github/workflows/deploy-frontend.yml`

**Step 1: 替换工作流内容为纯静态部署**

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 配置 Pages
        uses: actions/configure-pages@v5
        with:
          enablement: true

      - name: 上传静态文件
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: 部署到 GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: 提交**

```bash
git add .github/workflows/deploy-frontend.yml
git commit -m "ci: simplify GitHub Pages workflow for static HTML demo"
```

---

### Task 4: 更新 README 和 .gitignore

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`

**Step 1: 更新 README**

内容要点：
- 项目简介：「修哪儿」社区报修进度追踪平台交互 Demo
- 在线预览：`https://junjie73-blip.github.io/xiu-naer-creative/`
- 本地使用：直接用浏览器打开 `index.html`
- 角色入口：居民 / 物业管理员
- 默认账号：无需登录，点击角色切换

**Step 2: 更新 .gitignore**

移除与 node_modules / dist / Vercel 相关的旧规则，保留通用规则：

```gitignore
.DS_Store
Thumbs.db
*.log
.idea/
.vscode/
*.swp
*.swo
```

**Step 3: 提交**

```bash
git add README.md .gitignore
git commit -m "docs: update README and .gitignore for HTML demo"
```

---

### Task 5: 推送并验证部署

**Files:**
- 无

**Step 1: 推送到 Gitee**

```bash
git push origin main
```

**Step 2: 等待 Gitee 同步到 GitHub**

同步完成后检查 GitHub Actions 是否成功部署。

**Step 3: 访问验证**

打开 `https://junjie73-blip.github.io/xiu-naer-creative/`，确认：
- 页面正常加载
- 居民端和管理端切换正常
- 报修、派单、改状态流程可用

---

## 验收标准

1. `index.html` 直接双击打开即可交互。
2. 删除旧代码后仓库体积显著减小。
3. GitHub Actions 部署成功，Pages 可访问。
