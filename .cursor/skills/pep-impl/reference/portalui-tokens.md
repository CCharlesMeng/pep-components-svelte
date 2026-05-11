# PortalUI CSS Token 与样式类速查

> 本文件是 pep-impl 的参考资料，由主 SKILL.md 按需引用。

---

## 颜色 Token

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

---

## 文本 Token（class 方式）

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

---

## 图标

使用 PortalUI 字体图标：
```html
<i class="por-icon por-icon-right"></i>
<i class="por-icon por-icon-left"></i>
<i class="por-icon por-icon-close"></i>
<i class="por-icon por-icon-more"></i>
```

产品图标：`<i class="icons-product-md ecs"></i>`

---

## 按钮样式

```html
<a class="por-btn-primary" href="#">主要按钮</a>
<a class="por-btn-secondary" href="#">次要按钮</a>
<a class="por-btn-dark" href="#">深色按钮</a>
```

---

## 楼层布局类（由 `Floor.svelte` 封装，了解即可）

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

---

## 轮播类（由 `Carousel.svelte` 封装，了解即可）

| 类名 | 作用 |
|------|------|
| `por-carousel` | 轮播根元素 |
| `por-carousel-wrapper` | 滑块容器 |
| `por-carousel-slide` | 每一张幻灯片（**使用时必须加此 class**） |
| `por-carousel-free` | **自由宽度布局**（`layout="free"` 时根节点由 Carousel 自动带此 class，可选用其下样式钩子） |
| `por-carousel-pagination` | 分页圆点容器 |
| `por-carousel-prev` / `por-carousel-next` | 前进/后退按钮 |

> **注意**：轮播交互由 `<Carousel>` 组件管理，幻灯片内容必须使用 `por-carousel-slide` class。使用前先确认 **轮播种类**（preview / free、slide / fade）：见 pep-impl `reference/shared-components.md`。

---

## 项目补充 Token（PortalUI 未覆盖时使用）

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
