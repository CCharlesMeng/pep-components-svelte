# PEP 组件开发指南

> 本指南面向所有参与本仓库组件开发的工程师，涵盖从创建新组件到上线交付的完整流程、规范与最佳实践。

## 目录

1. [核心概念](#1-核心概念)
2. [组件目录结构详解](#2-组件目录结构详解)
3. [类型系统与 Props 规范](#3-类型系统与-props-规范)
4. [schema.json 规范](#4-schemajson-规范)
5. [Svelte 5 Runes 编写规范](#5-svelte-5-runes-编写规范)
6. [状态管理模式](#6-状态管理模式)
7. [服务端数据 Loader](#7-服务端数据-loader)
8. [Mock 数据规范](#8-mock-数据规范)
9. [样式规范](#9-样式规范)
10. [构建系统详解](#10-构建系统详解)
11. [Vite 配置与路径别名](#11-vite-配置与路径别名)
12. [验收标准（GWT 规范）](#12-验收标准gwt-规范)
13. [创建新组件完整流程](#13-创建新组件完整流程)
14. [常见问题与排查](#14-常见问题与排查)

---

## 1. 核心概念

### 1.1 组件定位

本仓库的每个组件是一个**"楼层组件"（Floor Component）**，对应页面中的一个独立内容区块（楼层）。它的特点是：

- **数据驱动**：所有显示内容由外部注入的 Props（即 `schema.json` 定义的字段）控制，无内部硬编码文案
- **SSR 优先**：支持服务端渲染（SSR），同时支持客户端水合（Hydration）
- **可编辑**：通过 `schema.json` 接入可视化编辑器，运营人员可配置内容
- **独立部署**：每个组件是独立 npm 包，可单独构建和发布

### 1.2 生命周期

```
开发 (dev) → Mock 数据渲染
   ↓
构建 (build)
   ├── client build   → 浏览器端水合脚本
   ├── server build   → Node.js SSR 渲染
   ├── data build     → 服务端数据加载器
   └── editor build   → 可视化编辑器集成
```

---

## 2. 组件目录结构详解

```
components/pep-your-component/
│
├── src/                              # 源代码目录（必须）
│   ├── index.svelte                  # ★ 组件主入口
│   ├── types.ts                      # ★ TypeScript 类型定义
│   ├── component.server.ts           # ★ 服务端数据 Loader
│   ├── vite-env.d.ts                 # Vite 环境类型声明
│   │
│   ├── components/                   # 本地子组件
│   │   ├── SubComponentA.svelte      # 子组件文件名使用 PascalCase
│   │   └── SubComponentB.svelte
│   │
│   ├── state/                        # 可复用响应式状态原语
│   │   └── timer.svelte.ts           # ⚠️ 文件名必须含 .svelte 后缀才能使用 $state/$effect
│   │
│   ├── styles/                       # 组件级额外样式（可选）
│   │   └── card.css                  # 拆分原则见下方说明
│   │
│   ├── assets/                       # 静态资源（可选）
│   │   ├── icons/                    # SVG 图标
│   │   └── images/                   # 组件专属图片
│   │
│   └── utils/                        # 组件级工具函数（可选）
│       └── helper.ts
│
├── mocks/                            # 本地开发 Mock 数据（必须）
│   ├── props/                        # ★ 组件 Props 静态数据
│   │   ├── default.json              # 默认场景数据（对应 schema 结构）
│   │   └── index.ts                  # 数据出口（可选，用于多场景切换）
│   └── api/                          # API 接口 Mock 配置（可选，组件有接口请求时创建）
│       └── index.ts                  # Mock 配置列表
│
├── tests/                            # 测试目录
│   ├── your-component.spec.ts        # Playwright E2E 主测试文件
│   └── unit/                         # 单元测试（可选）
│
├── schema.json                       # ★ 组件字段 JSON Schema（用于编辑器）
├── features.json                     # 组件功能特性列表（AI 辅助开发使用）
├── spec.md                           # 组件需求规格说明（不含 GWT）
├── acceptance.md                     # ★ GWT 验收标准（Given / When / Then）
├── DEVELOPMENT.md                    # 开发日志与 TODO
├── README.md                         # 组件使用文档
│
├── package.json                      # ★ 包配置（名称/脚本/依赖）
├── vite.config.ts                    # ★ Vite 配置（一般只需调用工厂函数）
└── tsconfig.json                     # TypeScript 配置（继承共享配置）
```

> ★ 标注为**必须**存在的文件，其余为推荐但可选。

**`src/styles/` 拆分原则**

默认样式写在 `index.svelte` 的 `<style>` 块内。满足以下任一条件时，将样式提取到 `src/styles/` 的独立 `.css` 文件：

- 单个 `<style>` 块超过 **150 行**
- 存在**多个子组件共用**的样式（如卡片网格通用排版）
- 存在需要**按功能独立维护**的样式模块（如动画、主题变体）

提取后在 `<style>` 块顶部使用 `@import` 引入：

```svelte
<style>
  @import './styles/card.css';
  @import './styles/animation.css';

  /* 仅属于根组件的少量样式保留在此 */
  .pep-your-component { width: 100%; }
</style>
```

---

## 3. 类型系统与 Props 规范

### 3.1 类型文件结构

`src/types.ts` 是组件唯一的类型声明文件，遵循两段式结构：

```typescript
// src/types.ts

/**
 * 第一段：定义组件 Props 接口
 * 命名规范：<ComponentNamePascal>Props
 * 每个字段与 schema.json 中的 property 一一对应
 */
export interface YourComponentProps {
  /** PC 端卡片样式 */
  cardType?: 'left' | 'center' | 'product';
  /** 背景色主题 */
  theme?: 'white' | 'grey';
  /** 卡片列数 */
  cardColumn?: '2' | '3' | '4' | '5';
  /** 页签列表 */
  tabList?: TabItem[];
}

/**
 * 第二段：如有嵌套数据结构，在此声明
 */
export interface TabItem {
  title?: string;
  layoutMb?: 'upDownLayout' | 'leftRightLayout';
  cards?: {
    products?: ProductItem[];
  };
}

export interface ProductItem {
  title?: string;
  icon?: string;
  desc?: string;
  href?: string;
  endTime?: string;  // ISO 8601 时间字符串，用于倒计时
  btnGroups?: ButtonItem[];
}

export interface ButtonItem {
  btnType?: 'por-btn-primary' | 'por-btn-secondary' | 'por-btn-dark';
  btnHref?: string;
  btnLinkText?: string;
}
```

### 3.2 类型与 schema.json 的对应原则

**`schema.json` 中每个 property 字段，必须在 `types.ts` 中有对应的类型声明**，反之亦然。两者不一致会导致编辑器无法正确渲染配置面板，或出现运行时错误。

| schema.json 中的类型 | TypeScript 中对应的类型 |
|---------------------|----------------------|
| `"type": "string"` | `string` |
| `"type": "boolean"` | `boolean` |
| `"type": "number"` | `number` |
| `"type": "array"` | `T[]` |
| `"type": "object"` | `interface` 或 `Record<string, T>` |
| `"enum": ["a", "b"]` | `'a' \| 'b'` |

---

## 4. schema.json 规范

`schema.json` 是组件的"元数据"，供可视化编辑器（CMS）解析并生成配置面板，字段结构与 `types.ts` 保持一一对应。

以下是编辑器支持的特殊扩展字段，标准 JSON Schema 语法之外的补充：

| 字段 | 说明 |
|------|------|
| `"ui:widget": "richtext"` | 使用富文本编辑器（用于支持 HTML 的字段，如 `subtitle`） |
| `"ui:options": { "format": "url" }` | URL 格式验证（用于链接字段） |
| `"enumNames": [...]` | 枚举值的中文显示名称，与 `enum` 配合使用 |
| `"default": "..."` | 编辑器新建组件时的默认值 |

---

## 5. Svelte 5 Runes 编写规范

本项目**强制使用 Svelte 5 Runes 模式**（`compilerOptions: { runes: true }`），禁止使用旧版响应式语法。

### 5.1 index.svelte 标准结构

```svelte
<script lang="ts">
  // ════════════════════════════════════════════════
  // 第 1 节：导入
  // 顺序：Svelte 内置 → 第三方库 → @pep/shared → 本地子组件 → 本地工具
  // ════════════════════════════════════════════════
  import { type Snippet } from "svelte";
  import type { YourComponentProps } from "./types";

  // 本地业务子组件
  import ProductGrid from "./components/ProductGrid.svelte";

  // 本地工具 / 状态原语
  import { createTimer } from "./state/timer.svelte";
  import { isExpired } from "../../../shared/utils/date";

  // ════════════════════════════════════════════════
  // 第 2 节：Props 声明（类型对应 schema.json）
  // ════════════════════════════════════════════════
  let props: YourComponentProps & { children?: Snippet } = $props();

  // ════════════════════════════════════════════════
  // 第 3 节：业务属性默认值解构
  // ════════════════════════════════════════════════
  const {
    cardType = "center",
    theme = "white",
    cardColumn = "3",
    tabList = [],
  } = props;

  // ════════════════════════════════════════════════
  // 第 4 节：本地状态（$state）
  // 只有"组件内部"需要维护的 UI 状态才放这里
  // ════════════════════════════════════════════════
  const timer = createTimer();      // 响应式状态原语
  let activeTabIndex = $state(0);   // 当前选中的 Tab 索引

  // ════════════════════════════════════════════════
  // 第 5 节：派生状态（$derived）
  // 基于 props 或 state 计算的只读值
  // ════════════════════════════════════════════════
  const activeTab = $derived(tabList[activeTabIndex]);
  const displayProducts = $derived(
    activeTab?.cards?.products?.filter(
      (p) => !isExpired(p.endTime, timer.current)
    ) ?? []
  );

  // ════════════════════════════════════════════════
  // 第 6 节：事件处理函数
  // ════════════════════════════════════════════════
  function handleSomeAction(value: string) {
    // ...
  }
</script>

<div
  class="pep-your-component"
  class:theme-grey={theme === "grey"}
>
  <div class="pep-your-component__container">
    <div class="pep-your-component__content">
      {#if activeTab}
        <ProductGrid
          products={displayProducts}
          {cardColumn}
          {cardType}
          now={timer.current}
        />
      {/if}

      <!-- Snippet 插槽：允许父级注入自定义内容 -->
      {@render props.children?.()}
    </div>
  </div>
</div>

<style>
  /* 样式见第 9 节 */
</style>
```

### 5.2 Runes 对照表

| 旧版 Svelte 语法（禁止） | Svelte 5 Runes（必须使用） |
|------------------------|--------------------------|
| `export let foo` | `let { foo } = $props()` 或 `let props = $props()` |
| `$: derived = expr` | `const derived = $derived(expr)` |
| `let count = 0` (响应式) | `let count = $state(0)` |
| `on:click={handler}` | `onclick={handler}` |
| `<slot />` | `{@render children?.()}` |
| `<slot name="foo" />` | `{@render foo?.()}` |
| `bind:value` | 仍然有效（`$bindable` 配合使用） |

### 5.3 禁止事项

```svelte
<!-- ❌ 禁止：旧版 export let -->
<script>
  export let title;
</script>

<!-- ❌ 禁止：旧版响应式标签 -->
<script>
  $: doubled = count * 2;
</script>

<!-- ❌ 禁止：直接修改 props（props 是只读的） -->
<script>
  let { count } = $props();
  count += 1; // 运行时警告
</script>

<!-- ✅ 正确：需要修改的值用本地 state -->
<script>
  let { initialCount = 0 } = $props();
  let count = $state(initialCount);
  count += 1; // OK
</script>
```

---

## 6. 状态管理模式

### 6.1 组件内部状态

简单状态直接在 `index.svelte` 中使用 `$state()`：

```svelte
<script lang="ts">
  let activeTabIndex = $state(0);
  let isExpanded = $state(false);
  let selectedItem = $state<string | null>(null);
</script>
```

### 6.2 可复用状态原语（.svelte.ts 文件）

当状态逻辑需要在多处复用，或包含副作用（如定时器、事件监听），应抽取为 `.svelte.ts` 文件中的工厂函数。

> **重要**：文件名必须包含 `.svelte`（如 `timer.svelte.ts`），否则 Svelte 编译器不会处理 `$state`、`$effect` 等 Rune。

```typescript
// src/state/timer.svelte.ts

/**
 * 计时器状态原语
 * 提供响应式当前时间戳，用于实时倒计时计算
 */
export function createTimer(interval = 1000) {
  let timestamp = $state(Date.now());

  $effect(() => {
    const timerId = setInterval(() => {
      timestamp = Date.now();
    }, interval);

    // 返回清理函数，在组件销毁时自动调用
    return () => clearInterval(timerId);
  });

  return {
    // 使用 getter 而非直接返回 timestamp，确保响应式
    get current() {
      return timestamp;
    }
  };
}
```

在组件中使用：

```svelte
<script lang="ts">
  import { createTimer } from "./state/timer.svelte";

  const timer = createTimer();   // 每秒更新一次

  // 在模板中使用 timer.current 会自动响应时间变化
  const displayProducts = $derived(
    products.filter(p => !isExpired(p.endTime, timer.current))
  );
</script>
```

### 6.3 派生状态

所有由 props 或 state 计算得出的值，使用 `$derived()`：

```svelte
<script lang="ts">
  // ✅ 正确：使用 $derived
  const filteredItems = $derived(
    items.filter(item => item.visible)
  );

  const totalCount = $derived(filteredItems.length);

  // ❌ 错误：不要手动缓存派生计算
  // let filteredItems = items.filter(item => item.visible); // 不会自动更新
</script>
```

---

## 7. 服务端数据 Loader

### 7.1 Loader 的作用

`src/component.server.ts` 导出一个 `loader` 函数，它在**服务端**运行，负责：

1. 接收来自 CMS 或配置文件的原始数据
2. 按需调用 BFF 接口补充动态数据
3. 对数据进行预处理（格式转换、字段筛选、远程内容预加载等）
4. 返回最终的 Props 对象，直接传给 Svelte 组件

### 7.2 Loader 标准结构

`requestClient` 只暴露一个通用 `request()` 方法，与具体 HTTP 库解耦。**调用时只需传请求参数，无需关心 Mock 路径**：

```typescript
// src/component.server.ts
import type { YourComponentProps } from './types';

interface RequestOptions {
  url: string;
  method?: string;   // 默认 'get'
  params?: any;      // query 参数
  data?: any;        // body 参数
}

interface LoaderMethod {
  requestClient: {
    request: (options: RequestOptions) => Promise<any>;
  };
}

/**
 * 服务端数据加载器
 *
 * @param method - 包含 requestClient 等服务端工具
 * @param data   - 来自 CMS 的原始配置数据（对应 schema.json 结构） && BFF的一些全局变量
 * @returns      - 经处理后传给组件的最终 Props
 */
export const loader = async (
  method: LoaderMethod,
  data: any
): Promise<YourComponentProps> => {
  // 调用接口补充动态数据
  const result = await method.requestClient.request({
    url: '/api/your-endpoint',
    method: 'get',
    params: { id: data.id }
  });
  return { list: result.data };

  // ❌ 场景 1：禁止直接透传（数据无需处理）
  // return { ...data };

  // ❌ 场景 2：禁止返回完整data，bff中会去拼接date和loader返回的数据，这里的data包含了大量的全局变量，会导致冗余
  // return { ...data，list: result.data };
};
```

### 7.3 开发模式下的 Loader 调用（RequestAdater）

开发时，`shared/core/dev/main.ts` 用 `RequestAdater` 替代真实 HTTP 客户端传入 `loader`。`RequestAdater` 通过 Vite 别名 `$mockServer` 直接读取当前组件的 `mocks/api/index.ts`，**无需在调用处传路径**：

```
RequestAdater.request(options)
        ↓
  import('$mockServer')  ← Vite 别名，自动指向 mocks/api/index.ts
        ↓                   （文件不存在时别名为 null，直接走真实接口）
  按 url + method 匹配
  ├── 匹配到 && mock: true  → 直接返回配置中的 response
  ├── 匹配到 && mock: false → 走真实 axios 请求
  └── 未匹配                → 走真实 axios 请求
```

这意味着开发阶段**不需要起后端服务**，只需在 `mocks/api/index.ts` 中配置好接口 Mock 即可；上线时 `loader` 代码无需任何修改，生产环境注入的是真实 HTTP 客户端。

---

## 8. Mock 数据规范

`mocks/` 目录分为两个子目录，职责明确：

```
mocks/
├── props/          # 组件 Props 静态数据（对应 schema 字段）
│   ├── default.json
│   └── index.ts    # 可选，用于多场景切换
└── api/            # API 接口 Mock 配置（组件有接口请求时创建）
    └── index.ts
```

### 8.1 props/ — 组件静态数据

`mocks/props/default.json` 是开发时渲染组件用的默认 Props 数据，**必须完整覆盖 schema.json 定义的所有字段**，尽可能使用真实感数据。

```json
{
  "title": "您可能感兴趣的产品",
  "cardType": "center",
  "cardColumn": "3",
  "theme": "white",
  "tabList": [
    {
      "title": "全部产品",
      "cards": {
        "products": [
          {
            "title": "弹性云服务器 ECS",
            "icon": "https://example.com/icons/ecs.png",
            "desc": "提供可靠、安全、灵活的云服务器资源",
            "href": "https://example.com/ecs"
          }
        ]
      }
    }
  ]
}
```

当组件有多个调试场景时，在 `mocks/props/index.ts` 中切换：

```typescript
// mocks/props/index.ts
import defaultData from './default.json';
import promotionData from './promotion.json';

// 切换这里来调试不同场景
export default defaultData;
```

`vite.factory.ts` 按以下优先级查找 Props 数据文件：
1. `mocks/props/index.ts`
2. `mocks/props/index.js`
3. `mocks/props/default.json`
4. `mocks/index.ts`
5. `mocks/index.js`
6. `mocks/default.json`

### 8.2 api/ — 接口 Mock 配置

当组件的 `loader` 需要调用接口时，在 `mocks/api/index.ts` 中配置对应的 Mock 规则。`RequestAdater` 开发时会自动加载此文件。

```typescript
// mocks/api/index.ts
const mockConfig = [
  {
    url: '/api/your-component/list',
    method: 'get',
    mock: true,           // true: 返回下方 response；false: 透传到真实接口
    params: { page: 1 },  // 仅作文档说明，不参与匹配
    response: {
      code: 0,
      message: 'success',
      data: {
        list: [
          { id: 1, name: '示例项目' }
        ]
      }
    }
  }
];

export default mockConfig;
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | 接口路径，与 `loader` 中 `request()` 的 `url` 完全匹配 |
| `method` | `string` | HTTP 方法，默认 `'get'`，不区分大小写 |
| `mock` | `boolean` | `true` 返回 `response`；`false` 透传到真实接口（调试真实环境时使用） |
| `params` | `any` | 仅供文档参考，当前不参与匹配逻辑 |
| `response` | `any` | `mock: true` 时返回的数据 |

> 组件没有接口请求时，无需创建 `mocks/api/` 目录。

---

## 9. 样式规范

### 9.1 设计 Token

**禁止硬编码颜色、字号、间距等设计值**，统一使用 CSS 变量（Token）：

```css
/* ❌ 禁止 */
color: #333;
font-size: 16px;
padding: 24px 20px;

/* ✅ 正确 */
color: var(--text-primary);
font-size: var(--primitive-font-base);
padding: var(--primitive-space-15) var(--primitive-space-5);
```

Token 定义在 `shared/styles/tokens/` 下，开发时由 `main.ts` 自动注入，无需手动 import。

### 9.2 响应式适配

移动端断点统一为 `max-width: 767px`。优先使用 Token 中的间距变量适配不同屏幕：

```css
.pep-your-component__container {
  padding: var(--primitive-space-15) var(--primitive-space-5);
}

@media (max-width: 767px) {
  .pep-your-component__container {
    padding: var(--primitive-space-10) var(--primitive-space-4);
  }
}
```

需要对移动端完全隐藏的元素，通过 Props                                                                                    CSS 类而非内联 `display:none`：

```svelte
<div class:hide-mb={!props.isShowMb}>...</div>
```

```css
@media (max-width: 767px) {
  .hide-mb { display: none; }
}
```

### 9.3 Svelte 样式作用域

Svelte 默认对 `<style>` 块内的选择器添加作用域，不同组件同名类不会互相干扰。需要穿透作用域时使用 `:global()`：

```css
/* 影响 {@html} 渲染的富文本内容 */
.pep-your-component__content :global(p) {
  margin: 0 0 8px 0;
}
```

---

## 10. 构建系统详解

### 10.1 四种构建模式

每个组件支持四种构建模式，由 `vite.factory.ts` 的工厂函数统一处理：

#### `client` 模式
```bash
npm run build:client
# 输出：dist/client/entry-client.js
```
- 入口：`shared/core/prod/entry-client.ts`
- 功能：导出 `hydrateApp(id)` 函数，在浏览器中将 SSR 渲染的 HTML 水合为可交互的 Svelte 组件
- 格式：ES Module（`format: 'es'`）

#### `server` 模式
```bash
npm run build:server
# 输出：dist/server/entry-server.js (CJS)
```
- 入口：`shared/core/prod/entry-server.ts`
- 功能：导出 Svelte 组件类，供 Node.js SSR 渲染环境调用 `render()`
- 格式：CommonJS（`format: 'cjs'`），SSR 模式构建

#### `data` 模式
```bash
npm run build:data
# 输出：dist/data/load-data.cjs
```
- 入口：`src/component.server.ts`（即 Loader 文件）
- 功能：单独打包数据加载逻辑，供服务端按需调用
- 格式：CommonJS，不打包 JSON 文件（外部化）

#### `editor` 模式
```bash
npm run build:editor
# 输出：dist/editor/entry-editor.js
```
- 入口：`shared/core/prod/entry-editor.ts`
- 功能：与可视化编辑器集成，支持实时预览组件配置变化
- 格式：ES Module

### 10.2 构建脚本说明

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "npm run build:client && npm run build:server && npm run build:data && npm run build:editor",
    "build:client": "vite build --mode=client --config vite.config.ts",
    "build:server": "vite build --mode=server --config vite.config.ts",
    "build:data": "[ -f src/component.server.ts ] && vite build --mode=data || echo 'Skipping data build'",
    "build:editor": "vite build --mode=editor --config vite.config.ts",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "clean": "rm -rf dist"
  }
}
```

> `build:data` 使用了条件判断，如果 `component.server.ts` 不存在则跳过，避免报错。

---

## 11. Vite 配置与路径别名

### 11.1 vite.config.ts（标准写法）

```typescript
// vite.config.ts
import { createComponentConfig } from '../../shared/config/vite.factory';

export default createComponentConfig({
  cwd: process.cwd(),   // 当前组件目录
  name: 'CommonCardV2'  // 组件库名（PascalCase），用于构建产物命名
});
```

一般情况下无需修改，工厂函数已处理所有配置。

### 11.2 内置路径别名

工厂函数自动注册以下路径别名，在 `.svelte`、`.ts` 文件中直接使用：

| 别名 | 实际路径 | 说明 |
|------|---------|------|
| `$lib` | `src/lib/` | 组件内部公共模块 |
| `$component` | `src/index.svelte` | 组件主入口（构建入口使用） |
| `$loader` | `src/component.server.ts` | Loader 文件（构建/开发使用） |
| `$data` | `mocks/props/default.json` 等 | Mock Props 数据（开发时按优先级自动查找） |
| `$mockServer` | `mocks/api/index.ts` | 接口 Mock 配置（文件不存在时为 `null`）；`RequestAdater` 内部使用，无需在业务代码中直接引用 |
| `@pep/shared` | `shared/` | 共享包根目录 |

**在源码中使用别名示例：**

```typescript
// ✅ 正确：使用 @pep/shared 别名
import FloorHeader from "@pep/shared/ui/FloorHeader.svelte";
import FloorTabs from "@pep/shared/ui/FloorTabs.svelte";
import { isExpired } from "@pep/shared/utils/date";
```

### 11.3 tsconfig.json

```json
{
  "extends": "../../shared/config/tsconfig.json",
  "compilerOptions": {
    "moduleResolution": "bundler",
    "target": "esnext",
    "module": "esnext",
    "types": ["svelte", "vite/client"]
  },
  "include": [
    "src/**/*",
    "mocks/**/*",
    "vite.config.ts",
    "../../types.d.ts"
  ]
}
```

> **注意**：`tsconfig.json` 只用于 `svelte-check` 的类型检查。Vite 构建时使用 `vite.factory.ts` 中的别名配置，与 `tsconfig.paths` 是分开的。

---

## 12. 验收标准（GWT 规范）

GWT 验收标准**必须写在组件根目录的独立文件 `acceptance.md` 中**，不得放在 `spec.md` 内。`spec.md` 描述需求、范围与背景；`acceptance.md` 只承载可逐条验收的 Given / When / Then 条目，便于评审、对齐自动化测试与交付验收。

可选：在 `spec.md` 末尾用一行链接指向验收文档，例如 `验收标准见 [acceptance.md](./acceptance.md)`。

### 12.1 GWT 格式规范

`acceptance.md` 示例结构：

```markdown
# 验收标准

### AC-001：基础渲染
**Given** 组件挂载，且 `tabList` 包含 2 个页签、第一个页签有 3 张卡片
**When**  页面首次加载完成
**Then**
- 楼层标题显示正确
- 默认激活第一个页签
- 展示 3 张产品卡片

### AC-002：页签切换
**Given** 组件已渲染，当前激活第一个页签
**When**  用户点击第二个页签
**Then**
- 第二个页签高亮
- 内容区切换为第二个页签的数据

### AC-003：移动端适配
**Given** 视口宽度为 375px
**When**  页面加载
**Then**
- 组件正常渲染，不超出视口
- 移动端专属文案（titleMb）优先显示

### AC-004：边界情况 - 空数据
**Given** `tabList` 为空数组
**When**  页面加载
**Then**
- 组件不报错、不崩溃
- 页签导航不显示
- 内容区为空
```

### 12.2 GWT 与测试代码的对应关系

每条 AC 直接对应 `tests/*.spec.ts` 中的一个 `test()` 用例，AC 编号作为测试名称前缀：

```typescript
test('AC-001：基础渲染', async ({ page }) => { ... });
test('AC-002：页签切换', async ({ page }) => { ... });
```

### 12.3 编写时机

| 阶段 | 操作 |
|------|------|
| `pep-spec` 生成规格后 | 自动输出 `acceptance.md` 初版，包含所有 AC 条目 |
| 需求变更时 | 重新运行 `pep-spec` 或手动在 `acceptance.md` 中补充/修改 AC |
| 实现功能前 | 先锁定 `acceptance.md` 中的 AC，再写实现（TDD 思路） |
| 交付验收时 | 逐条比对 `acceptance.md` 与实际运行结果 |

---

## 13. 创建新组件完整流程

新组件开发采用 **Spec-Driven + AI Skill** 的链式流程，从设计稿到交付代码全流程自动化。

### 前置准备

1. **设计稿 HTML**：从 Figma、即时设计等工具导出或转换的组件 HTML 片段（包含样式类名）
2. **组件命名**：遵循 `pep-<功能名>` 格式（如 `pep-banner`、`pep-product-card`）

---

### 步骤一：生成组件骨架（pep-init）

向 AI 提供组件名，触发 `pep-init` skill：

```
我要创建一个新组件 pep-my-component，请帮我初始化
```

AI 自动完成：
- 从 `.ai-workflow/templates/component/` 拷贝标准骨架到 `components/pep-my-component/`
- 生成 `package.json`、`vite.config.ts`、`tsconfig.json` 等配置文件
- 创建空的 `src/index.svelte`、`src/types.ts`、`src/component.server.ts`
- 创建 `mocks/props/`、`tests/` 等目录
- 生成空白 `spec.md`、`schema.json` 占位文件

> 完成后输出：`✅ 组件骨架已生成：components/pep-my-component/`

---

### 步骤二：从设计稿生成需求规格（pep-spec）

提供设计稿 HTML，触发 `pep-spec` skill：

```
这是设计稿 HTML：
<div class="...">...</div>

请分析生成 spec.md
```

或简化：

```
pep-spec
```

AI 会：
1. 分析 HTML 结构，提取布局、内容字段、响应式差异、交互行为
2. 向你展示推断结论，与你确认不明确的部分（1-2 轮对话）
3. 生成 `spec.md`，包含：
   - 组件定位与功能描述
   - Props 设计（所有字段、类型、默认值）
   - 嵌套数据结构（列表、卡片等）
   - 响应式规格（PC / 移动端布局差异）
   - 交互行为（点击、切换、展开等）
4. 基于 `spec.md` 自动生成 `acceptance.md`（GWT 验收标准），覆盖基础渲染、核心功能、交互行为、响应式、边界情况等维度

> 完成后输出：`✅ spec.md 和 acceptance.md 已写入`（acceptance.md 包含所有 AC 条目）

---

### 步骤三：生成 Mock 数据与类型（pep-mock）

触发 `pep-mock` skill：

```
基于 spec.md 生成 Mock 数据
```

或简化：

```
pep-mock
```

AI 会：
1. 读取 `spec.md`，提取所有 Props 及嵌套结构
2. 向你展示数据结构方案（1-2 轮确认）
3. 生成 `src/types.ts`（完整 TypeScript 接口定义）
4. 生成 `mocks/props/default.json`（真实感数据，包含 3-5 条列表示例）
5. 更新 `schema.json`（补充字段定义）

> 完成后输出：`✅ types.ts、default.json、schema.json 已生成`

---

### 步骤四：生成组件实现代码（pep-impl）

提供设计稿 HTML，触发 `pep-impl` skill：

```
设计稿 HTML：
<div class="...">...</div>

请生成组件代码
```

或简化：

```
pep-impl
```

AI 会：
1. 基于 `spec.md` + `types.ts` + `default.json` + 设计稿 HTML 四个输入源分析
2. 向你展示实现方案（组件拆分、共享组件复用、响应式策略等）
3. 生成 `src/index.svelte`（符合[第 5 节](#5-svelte-5-runes-编写规范)的标准结构）
4. 按需生成子组件（`src/components/*.svelte`）
5. 生成 `src/component.server.ts` 的 loader 实现
6. 调用 Svelte MCP 验证代码规范

> 完成后输出：`✅ index.svelte、子组件及 loader 已生成`

---

### 步骤五：安装依赖并启动开发

```bash
pnpm install
pnpm dev pep-my-component
```

访问 `http://localhost:5173` 查看组件渲染效果。

---

### 步骤六：类型检查与构建验证

```bash
pnpm --filter pep-my-component check
pnpm --filter pep-my-component build
```

确保类型正确且四种构建产物（client/server/data/editor）均无报错。

---

### 核心流程总结

```
pep-init（组件骨架）
    ↓
提供设计稿 HTML
    ↓
pep-spec（生成 spec.md + acceptance.md）
    ↓
pep-mock（生成 types.ts + default.json + schema.json）
    ↓
pep-impl（生成 index.svelte + 子组件 + loader）
    ↓
pnpm dev 启动开发
    ↓
pnpm build 构建验证
```

> 测试环节（Playwright）需手动编写，基于 `acceptance.md` 中的 GWT 验收标准逐条实现 `test()` 用例。

---

## 14. 常见问题与排查

### Q1：构建时报找不到三方依赖包

**核心原因**：组件引入的三方依赖（如 `js-base64`、`marked`）未在 `vite.factory.ts` 的 `ssr.noExternal` 中配置，导致 SSR 构建时将其视为外部依赖。若 BFF 服务（或其他调用方）未安装该依赖，运行时会报错"找不到模块"。

**解决**：在 `shared/config/vite.factory.ts` 的 `ssr` 配置中将该依赖添加到 `noExternal` 列表：

```typescript
// shared/config/vite.factory.ts（server 模式配置）
ssr: {
  noExternal: ['js-base64', 'marked', '你的新依赖包名']
}
```

**原理**：`noExternal` 告诉 Vite 将这些包打包进 SSR bundle 中，而非标记为外部依赖，从而避免运行时 require 失败。

### Q2：组件中禁止用 JS 判断设备类型（页面宽度）

**错误示例**：

```typescript
// ❌ 禁止：在组件中用 window.innerWidth 判断设备
let isMobile = $state(false);

$effect(() => {
  isMobile = window.innerWidth < 768;
});
```

**原因**：服务端渲染（SSR）时没有 `window` 对象，无法获取页面宽度。若代码中存在设备判断逻辑，可能导致：
- SSR 时渲染一套结构，客户端水合时又渲染另一套结构，**导致水合失败**
- 页面闪烁（Hydration Mismatch）

**正确做法**：**优先使用 CSS 媒体查询**控制不同设备的样式和显示逻辑。

```svelte
<div class="content">
  <span class="pc-only">PC 端文案</span>
  <span class="mb-only">移动端文案</span>
</div>

<style>
  .mb-only { display: none; }

  @media (max-width: 767px) {
    .pc-only { display: none; }
    .mb-only { display: block; }
  }
</style>
```

**特殊情况处理**：若必须在 JS 中判断（如需要监听 resize 事件），应使用 `$effect` 且仅在客户端执行：

```typescript
let isMobile = $state(false);

$effect(() => {
  if (typeof window === 'undefined') return;  // SSR 时跳过
  isMobile = window.innerWidth < 768;
  // ...
});
```

但**强烈建议**优先使用 CSS 方案，避免水合问题。

### Q3：`$state` 在 `.ts` 文件中报错

**原因**：`.ts` 文件不经过 Svelte 编译器处理，无法识别 Rune 语法。

**解决**：将包含 Rune 的文件重命名为 `.svelte.ts`（如 `timer.svelte.ts`）。

### Q4：`@pep/shared/...` 路径无法解析

**原因**：路径别名仅在 Vite 环境下生效，`svelte-check` 也需要正确的 `tsconfig.json`。

**排查**：
1. 检查 `tsconfig.json` 是否继承了 `../../shared/config/tsconfig.json`
2. 检查 `shared/config/tsconfig.json` 中是否有 `"@pep/shared"` 的 paths 配置
3. 检查 `vite.config.ts` 中是否使用了 `createComponentConfig` 工厂函数

### Q5：组件修改 Props 报"readonly"警告

**原因**：Svelte 5 中 `$props()` 返回的对象是只读的（Proxy），不能直接修改。

**解决**：
```typescript
// ❌ 错误
let { count } = $props();
count = 0;  // 警告

// ✅ 正确：需要本地状态时用 $state 单独声明
let { initialCount = 0 } = $props();
let count = $state(initialCount);
```

### Q6：开发服务器启动后页面空白

**排查顺序**：
1. 检查浏览器控制台是否有 JS 报错
2. 确认 `mocks/` 目录下有有效的数据文件
3. 检查 `component.server.ts` 的 `loader` 函数是否有未捕获的异常
4. 检查 `shared/templates/index.html` 是否有 `<div id="app"></div>`

### Q7：CSS Token 变量不生效（变量值为 undefined）

**原因**：语义化 Token 文件（`shared/styles/tokens/semantic.css`）未被加载。

**解决**：开发模式下，`shared/core/dev/main.ts` 会自动 import 该文件。生产模式下，宿主页面应负责加载样式。如果本地开发不生效，检查 `main.ts` 中是否有：

```typescript
import '@pep/shared/styles/tokens/semantic.css';
```

---

## 附录：快速参考卡片

### 新组件必须包含的文件

```
src/index.svelte          ← 主组件（Svelte 5 Runes）
src/types.ts              ← Props 类型（与 schema.json 对应）
src/component.server.ts   ← 服务端 Loader
mocks/props/default.json  ← 组件 Props Mock 数据
mocks/api/index.ts        ← 接口 Mock 配置（有接口请求时）
schema.json               ← 编辑器 JSON Schema
acceptance.md             ← GWT 验收标准
package.json              ← 包配置（含 @pep/shared workspace 依赖）
vite.config.ts            ← Vite 配置（使用工厂函数）
tsconfig.json             ← TS 配置（继承共享配置）
```

### 常用导入路径

```typescript
import FloorHeader from "@pep/shared/ui/FloorHeader.svelte";
import FloorTabs from "@pep/shared/ui/FloorTabs.svelte";
import { isExpired } from "@pep/shared/utils/date";
```

### index.svelte 代码段顺序

```
1. 导入（Svelte → 第三方 → @pep/shared → 本地）
2. Props 声明（$props()）
3. 业务默认值解构（const { field = default } = props）
4. 本地状态（$state）
5. 派生状态（$derived）
6. 事件处理函数
```
