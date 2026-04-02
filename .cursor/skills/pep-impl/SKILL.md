---
name: pep-impl
description: 基于 spec.md、mock 数据和设计稿 HTML，生成完整的 Svelte 5 组件代码，包含 index.svelte、子组件等。使用 Less 编写样式，CSS 优先处理响应式，禁止 JS 判断设备类型。当用户说"生成组件"、"实现组件"、"写代码"、"pep-impl"时立即使用此技能。
---

# pep-impl — 生成组件实现代码

## 概述

本技能基于三个输入源生成完整的组件代码：

| 输入 | 作用 |
|------|------|
| `spec.md` | **权威需求来源**：功能、Props、响应式、交互行为 |
| `mocks/props/default.json` + `src/types.ts` | 数据结构蓝图 |
| 设计稿 HTML | **视觉参考**：提取颜色、字号、间距等视觉意图，不照搬其 HTML 结构 |

**核心输出**：
- `src/index.svelte` — 组件主入口
- `src/types.ts` — 类型定义（若需更新）
- `src/components/*.svelte` — 子组件（如逻辑复杂则拆分）

> 设计稿 HTML 的结构往往因工具转换产生冗余嵌套和混乱命名，**必须根据 spec.md 重新设计组件结构**，不要试图还原 HTML 原始嵌套。

---

## 前置约定

> 以下规范在整个生成过程中始终适用，**阶段 1 规划时即需运用**，请在执行流程前通读。

### A. 样式体系

本项目使用 **Less + CSS 变量**双层样式体系：

- **Less**：负责选择器嵌套、BEM 结构、媒体查询内嵌
- **CSS 变量**（`var(--primitive-*)`）：负责设计 token（间距、颜色、容器宽度等），在 Less 中直接通过 `var()` 引用

> **注意**：Less 变量（`@foo: value`）仅用于局部临时复用，**不要**把 CSS 变量赋值给 Less 变量再使用（即不要写 `@mySpace: var(--primitive-space-4)`）。

断点规范（全项目统一）：
- 项目有多个断点（如 1600px、1024px、767px），具体以当前组件的 spec.md 为准
- 默认样式（无媒体查询）对应最宽的 PC 端
- 媒体查询按断点从大到小依次声明，**集中写在组件根块末尾**，不分散在每个元素内部（详见 3.3 样式规范）

### B. Trait 系统

Trait 是本项目对组件"通用能力"的抽象，每个 Trait 对应一组 Props 字段，通过 `pickTrait(props, "traitName")` 从组件 props 中提取后使用。

常用 Trait：

| Trait | 作用 | 用法 |
|-------|------|------|
| `header` | 楼层标题区域（title、subtitle、more 链接） | `pickTrait(props, "header")` 传给 `FloorHeader` |
| `spacing` | 上下间距合并控制 | 控制根元素的 `merge-top` / `merge-bottom` class |
| `visibility` | 移动端显隐 | 控制根元素的 `hide-mb` class |

Trait 分拣只在根组件处理，子组件只接收处理后的值，不直接调用 `pickTrait`。

### C. Portal-UI 使用规范

Portal-UI 是一个基于 CSS token 和 jQuery 的组件库。**本项目只使用其纯 CSS 样式类**，不引入任何 JS 文件。

#### ✅ 可以使用的类（纯样式）

```html
<!-- 按钮样式 -->
<a class="por-btn-primary" href="#">主要按钮</a>
<a class="por-btn-secondary" href="#">次要按钮</a>
<a class="por-btn-dark" href="#">深色按钮</a>

<!-- 若有其他纯样式类，根据设计稿按需使用 -->
```

#### ❌ 不使用的功能（依赖 jQuery 的交互插件）

以下 Portal-UI 功能改用 Svelte 原生实现：

| Portal-UI 功能 | 替代方案 |
|---------------|----------|
| 弹窗（Modal） | Svelte `{#if}` + CSS |
| 下拉菜单（Dropdown） | Svelte 状态 + click 事件 |
| 轮播（Carousel/Slider） | Svelte 实现或 CSS Scroll Snap |
| Tooltip | CSS `:hover` |
| 标签页（Tab） | 项目共享组件 `FloorTabs` |

