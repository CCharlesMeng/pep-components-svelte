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

## 前置依赖 Skill

> **必须在阶段 0 首先执行**：读取并激活 `frontend-portalui-helper` skill，获取 PortalUI 的完整使用指南（token 列表、组件用法、CSS class 规范等）。该 skill 提供比本文档更详尽的 PortalUI 参考，在编写样式和选择组件时以其为准。
>
> 操作：使用 Read 工具读取 `frontend-portalui-helper` 的 SKILL.md，将其中的 PortalUI 规范作为本次生成的样式参考基准。

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
- 媒体查询按断点从大到小依次声明，**集中写在组件根块末尾**，不分散在每个元素内部

### B. Trait 系统

Trait 是本项目对组件"通用能力"的抽象，每个 Trait 对应一组 Props 字段，通过 `pickTrait(props, "traitName")` 从组件 props 中提取后使用。

常用 Trait：

| Trait | 作用 | 用法 |
|-------|------|------|
| `header` | 楼层标题区域（title、subtitle、more 链接） | `pickTrait(props, "header")` 传给 `Floor` 的 title/subtitle/titleLink props |
| `spacing` | 上下间距合并控制 | `pickTrait(props, "spacing")` 传给 `Floor` 的 mergeTopSpacing/mergeBottomSpacing props |
| `visibility` | 移动端显隐（特殊场景，极少使用） | `pickTrait(props, "visibility")` 获取 `isShowMb`，仅在 CMS 要求整层隐藏时使用 |

Trait 分拣只在根组件处理，子组件只接收处理后的值，不直接调用 `pickTrait`。

### C. Portal-UI（PortalUI）使用规范

Portal-UI 是华为云官网标准设计体系，提供 CSS token（颜色、字号、间距等）和基于 jQuery 的 UI 组件。**本项目复用其 CSS token 和纯样式类**，但所有需要 JS 交互的组件使用 `shared/ui/` 中基于 PortalUI 封装的 Svelte 组件替代。

> **详细参考**：读取 `reference/portalui-tokens.md` 获取完整的颜色 Token、文本 class、图标、按钮、楼层/轮播类名速查表。
>
> **共享组件详情**：读取 `reference/shared-components.md` 获取 Floor、Carousel 等组件的完整 Props 列表和使用示例。

---

## 执行流程

### 阶段 0：读取所有上下文

**0-A. 激活 PortalUI 辅助 Skill（必须首先执行）**：

读取 `frontend-portalui-helper` skill 的 SKILL.md，获取 PortalUI 完整参考（颜色 token、文本 class、图标用法、组件规范等）。后续所有样式编写、组件选型均以该 skill 的指南为基准，本文档的 PortalUI 速查仅作备用参考。

**0-B. 并行读取组件上下文文件**：
1. `components/<component-name>/spec.md`
2. `components/<component-name>/src/types.ts`
3. `components/<component-name>/mocks/props/default.json`
4. 设计稿 HTML（用户提供，或已在上下文中）
5. `.ai-workflow/templates/component/src/index.svelte`（参考模板）
6. `ARCHITECTURE.md`（架构规范）
7. `components/<component-name>/acceptance.md`（验收标准，若存在则读取，阶段 8 使用）

若 spec.md 或 types.ts 缺失，提示用户先运行 `pep-spec` 和 `pep-mock`。

**0-C. 按需读取参考资料**：

根据组件复杂度，读取以下 reference 文件（首次使用本 skill 时建议全部读取）：

| 文件 | 何时读取 |
|------|---------|
| `reference/shared-components.md` | **始终读取** — Floor/Carousel 使用方式 |
| `reference/responsive-levels.md` | 组件有 PC/移动端差异时读取 |
| `reference/portalui-tokens.md` | 需要查阅具体 token 值时读取 |
| `reference/quality-checklist.md` | 阶段 7 质量检查时读取 |
| `reference/svelte5-runes.md` | 需要确认 Svelte 5 语法时读取 |

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
  ⚠️ visibility — 移动端显隐（极少使用，仅当 spec 要求整层隐藏时才启用）

