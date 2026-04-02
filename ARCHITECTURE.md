# 组件架构规范（军规）

> **适用范围**：所有组件开发必须遵守本规范  
> **版本**：v2.0  
> **更新日期**：2026-01-13

---

## 📜 核心原则（必须遵守）

### 1. Unix 哲学

```
✅ 一个组件只做一件事，并做好
✅ 通过组合解决复杂问题，而非继承
✅ 组件是数据的过滤器：输入 Props → 处理逻辑 → 输出 UI + Events
```

### 2. 整洁架构

```
依赖规则：外层依赖内层，内层不知道外层

┌─────────────────────────┐
│  UI Components          │  ← 展示层
├─────────────────────────┤
│  State Primitives       │  ← 应用层
├─────────────────────────┤
│  Pure Logic & Types     │  ← 领域层
└─────────────────────────┘
```

### 3. 组件分类

- **Primitives（原语）**：Button、Input、Icon - 无业务逻辑
- **Molecules（分子）**：Card、Modal、Tabs - 简单交互
- **Organisms（有机）**：业务组件 - 完整功能

---

## 🎨 样式系统（三层令牌）

### 第一层：原始值（primitives.css）

```css
/* 只定义最基础的常量，无语义 */
:root {
  --primitive-gray-900: #212121;
  --primitive-red-500: #e41e2b;
  --primitive-space-4: 16px;
  --primitive-font-lg: 18px;
}
```

### 第二层：语义值（semantic.css）

```css
/* 赋予原始值语义，包含组件含义 */
:root {
  --text-primary: var(--primitive-gray-900);
  --bg-primary: #ffffff;
  
  /* 组件级语义 */
  --card-bg: var(--bg-primary);
  --card-padding: var(--primitive-space-6);
  --button-primary-bg: var(--primitive-gray-900);
}
```

### 第三层：主题（themes.css）

```css
/* 润物细无声的主题切换 */
[data-theme="dark"] {
  --text-primary: #ffffff;
  --bg-primary: #212121;
}
```

### ✅ 样式规范

```css
/* ✅ 正确：使用令牌 */
.card {
  background: var(--card-bg);
  padding: var(--card-padding);
  color: var(--text-primary);
}

/* ❌ 错误：硬编码 */
.card {
  background: #ffffff;
  padding: 24px;
  color: #111;
}
```

---

## ⚡ 状态管理（Svelte 5 Runes）

### 命名规范（重要！）

```typescript
// ✅ 正确：使用 createXXX 或名词
export function createCountdown() { ... }
export function countdown() { ... }
export function timer() { ... }

// ❌ 错误：不要模仿 React Hooks
export function useCountdown() { ... }  // 禁止！
export function useTimer() { ... }      // 禁止！
```

### 状态原语模板

```typescript
// shared/state/countdown.svelte.ts
export function createCountdown(interval = 1000) {
  let timestamp = $state(Date.now());
  
  $effect(() => {
    const timer = setInterval(() => {
      timestamp = Date.now();
    }, interval);
    
    // 清理函数
    return () => clearInterval(timer);
  });
  
  return {
    get current() { return timestamp; }
  };
}
```

---

## 📁 目录结构规范

### 单个组件结构

```
components/your-component/
├── src/
│   ├── index.svelte              # 主组件（遵循特征架构 pickTrait）
│   ├── types.ts                  # 类型定义（使用 UseTraits 组合）
│   ├── component.server.ts       # 服务端数据
│   │
│   ├── components/               # 子组件
│   │   ├── Header.svelte
│   │   └── Item.svelte
│   │
│   ├── state/                    # 状态原语（局部）
│   │   └── filter.svelte.ts
│   │
│   └── logic/                    # 纯函数逻辑
│       └── transform.ts
│
├── tests/
│   ├── unit/
│   │   └── consistency.spec.ts   # 一致性看护测试
│   └── integration/
│
├── data.json
└── README.md
```

---

## 🧩 特征架构 (Trait-based Architecture)

为了应对 100+ 组件能力的复用与分发，本项目采用 **特征注册 (Trait Registry)** 模式。其核心目标是解耦通用能力（如标题、间距、显隐等）与业务逻辑。

### 1. 类型注册 (types.ts)
禁止深层 `extends`。必须将业务属性与通用楼层特征进行交叉组合。

```typescript
import type { UseTraits } from "@pep/shared/ui/types";

// ✅ 正确：定义业务属性并组合特征
export interface CardBusinessProps {
  cardType?: 'left' | 'center';
}

export type YourComponentProps = CardBusinessProps & UseTraits<'header' | 'spacing' | 'visibility'>;
```