**判断原则**：需要调用 `$(element).plugin()` 初始化的，一律不用。

---

## 执行流程

### 阶段 0：读取所有上下文

并行读取以下文件：
1. `components/<component-name>/spec.md`
2. `components/<component-name>/src/types.ts`
3. `components/<component-name>/mocks/props/default.json`
4. 设计稿 HTML（用户提供，或已在上下文中）
5. `.ai-workflow/templates/component/src/index.svelte`（参考模板）
6. `ARCHITECTURE.md`（架构规范）
7. `components/<component-name>/acceptance.md`（验收标准，若存在则读取，阶段 8 使用）

若 spec.md 或 types.ts 缺失，提示用户先运行 `pep-spec` 和 `pep-mock`。

---

### 阶段 1：分析与规划

分析完所有上下文后，向用户展示实现计划：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 实现方案

组件复杂度：[简单 / 中等 / 复杂]

文件规划：
  ✅ src/index.svelte — 主组件
  [✅ / ⬜] src/components/[SubName].svelte — [子组件说明]

Traits 使用：
  ✅ header — 楼层标题
  ✅ spacing — 上下间距
  ✅ visibility — 移动端显隐

共享组件复用：
  [✅ FloorHeader / FloorTabs / 其他]

Portal-UI 样式类：
  [列举会用到的 portal-ui 类名，如 por-btn-primary；若无则填"无"]

响应式策略（纯 CSS 实现）：
  PC（≥768px）：[布局描述]
  移动端（<768px）：[布局描述]
  设备差异由 CSS media query 控制，不使用 JS 判断

交互状态：
  [列举需要 $state 管理的状态]

是否可以开始生成？[Y/n]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

等待用户确认（若用户说"直接生成"则跳过）。

---

### 阶段 2：决定子组件拆分策略

遵循以下原则决定是否拆分子组件：

**建议拆分**：
- 列表中的重复项目（如 CardItem、ListItem）— 模板超过 30 行或有独立状态
- 有明显独立功能的区域（如 CountdownTimer）
- 子组件将来可能被其他地方复用

**不拆分**：
- 简单的展示片段（5-15 行 HTML）
- 没有独立状态或逻辑的纯展示区域

---

### 阶段 3：生成 index.svelte

严格遵循 Svelte 5 + Less 规范。

#### 3.1 script 块（严格按顺序）

```svelte
<script lang="ts">
  // ① 导入：Svelte 内置 → 第三方 → 共享组件 → 本地组件
  import { type Snippet } from "svelte";
  import type { <ComponentName>Props } from "./types";

  // 共享 UI 组件（按需导入）
  import FloorHeader from "@pep/shared/ui/FloorHeader.svelte";
  import FloorTabs from "@pep/shared/ui/FloorTabs.svelte";
  import { pickTrait } from "@pep/shared/ui/traits";

  // 本地子组件
  import CardItem from "./components/CardItem.svelte";

  // ② Props 定义（严格对应 types.ts 中的最终类型）
  let props: <ComponentName>Props & { children?: Snippet } = $props();

  // ③ 业务逻辑默认值（只提取本组件逻辑需要的字段）
  const {
    theme = "white",
    cardColumn = "3",
    tabList = [],
    // ... 其他有默认值的业务字段
  } = props;

  // ④ Trait 分拣（Explicit Forwarder 模式，有什么 Trait 就分拣什么）
  const headerProps = $derived(pickTrait(props, "header"));
  const spacingProps = $derived(pickTrait(props, "spacing"));
  const visibilityProps = $derived(pickTrait(props, "visibility"));

  // ⑤ 响应式状态（只声明确实需要响应式的状态）
  let activeTabIndex = $state(0);

  // ⑥ 派生计算
  const activeTab = $derived(tabList[activeTabIndex]);
  const displayItems = $derived(activeTab?.items ?? []);
</script>
```

#### 3.2 template 块