共享组件复用（shared/ui 封装组件）：
  ✅ Floor — 楼层容器（por-section 封装）
  [✅ / ⬜] Carousel — 轮播（por-carousel 封装）

Portal-UI 样式类直接使用：
  [列举会用到的 PortalUI 类名，如 por-btn-primary、por-text-title-t7、por-icon por-icon-right]
  [若无则填"无"]

Portal-UI Token 使用：
  颜色：[列举会用到的颜色 token，如 --por-color-text-primary]
  字重：[如 --por-base-font-weight-bold]
  文本排版：[如 por-text-body-t3]

响应式策略（纯 CSS 实现）：
  PC（≥768px）：[布局描述]
  移动端（≤767px）：[布局描述]
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

  // 共享 UI 组件
  import Floor from "@pep/shared/ui/floor/Floor.svelte";
  import { pickTrait } from "@pep/shared/ui/traits";

  // 本地子组件（按需导入）
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

  // ④ Trait 分拣（Explicit Forwarder 模式）
  //    header → 传给 Floor 的 title/subtitle/titleLink
  //    spacing → 传给 Floor 的 mergeTopSpacing/mergeBottomSpacing
  const headerProps = $derived(pickTrait(props, "header"));
  const spacingProps = $derived(pickTrait(props, "spacing"));
  // 若 spec 要求整层移动端隐藏（罕见），才需要 visibility Trait：
  // const visibilityProps = $derived(pickTrait(props, "visibility"));

  // ⑤ 响应式状态（只声明确实需要响应式的状态）
  let activeTabIndex = $state(0);

  // ⑥ 派生计算
  const activeTab = $derived(tabList[activeTabIndex]);
  const displayItems = $derived(activeTab?.items ?? []);
</script>
```

#### 3.2 template 块

> **核心模式**：`<Floor>` 组件作为楼层根容器（封装标题区 + 容器 + 间距）→ 内容区。
>
> 不再使用独立的 FloorHeader 组件，不再手写 `por-section` / `por-container` 类名。

```svelte
<Floor
  bg={theme === "grey" ? "grey" : "white"}
  title={headerProps.title}
  subtitle={headerProps.subtitle}
  titleLink={headerProps.more?.text
    ? { text: headerProps.more.text, href: headerProps.more.href }
    : undefined}
  mergeTopSpacing={spacingProps.isMergeTopSpacing}
  mergeBottomSpacing={spacingProps.isMergeBottomSpacing}
