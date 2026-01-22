# TypeScript 工程准则

## 原则：信任推断，契约显式，错误优先

---

## 1️⃣ 类型系统（边界清晰）

### ✅ DO
```typescript
// 契约边界显式标注
export function fetchUser(id: string): Promise<User> { }

// 内部变量信任推断
const users = await fetchUser('123')  // TS 自动推断 User 类型

// 不确定类型用 unknown + 收窄
function parse(raw: unknown) {
  if (typeof raw === 'string') { /* ... */ }
}

// Union Type 优于 Enum
type Status = 'pending' | 'success' | 'error'  // 可 tree-shaking
```

### ❌ DON'T
```typescript
❌ const name: string = 'John'  // 冗余标注
❌ data as User                 // 危险断言（除非配合注释说明为何安全）
❌ enum Status { }              // 运行时开销，用 union type
❌ user?.profile?.avatar?.()    // 过度可选链，掩盖数据结构问题
```

### 🎯 关键决策
- **type vs interface**: 优先 `type`（联合类型、映射类型更灵活），仅在需要声明合并时用 `interface`
- **null vs undefined**: 统一使用 `undefined` 表示"缺失"，避免混用
- **泛型边界**: 超过 2 层嵌套泛型视为过度抽象警告

---

## 2️⃣ 错误处理（最容易忽略的部分）

### 🎯 三层策略（根据团队习惯选择）

#### 策略 1：抛出业务异常 + 全局拦截 ⭐️ 推荐（保持主流程顺畅）
```typescript
// 定义业务异常类（携带错误码）
class BusinessError extends Error {
  constructor(
    public code: string,
    message?: string,
    public meta?: Record<string, any>
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

// 业务逻辑：直接抛异常，不干扰主流程
async function login(credentials: Credentials): Promise<User> {
  if (!validate(credentials)) {
    throw new BusinessError('AUTH_INVALID', '用户名或密码错误')
  }
  if (isLocked(credentials.username)) {
    throw new BusinessError('AUTH_LOCKED', '账号已锁定')
  }
  return await authService.login(credentials)  // 主流程清晰
}

// 全局拦截器（各框架实现不同，此处仅示意）
globalErrorHandler.on(BusinessError, (err) => {
  // 根据 err.code 显示对应 Toast/Dialog
  toast.error(err.message)
  // 或通过事件总线分发
  eventBus.emit('business-error', err)
})
```

**优势**：业务主流程无分支，错误统一处理（适合 UI 密集型应用）

---

#### 策略 2：返回缺省值（静默处理）
```typescript
// ✅ 数据查询：失败不影响主流程
async function getUser(id: string): Promise<User | null> {
  try {
    return await api.fetchUser(id)
  } catch (err) {
    console.warn('User not found:', err)
    return null  // UI 可以优雅降级（显示空状态）
  }
}

// 使用时
const user = await getUser(id)
if (!user) {
  return <EmptyState />  // 自然的降级
}
```

**优势**：简单场景无需额外机制

---

#### 策略 3：联合类型（需要代码分支处理）
```typescript
// ✅ 需要根据错误类型执行不同逻辑
async function submitForm(data: FormData): Promise<'success' | 'duplicate' | 'invalid'> {
  if (isDuplicate(data)) return 'duplicate'
  if (!validate(data)) return 'invalid'
  await saveData(data)
  return 'success'
}

// 使用时
const result = await submitForm(data)
if (result === 'duplicate') {
  // 特殊处理：跳转到编辑页
  router.push(`/edit/${id}`)
} else if (result === 'invalid') {
  // 特殊处理：高亮错误字段
  highlightFields()
}
```

**优势**：类型安全，强制处理所有分支

---

### 📋 选择决策树

```
需要用户感知（Toast/弹窗）？
  ├─ 是 → 策略 1：抛异常 + 全局拦截
  └─ 否 → 继续判断
      
需要针对错误执行不同代码逻辑？
  ├─ 是 → 策略 3：联合类型
  └─ 否 → 策略 2：返回缺省值
```

---

### ⚙️ 团队适配建议
不同团队可根据以下因素调整：
- **UI 框架**：React/Vue/Svelte 的全局错误处理机制
- **状态管理**：Redux/Pinia/Zustand 的错误处理模式
- **API 层**：axios/fetch 拦截器的实现
- **团队偏好**：函数式 vs 面向对象风格

---

### ❌ 反模式（所有策略通用）
```typescript
❌ try { await Promise.all([...]) } catch { }  // 吞掉错误
❌ .catch(console.error)                       // 只打日志不处理
❌ throw 'error message'                       // 必须 throw Error 对象
❌ catch (err) { return err as User }          // 返回 Error 混入数据流
```

---

## 3️⃣ 函数与逻辑

### ✅ 实用准则
```typescript
// ✅ 尽早返回（减少嵌套）
function process(user?: User) {
  if (!user) return null
  if (!user.isActive) return null
  return user.profile
}

// ✅ 并发优先
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
])

// ✅ 副作用隔离
function calculateDiscount(price: number) { }  // 纯函数
async function saveOrder(order: Order) { }     // 副作用函数
```