```svelte
<div
  class="<component-name>"
  class:theme-grey={theme === "grey"}
  class:theme-white={theme === "white"}
  class:merge-top={spacingProps.isMergeTopSpacing ?? true}
  class:merge-bottom={spacingProps.isMergeBottomSpacing ?? true}
  class:hide-mb={visibilityProps.isShowMb === false}
>
  <div class="<component-name>__container">
    <FloorHeader {...headerProps} />

    <div class="<component-name>__content">
      <FloorTabs {tabList} bind:activeTabIndex />

      {#if displayItems.length > 0}
        <div class="<component-name>__grid">
          {#each displayItems as item}
            <CardItem {item} />
          {/each}
        </div>
      {/if}

      {@render props.children?.()}
    </div>
  </div>
</div>
```

**Template 编写规则**：
- 根元素使用 kebab-case 的组件名作为 class（如 `pep-common-card`）
- 内部元素使用 BEM 命名：`<组件名>__<元素>` 或 `<组件名>--<修饰符>`
- class 绑定使用 Svelte 的 `class:xxx={condition}` 语法
- 条件渲染用 `{#if}...{/if}`，列表渲染用 `{#each}`
- 富文本字段用 `{@html filterXSS(text)}` 渲染
- 事件绑定用 `onclick={handler}`（不用 on:click，Svelte 5 规范）

#### 3.3 style 块（完整样式规范）

样式块声明为 `<style lang="less">`，充分利用 Less 的嵌套、变量和混入能力。

##### Less 基础规则

- 使用 Less 嵌套语法，避免重复写父选择器
- 优先使用项目 CSS 变量（`var(--primitive-space-*)` 等），Less 变量仅用于局部复用
- BEM 的 `__element` 和 `--modifier` 用 `&__element` / `&--modifier` 嵌套书写
- **媒体查询按断点分组，集中写在组件根块末尾**，不分散在每个元素内部；多个断点时从大到小依次排列
- 样式结构不固定，根据组件实际需求灵活组织，无需套用固定模板

##### CSS-first：所有设备差异通过 CSS 控制

PC/移动端的所有差异——无论是**样式差异**还是**结构差异**——都必须通过 CSS 解决，**不使用 JS 判断设备类型**（原因见阶段 4 的 SSR 说明）。

**同一元素，不同断点的样式不同** — 断点集中写在组件块底部：

```less
.component {
  &__grid { grid-template-columns: repeat(4, 1fr); } // 默认 PC

  @media (max-width: 1024px) {
    &__grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 767px) {
    &__grid { grid-template-columns: 1fr; }
  }
}
```

**PC/移动端显示不同图片** — 两张图都渲染，CSS 控制显隐（不要根据屏幕宽度决定渲染哪张）：

```svelte
<img class="icon icon--pc" src={item.icon} alt="" />
<img class="icon icon--mb" src={item.iconMb || item.icon} alt="" />
```

```less
.component {
  .icon--mb { display: none; }

  @media (max-width: 767px) {
    .icon--pc { display: none; }
    .icon--mb { display: block; }
  }
}
```

**PC/移动端结构差异较大** — 两套结构都渲染，CSS 控制显隐：

```svelte
<div class="layout-pc"> ... PC 端结构 ... </div>
<div class="layout-mb"> ... 移动端结构 ... </div>
```

```less
.component {
  .layout-mb { display: none; }

  @media (max-width: 767px) {
    .layout-pc { display: none; }
    .layout-mb { display: block; }
  }
}
```

**Props 驱动的布局变化**（如 `layoutMb` 字段）— class 绑定 + 媒体查询组合：

```svelte
<div class="item" class:layout-updown={layoutMb === 'upDownLayout'}>
  ...
</div>
```

```less
.component {
  .item { display: flex; flex-direction: row; } // 默认横向

  @media (max-width: 767px) {
    .item.layout-updown { flex-direction: column; } // 移动端纵向
  }
}
```

##### CSS 变量传递动态 Props

通过 `style` 属性将 Props 值传入 CSS 变量，让 CSS 自己处理响应式（不要用 JS 计算后写 inline style）：

