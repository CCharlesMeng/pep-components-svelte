# 前端架构分层准则（务实版）

## 🎯 适用场景判断（先问自己）

```
项目复杂度评估：
├─ 简单（< 10 页面，无复杂业务）      → ❌ 不要 DDD，用简单分层即可
├─ 中等（10-50 页面，中等业务逻辑）   → ✅ 轻量 DDD（3 层：View/Logic/Data）
└─ 复杂（> 50 页面，复杂业务规则）    → ✅ 完整 DDD（4 层 + 防腐层）
```

**核心原则：架构是为了降低复杂度，而非增加约束。如果分层让开发变慢，说明过度设计了。**

---

## 1️⃣ 依赖方向铁律

```
┌─────────────────────────────────────────┐
│  View/Presentation Layer (表现层)       │  ← 用户交互、路由、组件状态
│  - Components, Hooks, ViewModels        │
└─────────────┬───────────────────────────┘
              │ 依赖
              ↓
┌─────────────────────────────────────────┐
│  Application Layer (应用层)             │  ← 业务流程编排、Use Cases
│  - Use Cases, Application Services      │
└─────────────┬───────────────────────────┘
              │ 依赖
              ↓
┌─────────────────────────────────────────┐
│  Domain Layer (领域层)                  │  ← 核心业务逻辑、实体、规则
│  - Entities, Value Objects, Interfaces  │  ⚠️ 不依赖业务基础设施
└─────────────┬───────────────────────────┘
              ↑ 实现
              │
┌─────────────────────────────────────────┐
│  Infrastructure Layer (基础设施层)      │
│  ├─ 业务基础设施：Repositories, Adapters│  ← 实现领域接口（依赖倒置）
│  └─ 技术基础设施：HTTP, Logger, Utils  │  ← 全局可用（纯技术工具）
└─────────────────────────────────────────┘
```

### ✅ 合法依赖

```typescript
// 业务依赖链
View → Application → Domain ← Infrastructure(业务基础设施)

// 技术基础设施：所有层都可以使用
所有层 → Infrastructure(技术基础设施)
```

### 📦 基础设施层分类

#### 1️⃣ 业务基础设施（需要依赖倒置）
```typescript
// ✅ 实现领域层定义的接口
class UserRepositoryImpl implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // 实现领域接口
  }
}

// ❌ Domain 层不能直接依赖这些具体实现
```

#### 2️⃣ 技术基础设施（全局可用）
```typescript
// ✅ 所有层都可以使用（纯技术工具，无业务逻辑）
// Logger
import { logger } from '@/infrastructure/logger'
logger.info('User logged in', { userId })

// 工具函数
import { formatDate, debounce } from '@/infrastructure/utils'

```

### ❌ 禁止依赖

```typescript
❌ Domain → UserRepositoryImpl       // 领域层不能依赖具体 Repository 实现
❌ Domain → View                 // 领域层不能依赖 UI
❌ Application → View            // 应用层不能依赖 UI 组件（除非是纯展示组件工具）

✅ Domain → logger              // 可以使用日志工具
✅ Application → formatDate     // 可以使用技术工具
```

### 🎯 判断标准

```typescript
// 问：这个工具应该放在哪？
const someFunction = () => { }

判断流程：
1. 包含业务规则？
   ├─ 是 → Domain/Application 层
   └─ 否 → 继续判断

2. 依赖外部系统（API、数据库、缓存）？
   ├─ 是 → Infrastructure(业务基础设施)，需要接口契约
   └─ 否 → 继续判断

3. 纯技术工具（格式化、日期、日志）？
   ├─ 是 → Infrastructure(技术基础设施)，全局可用
   └─ 否 → Utils（与架构层无关的纯函数）
```

---

## 2️⃣ 分层职责与代码示例

### 📁 Domain Layer（领域层）- 业务的核心真理

**职责**：定义业务实体、规则、接口契约（不关心技术实现）

```typescript
// domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    private _role: UserRole
  ) {}

  // ✅ 业务规则内聚在实体内
  canAccessAdmin(): boolean {
    return this._role === 'admin' || this._role === 'super_admin'
  }

  // ✅ 业务校验
  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format')
    }
    this.email = newEmail
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}

// domain/interfaces/UserRepository.ts（接口契约）
export interface UserRepository {
  findById(id: string): Promise<User | null>
  save(user: User): Promise<void>
}
```

**禁止事项**：
```typescript
❌ import axios from 'axios'           // 不能直接调用 API（需通过 Repository）
❌ import { Button } from '@/components' // 不能依赖 UI 组件
❌ localStorage.getItem('token')      // 不能直接操作数据存储（需通过 Repository/Service）
❌ await fetch('/api/users')          // 不能直接发起网络请求

// ✅ 可以使用技术工具
✅ logger.info('User created')        // 可以使用日志
✅ formatDate(user.createdAt)         // 可以使用纯工具函数
```