### 🔢 行数建议
- **20 行内**: 理想状态
- **50 行内**: 可接受（复杂业务逻辑）
- **超过 80 行**: 必须重构

---

## 4️⃣ 工程规范

### 模块导入
```typescript
// ✅ 路径别名（跨目录引用）
import { Button } from '@/components/Button'

// ✅ 相对路径（同目录/子目录）
import { helper } from './utils'

// ✅ 类型导入分离（减少运行时体积）
import type { User } from './types'
```

### Tree-Shaking 友好导入 ⚠️ 性能关键
```typescript
// ❌ 引入整个包（打包体积暴增）
import _ from 'lodash'              // +70KB（即使只用 debounce）
import * as _ from 'lodash'         // 同上
import moment from 'moment'         // +230KB

// ✅ 按模块导入（仅打包使用的函数）
import debounce from 'lodash/debounce'       // ~2KB
import cloneDeep from 'lodash/cloneDeep'     // ~5KB
import { format } from 'date-fns'            // ~10KB

// ✅ 使用 ES Module 版本（自动 tree-shaking）
import { debounce } from 'lodash-es'         // 需要配置 bundler
import { cloneDeep } from 'lodash-es'
```

**强制规则**：对于大型工具库（lodash、moment、antd、element-ui 等），**必须**使用按模块导入，避免全量引入导致打包体积膨胀。

**检查方法**：
```bash
# 打包后检查体积
npm run build -- --analyze
# 或使用 webpack-bundle-analyzer、rollup-plugin-visualizer
```

### 命名规范（分层细化）

#### 1. 变量命名
```typescript
// ✅ 语义化局部变量（推断类型）
const activeUsers = users.filter(u => u.isActive)
const filteredList = data.filter(predicate)
const userCount = users.length

// ✅ 布尔值：is/has/can/should 前缀
const isLoading = ref(false)
const hasPermission = user.role === 'admin'
const canEdit = !isLocked && hasPermission
const shouldRefetch = timestamp > lastFetchTime

// ❌ 无意义命名
const data = await fetch()      // ❌ 改为 userData / orderList
const info = getInfo()          // ❌ 改为 userProfile / productDetails  
const temp = calculate()        // ❌ 改为 discountAmount / totalPrice
const flag = check()            // ❌ 改为 isValid / hasAccess

// ❌ 缩写过度
const usr = getUser()           // ❌ 改为 user
const btn = document.query()    // ❌ 改为 button
const idx = 0                   // ❌ 改为 index（除非在循环中）
```

#### 2. 函数/方法命名
```typescript
// ✅ 业务函数：动词 + 名词（清晰表达做什么）
async function getUserById(id: string) { }
async function updateUserProfile(userId: string, profile: Profile) { }
async function deleteOrder(orderId: string) { }
async function validateUserInput(data: FormData) { }

// ✅ 事件处理：动词 + 业务对象（不是 handle + 泛型事件名）
function submitLoginForm(event: FormEvent) { }        // ❌ handleSubmit
function closeModal() { }                             // ❌ handleClick
function openUserProfile(userId: string) { }          // ❌ handleUserClick
function confirmDeleteOrder(orderId: string) { }      // ❌ handleConfirm
function toggleSidebarVisibility() { }                // ❌ handleToggle

// 🎯 组件内部方法：on + 具体动作
const onLoginButtonClick = () => { }
const onFormSubmit = (data: FormData) => { }
const onPasswordInputChange = (value: string) => { }

// ✅ 转换/格式化：动词 + 描述
function formatCurrency(amount: number): string { }   // 格式化
function parseDateString(input: string): Date { }     // 解析
function convertToJSON(obj: Object): string { }       // 转换
function serializeFormData(form: FormData): string { }

// ✅ 工具函数：描述功能
function debounce(fn: Function, delay: number) { }
function isEmpty(value: unknown): boolean { }
function clamp(value: number, min: number, max: number) { }

// ❌ 反模式
function handleClick() { }       // ❌ 点击了什么？改为 submitLoginForm / closeModal
function handleSubmit() { }      // ❌ 提交了什么？改为 submitUserForm / saveOrderData
function onClick() { }           // ❌ 改为 onLoginButtonClick / onCancelButtonClick
function data() { }              // ❌ 改为 fetchUserData / loadOrderList
function process() { }           // ❌ 改为 processPayment / validateForm
function doSomething() { }       // ❌ 改为具体动作
function get_user_by_id() { }   // ❌ 驼峰式：getUserById
```

#### 3. 类型/接口/类命名
```typescript
// ✅ 类型/接口：PascalCase + 语义化
type User = { id: string; name: string }
type UserRole = 'admin' | 'user' | 'guest'
type ApiResponse<T> = { data: T; error?: string }

interface UserProfile {
  avatar: string
  bio: string
}

// ✅ 泛型参数：语义化命名（复杂场景）
type APIRequest<TData, TError = Error> = {
  data?: TData
  error?: TError
}

// ✅ 类名：名词，描述职责
class UserRepository { }
class AuthService { }
class PaymentProcessor { }

// ❌ 反模式
type userType = { }              // ❌ 改为 User（PascalCase）
interface IUser { }              // ❌ 不要 I 前缀（非 TS 风格）
type Data = { }                  // ❌ 过于宽泛
type T = string | number         // ❌ 改为 Primitive / ID
```

