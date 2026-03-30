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

## 执行流程

### 阶段 0：读取所有上下文

并行读取以下文件：
1. `components/<component-name>/spec.md`
2. `components/<component-name>/src/types.ts`
3. `components/<component-name>/mocks/props/default.json`
4. 设计稿 HTML（用户提供，或已在上下文中）
5. `.ai-workflow/templates/component/src/index.svelte`（参考模板）
6. `ARCHITECTURE.md`（架构规范）

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
  [列举会用到的 portal-ui 类名，如 por-btn-primary]

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
- 富文本字段用 `{@html text}` 渲染
- 事件绑定用 `onclick={handler}`（不用 on:click，Svelte 5 规范）

#### 3.3 style 块（使用 Less）

样式块声明为 `<style lang="less">`，充分利用 Less 的嵌套、变量和混入能力。

**Less 样式的核心规则**：

- 使用 Less 嵌套语法，避免重复写父选择器
- 优先使用项目 CSS 变量（`var(--primitive-space-*)` 等），Less 变量用于局部复用
- BEM 的 `__element` 和 `--modifier` 用 `&__element` / `&--modifier` 嵌套书写
- 媒体查询可内嵌在选择器块内（Less 支持）
- 样式结构不固定，根据组件实际需求灵活组织，无需套用固定模板

**Less 样式示例**（仅供参考，根据实际组件调整）：

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

    // 移动端样式
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

#### ✅ 正确做法：CSS 控制一切设备差异

无论是**样式差异**还是**结构差异**，都通过 CSS 解决：

**同一元素的样式差异** — 直接用媒体查询：
```less
.component__grid {
  grid-template-columns: repeat(3, 1fr); // PC

  @media (max-width: 767px) {
    grid-template-columns: 1fr; // 移动端
  }
}
```

**PC/移动端显示不同图片** — 两张图都渲染，CSS 控制显隐（不要根据屏幕宽度决定渲染哪张）：
```svelte
<!-- ✅ 两个元素都渲染，CSS 控制显示 -->
<img class="icon icon--pc" src={item.icon} alt="" />
<img class="icon icon--mb" src={item.iconMb || item.icon} alt="" />
```
```less
.icon--mb { display: none; }

@media (max-width: 767px) {
  .icon--pc { display: none; }
  .icon--mb { display: block; }
}
```

**PC/移动端结构差异较大** — 同样两套结构都渲染，CSS 控制显隐：
```svelte
<!-- ✅ 两套结构都输出，通过 CSS 切换 -->
<div class="layout-pc"> ... PC 端结构 ... </div>
<div class="layout-mb"> ... 移动端结构 ... </div>
```
```less
.layout-mb { display: none; }

@media (max-width: 767px) {
  .layout-pc { display: none; }
  .layout-mb { display: block; }
}
```

**Props 驱动的布局变化**（如 `layoutMb` 字段）— class 绑定 + CSS 媒体查询组合：
```svelte
<div class="item" class:layout-updown={layoutMb === 'upDownLayout'}>
  ...
</div>
```
```less
.item {
  display: flex;
  flex-direction: row; // 默认横向

  @media (max-width: 767px) {
    &.layout-updown {
      flex-direction: column; // 移动端纵向
    }
  }
}
```

#### ⚠️ onMount 的使用限制

`onMount` 只能用于**不影响 HTML 结构**的副作用，例如：
- 初始化第三方纯 JS 库（如埋点、事件监听）
- 启动定时器
- 读取 DOM 尺寸用于**动画**（不影响渲染结构）

**不能**在 onMount 中修改任何会影响 HTML 输出的响应式状态。

---

### 阶段 5：Portal-UI 使用规范

Portal-UI 是一个基于 CSS token 和 jQuery 的组件库。**本项目只使用其纯 CSS 样式类**，不引入任何 JS 文件。

#### ✅ 可以使用的类（纯样式）

```html
<!-- 按钮样式 -->
<a class="por-btn-primary" href="#">主要按钮</a>
<a class="por-btn-secondary" href="#">次要按钮</a>
<a class="por-btn-dark" href="#">深色按钮</a>

<!-- 若有其他纯样式类，根据设计稿按需使用 -->
```

#### ❌ 不使用的功能（jQuery 交互插件）

以下 Portal-UI 功能不要使用，改用 Svelte 原生实现：
- 弹窗（Modal）→ 用 Svelte 的 `{#if}` + CSS 实现
- 下拉菜单（Dropdown）→ 用 Svelte 状态 + click 事件实现
- 轮播（Carousel/Slider）→ 用 Svelte 实现或 CSS Scroll Snap
- Tooltip → 用 CSS `:hover` 实现
- 标签页（Tab）→ 使用项目共享组件 `FloorTabs`