### 2. 显式属性分拣 (index.svelte)
主组件入口禁止大规模解构 Props。必须使用 `pickTrait` 显式声明属性流向，分发给共享组件。

```svelte
<script lang="ts">
  import { pickTrait } from "@pep/shared/ui/traits";
  let props: YourComponentProps = $props();

  // 1. 透明分拣特征属性
  const headerProps = $derived(pickTrait(props, 'header'));
  const spacingProps = $derived(pickTrait(props, 'spacing'));

  // 2. 局部使用业务属性
  const { cardType } = props;
</script>

<div class:hide-mb={visibilityProps.isShowMb === false}>
  <Floor
    bg="white"
    title={headerProps.title}
    subtitle={headerProps.subtitle}
    mergeTopSpacing={spacingProps.isMergeTopSpacing}
    mergeBottomSpacing={spacingProps.isMergeBottomSpacing}
  >
    <CardGrid type={cardType} />
  </Floor>
</div>
```

### 3. 一致性看护
每个组件必须在 `tests/unit/consistency.spec.ts` 中编写看护用例，确保 `schema.json`、`types.ts` 与 `pickTrait` 映射表完全一致。

---

## 共享资源结构

```
shared/
├── primitives/          # 基础组件（Button、Input）
├── molecules/           # 分子组件（Card、Modal）
├── state/               # 状态原语（全局）
├── utils/               # 工具函数
├── styles/
│   └── tokens/
│       ├── primitives.css
│       ├── semantic.css
│       └── themes.css
└── types/               # 全局类型
```

---

## 💻 代码规范

### 组件编写顺序

```svelte
<script lang="ts">
  // 1. 导入：Svelte → 第三方 → 本地
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { createTabs } from '$lib/state/tabs.svelte';
  
  // 2. Props 定义
  let { title, items = [] } = $props<{ title: string; items?: Item[] }>();
  
  // 3. 状态管理
  const tabs = createTabs(items);
  
  // 4. 派生状态
  const activeItem = $derived(tabs.activeTab);
  
  // 5. 函数定义
  function handleClick() { }
</script>

<!-- 6. 模板 -->
<div class="container">
  <h2>{title}</h2>
</div>

<!-- 7. 样式（使用令牌） -->
<style>
  .container {
    padding: var(--layout-padding-y);
  }
</style>
```

### 响应式策略（PC 优先）

```css
/* 默认：PC 端 */
.card-grid {
  grid-template-columns: repeat(3, 1fr);
  gap: var(--grid-gap);
}

/* 渐进增强：移动端 */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## ✅ 组件开发检查清单

### 开发前

- [ ] 确定组件类型（原语/分子/有机）
- [ ] 定义类型契约（Props、Events、Slots）
- [ ] 检查是否可复用现有组件

### 开发中

- [ ] 使用设计令牌（无硬编码颜色、间距）
- [ ] 状态逻辑抽取到 state 层
- [ ] 主组件 < 100 行，子组件 < 150 行
- [ ] TypeScript 严格模式
- [ ] 遵循命名规范（不用 useXXX）

### 开发后

- [ ] 编写单元测试（覆盖率 > 70%）
- [ ] 编写集成测试
- [ ] 更新 README 文档
- [ ] Code Review 通过
- [ ] 性能检查通过

---

## ❌ 禁止事项（违反将被打回）

### 1. 样式禁止

```css
/* ❌ 禁止：硬编码颜色 */
color: #333;
background: #f5f5f5;
background: rgb(255, 255, 255);

/* ❌ 禁止：硬编码间距 */
padding: 16px;
margin: 20px;

/* ❌ 禁止：魔术数字 */
width: 1200px;
font-size: 14px;
```

### 2. 命名禁止

```typescript
// ❌ 禁止：React Hooks 风格
export function useCountdown() { }
export function useTimer() { }
export function useTabs() { }

// ❌ 禁止：无语义命名
export function func1() { }
let data: any;
```

### 3. 架构禁止

```typescript
// ❌ 禁止：在 UI 组件中直接调用 API
async function loadData() {
  const res = await fetch('/api/data');
}

