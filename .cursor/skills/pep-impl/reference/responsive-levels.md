# 响应式分级策略

> 本文件是 pep-impl 的参考资料，由主 SKILL.md 按需引用。
>
> **核心原则**：CSS-first，禁止 JS 判断设备类型。PC/移动端的所有差异——无论是样式差异还是结构差异——都必须通过 CSS 解决。

---

## 前置: PortalUI 组件豁免

以下元素 **已由 PortalUI 内置响应式适配**，无需编写任何 `@media` 规则：

- `<Floor>` 组件 — 楼层容器（`por-section` / `por-container`）自动处理容器宽度和内边距
- `<Carousel>` 组件 — 轮播交互和布局
- `por-btn-*` 按钮类 — 按钮尺寸和间距
- `por-text-title-t*` / `por-text-body-t*` 文本类 — 字号和行高
- `por-section-head` 标题区 — 标题排版

**只有组件自身的业务内容区域（Floor 的 children 部分）才需要按 Level 0-4 处理响应式。**

---

## Level 0: 纯 CSS 适配（零 DOM 开销）

**适用场景**：同一 HTML、同一数据，仅视觉属性不同——栅格列数、字号/间距、flex 方向等。

```less
.component {
  &__grid {
    display: grid;
    grid-template-columns: repeat(var(--col-count, 3), 1fr);
    gap: 24px;
  }

  @media (max-width: 1024px) {
    &__grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 767px) {
    &__grid { grid-template-columns: 1fr; gap: 12px; }
  }
}
```

Props 驱动的响应式也属于 Level 0——通过 CSS 变量注入，让 CSS 自己处理：

```svelte
<div class="component__grid" style="--col-count: {cardColumn};">
```

Props 驱动的移动端布局变体同属 Level 0：

```svelte
<div class="item" class:layout-mb-ud={layoutMb === 'upDownLayout'}>
```

```less
@media (max-width: 767px) {
  .item.layout-mb-ud { flex-direction: column; }
}
```

---

## Level 1: CSS 变量驱动的内容切换（零额外 DOM）

**适用场景**：PC/移动端使用不同的 **可由 CSS 属性承载的值**，如背景图。无需额外 DOM 元素。

```svelte
<div
  class="banner"
  style="--bg-pc: url({bgImage}); --bg-mb: url({bgImageMb || bgImage});"
/>
```

```less
.banner {
  background-image: var(--bg-pc);
  @media (max-width: 767px) {
    background-image: var(--bg-mb);
  }
}
```

---

## Level 2: 配对元素切换（少量 DOM 冗余）

**适用场景**：单个元素（图片、标题文字等）在 PC 和移动端 **内容不同**，且 CSS 属性无法承载（如 `<img src>` / 文本内容）。

渲染两个元素，用 `.pc-only` / `.mb-only` 切换：

```svelte
<img src={item.icon} class="pc-only" alt="" />
<img src={item.iconMb || item.icon} class="mb-only" alt="" />
```

```less
.mb-only { display: none; }
@media (max-width: 767px) {
  .pc-only { display: none; }
  .mb-only { display: block; }
}
```

**数据约定**：需要 Level 2 的字段，在 `default.json` 中创建 `*Mb` 后缀字段（如 `iconMb`）。`types.ts` 中声明为可选字段，模板中用 `fieldMb || field` 做 fallback。

---

## Level 3: 区块级模板切换（中等 DOM 冗余）

**适用场景**：一个区域的 HTML 结构在 PC 和移动端 **完全不同**（不只是样式差异），如卡片列表变轮播、侧边栏变底部抽屉。

渲染两套 DOM，复用 `.pc-only` / `.mb-only` 切换：

```svelte
<div class="pc-only">
  <div class="card-grid">...</div>
</div>
<div class="mb-only">
  <Carousel>...</Carousel>
</div>
```

**使用 Level 3 前必须确认**：
1. CSS flex/grid 的方向/换行/排序确实无法实现目标布局？（否则降为 Level 0）
2. 两套模板使用的是同一份数据（只是渲染方式不同）？
3. 如果两套模板的数据也不同，是否应该拆成两个独立子组件？

---

## Level 4: 整层显隐（特殊场景，极少使用）

> 这是一个罕见的特殊场景——在实际项目中，很少需要将整个组件在移动端完全隐藏。更常见的做法是对组件内的**某个元素**使用 Level 2/3 控制显隐。**仅当 CMS 配置明确要求整层移动端不展示时才使用。**

**适用场景**：整个楼层/组件在移动端不展示。通过 `isShowMb` Trait 控制。