---

### 📁 Application Layer（应用层）- 业务流程编排

**职责**：协调领域对象，实现完整业务用例

```typescript
// application/useCases/LoginUser.ts
export class LoginUser {
  constructor(
    private userRepo: UserRepository,      // 依赖接口，不依赖实现
    private authService: AuthService
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    // 1. 查询用户
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' }
    }

    // 2. 验证密码（调用领域服务）
    const isValid = await this.authService.verifyPassword(user, password)
    if (!isValid) {
      return { success: false, error: 'INVALID_PASSWORD' }
    }

    // 3. 生成令牌
    const token = await this.authService.generateToken(user)
    
    return { success: true, token, user }
  }
}

// application/dto/LoginResult.ts（数据传输对象）
export type LoginResult = 
  | { success: true; token: string; user: User }
  | { success: false; error: string }
```

**特点**：
- ✅ 无 UI 逻辑（可以在任何 UI 框架中复用）
- ✅ 可测试（不依赖具体实现，易 mock）
- ✅ 编排业务流程，不实现技术细节

---

### 📁 Infrastructure Layer（基础设施层）- 技术实现

**职责**：实现领域层定义的接口，处理 API、缓存、存储等

```typescript
// infrastructure/repositories/UserRepositoryImpl.ts
import { UserRepository } from '@/domain/interfaces/UserRepository'
import { User } from '@/domain/entities/User'
import { apiClient } from './apiClient'

export class UserRepositoryImpl implements UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`/users/${id}`)
      // 防腐层：将 API Response 转换为 Domain Entity
      return this.mapToDomain(response.data)
    } catch (err) {
      console.error('Failed to fetch user:', err)
      return null
    }
  }

  async save(user: User): Promise<void> {
    const dto = this.mapToDTO(user)  // Domain → API DTO
    await apiClient.put(`/users/${user.id}`, dto)
  }

  // 防腐层（ACL）：隔离外部 API 结构变化
  private mapToDomain(apiData: any): User {
    return new User(
      apiData.id,
      apiData.email,
      apiData.user_role  // snake_case → camelCase
    )
  }

  private mapToDTO(user: User): any {
    return {
      id: user.id,
      email: user.email,
      user_role: user.role
    }
  }
}
```

**关键点**：
- ✅ 防腐层（Mapper）：隔离后端 API 变化
- ✅ 错误处理：返回缺省值或抛出业务异常
- ✅ 可替换：可以轻松切换为 Mock 实现用于测试

---

### 📁 Presentation Layer（表现层）- UI 与用户交互

**职责**：渲染 UI，处理用户事件，调用 Application 层

```typescript
// presentation/pages/LoginPage.tsx
import { LoginUser } from '@/application/useCases/LoginUser'
import { userRepositoryImpl } from '@/infrastructure/repositories/UserRepositoryImpl'
import { authServiceImpl } from '@/infrastructure/services/AuthServiceImpl'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    // ✅ 通过 Use Case 执行业务逻辑（注入具体实现）
    const loginUseCase = new LoginUser(userRepositoryImpl, authServiceImpl)
    const result = await loginUseCase.execute(email, password)

    if (result.success) {
      // ✅ UI 层只处理展示逻辑
      toast.success('登录成功')
      router.push('/dashboard')
    } else {
      // ✅ 错误码映射为用户提示
      const message = errorMessages[result.error] || '登录失败'
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">登录</button>
    </form>
  )
}
```

**禁止事项**：
```typescript
❌ const user = await axios.get('/api/user')    // 不直接调 API
❌ if (!email.includes('@')) { }                 // 不写业务校验
❌ const isAdmin = user.role === 'admin'        // 不写业务判断
```

---

## 3️⃣ 前端特殊场景处理

### 组件内部状态（UI 状态 vs 业务状态）
```typescript
// ✅ UI 状态：可以留在组件内
const [isModalOpen, setModalOpen] = useState(false)
const [currentTab, setCurrentTab] = useState('profile')

// ⚠️ 业务状态：应该提升到 Application 层
const [userProfile, setUserProfile] = useState<User>()  // 考虑用 Use Case 管理
```

### 路由守卫（权限判断）
```typescript
// ✅ 正确：调用领域层的业务规则
function ProtectedRoute({ user, children }) {
  if (!user.canAccessAdmin()) {  // 领域层方法
    return <Navigate to="/forbidden" />
  }
  return children
}

// ❌ 错误：在路由层写业务逻辑
if (user.role === 'admin' || user.role === 'super_admin') { }
```

