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

### C. Portal-UI（PortalUI）使用规范

Portal-UI 是华为云官网标准设计体系，提供 CSS token（颜色、字号、间距等）和基于 jQuery 的 UI 组件。**本项目复用其 CSS token 和纯样式类**，但所有需要 JS 交互的组件使用 `shared/ui/` 中基于 PortalUI 封装的 Svelte 组件替代。

#### C.1 核心原则：静态用 PortalUI，动态用 shared/ui

| 场景 | 方案 | 示例 |
|------|------|------|
| **纯样式**（颜色、字号、按钮外观、图标） | 直接使用 PortalUI CSS 类名 / token | `por-btn-primary`、`por-text-title-t7`、`por-icon por-icon-right` |
| **布局容器**（楼层、栅格） | 使用 `shared/ui/floor/Floor.svelte` 组件 | `<Floor bg="white" title="..." />` |
| **交互组件**（轮播等） | 使用 `shared/ui/` 中的 Svelte 封装组件 | `<Carousel loop pagination />` |
| **样式 token**（间距、颜色、文字） | 使用 PortalUI CSS 变量 / class | `--por-color-text-primary`、`por-text-body-t3` |

#### C.2 PortalUI CSS Token 速查

##### 颜色 Token

| 用途 | PortalUI Token | 色值 |
|------|---------------|------|
| 页面深色背景 | `--por-color-background-primary` | #191919 |
| 禁用背景 | `--por-color-background-disabled` | rgba(0,0,0,0.05) |
| 悬浮背景 | `--por-color-background-gray-1` | #fafafa |
| 白色背景 | `--por-color-background-white` | #ffffff |
| 文本\_重要色 | `--por-color-text-primary` | #191919 |
| 文本\_次要色 | `--por-color-text-secondary` | #595959 |
| 文本\_按钮色 | `--por-color-text-button` | #1476ef |
| 文本\_弱化色 | `--por-color-text-weak` | #808080 |
| 文本\_禁用色 | `--por-color-text-disabled` | #c2c2c2 |
| 错误色 | — | #F23030 |
| 告警色 | — | #FF8800 |
| 成功色 | — | #5CB300 |
| 提示色 | — | #1476FF |

在 Less 中使用：
```less
.my-title {
  color: var(--por-color-text-primary);
}
.my-desc {
  color: var(--por-color-text-secondary);
}
.my-link:hover {
  color: var(--por-color-text-button);
}
```

##### 文本 Token（class 方式）

| 类名 | 字号/行高 | 适用场景 |
|------|---------|---------|
| `por-text-title-t3` | 40px/60px | 官网楼层一级标题 |
| `por-text-title-t4` | 36px/54px | 购买页标题、子站楼层标题 |
| `por-text-title-t5` | 32px/48px | 首页、活动标题 |
| `por-text-title-t6` | 28px/42px | 价格数字、控制台页面标题 |
| `por-text-title-t7` | 24px/36px | banner 副标题、控制台文字标题 |
| `por-text-title-t8` | 20px/30px | 卡片标题 |
| `por-text-body-t1` | 18px/28px | 小标题 |
| `por-text-body-t2` | 16px/24px | 小标题 |
| `por-text-body-t3` | 14px/22px | 卡片内说明文字 |
| `por-text-body-t4` | 12px/18px | 辅助文字 |

字重 token：`--por-base-font-weight-lighter` (100)、`--por-base-font-weight-normal` (400)、`--por-base-font-weight-bold` (700)

在模板中使用：
```svelte
<h2 class="por-text-title-t7">标题</h2>
<p class="por-text-body-t3">说明文字</p>
```

在 Less 中也可以直接用对应的字号值：
```less
.card-title {
  font-size: 20px;
  line-height: 30px;
  font-weight: var(--por-base-font-weight-bold);
}
```

##### 图标

使用 PortalUI 字体图标：
```html
<i class="por-icon por-icon-right"></i>
<i class="por-icon por-icon-left"></i>
<i class="por-icon por-icon-close"></i>
<i class="por-icon por-icon-more"></i>
```

产品图标：`<i class="icons-product-md ecs"></i>`

