# H5 与后台管理系统改造设计文档

## 1. 项目背景

当前 `xiu-naer-creative` 已实现 H5 报修追踪最小 demo：用户可拍照报修、查看进度、评价服务。为进一步验证产品价值，需要：

1. 对 H5 前端进行全面体验升级（UI、流程、字段、交互）。
2. 新增独立后台管理子系统，供物业/社区管理人员处理工单、查看数据。

## 2. 总体架构

```text
xiu-naer-creative/
├── src/                  # H5 前端（移动端优先）
├── api/                  # Express + TypeScript 后端 API
├── admin/                # 新增：独立后台管理子项目
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docs/plans/           # 设计文档
└── package.json          # 根目录脚本扩展
```

- 后台子项目技术栈：`Vite 5 + Vue 3 + TypeScript + Naive UI + Vue Router + Pinia`。
- 复用现有后端服务，不新增独立服务端。
- 构建产物为 `admin/dist/`，可通过后端静态托管或单独部署。

## 3. H5 改造设计

### 3.1 UI 升级

- 引入统一设计令牌：主色 `primary`、辅助色 `secondary`、成功/警告/错误色。
- 统一圆角（卡片 1.5rem、按钮全圆角）、阴影、间距 4 的倍数。
- 优化首页英雄区、流程步骤、空状态视觉层次。
- 所有页面使用骨架屏或 loading 状态，避免白屏。

### 3.2 流程优化

- 首页增加"最近报修"快捷卡片，最近有单时直接展示。
- 报修成功页改为中间页，展示工单号、预计完成时间、"查看进度"按钮。
- 追踪页增加"催单"、"联系物业"快捷操作。
- 评价完成后展示感谢页/动画反馈。

### 3.3 字段完善

报修表单新增字段：

- 报修位置：楼栋 / 单元 / 具体位置（三级选择）。
- 联系人姓名。
- 期望上门时间（选填）。
- 是否紧急（开关，影响严重度）。

追踪页新增展示：

- 负责维修人员姓名/电话。
- 实际处理照片。
- 预计完成倒计时。

### 3.4 交互提升

- 表单实时校验，错误即时提示。
- 图片上传显示缩略图、进度、删除确认。
- 提交、验收、评价后显示 Toast 提示。
- 下拉刷新、上拉加载（我的报修列表）。
- 网络错误统一兜底提示。

## 4. 后台管理系统设计

### 4.1 技术栈

| 层 | 技术 |
|---|---|
| 构建工具 | Vite 5 |
| 框架 | Vue 3 Composition API |
| UI 组件库 | Naive UI |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| HTTP 请求 | 复用 `src/utils/api.ts` 或新建 `admin/src/api` |

### 4.2 页面结构

```text
/admin
  /login              # 登录页
  /dashboard          # 数据看板
  /orders             # 工单列表
  /orders/:id         # 工单详情
  /communities        # 社区管理
  /staff              # 人员管理
  /reports            # 数据报表
```

### 4.3 功能模块

#### 登录页

- 账号密码登录。
- Demo 阶段支持内置测试账号，生产环境可对接后端 JWT。

#### 数据看板

- 今日新增工单数。
- 待处理工单数。
- 本月完成率。
- 平均满意度。
- 最近 7 天工单趋势图。

#### 工单管理

- 列表：支持按状态、社区、严重度、日期范围筛选；支持关键词搜索；分页。
- 列表项展示：工单号、分类、状态、报修人、手机号、提交时间、操作按钮。
- 详情：基本信息、图片、地图位置、时间线、处理记录。
- 操作：受理、派单、更新状态、上传处理照片、验收通过、标记升级、关闭工单。

#### 社区管理

- 列表、新增、编辑、禁用社区。
- 字段：社区名称、地址、负责人、联系电话。

#### 人员管理

- 维修人员 / 物业管理员账号管理。
- 字段：姓名、手机号、角色、所属社区、账号状态。

#### 数据报表

- 工单趋势（按日/周/月）。
- 分类占比饼图。
- 严重度分布。
- 满意度评分分布。

## 5. 后端 API 调整

### 5.1 数据模型扩展

- `User` 表：后台账号（id, username, passwordHash, role, name, phone, status, createdAt）。
- `Community` 表：扩展地址、负责人字段。
- `RepairOrder` 表：
  - 增加 `building`, `unit`, `contactName`, `preferredTime`, `isUrgent`。
  - 增加 `handlerId`（负责人员外键）。
  - 增加 `handlerPhotos` 或单独 `RepairAttachment` 类型区分用户上传/处理上传。
- `TimelineEvent` 表：增加 `operatorId`、`operatorName`。

### 5.2 API 扩展

- `POST /api/auth/login`：管理员登录。
- `GET /api/admin/dashboard`：看板统计数据。
- `GET /api/repair-orders`：增加分页、筛选、排序参数。
- `PATCH /api/repair-orders/:id/assign`：派单。
- `POST /api/repair-orders/:id/handler-photos`：上传处理照片。
- `GET /api/admin/reports/trend`：趋势报表。
- `GET /api/admin/reports/category`：分类占比。
- `GET /api/admin/reports/rating`：满意度分布。

## 6. 部署方案

- H5：`npm run build` 构建到 `dist/`，由后端托管或静态部署。
- Admin：`cd admin && npm run build` 构建到 `admin/dist/`，可通过 `app.use('/admin', express.static('admin/dist'))` 由后端托管。
- 生产环境建议 Admin 单独部署，避免与 H5 互相影响。

## 7. 实现顺序

1. 后端：扩展数据模型与 API。
2. H5：按 UI/流程/字段/交互顺序改造。
3. Admin：搭建子项目骨架，逐模块实现。
4. 联调测试、数据迁移、部署验证。