### 表单校验
```typescript
// ✅ 前端实时校验（UX）+ 领域层最终校验（安全）
const handleSubmit = (data: FormData) => {
  // 前端快速反馈
  if (!data.email) {
    showError('邮箱不能为空')
    return
  }

  // 领域层最终校验
  try {
    user.updateEmail(data.email)  // 领域层会抛出业务异常
  } catch (err) {
    showError(err.message)
  }
}
```

---

## 4️⃣ 常见反模式警示

```typescript
// 🚨 反模式 1：层级穿透
// ❌ 组件直接调用 Repository
import { userRepository } from '@/infrastructure/repositories'
const user = await userRepository.findById(id)  // 绕过 Application 层

// ✅ 正确：通过 Use Case
const getUserUseCase = new GetUser(userRepository)
const user = await getUserUseCase.execute(id)

// 🚨 反模式 2：领域层依赖基础设施
// ❌ Domain 层直接调用 API
class User {
  async save() {
    await axios.post('/users', this)  // 领域层不该知道 axios
  }
}

// ✅ 正确：领域层只定义接口
interface UserRepository {
  save(user: User): Promise<void>
}

// 🚨 反模式 3：基础设施层包含业务逻辑
// ❌ Repository 中写业务判断
async findActiveUsers() {
  const users = await api.get('/users')
  return users.filter(u => u.status === 'active')  // 业务规则
}

// ✅ 正确：业务逻辑在 Domain/Application 层
// Repository 只负责数据获取，过滤逻辑在 Use Case 或 Entity 中

// 🚨 反模式 4：循环依赖
// ❌ Use Case 互相调用
class CreateOrder {
  async execute() {
    const payment = await new ProcessPayment().execute()  // 循环依赖风险
  }
}

// ✅ 正确：共享逻辑提取到 Domain Service
class OrderDomainService {
  processPayment() { }
}
```

---

## 5️⃣ 轻量化建议（适配不同团队）

### 小型项目（< 10 页面）
```
简化为 3 层：
├─ components/     # 组件 + 业务逻辑（混合）
├─ services/       # API 调用
└─ utils/          # 工具函数
```

### 中型项目（10-50 页面）
```
轻量 DDD：
├─ presentation/   # UI 组件
├─ application/    # Use Cases（核心）
├─ domain/         # 实体 + 接口（简化，不强制 Repository）
└─ api/            # API 调用（直接实现，无防腐层）
```

### 大型项目（> 50 页面）
```
完整 DDD：
├─ presentation/
├─ application/
├─ domain/
│   ├─ entities/
│   ├─ interfaces/
│   └─ services/
└─ infrastructure/
    ├─ repositories/
    ├─ adapters/      # 防腐层
    └─ services/
```

---

## 6️⃣ AI 输出格式

### 实现新功能时的输出结构
```markdown
## 📋 架构设计

**场景复杂度**: 中等（使用轻量 DDD）

**分层决策**:
- Domain: User 实体（包含权限校验）+ UserRepository 接口
- Application: LoginUser Use Case（流程编排）
- Infrastructure: UserRepositoryImpl 实现（API 调用 + 防腐层）
- Presentation: LoginPage 组件（UI 交互）

---

## 📁 Domain Layer

\`\`\`typescript
// domain/entities/User.ts
...
\`\`\`

---

## 📁 Application Layer

\`\`\`typescript
// application/useCases/LoginUser.ts
...
\`\`\`

---

## 📁 Infrastructure Layer

\`\`\`typescript
// infrastructure/repositories/UserRepositoryImpl.ts
...
\`\`\`

---

## 📁 Presentation Layer

\`\`\`typescript
// presentation/pages/LoginPage.tsx
...
\`\`\`

---

## 🔍 架构检查清单

- [ ] 依赖方向正确（外层依赖内层）
- [ ] Domain 层无基础设施依赖
- [ ] 业务逻辑在 Domain/Application 层（不在组件中）
- [ ] 防腐层已实现（API Response → Domain Entity）
- [ ] Use Case 可测试（依赖注入接口）
```

---

## 🎯 关键原则总结

1. **依赖方向**：外层依赖内层，内层不知道外层存在
2. **业务内聚**：业务规则必须在 Domain/Application 层，不在 UI
3. **防腐层**：隔离外部 API 变化，保护领域模型
4. **可测试性**：Use Case 依赖接口，可轻松 Mock
5. **务实优先**：简单场景别过度设计，复杂场景才上 DDD

**元原则：架构是为了应对复杂度，不是为了炫技。如果团队觉得架构变成了负担，说明过度设计了。**