##### 按钮样式

```html
<a class="por-btn-primary" href="#">主要按钮</a>
<a class="por-btn-secondary" href="#">次要按钮</a>
<a class="por-btn-dark" href="#">深色按钮</a>
```

##### 楼层布局类（由 `Floor.svelte` 封装，了解即可）

| 类名 | 作用 |
|------|------|
| `por-section` | 楼层容器根元素 |
| `por-section[data-bg="white/light/grey/dark"]` | 楼层背景色 |
| `por-container` | 楼层内容容器（居中、最大宽度） |
| `por-section-head` | 标题区容器 |
| `por-section-title` | 楼层主标题 |
| `por-section-subtitle` | 楼层副标题 |
| `por-section-title-link` | 标题区"查看更多"链接 |
| `por-section-body` | 楼层内容区 |
| `por-section-merge-spacing-top` | 合并上方间距 |
| `por-section-merge-spacing-bottom` | 合并下方间距 |

> **注意**：不要手写这些 `por-section*` 类名，统一通过 `<Floor>` 组件使用。

##### 轮播类（由 `Carousel.svelte` 封装，了解即可）

| 类名 | 作用 |
|------|------|
| `por-carousel` | 轮播根元素 |
| `por-carousel-wrapper` | 滑块容器 |
| `por-carousel-slide` | 每一张幻灯片（**使用时必须加此 class**） |
| `por-carousel-pagination` | 分页圆点容器 |
| `por-carousel-prev` / `por-carousel-next` | 前进/后退按钮 |

> **注意**：轮播交互由 `<Carousel>` 组件管理，但幻灯片内容必须使用 `por-carousel-slide` class。

#### C.3 shared/ui 封装组件（动态组件，必须使用）

| 组件 | 路径 | 替代的 PortalUI 功能 | 使用场景 |
|------|------|---------------------|---------|
| `Floor` | `@pep/shared/ui/floor/Floor.svelte` | 楼层容器 `por-section` | 所有楼层组件的根容器 |
| `Carousel` | `@pep/shared/ui/carousel/Carousel.svelte` | 轮播 `por-carousel` | 需要轮播切换的场景 |

##### Floor 组件使用：
```svelte
import Floor from "@pep/shared/ui/floor/Floor.svelte";

<Floor
  bg={theme === "grey" ? "grey" : "white"}
  title={headerProps.title}
  subtitle={headerProps.subtitle}
  titleLink={headerProps.more?.text ? { text: headerProps.more.text, href: headerProps.more.href } : undefined}
  mergeTopSpacing={spacingProps.isMergeTopSpacing}
  mergeBottomSpacing={spacingProps.isMergeBottomSpacing}
>
  <!-- 楼层内容 -->
</Floor>
```

Floor Props：`bg`（white/light/grey/dark/transBlack/transWhite）、`theme`（dark/light）、`title`、`subtitle`、`titleLink`、`titleLeft`、`mergeTopSpacing`、`mergeBottomSpacing`

##### Carousel 组件使用：
```svelte
import Carousel from "@pep/shared/ui/carousel/Carousel.svelte";

<Carousel loop autoplay pagination navigation>
  {#each items as item}
    <div class="por-carousel-slide">
      <!-- 幻灯片内容 -->
    </div>
  {/each}
</Carousel>
```

Carousel Props：`transition`（slide/fade）、`initialSlide`、`preview`（同屏数量）、`speed`、`loop`、`autoplay`、`pagination`、`navigation`、`simulateTouch`、`dark`

#### C.4 不使用的 PortalUI 功能（依赖 jQuery）

以下 PortalUI 功能的 JS 交互部分不使用，改用上述 Svelte 组件或原生实现：

| Portal-UI 功能 | 替代方案 |
|---------------|----------|
| 弹窗 Modal（JS 初始化） | Svelte `{#if}` + CSS |
| 下拉菜单 Dropdown（JS） | Svelte 状态 + click 事件 |
| 轮播 Carousel（JS） | `shared/ui/carousel/Carousel.svelte` |
| 标签页 Tab（JS） | Svelte 状态 + 自定义实现 |
| 楼层容器（JS） | `shared/ui/floor/Floor.svelte` |
| Tooltip | CSS `:hover` |