```svelte
<div
  class="component__grid"
  style="--col-count: {cardColumn};"
>
```

```less
.component {
  &__grid {
    display: grid;
    grid-template-columns: repeat(var(--col-count, 3), 1fr);
    gap: 24px;
  }

  @media (max-width: 767px) {
    &__grid {
      grid-template-columns: 1fr; // 移动端固定单列，忽略 CSS 变量
      gap: 12px;
    }
  }
}
```

##### 从设计稿 HTML 提取视觉意图

分析设计稿 HTML 时，**不要直接翻译 tailwind 类名到 CSS**，而是理解其背后的视觉意图，然后用 Less 重新实现：

- `grid grid-cols-3` → 理解为"三列等宽网格"，用 `grid-template-columns: repeat(3, 1fr)` 实现
- `text-xl font-bold text-gray-900` → 理解为"大标题，粗体，主色文字"，用 `font-size: 20px; font-weight: 700; color: var(--text-primary)` 实现
- `hidden md:block` → 理解为"移动端隐藏，PC 端显示"，用 CSS media query 控制 `display`
- `p-4 md:p-6` → 理解为"移动端 16px 内边距，PC 端 24px"

目标是写出清晰、可维护的 Less 代码，而不是机械翻译。

##### Less 样式示例

```svelte
<style lang="less">
  .pep-your-component {
    width: 100%;
    box-sizing: border-box;

    &.theme-grey {
      background-color: var(--bg-secondary, #f5f5f5);
    }

    &__container {
      max-width: var(--container-max-width, 1200px);
      margin: 0 auto;
      padding: var(--primitive-space-15) var(--primitive-space-5);
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(var(--col-count, 3), 1fr);
      gap: 24px;
    }

    // 间距合并（Trait 控制）
    &.merge-top &__container { padding-top: 0; }
    &.merge-bottom &__container { padding-bottom: 0; }

    // 移动端隐藏（Trait 控制）
    &.hide-mb { display: none; }

    // 断点从大到小集中声明，不分散在每个元素内部
    @media (max-width: 1024px) {
      &__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 767px) {
      &__container {
        padding: var(--primitive-space-10) var(--primitive-space-4);
      }

      &__grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  }
</style>
```

> 这只是一个结构示例。不同组件的样式复杂度差异很大，根据实际 spec 和设计稿的视觉意图自由组织 Less 代码，无需机械套用此结构。

---

### 阶段 4：SSR 水合安全 — 禁止 JS 判断设备类型

**这是本项目最重要的约束之一。** 组件在服务端渲染（SSR）时运行于 Node.js 环境，没有 `window`、`document`、`screen` 等浏览器对象。如果在组件初始化阶段用 JS 判断屏幕宽度来决定渲染结构，服务端和客户端得到的结果不同，**将导致水合（Hydration）失败，页面出现闪烁或报错**。

所有设备差异的正确处理方式已在 **3.3 style 块规范**中说明，本阶段只列出禁止写法。

#### ❌ 绝对禁止的写法

```svelte
<script lang="ts">
  // ❌ 禁止：SSR 时 window 不存在
  const isMobile = window.innerWidth < 768;

  // ❌ 禁止：onMount 内修改影响 HTML 结构的状态
  import { onMount } from 'svelte';
  let isMobile = $state(false);
  onMount(() => {
    isMobile = window.innerWidth < 768; // 导致水合不一致
  });

  // ❌ 禁止：通过 navigator.userAgent 判断设备
  const isMobile = /Mobile/.test(navigator.userAgent);
</script>

<!-- ❌ 禁止：根据 isMobile 渲染不同 HTML 结构 -->
{#if isMobile}
  <MobileLayout />
{:else}
  <DesktopLayout />
{/if}
```

#### ⚠️ onMount 的使用限制

`onMount` 只能用于**不影响 HTML 结构**的副作用，例如：
- 初始化第三方纯 JS 库（如埋点、事件监听）
- 启动定时器
- 读取 DOM 尺寸用于**动画**（不影响渲染结构）

