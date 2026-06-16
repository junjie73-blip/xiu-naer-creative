# 修哪儿（Xiu Naer）项目编码规范

本规范适用于「修哪儿」社区报修进度追踪平台全栈代码，覆盖微信小程序居民端、Vue 3 + TypeScript Web 管理后台、Node.js/TypeScript 后端服务。所有贡献者提交代码前请遵循本规范，以保障代码质量、可维护性与团队协作效率。

## 1. 通用原则

- **清晰优先于简洁**：宁可多写一行，也不要让下一行代码的维护者猜测意图。
- **单一职责**：每个函数、组件、类只负责一件事；超过 50 行的函数优先考虑拆分。
- **避免重复**：提取重复逻辑到独立的工具函数、组合式函数（composable）或服务中。
- **及时清理**：删除未使用的变量、导入、代码路径和文件。
- **信任框架**：优先使用框架/库提供的机制，不自行造轮子处理通用问题。
- **安全与隐私**：禁止在日志、错误信息、前端代码中输出 token、手机号、身份证号等敏感信息。

## 2. 命名约定

使用有意义、描述性的名称，避免无意义缩写（除非行业通用，如 `api`、`url`、`id`）。

| 项目 | 约定 | 示例 |
|------|------|------|
| 类 / 类型 / 接口 | PascalCase | `RepairOrderService`, `UserProfile`, `RepairStatus` |
| 组件名（Vue / 小程序） | PascalCase | `RepairOrderCard`, `TimelineItem` |
| 函数 / 方法 | camelCase | `getRepairOrderList`, `handleSubmit` |
| 变量 / 属性 | camelCase | `repairOrderList`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE`, `DEFAULT_PAGE_SIZE` |
| 枚举成员 | PascalCase | `Pending`, `InProgress`, `Completed` |
| 文件 / 文件夹 | kebab-case | `repair-order.service.ts`, `repair-order-card.vue` |
| 数据库表 / 字段 | snake_case | `repair_orders`, `created_at` |
| CSS 类名 | kebab-case / BEM | `repair-card`, `repair-card--active` |

### 命名禁忌

- 避免使用拼音或无意义字母，如 `xx`, `temp1`, `abc`。
- 避免使用保留字或框架关键字作为变量名。
- 布尔变量使用 `is`、`has`、`should`、`can` 等前缀，如 `isLoading`, `hasError`。

## 3. 代码格式

- **缩进**：2 个空格（TypeScript / JavaScript / Vue / WXML / WXSS / JSON）。
- **换行符**：LF（`\n`），文件末尾保留一个空行。
- **编码**：UTF-8，无 BOM。
- **行宽**：单行不超过 100 个字符；超出时合理换行。
- **引号**：字符串统一使用单引号 `'`，模板字符串使用反引号 `` ` ``。
- **分号**：TypeScript / JavaScript 语句末尾必须加分号。
- **空格**：
  - 关键字后加空格：`if (condition)`, `for (let i = 0; ...)`。
  - 运算符两侧加空格：`a + b`, `x === y`。
  - 对象/数组字面量内部保持简洁：`{ a: 1 }`, `[1, 2, 3]`。
- **大括号**：K&R 风格，左大括号不换行。

```typescript
if (condition) {
  doSomething();
} else {
  doSomethingElse();
}
```

## 4. 注释规范

- **注释解释「为什么」，而非「做什么」**：代码本身应自解释行为，注释用于说明设计决策、业务背景、权衡原因。
- **正确示例**：

```typescript
// 小程序图片压缩上限 1280px，兼顾 4G 网络上传速度与后续 AI 识别清晰度
const MAX_IMAGE_WIDTH = 1280;
```

- **错误示例**：

```typescript
// 设置最大图片宽度为 1280
const MAX_IMAGE_WIDTH = 1280;
```

- **复杂算法必须注释**：说明算法选择原因、边界条件、参考来源。
- **TODO / FIXME / NOTE**：
  - `TODO:`：待完成的后续工作。
  - `FIXME:`：已知有问题的代码，需要修复。
  - `NOTE:`：非显而易见的设计决策或注意事项。
- **不要保留被注释掉的代码**：如需保留历史版本，请使用 Git。

## 5. 微信小程序端规范

### 5.1 目录与文件组织

```text
miniprogram/
├── app.ts
├── app.json
├── app.wxss
├── pages/
│   └── repair/
│       ├── repair.ts
│       ├── repair.wxml
│       ├── repair.wxss
│       └── repair.json
├── components/
│   └── repair-order-card/
│       ├── repair-order-card.ts
│       ├── repair-order-card.wxml
│       ├── repair-order-card.wxss
│       └── repair-order-card.json
├── utils/
│   ├── request.ts
│   └── storage.ts
└── services/
    └── repair-order.service.ts
```

### 5.2 页面 / 组件命名