**判断原则**：需要调用 `$(element).plugin()` 初始化的，一律不用。

---

### 阶段 6：共享组件使用

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

### 阶段 7：响应式实现要点

#### CSS 变量传递动态值（Props 驱动样式）

通过 `style` 属性将 Props 值传入 CSS 变量，让 CSS 自己处理响应式：

```svelte
<div
  class="component__grid"
  style="--col-count: {cardColumn};"
>
```
```less
.component__grid {
  display: grid;
  grid-template-columns: repeat(var(--col-count, 3), 1fr);
  gap: 24px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr; // 移动端固定单列，忽略 CSS 变量
    gap: 12px;
  }
}
```

#### 从设计稿 HTML 提取视觉意图

分析设计稿 HTML 时，**不要直接翻译 tailwind 类名到 CSS**，而是理解其背后的视觉意图，然后用 Less 重新实现：

- `grid grid-cols-3` → 理解为"三列等宽网格"，用 `grid-template-columns: repeat(3, 1fr)` 实现
- `text-xl font-bold text-gray-900` → 理解为"大标题，粗体，主色文字"，用 `font-size: 20px; font-weight: 700; color: var(--text-primary)` 实现
- `hidden md:block` → 理解为"移动端隐藏，PC 端显示"，用 CSS media query 控制 `display`
- `p-4 md:p-6` → 理解为"移动端 16px 内边距，PC 端 24px"

目标是写出清晰、可维护的 Less 代码，而不是机械翻译。

---

### 阶段 8：生成子组件（如需拆分）

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

    @media (max-width: 767px) {
      // 移动端样式
    }
  }
</style>
```

**子组件原则**：
- 子组件使用自己独立的 BEM 根类名（不要继续用父组件的 `<component-name>__`前缀）
- Trait 分拣只在根组件处理，子组件只接收处理后的值
- 子组件的类型从父组件的 `types.ts` 导入

---

### 阶段 9：代码质量检查清单

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
  □ 响应式断点统一用 @media (max-width: 767px)（在 Less 块内嵌套）
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

### 阶段 10：展示与确认

生成完毕后，向用户展示文件列表：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 组件代码已生成！

生成文件：
  📄 src/index.svelte — 主组件（约 [N] 行）
  [📄 src/components/CardItem.svelte — 卡片子组件]
  [📄 src/types.ts — 已更新（新增 [M] 个字段）]

---

快速验证：
  1. 运行 `npm run dev` 查看效果
  2. 检查控制台是否有类型报错
  3. 对比设计稿确认 PC/移动端布局（调整浏览器宽度验证断点）

---

请检查以下关键点：
  ✓ PC 端布局是否正确？
  ✓ 移动端（< 768px）布局变化是否符合预期？
  ✓ 交互行为（Tab 切换/展开等）是否正常工作？
  ✓ 服务端渲染时 HTML 结构与客户端是否一致（无水合警告）？

如需调整，告诉我具体的问题即可。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 参考：项目 CSS 变量速查

```less
// 间距
@space-4: var(--primitive-space-4, 16px);
@space-5: var(--primitive-space-5, 20px);
@space-6: var(--primitive-space-6, 24px);
@space-10: var(--primitive-space-10, 40px);
@space-15: var(--primitive-space-15, 60px);

// 断点（在媒体查询中使用字面值）
// 移动端：@media (max-width: 767px)
// PC端：默认（不加媒体查询）

// 文字颜色
// var(--text-primary)    #212121
// var(--text-secondary)  #666666
// var(--text-tertiary)   #999999

// 背景
// var(--bg-primary)      #ffffff
// var(--bg-secondary)    #f5f5f5

// 边框
// var(--border-subtle)   #e5e5e5

// 容器
// var(--container-max-width) 1200px
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
2. **强制使用 Less**：所有 style 块必须声明 `<style lang="less">`，利用嵌套语法写 BEM
3. **CSS 优先处理响应式**：任何 PC/移动端的展示差异，第一选择是 CSS media query，而非 JS 条件渲染
4. **禁止 JS 判断设备类型**：初始化阶段不得访问 `window.innerWidth`、`navigator.userAgent`、`document.body.clientWidth` 等，避免 SSR 水合失败
5. **保守使用 $effect**：大多数场景用 `$derived` 即可，`$effect` 只用于真正的副作用（定时器、事件监听、第三方 JS 库初始化）
6. **Portal-UI 只用样式类**：不引入 portal-ui 的 JS 文件，不调用任何 jQuery 插件
7. **不要写无用注释**：不要写"// 导入组件"、"// 定义 Props"这类纯描述性注释
8. **BEM 命名不要太深**：最多三层（`block__element--modifier`），超过则考虑拆子组件