**不能**在 onMount 中修改任何会影响 HTML 输出的响应式状态。

---

### 阶段 5：共享组件使用

优先使用项目共享的 UI 组件，避免重复造轮子：

```typescript
// 楼层标题（包含 title、subtitle、more 链接）
import FloorHeader from "@pep/shared/ui/FloorHeader.svelte";

// Tab 切换（配合 tabList Props + activeTabIndex 状态）
import FloorTabs from "@pep/shared/ui/FloorTabs.svelte";

// Trait 分拣工具
import { pickTrait } from "@pep/shared/ui/traits";
```

**FloorHeader 使用方式**：
```svelte
const headerProps = $derived(pickTrait(props, "header"));
// ...
<FloorHeader {...headerProps} />
```

**FloorTabs 使用方式**：
```svelte
let activeTabIndex = $state(0);
// ...
<FloorTabs {tabList} bind:activeTabIndex />
{#if tabList[activeTabIndex]}
  <!-- 当前 Tab 的内容 -->
{/if}
```

---

### 阶段 6：生成子组件（如需拆分）

若决定拆分子组件，在 `src/components/` 目录下创建，命名使用 **PascalCase**：

```svelte
<!-- src/components/CardItem.svelte -->
<script lang="ts">
  import type { ProductItem } from "../types";

  let { item }: { item: ProductItem } = $props();
</script>

<div class="card-item">
  <!-- 内容 -->
</div>

<style lang="less">
  .card-item {
    // 子组件使用自己独立的 BEM 根类名
    &__title { ... }
    &__desc { ... }

    // 断点从大到小集中声明
    @media (max-width: 1024px) {
      // 平板样式
    }

    @media (max-width: 767px) {
      // 移动端样式
    }
  }
</style>
```

**子组件原则**：
- 子组件使用自己独立的 BEM 根类名（不要继续用父组件的 `<component-name>__` 前缀）
- Trait 分拣只在根组件处理，子组件只接收处理后的值
- 子组件的类型从父组件的 `types.ts` 导入

---

### 阶段 7：代码质量检查清单

生成代码后，逐一检查：

```
代码规范：
  □ script 块内的导入顺序正确（Svelte → 第三方 → 共享 → 本地）
  □ 使用 $props() 而非 export let（Svelte 5 规范）
  □ 使用 $state() 而非 let（需要响应式的变量）
  □ 使用 $derived() 而非 $: 计算
  □ 事件用 onclick={} 而非 on:click（Svelte 5 规范）
  □ 无 TypeScript 类型错误（类型与 types.ts 一致）

样式规范：
  □ style 块声明为 <style lang="less">
  □ 根元素 class 与组件包名一致（kebab-case）
  □ 子元素用 BEM 命名，Less 嵌套书写（&__element / &--modifier）
  □ 无 inline style（除 CSS 变量传递，如 style="--col-count: {n};"）
  □ 媒体查询按断点集中写在组件根块末尾，从大到小排列，不逐元素分散
  □ 优先使用项目 CSS 变量（var(--primitive-*)、var(--text-*)等）
  □ merge-top / merge-bottom / hide-mb 响应 Trait

SSR 水合安全：
  □ 无任何 window / document / navigator 访问（初始化阶段）
  □ 无根据屏幕宽度决定渲染结构的 $state 变量
  □ onMount 内无修改影响 HTML 结构的状态
  □ PC/移动端差异全部由 CSS media query 控制

功能完整性：
  □ 所有 spec.md 中列出的 Props 都在组件中有对应处理
  □ 所有交互行为按 spec 描述实现
  □ 边界情况有处理（空数据、缺字段等）
  □ {@render props.children?.()} 保留扩展能力
```

---

### 阶段 8：对照 acceptance.md 执行验收

代码生成后，读取 `components/<component-name>/acceptance.md`，逐条核查已生成的组件代码是否满足每条 AC 的 **Then** 期望。

**核查逻辑**：逐条分析代码实现，判断是否覆盖了该 AC 的所有 Then 断言：