- 页面目录使用 kebab-case，如 `repair-detail`。
- 组件目录使用 kebab-case，如 `timeline-item`。
- 组件在 WXML 中使用 kebab-case 标签：`<timeline-item />`。

### 5.3 TypeScript 规范

- 小程序脚本统一使用 TypeScript（`.ts`），禁用裸 JavaScript。
- 页面 / 组件数据使用 `data` + 类型声明，避免 `any`。
- 网络请求统一封装，集中处理 token、错误码、Loading。

```typescript
// utils/request.ts
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function request<T>(options: WxRequestOption): Promise<T> {
  // 统一处理鉴权、错误提示与重试
}
```

### 5.4 WXML / WXSS 规范

- WXML 中使用双引号包裹属性值：`<view class="card">`。
- 避免内联样式，统一使用 class。
- WXSS 使用 CSS Variables 管理主题色，变量名统一前缀 `--xn-`：

```css
:root {
  --xn-primary: #2563EB;
  --xn-accent: #E85D3A;
}
```

- 图片必须设置 `mode`、`lazy-load`，控制包体积与加载性能。

### 5.5 最佳实践

- 分包加载：按业务模块分包，控制主包体积 < 2MB。
- 图片上传前本地压缩，最大宽度 1280px，质量 0.8。
- 敏感信息（token、用户信息）使用 `wx.setStorage` 加密存储或内存持有。
- 生命周期函数保持精简，复杂逻辑拆分到 service 或 util。

## 6. Vue 3 Web 管理后台规范

### 6.1 技术栈约定

- Vue 3 Composition API + `<script setup>` + TypeScript。
- 状态管理使用 Pinia，按业务领域拆分 store。
- UI 组件库统一使用 Element Plus。
- HTTP 客户端统一使用 Axios，封装请求/响应拦截器。

### 6.2 目录与文件组织

```text
web-admin/
├── src/
│   ├── api/              # 接口定义，按模块拆分
│   ├── assets/
│   ├── components/       # 通用业务组件
│   ├── composables/      # 通用逻辑复用
│   ├── layouts/
│   ├── router/
│   ├── stores/           # Pinia stores
│   ├── styles/
│   ├── utils/
│   └── views/            # 页面级组件
```

### 6.3 组件规范

- 组件文件名使用 PascalCase：
  - 单文件组件：`RepairOrderTable.vue`
  - 多单词组件：避免与 HTML 标签冲突。
- `script setup` 中按顺序组织：imports → types → props → emits → state → computed → watch → lifecycle → methods。
- Props 必须声明类型与默认值：

```vue
<script setup lang="ts">
interface Props {
  orderId: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
});
</script>
```

### 6.4 TypeScript 规范

- 所有 `.ts` / `.vue` 文件启用 `strict` 模式。
- 接口名使用 PascalCase，避免使用 `I` 前缀。
- 使用 `type` 定义联合类型，使用 `interface` 定义对象结构。
- 禁止使用 `any`；无法推断时使用 `unknown` 并显式类型收窄。

### 6.5 样式规范

- 使用 Tailwind CSS 或 Element Plus 变量，保持视觉一致性。
- 组件局部样式使用 `<style scoped>`，全局样式统一放在 `styles/`。
- 颜色、间距、圆角等设计 token 使用 CSS Variables 集中管理。

## 7. Node.js / TypeScript 后端服务规范

### 7.1 技术栈约定

- Node.js 20 LTS + TypeScript + NestJS（推荐）或 Express。
- ORM 使用 Prisma。
- 数据库使用 PostgreSQL，缓存 / 队列 / 会话使用 Redis。
- 接口文档使用 Swagger / OpenAPI 自动生成。

### 7.2 目录与文件组织（NestJS 示例）

```text
server/
├── src/
│   ├── modules/
│   │   └── repair-order/
│   │       ├── repair-order.controller.ts
│   │       ├── repair-order.service.ts
│   │       ├── repair-order.module.ts
│   │       ├── dto/
│   │       │   ├── create-repair-order.dto.ts
│   │       │   └── update-repair-order.dto.ts
│   │       └── entities/
│   │           └── repair-order.entity.ts
│   ├── common/           # 过滤器、拦截器、守卫、装饰器、工具
│   ├── config/
│   ├── prisma/
│   └── main.ts
```

### 7.3 API 设计规范

- RESTful 资源路径使用名词复数：
  - `GET    /api/v1/repair-orders`
  - `POST   /api/v1/repair-orders`
  - `GET    /api/v1/repair-orders/:id`
  - `PATCH  /api/v1/repair-orders/:id`
  - `PATCH  /api/v1/repair-orders/:id/assign`
- 状态流转使用显式动作路径，如 `/repair-orders/:id/accept`。
- 统一响应格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