>
  <!-- Floor 内部：楼层主体内容 -->
  {#if displayItems.length > 0}
    <div class="<component-name>__grid">
      {#each displayItems as item}
        <CardItem {item} />
      {/each}
    </div>
  {/if}

  {@render props.children?.()}
</Floor>

<!-- Floor 外部：可选的独立区域（如轮播等），不受 Floor 容器约束 -->
```

**Template 编写规则**：
- `<Floor>` 作为楼层根容器，接收 header/spacing Trait 字段，自动渲染标题区和 por-section 布局
- Floor 内部的内容元素使用 BEM 命名：`<组件名>__<元素>` 或 `<组件名>--<修饰符>`
- class 绑定使用 Svelte 的 `class:xxx={condition}` 语法
- 条件渲染用 `{#if}...{/if}`，列表渲染用 `{#each}`
- 富文本字段用 `{@html filterXSS(text)}` 渲染（filterXSS 从 `@pep/shared/utils` 导入，若项目中不存在则直接用 `{@html text}`）
- 事件绑定用 `onclick={handler}`（不用 on:click，Svelte 5 规范）

#### 3.3 style 块

样式块声明为 `<style lang="less">`，充分利用 Less 的嵌套、变量和混入能力。

**Less 基础规则**：
- 使用 Less 嵌套语法，避免重复写父选择器
- 优先使用项目 CSS 变量（`var(--primitive-space-*)` 等），Less 变量仅用于局部复用
- BEM 的 `__element` 和 `--modifier` 用 `&__element` / `&--modifier` 嵌套书写
- **媒体查询按断点分组，集中写在组件根块末尾**，不分散在每个元素内部；多个断点时从大到小依次排列
- 样式结构不固定，根据组件实际需求灵活组织，无需套用固定模板

**响应式处理**：CSS-first，禁止 JS 判断设备类型。根据差异粒度从最小 DOM 开销的方案向上选择（Level 0→1→2→3→4），永远优先低 Level。

> **详细的响应式分级策略、Level 0-4 示例、决策流程图、断点规范、类名规范和完整样式示例**：读取 `reference/responsive-levels.md`。

---

### 阶段 4：SSR 水合安全 — 禁止 JS 判断设备类型

**这是本项目最重要的约束之一。** 组件在服务端渲染（SSR）时运行于 Node.js 环境，没有 `window`、`document`、`screen` 等浏览器对象。如果在组件初始化阶段用 JS 判断屏幕宽度来决定渲染结构，服务端和客户端得到的结果不同，**将导致水合（Hydration）失败，页面出现闪烁或报错**。

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

### 阶段 5：共享组件与 PortalUI 组件使用

**必须优先使用 shared/ui 组件和 PortalUI 样式，禁止重复造轮子。**

> **完整的组件使用指南（Floor Props、Carousel Props、导入方式、PortalUI 纯样式类、不使用的功能列表）**：读取 `reference/shared-components.md`。

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

生成代码后，读取 `reference/quality-checklist.md`，逐一对照检查。

---

### 阶段 8：对照 acceptance.md 执行验收

代码生成后，读取 `components/<component-name>/acceptance.md`，逐条核查已生成的组件代码是否满足每条 AC 的 **Then** 期望。

**核查逻辑**：逐条分析代码实现，判断是否覆盖了该 AC 的所有 Then 断言：

- **基础渲染类 AC**：对应数据字段在模板中是否有渲染逻辑？空值情况是否处理？
- **交互类 AC**：对应的事件处理函数是否实现？状态变化是否正确驱动视图？
- **响应式类 AC**：Less 中是否有 `@media (max-width: 767px)` 对应的样式规则？
- **移动端隐藏 AC**（仅当 spec 要求整层隐藏时检查）：`isShowMb === false` 时是否有对应的 CSS 隐藏逻辑？
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
  3. 调整浏览器宽度验证 767px 断点
  4. 无水合警告（SSR 结构与客户端一致）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**重要**：发现 ❌ 未通过项时，**必须立即修复**，不能仅报告问题让用户处理。修复完成后重新对该条 AC 进行核查，直到所有 AC 全部通过（或标明需要运行时才能验证的项）。

---

## 参考实现

> **`pep-common-card-v2`** 是最具代表性的标杆组件，遇到不确定的实现模式时，优先参考它。
> 精简后的源码位于 `examples/pep-common-card-v2/`，可直接读取。

在生成代码前，建议读取以下示例文件作为模式参考：

| 文件 | 展示的关键模式 |
|------|--------------|
| `examples/pep-common-card-v2/types.ts` | `UseTraits` 类型组合、`*Mb` 后缀字段约定 |
| `examples/pep-common-card-v2/index.svelte` | Floor 根容器 + Trait 分拣 + CSS 变量驱动栅格 |

---

## 注意事项

1. **设计稿 HTML 只是视觉参考**：从中提取颜色值、字号、间距等视觉意图，根据 spec.md 重新设计 HTML 结构，不照搬原始嵌套
2. **保守使用 $effect**：大多数场景用 `$derived` 即可，`$effect` 只用于真正的副作用（定时器、事件监听、第三方 JS 库初始化）
3. **不要写无用注释**：不要写"// 导入组件"、"// 定义 Props"这类纯描述性注释
4. **BEM 命名不要太深**：最多三层（`block__element--modifier`），超过则考虑拆子组件
5. **FloorHeader / FloorTabs 已废弃**：不要导入或引用，标题区通过 Floor props 渲染，Tab 切换自行实现