**判断原则**：需要 `$(element).plugin()` 初始化的 JS 功能一律不用，用 shared/ui 中的 Svelte 封装替代。纯 CSS 类名和 token 直接使用。

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
  import Floor from "@pep/shared/ui/floor/Floor.svelte";
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

##### 从设计稿 HTML 提取视觉意图（映射到 PortalUI Token）

分析设计稿 HTML 时，**不要直接翻译 tailwind 类名到 CSS**，而是理解其背后的视觉意图，**优先映射到 PortalUI token 或 class**，然后用 Less 重新实现：

- `grid grid-cols-3` → 理解为"三列等宽网格"，用 `grid-template-columns: repeat(3, 1fr)` 实现
- `text-xl font-bold text-gray-900` → 理解为"大标题，粗体，主色文字"，映射到 `font-size: 20px; font-weight: var(--por-base-font-weight-bold); color: var(--por-color-text-primary)`，或直接使用 `por-text-title-t8` class
- `text-sm text-gray-500` → 映射到 `por-text-body-t3` + `color: var(--por-color-text-secondary)`
- `hidden md:block` → 理解为"移动端隐藏，PC 端显示"，用 CSS media query 控制 `display`
- `p-4 md:p-6` → 理解为"移动端 16px 内边距，PC 端 24px"，用 `var(--primitive-space-4)` / `var(--primitive-space-6)`

目标是写出**使用 PortalUI token** 的清晰、可维护的 Less 代码，而不是机械翻译或使用硬编码色值。

##### Less 样式示例

```svelte
<style lang="less">
  .pep-your-component {
    // 由于楼层容器已由 <Floor> 组件提供 por-section + por-container，
    // 这里只写内容区自身的样式

    &__grid {
      display: grid;
      grid-template-columns: repeat(var(--col-count, 3), 1fr);
      gap: 24px;
    }

    &__title {
      color: var(--por-color-text-primary);
      font-weight: var(--por-base-font-weight-bold);
    }

    &__desc {
      color: var(--por-color-text-secondary);
      font-size: 14px;
      line-height: 22px;
    }

    &__link {
      color: var(--por-color-text-button);
    }

    // 移动端隐藏（Trait 控制）
    &.hide-mb { display: none; }

    // 断点从大到小集中声明，不分散在每个元素内部
    @media (max-width: 1024px) {
      &__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 767px) {
      &__grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  }
</style>
```

> 这只是一个结构示例。注意：楼层容器布局（`por-section`、`por-container`、间距合并等）已由 `<Floor>` 组件封装，组件样式只需关注内容区自身。颜色、字重等优先使用 PortalUI token。

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

### 阶段 5：共享组件与 PortalUI 组件使用

**必须优先使用 shared/ui 组件和 PortalUI 样式，禁止重复造轮子。**

#### 5.1 组件导入参考

```typescript
// 楼层容器（封装了 por-section / por-container / por-section-head 等 PortalUI 布局类）
import Floor from "@pep/shared/ui/floor/Floor.svelte";

// 轮播（封装了 por-carousel 系列 PortalUI 类）
import Carousel from "@pep/shared/ui/carousel/Carousel.svelte";

// Trait 分拣工具
import { pickTrait } from "@pep/shared/ui/traits";
```

#### 5.2 Floor 组件使用（取代手写 por-section）

**所有楼层组件必须使用 `Floor` 作为根容器**，不要手写 `por-section`、`por-container` 等类名：

```svelte
const headerProps = $derived(pickTrait(props, "header"));
const spacingProps = $derived(pickTrait(props, "spacing"));

<Floor
  bg={theme === "grey" ? "grey" : "white"}
  title={headerProps.title}
  subtitle={headerProps.subtitle}
  titleLink={headerProps.more?.text ? { text: headerProps.more.text, href: headerProps.more.href } : undefined}
  mergeTopSpacing={spacingProps.isMergeTopSpacing}
  mergeBottomSpacing={spacingProps.isMergeBottomSpacing}
>
  <!-- 楼层内容放在 Floor 内部 -->
</Floor>
```