// ❌ 禁止：在模板中写复杂逻辑
{#if data && data.items && data.items.length > 0 && !loading && isValid()}
  ...
{/if}

// ❌ 禁止：忘记清理副作用
setInterval(() => { ... }, 1000);  // 内存泄漏！

// ✅ 正确：使用 $effect 自动清理
$effect(() => {
  const timer = setInterval(() => { ... }, 1000);
  return () => clearInterval(timer);
});
```

### 4. 组件禁止

```svelte
<!-- ❌ 禁止：配置地狱的上帝组件 -->
<Card
  hasHeader={true}
  hasFooter={true}
  headerAlign="center"
  ...30个其他props
/>

<!-- ✅ 正确：组合式设计 -->
<Card>
  {#snippet header()}
    <CardHeader />
  {/snippet}
  
  <CardContent />
</Card>
```

---

## 🧪 测试规范

### 测试覆盖率要求

```
单元测试：70%（纯函数、状态原语）
集成测试：60%（组件交互）
E2E 测试：关键流程即可
```

### 测试模板

```typescript
// tests/unit/logic/date.test.ts
import { describe, it, expect } from 'vitest';
import { isExpired } from '$lib/utils/date';

describe('date utils', () => {
  it('should detect expired time', () => {
    const past = '2020-01-01 00:00:00';
    expect(isExpired(past, Date.now())).toBe(true);
  });
});
```

---

## 🔍 代码审查检查点

### 架构层面

- [ ] 组件职责单一
- [ ] 依赖方向正确（外层→内层）
- [ ] 状态逻辑已抽取
- [ ] 无跨层依赖

### 样式层面

- [ ] 使用设计令牌
- [ ] 无硬编码值
- [ ] 响应式遵循 PC 优先

### 代码层面

- [ ] TypeScript 严格模式通过
- [ ] 无 any 类型（除特殊情况）
- [ ] 命名规范正确
- [ ] 文件大小合理（< 200 行）

### 测试层面

- [ ] 关键逻辑有单元测试
- [ ] 组件有集成测试
- [ ] 测试覆盖率达标

---

## 📊 性能指标

### 性能阈值

```
首次渲染：< 100ms
重新渲染：< 16ms (60fps)
Bundle 大小：< 50KB
内存占用：< 10MB
```

### 优化手段

- 使用 `$derived` 而非手动同步
- 长列表使用虚拟滚动
- 图片使用 `loading="lazy"`
- 大组件使用动态导入

---

## 🚀 Git 提交前检查

```bash
# 运行以下命令，全部通过才能提交
npm run lint              # 代码规范检查
npm run lint:style        # 样式规范检查
npm run architecture:guard # 架构检查
npm run typecheck         # 类型检查
npm run test:unit         # 单元测试
```

---

## 📚 快速参考

### 常用令牌

```css
/* 颜色 */
--text-primary, --text-secondary, --text-accent
--bg-primary, --bg-secondary, --bg-elevated

/* 间距 */
--primitive-space-{1,2,3,4,5,6,8,10,12,15}

/* 字体 */
--primitive-font-{xs,sm,base,lg,xl,2xl,3xl}

/* 组件 */
--card-bg, --card-padding, --card-radius
--button-primary-bg, --button-primary-text
```

### 常用命令

```bash
# 开发
npm run dev

# 测试
npm run test:watch

# 构建
npm run build

# 文档
npm run storybook
```

---

## ⚠️ 违规处理

**警告**（第一次违规）：
- Code Review 打回
- 要求修改后重新提交

**严重警告**（重复违规）：
- 记录到团队 KPI
- 架构评审会议讨论

**一票否决**（重大违规）：
- 使用 `useXXX` 命名
- 硬编码样式超过 5 处
- 组件超过 300 行
- 无测试覆盖

---

## 💡 常见问题

**Q: 什么时候需要拆分组件？**  
A: 超过 200 行，或者逻辑可以独立复用时。

**Q: 什么时候使用状态原语？**  
A: 状态逻辑需要在多个组件间共享时。

**Q: 如何快速学习 Svelte 5 Runes？**  
A: 查看 `shared/state/` 下的现有示例。

**Q: 遇到架构问题找谁？**  
A: 提 Issue 或在架构评审会议讨论。

---

## 📖 延伸阅读

- [完整架构方案](.cursor/plans/svelte_组件架构重构方案_*.plan.md)
- [Svelte 5 文档](https://svelte-5-preview.vercel.app/docs)
- [设计令牌规范](https://design-tokens.github.io/community-group/format/)

---

**Remember**:

> "优秀的代码不是写出来的，是重构出来的。"  
> "架构规范不是束缚，而是自由的保障。"  
> "遵守规范，是对团队最大的尊重。"

---

**维护者**：前端架构团队  
**问题反馈**：提交 Issue 或联系架构师
