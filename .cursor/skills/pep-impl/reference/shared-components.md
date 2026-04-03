# 共享组件与 PortalUI 组件使用

> 本文件是 pep-impl 的参考资料，由主 SKILL.md 按需引用。
>
> **必须优先使用 shared/ui 组件和 PortalUI 样式，禁止重复造轮子。**

---

## 核心原则：静态用 PortalUI，动态用 shared/ui

| 场景 | 方案 | 示例 |
|------|------|------|
| **纯样式**（颜色、字号、按钮外观、图标） | 直接使用 PortalUI CSS 类名 / token | `por-btn-primary`、`por-text-title-t7`、`por-icon por-icon-right` |
| **布局容器**（楼层、栅格） | 使用 `shared/ui/floor/Floor.svelte` 组件 | `<Floor bg="white" title="..." />` |
| **交互组件**（轮播等） | 使用 `shared/ui/` 中的 Svelte 封装组件 | `<Carousel loop pagination />` |
| **样式 token**（间距、颜色、文字） | 使用 PortalUI CSS 变量 / class | `--por-color-text-primary`、`por-text-body-t3` |

**判断原则**：需要 `$(element).plugin()` 初始化的 JS 功能一律不用，用 shared/ui 中的 Svelte 封装替代。纯 CSS 类名和 token 直接使用。

---

## 组件导入参考

```typescript
// 楼层容器（封装 por-section + 标题区 + 间距合并，替代原 FloorHeader）
import Floor from "@pep/shared/ui/floor/Floor.svelte";

// 轮播（封装 por-carousel 系列 PortalUI 类）
import Carousel from "@pep/shared/ui/carousel/Carousel.svelte";

// Trait 分拣工具
import { pickTrait } from "@pep/shared/ui/traits";
```

> ⚠️ **FloorHeader 和 FloorTabs 已废弃**，不要导入。标题区通过 Floor 的 props 渲染，Tab 切换用 Svelte 状态自行实现。

---

## Floor 组件（唯一楼层容器）

**所有楼层组件必须使用 `Floor` 作为根容器**。Floor 内部自动生成 `por-section` + `por-container` + 标题区（`por-section-head`），不要手动编写这些类名。

```svelte
const headerProps = $derived(pickTrait(props, "header"));
const spacingProps = $derived(pickTrait(props, "spacing"));

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
  <!-- 楼层内容放在 Floor 内部的 por-section-body 中 -->
</Floor>
```

### Floor Props 完整列表

| Prop | 类型 | 说明 |
|------|------|------|
| `bg` | `'white' \| 'light' \| 'grey' \| 'dark' \| 'transBlack' \| 'transWhite'` | 楼层背景色 |
| `theme` | `'dark' \| 'light'` | 标题区颜色主题 |
| `title` | `string` | 主标题（支持 HTML） |
| `subtitle` | `string` | 副标题（支持 HTML） |
| `titleLink` | `{ text: string; href?: string }` | "查看更多"链接 |
| `titleLeft` | `boolean` | 标题居左 |
| `mergeTopSpacing` | `boolean` | 合并上方间距 |
| `mergeBottomSpacing` | `boolean` | 合并下方间距 |

---

## Carousel 组件

```svelte
<Carousel loop autoplay pagination navigation>
  {#each items as item}
    <div class="por-carousel-slide">
      <!-- 幻灯片内容，class 必须包含 por-carousel-slide -->
    </div>
  {/each}
</Carousel>
```

### Carousel Props

`transition`（slide/fade）、`initialSlide`、`preview`（同屏数量）、`speed`、`loop`、`autoplay`、`pagination`、`navigation`、`simulateTouch`、`dark`

---

## PortalUI 纯样式类的直接使用

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

## 不使用的 PortalUI 功能（依赖 jQuery）

| Portal-UI 功能 | 替代方案 |
|---------------|----------|
| 弹窗 Modal（JS 初始化） | Svelte `{#if}` + CSS |
| 下拉菜单 Dropdown（JS） | Svelte 状态 + click 事件 |
| 轮播 Carousel（JS） | `shared/ui/carousel/Carousel.svelte` |
| 标签页 Tab（JS） | Svelte 状态 + 自定义实现 |
| 楼层容器（JS） | `shared/ui/floor/Floor.svelte` |
| Tooltip | CSS `:hover` |