#### 5.3 Carousel 使用方式

```svelte
<Carousel loop autoplay pagination navigation>
  {#each items as item}
    <div class="por-carousel-slide">
      <!-- 幻灯片内容，class 必须包含 por-carousel-slide -->
    </div>
  {/each}
</Carousel>
```

#### 5.4 PortalUI 纯样式类的直接使用

以下 PortalUI 样式类可在模板中直接使用，无需封装：

```svelte
<!-- 按钮 -->
<a class="por-btn-primary" href={item.href}>立即使用</a>
<a class="por-btn-secondary" href={item.href}>了解详情</a>

<!-- 文本排版 -->
<h2 class="por-text-title-t7">标题文字</h2>
<p class="por-text-body-t3">描述文字</p>

<!-- 图标 -->
<i class="por-icon por-icon-right"></i>
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
  □ 颜色使用 PortalUI token（--por-color-text-primary 等），不硬编码色值
  □ 字重使用 PortalUI token（--por-base-font-weight-bold 等）
  □ 文本排版优先使用 PortalUI class（por-text-title-t7、por-text-body-t3 等）
  □ 间距使用项目 CSS 变量（var(--primitive-space-*)）
  □ merge-top / merge-bottom / hide-mb 响应 Trait

PortalUI 合规：
  □ 楼层容器使用 <Floor> 组件，不手写 por-section / por-container
  □ 轮播使用 <Carousel> 组件，幻灯片加 por-carousel-slide class
  □ 按钮使用 PortalUI 按钮类（por-btn-primary / por-btn-secondary / por-btn-dark）
  □ 图标使用 PortalUI 图标类（por-icon por-icon-xxx）
  □ 无硬编码颜色值（#191919、#595959 等），全部用 PortalUI token 替代

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

## 参考：CSS 变量与 PortalUI Token 速查

### PortalUI 官方 Token（优先使用）

```
// ── 颜色 Token（来自 PortalUI 设计规范）──
var(--por-color-background-primary)   // #191919 深色背景
var(--por-color-background-disabled)  // rgba(0,0,0,0.05) 禁用背景
var(--por-color-background-gray-1)    // #fafafa 悬浮背景
var(--por-color-background-white)     // #ffffff 白色背景

var(--por-color-text-primary)    // #191919 重要文本
var(--por-color-text-secondary)  // #595959 次要文本
var(--por-color-text-button)     // #1476ef 按钮/链接文本
var(--por-color-text-weak)       // #808080 弱化文本
var(--por-color-text-disabled)   // #c2c2c2 禁用/失效文本

// ── 字重 Token ──
var(--por-base-font-weight-lighter)  // 100 细体（辅助文字）
var(--por-base-font-weight-normal)   // 400 常规体（正文）
var(--por-base-font-weight-bold)     // 700 中黑体（标题）
```

### PortalUI 文本 class（在 HTML 模板中使用）

```
por-text-title-t3  // 40px/60px  楼层一级标题
por-text-title-t4  // 36px/54px  子站楼层标题
por-text-title-t5  // 32px/48px  活动标题
por-text-title-t6  // 28px/42px  价格数字
por-text-title-t7  // 24px/36px  副标题
por-text-title-t8  // 20px/30px  卡片标题
por-text-body-t1   // 18px/28px  小标题
por-text-body-t2   // 16px/24px  小标题
por-text-body-t3   // 14px/22px  卡片说明文字
por-text-body-t4   // 12px/18px  辅助文字
```

### 项目补充 Token（PortalUI 未覆盖时使用）

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

// 以下为项目 fallback token，优先使用 PortalUI token
var(--text-primary)    // → 优先用 var(--por-color-text-primary)
var(--text-secondary)  // → 优先用 var(--por-color-text-secondary)
var(--bg-primary)      // #ffffff → 优先用 var(--por-color-background-white)
var(--bg-secondary)    // #f5f5f5

// 容器
var(--container-max-width)  // 1200px（Floor 组件内部已处理，无需手写）
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