- **基础渲染类 AC**：对应数据字段在模板中是否有渲染逻辑？空值情况是否处理？
- **交互类 AC**：对应的事件处理函数是否实现？状态变化是否正确驱动视图？
- **响应式类 AC**：Less 中是否有 `@media (max-width: 767px)` 对应的样式规则？
- **移动端隐藏 AC**：`class:hide-mb={visibilityProps.isShowMb === false}` 是否存在？
- **边界情况 AC**：空数组/缺字段时的条件判断是否有兜底处理？

向用户展示核查报告：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 组件代码已生成！

生成文件：
  📄 src/index.svelte — 主组件（约 [N] 行）
  [📄 src/components/[SubName].svelte — 子组件]
  [📄 src/types.ts — 已更新]

---

📋 对照 acceptance.md 验收（共 [N] 条 AC）：

  ✅ AC-001 基础渲染 — 所有字段均有对应渲染逻辑
  ✅ AC-002 [交互名] — 事件处理和状态更新已实现
  ✅ AC-003 移动端适配 — 媒体查询样式已覆盖
  ❌ AC-004 [功能名] — Then 中 "[具体断言]" 未在代码中实现
  ⚠️  AC-005 边界情况 - 空数据 — 有条件判断，但未处理 [具体情况]

---

[如有 ❌ 或 ⚠️，立即在当前轮次补充修复，不要留给用户自己发现]

---

快速验证：
  1. 运行 `npm run dev` 查看效果
  2. 检查控制台是否有类型报错
  3. 调整浏览器宽度验证 768px 断点
  4. 无水合警告（SSR 结构与客户端一致）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**重要**：发现 ❌ 未通过项时，**必须立即修复**，不能仅报告问题让用户处理。修复完成后重新对该条 AC 进行核查，直到所有 AC 全部通过（或标明需要运行时才能验证的项）。

---

## 参考：项目 CSS 变量速查

```
// 间距（在 Less 中直接使用 var()）
var(--primitive-space-4)   // 16px
var(--primitive-space-5)   // 20px
var(--primitive-space-6)   // 24px
var(--primitive-space-10)  // 40px
var(--primitive-space-15)  // 60px

// 断点（使用字面值，以 spec.md 为准；集中写在组件块末尾，从大到小排列）
// @media (max-width: 1600px)  // 大屏收窄
// @media (max-width: 1024px)  // 平板 / 小屏 PC
// @media (max-width: 767px)   // 移动端

// 文字颜色
var(--text-primary)    // #212121
var(--text-secondary)  // #666666
var(--text-tertiary)   // #999999

// 背景
var(--bg-primary)      // #ffffff
var(--bg-secondary)    // #f5f5f5

// 边框
var(--border-subtle)   // #e5e5e5

// 容器
var(--container-max-width)  // 1200px
```

---

## Svelte 5 Runes 速查

```svelte
<script lang="ts">
  // Props（代替 export let）
  let props: MyProps = $props();
  const { theme = 'white', list = [] } = props;

  // 响应式状态（代替 let）
  let count = $state(0);
  let activeIndex = $state(0);

  // 派生计算（代替 $: 计算语句）
  const activeItem = $derived(list[activeIndex]);
  const total = $derived(list.length);

  // 副作用（只用于不影响 HTML 结构的操作）
  $effect(() => {
    // 定时器、事件监听、第三方库初始化等
    return () => { /* 清理函数 */ };
  });
</script>
```

---

## 注意事项

1. **设计稿 HTML 只是视觉参考**：从中提取颜色值、字号、间距等视觉意图，根据 spec.md 重新设计 HTML 结构，不照搬原始嵌套
2. **保守使用 $effect**：大多数场景用 `$derived` 即可，`$effect` 只用于真正的副作用（定时器、事件监听、第三方 JS 库初始化）
3. **不要写无用注释**：不要写"// 导入组件"、"// 定义 Props"这类纯描述性注释
4. **BEM 命名不要太深**：最多三层（`block__element--modifier`），超过则考虑拆子组件