- 列表接口统一支持 `page` + `pageSize` 分页。
- API 版本前缀：`/api/v1/`。

### 7.4 服务层规范

- Controller 只负责参数校验与响应组装，业务逻辑交给 Service。
- Service 方法保持单一职责，复杂流程使用私有方法拆分。
- 数据库访问统一通过 Repository / Prisma Client，禁止在 Controller 中直接写 SQL。
- 异常统一使用 NestJS `HttpException` 或自定义异常过滤器处理。

### 7.5 数据与安全规范

- 敏感字段（手机号、身份证）使用 AES-256-GCM 加密存储。
- 接口限流、防刷、验证码机制统一在网关层实现。
- 日志脱敏：禁止打印 token、密码、手机号、身份证号。
- 所有外部调用（AI 服务、微信接口）必须设置超时与重试机制。

## 8. 数据库与 SQL 规范

- 表名与字段名使用 snake_case，表名使用复数形式：`repair_orders`, `repair_order_logs`。
- 主键统一使用 `id`，类型推荐 `UUID` 或自增 `BIGINT`。
- 时间字段统一使用 `created_at`, `updated_at`。
- 索引命名：`idx_表名_字段名`。
- 复杂查询优先使用 ORM；手写 SQL 时必须参数化，禁止字符串拼接防止 SQL 注入。
- 状态字段使用枚举或 smallint，避免魔法数字。

## 9. 错误处理与日志

- 所有异步操作使用 `try / catch` 或框架异常拦截器。
- 错误日志包含上下文信息，但不包含敏感数据。
- 用户友好错误提示与内部错误日志分离。
- 关键操作（派单、状态变更、权限调整）记录审计日志。

```typescript
// 好：说明失败原因与上下文，便于排查
logger.error(`Failed to dispatch order ${orderId}: repairman ${repairmanId} is offline`);

// 坏：暴露内部异常细节与敏感字段
logger.error(`Database error: ${error.message}, user phone: ${user.phone}`);
```

## 10. 提交信息规范（Angular 规范）

所有提交信息必须遵循 [Angular Commit Message Conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)。

### 格式

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 说明

| Type | 含义 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 仅文档变更 |
| `style` | 不影响代码含义的格式变更（空格、分号、换行等） |
| `refactor` | 重构（既不是新功能也不是修复 Bug） |
| `perf` | 性能优化 |
| `test` | 新增或修改测试 |
| `chore` | 构建过程、辅助工具、依赖升级等 |
| `ci` | CI/CD 配置变更 |
| `revert` | 回滚提交 |

### Scope 建议

- `mini`：微信小程序端
- `web`：Vue 3 Web 管理后台
- `server`：Node.js 后端服务
- `db`：数据库迁移 / 模型
- `ai`：AI 服务相关
- `docs`：文档

### 示例

```text
feat(mini): 添加拍照上传与本地图片压缩功能

fix(server): 修复派单时并发竞争导致重复分配的问题

refactor(web): 将工单列表逻辑提取为 useRepairOrderList composable

docs: 更新 README 中的本地启动说明
```

## 11. 测试规范

- 新功能必须包含单元测试或接口测试。
- 测试用例应独立、可重复，不依赖外部随机状态。
- 后端接口使用 `jest` + `supertest`，数据库测试使用独立测试数据库或事务回滚。
- 小程序与 Web 端关键交互使用 E2E 或手动测试清单覆盖。

## 12. 代码审查与规范执行

- 所有代码变更通过 Pull Request / Merge Request 提交。
- 审查关注点：
  - 是否遵循命名与格式规范。
  - 是否存在重复代码或过度设计。
  - 是否有敏感信息泄露风险。
  - 注释是否解释「为什么」。
- 推荐使用 ESLint + Prettier + husky + lint-staged 在提交前自动校验。

## 13. 示例

### 正确示例

```typescript
// 根据工单当前负载与技能标签选择最优维修人员
// 规则：类别匹配 > 当前负载最低 > 距离最近
function selectBestRepairman(
  order: RepairOrder,
  candidates: Repairman[]
): Repairman | null {
  if (candidates.length === 0) {
    return null;
  }

  const scored = candidates.map((repairman) => ({
    repairman,
    score: calculateDispatchScore(order, repairman),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].repairman;
}
```

### 错误示例

```typescript
// 选择维修人员
function select(a: any, b: any) {
  let temp: any = [];
  for (let i = 0; i < b.length; i++) {
    // 计算分数
    let s = 0;
    if (b[i].categories.includes(a.category)) s += 100;
    s += (10 - b[i].currentLoad) * 5;
    temp.push({ r: b[i], s });
  }
  temp.sort((x: any, y: any) => y.s - x.s);
  return temp[0].r;
}
```

---

本规范将随项目演进持续更新。如有疑问或改进建议，请通过 Issue 或代码评审讨论。
