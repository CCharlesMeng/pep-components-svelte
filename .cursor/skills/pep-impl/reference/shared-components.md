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

封装 PortalUI `por-carousel` 系列类名，提供 Svelte 5 声明式轮播。

### Carousel Props 完整列表

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `transition` | `'slide' \| 'fade'` | `'slide'` | 过渡效果。`slide` 为水平滑动，`fade` 为淡入淡出 |
| `initialSlide` | `number` | `0` | 初始显示的 slide 索引 |
| `preview` | `number` | `1` | 同屏显示的 slide 数量。>1 时每个 slide 宽度自动计算为 `100% / preview` |
| `speed` | `number` | `400` | 过渡动画时长（ms） |
| `loop` | `boolean` | `false` | 是否循环播放。开启后首尾无缝衔接（内部通过克隆 slide 实现） |
| `autoplay` | `boolean \| AutoplayOptions` | `false` | 自动播放。传 `true` 使用默认 5000ms 间隔；传对象可自定义间隔 |
| `pagination` | `boolean` | `false` | 是否显示分页圆点 |
| `navigation` | `boolean` | `false` | 是否显示前进/后退箭头按钮 |
| `simulateTouch` | `boolean` | `false` | 是否允许鼠标拖拽切换（默认仅触屏可拖拽） |
| `dark` | `boolean` | `false` | 深色模式（箭头、圆点配色反转） |
| `class` | `string` | `''` | 额外 CSS class |

#### AutoplayOptions

当 `autoplay` 传对象时：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `delay` | `number` | `5000` | 自动播放间隔（ms） |
| `waitForTransition` | `boolean` | — | 是否等待过渡结束后再计时 |

### 公开方法（通过 `bind:this` 调用）

| 方法 | 签名 | 说明 |
|------|------|------|
| `prev()` | `() => void` | 切换到上一张 |
| `next()` | `() => void` | 切换到下一张 |
| `slideTo()` | `(index: number, dur?: number) => void` | 跳转到指定索引。`dur=0` 无动画跳转 |
| `play()` | `() => void` | 启动自动播放 |
| `pause()` | `() => void` | 暂停自动播放 |

### 使用示例

**基础用法**：

```svelte
<Carousel loop autoplay pagination navigation>
  {#each items as item}
    <div class="por-carousel-slide">
      <!-- 幻灯片内容，class 必须包含 por-carousel-slide -->
    </div>
  {/each}
</Carousel>
```

**自定义自动播放间隔**：

```svelte
<Carousel loop autoplay={{ delay: 3000 }} pagination>
  {#each items as item}
    <div class="por-carousel-slide">...</div>
  {/each}
</Carousel>
```

**多图同屏预览**：

```svelte
<Carousel preview={3} loop navigation pagination>
  {#each items as item}
    <div class="por-carousel-slide">...</div>
  {/each}
</Carousel>
```

**淡入淡出 + 慢速切换**：

```svelte
<Carousel transition="fade" speed={1200} loop autoplay pagination>
  {#each items as item}
    <div class="por-carousel-slide">...</div>
  {/each}
</Carousel>
```

**通过 ref 手动控制**：

```svelte
<script lang="ts">
  import Carousel from "@pep/shared/ui/carousel/Carousel.svelte";
  let carousel: Carousel;
</script>

<button onclick={() => carousel.prev()}>上一张</button>
<button onclick={() => carousel.next()}>下一张</button>

<Carousel bind:this={carousel} loop>
  {#each items as item}
    <div class="por-carousel-slide">...</div>
  {/each}
</Carousel>
```

> **注意**：每个幻灯片的根元素 **必须** 包含 `por-carousel-slide` class，否则组件无法识别和管理 slide。

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