```svelte
<div class="my-component" class:my-component--mobile-hidden={visibilityProps.isShowMb === false}>
  <Floor ...>...</Floor>
</div>
```

```less
@media (max-width: 767px) {
  .my-component--mobile-hidden { display: none; }
}
```

---

## Level 选择决策流程

```
该元素是否使用了 PortalUI 组件/类名？
├── 是 → 无需处理，PortalUI 自带适配
└── 否 → 差异是否涉及不同的数据内容？
    ├── 否 → 仅视觉属性变化？
    │   ├── 是 → Level 0 (纯 CSS)
    │   └── 否 → CSS flex/grid 可解决重排？
    │       ├── 是 → Level 0
    │       └── 否 → Level 3 (区块切换)
    └── 是 → 数据差异可用 CSS 属性表达？(如 background-image)
        ├── 是 → Level 1 (CSS 变量)
        └── 否 → 差异范围？
            ├── 单个元素 → Level 2 (配对切换)
            └── 整个区块 → Level 3 (区块切换)

特殊：CMS 要求整个楼层在移动端不展示？→ Level 4 (isShowMb，极少使用)
```

---

## 断点统一规范

**统一用 `max-width: 767px` 作为移动端断点，不用 768px**。

| 断点 | 媒体查询 | 适用场景 |
|------|---------|---------|
| 默认 | 无 | PC 最宽态 |
| 小屏 PC | `@media (max-width: 1280px)` | 可选，按 spec 需要 |
| 平板 | `@media (max-width: 1024px)` | 栅格降列等 |
| 移动端 | `@media (max-width: 767px)` | **统一移动端断点** |
| 小屏手机 | `@media (max-width: 480px)` | 可选，按 spec 需要 |

断点 **从大到小排列**，集中写在组件根块末尾。

---

## 类名统一规范

| 类名 | 用途 | 适用 Level |
|------|------|-----------|
| `.pc-only` | PC 端显示，移动端隐藏 | Level 2, 3 |
| `.mb-only` | 移动端显示，PC 端隐藏 | Level 2, 3 |
| `.layout-mb-*` | Props 驱动的移动端布局变体 | Level 0 |

Level 4 的整层显隐类名 **不作统一规定**，由各组件自行命名（如 `mobile-hidden`、`<组件名>--hidden-mb` 等）。

> 废弃 `icon--pc` / `icon--mb` 双划线命名（与 BEM modifier 语义冲突），统一使用 `.pc-only` / `.mb-only`。

---

## 样式示例

> `<style lang="less">` 或 `<style>` 均可。简单组件可用纯 CSS，复杂组件建议用 Less 嵌套。

```svelte
<style lang="less">
  .pep-your-component {
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

    // Level 2: 配对元素切换
    .mb-only { display: none; }

    // 断点从大到小集中声明
    @media (max-width: 1024px) {
      &__grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 767px) {
      &__grid { grid-template-columns: 1fr; gap: 12px; }

      // Level 2: 配对元素切换
      .pc-only { display: none; }
      .mb-only { display: block; }
    }
  }

  // Level 4: Trait 驱动整层隐藏（类名由组件自行命名）
  @media (max-width: 767px) {
    .my-component.mobile-hidden { display: none; }
  }
</style>
```

> **关键提醒**：
> - Level 4 的隐藏类名由组件自行决定，在移动端媒体查询中 `display: none`
> - `merge-top` / `merge-bottom` 由 `<Floor>` 的 props 处理，不手写 CSS
> - 楼层容器（`por-section`、`por-container`）已由 `<Floor>` 封装，PortalUI 自带适配
> - 只对 Floor children 内的业务 DOM 编写响应式规则

---

## 从设计稿 HTML 提取视觉意图（映射到 PortalUI Token）

分析设计稿 HTML 时，**不要直接翻译 tailwind 类名到 CSS**，而是理解其背后的视觉意图，**优先映射到 PortalUI token 或 class**，然后用 Less 重新实现：

- `grid grid-cols-3` → 理解为"三列等宽网格"，用 `grid-template-columns: repeat(3, 1fr)` 实现
- `text-xl font-bold text-gray-900` → 映射到 `por-text-title-t8` class 或 `font-weight: var(--por-base-font-weight-bold); color: var(--por-color-text-primary)`
- `text-sm text-gray-500` → 映射到 `por-text-body-t3` + `color: var(--por-color-text-secondary)`
- `hidden md:block` → Level 2/3："移动端隐藏，PC 端显示"，用 `.pc-only` 类
- `p-4 md:p-6` → Level 0："移动端 16px，PC 端 24px"，用 `var(--primitive-space-4)` / `var(--primitive-space-6)`