#### 4. 常量命名
```typescript
// ✅ 全局常量/配置：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3
const DEFAULT_TIMEOUT = 5000

// ✅ 枚举值/状态：UPPER_SNAKE_CASE
const OrderStatus = {
  PENDING_PAYMENT: 'pending_payment',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  ORDER_SHIPPED: 'order_shipped',
} as const

const HttpStatusCode = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
} as const

// ✅ 业务常量对象：camelCase
const routePaths = {
  home: '/',
  profile: '/profile',
  settings: '/settings',
} as const

const errorMessages = {
  notFound: '资源不存在',
  unauthorized: '无权限访问',
} as const
```

#### 5. 文件命名
```typescript
// ✅ 组件文件：PascalCase（匹配组件名）
UserProfile.tsx
OrderList.svelte
PaymentForm.vue

// ✅ 工具/逻辑文件：snake_case 或 PascalCase
user_service.ts  或  UserService.ts
date_utils.ts    或  DateUtils.ts
api_client.ts    或  ApiClient.ts

// ✅ 类型文件：统一命名
types.ts         // 模块内类型
global.d.ts      // 全局类型声明

// ✅ 测试文件：匹配源文件 + .spec/.test
user_service.spec.ts  或  UserService.spec.ts
PaymentForm.test.tsx
```

#### 🎯 核心原则
- **见名知义**：变量名应该能让 3 个月后的自己立即理解
- **层次一致**：同层级的命名风格必须统一
- **避免缩写**：除非是广泛认可的（id、url、api、max、min）
- **拒绝匈牙利命名法**：类型已经由 TS 推断，无需 `strName`、`arrUsers`

---

## 5️⃣ 常见陷阱警示

```typescript
// 🚨 循环依赖
// user.ts 导入 order.ts
// order.ts 导入 user.ts  ← 必须重构

// 🚨 可变性陷阱
const config = { api: 'xxx' }
config.api = 'yyy'  // ← 应该用 as const 或 Object.freeze

// 🚨 类型收窄失效
function process(value: string | number) {
  if (typeof value === 'string') {
    setTimeout(() => {
      value.trim()  // ❌ 类型收窄在异步中失效
    })
  }
}

// 🚨 Promise 未 await
async function load() {
  fetchData()  // ❌ 遗忘 await，静默失败
}
```

---

## 6️⃣ AI 协作协议

### 输出检查清单（7项核心必查）
```markdown
- [ ] 所有 Promise 已 await（最常见错误）
- [ ] 错误处理已覆盖（返回缺省值 / 抛 BusinessError等项目自定义错误）
- [ ] 大型库按模块导入（import debounce from 'lodash/debounce'）
- [ ] 函数命名具体化（submitLoginForm 而非 handleSubmit）
- [ ] 变量命名语义化（禁止 data/info/temp）
- [ ] 禁止 any（用 unknown + 类型收窄）
- [ ] 类型断言已注释原因（as 必须说明为何安全）
```

### 任务拆解格式
```
目标：实现用户认证模块
1. 定义 User/Credentials 类型
2. 实现 login/logout 纯逻辑
3. 封装 API 调用（副作用层）
4. 添加错误处理
```

### 代码输出分块
```
## 类型定义 (types.ts)
...

## 核心逻辑 (auth.ts)
...

## 变更说明
- 错误处理：失败返回 null，用户感知错误抛出 BusinessError
- 函数命名具体化：submitLoginForm 替代 handleSubmit
- Tree-shaking：lodash 改为按模块导入（debounce from 'lodash/debounce'）
- 分离纯逻辑与 API 调用
```

### 快速修复指令（出错时直接给方案）
```typescript
// ❌ 发现问题：Promise 未 await
loadData()  

// ✅ 直接给出修复（不废话）
await loadData()

// ❌ 发现问题：函数命名抽象
function handleClick() { }

// ✅ 直接给出修复
function submitLoginForm(event: FormEvent) { }

// ❌ 发现问题：全量导入
import _ from 'lodash'

// ✅ 直接给出修复
import debounce from 'lodash/debounce'
```

---

## 7️⃣ 注释准则

```typescript
// ✅ 解释"为什么"
// HACK: 绕过第三方库类型错误，已提 Issue #123
const data = response as any

// ✅ 标注业务陷阱
// 注意：status=0 表示成功（历史遗留）
if (response.status === 0) { }

// ❌ 解释"做什么"
// 循环遍历用户数组  ← 代码已经清晰表达
users.forEach(u => { })
```
---

**元原则：工程规范是为了降低认知负担，而非增加约束。当规则与直觉冲突时，重新审视规则的合理性。**
