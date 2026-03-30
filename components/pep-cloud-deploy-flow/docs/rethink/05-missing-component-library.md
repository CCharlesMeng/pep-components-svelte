# 缺失的组件库：重复与不一致审计

## 核心问题

一开始就还原设计稿开发了 button 组件（`DeployFlowButton`），但这只覆盖了"主/次操作按钮"一种场景。随着功能增加，工具栏按钮、Tab 按钮、图标按钮、卡片按钮等各写各的样式，导致全局不一致。

**这说明：在开始任何组件开发之前，应该先做一轮「UI 原子审计」，识别出需要哪些基础原子组件。**

---

## 1. 按钮（Button）— 最严重的不一致

### 已有共享

`DeployFlowButton.svelte`：统一的胶囊形主/次按钮。

### 仍然各自为政的按钮

| 位置 | 形态 | 与 DeployFlowButton 的差异 |
|------|------|---------------------------|
| `index.svelte` sidebar-resize-handle | 白底竖条图标，cursor: col-resize | 完全不同的交互语义 |
| `index.svelte` restore-btn | 圆形 32×32 + 阴影 | 图标按钮，无文字 |
| `index.svelte` float-panel__resize | 透明窄条拖拽热区 | 不可见的功能按钮 |
| `SidebarPanel.svelte` Tab 按钮 | 透明底 + border-bottom 选中态 | Tab 语义 |
| `SidebarPanel.svelte` __tools 图标按钮 | 20×20 工具栏 | 纯图标按钮 |
| `SidebarPanel.svelte` 步骤条 button | 圆形序号 | 步骤指示器 |
| `MobileFlow.svelte` 步骤 button | 类似但无 Tooltip | 移动端步骤 |
| `MobileFlow.svelte` __link-image | 整图作为复制入口 | 大面积点击区域 |
| `Navbar.svelte` __action-link / __end-btn | 文本链接外观 | 导航动作 |
| `PseudoBrowser.svelte` Tab | div role="button" | 与 Sidebar Tab 实现不一致 |
| `PseudoBrowser.svelte` __add-tab / __tool-btn | 浏览器工具栏 | 又一套工具栏样式 |
| `QuickLinkCard.svelte` | 260px 白底卡片 button | 卡片形态 |
| `EndDeploymentModal.svelte` __close-btn | 关闭按钮 | 模态关闭 |

### 应有的按钮体系

```
BaseButton（基础按钮）
├── PrimaryButton / SecondaryButton  → 当前 DeployFlowButton
├── IconButton（图标按钮）           → 工具栏、关闭、restore 等
├── GhostButton（幽灵按钮）          → 导航文字链接
└── CardButton（卡片按钮）           → QuickLinkCard
```

---

## 2. Tab 组件 — 两套不兼容实现

### SidebarPanel 的 Tab

- 使用 `<button type="button">`
- `class:active` + `border-bottom: 2px` 表示选中
- `title` 属性做原生提示

### PseudoBrowser 的 Tab

- 使用 `<div role="button" tabindex="0">`
- 手动处理 `onkeydown` Enter/Space
- 内嵌关闭按钮
- 完全不同的无障碍实现

### 应有的 Tab 体系

```
TabBar（容器）
├── Tab（单个页签）
│   ├── closable?: boolean    → 浏览器需要，侧栏不需要
│   ├── icon?: string         → 可选图标
│   └── 统一使用 <button>     → 一致的无障碍
└── AddTabButton              → 浏览器新建页签
```

---

## 3. Tooltip — 三种层次混用

### 当前状态

| 层次 | 使用场景 | 实现 |
|------|---------|------|
| `Tooltip.svelte` 组件 | 折叠恢复按钮、步骤圆点 | `computeTooltipPosition` + 悬浮层 |
| 原生 `title` 属性 | 拖拽手柄、Tab 标题、工具按钮 | 浏览器默认行为 |
| `copy-tip` Toast | 移动端复制反馈 | 底部固定 + 3s 渐隐 |

### 问题

- `Tooltip.svelte` 与 `title` 属性的视觉和行为完全不同（延迟、样式、换行）
- 复制反馈的 toast 是第三种完全独立的模式

### 应有的体系

```
Tooltip（悬浮提示，hover 触发）  → 统一替代所有 title 属性
Toast（操作反馈，事件触发）      → 复制成功、保存成功等
```

---

## 4. Loading 状态 — 三种不一致实现

| 组件 | 样式 | 差异 |
|------|------|------|
| `SidebarPanel` | `color: #86909c; font-size: 12px` | 灰色小字 |
| `MobileFlow` | `color: #4e5969; font-size: 13px` | 深色稍大字 |
| `PseudoBrowser` | 全屏 overlay + 居中文案 | 完全不同的形态 |

额外问题：`SidebarPanel` 有加载失败的 `remoteLoadFailedText`，但 `MobileFlow` 没有等价的失败态展示。

### 应有的体系

```
LoadingText（行内加载文案）     → 侧栏、移动端统一
LoadingOverlay（全屏加载遮罩）  → 伪浏览器 iframe
ErrorText（加载失败文案）       → 两端都应有
```

---

## 5. 图标渲染 — 无统一 Icon 组件

16px 工具图标的 CSS 在侧栏、导航栏、伪浏览器中**重复编写**。图标尺寸随场景变化（14/16/24/40/94×28），命名与约束未集中。

### 应有的体系

```svelte
<Icon src={url} size={16} alt="描述" />
```

一个简单的 Icon 组件可以统一：
- `img` 标签的尺寸控制
- SVG fallback 逻辑
- 无障碍 alt 文本
- 加载失败的占位

---

## 6. 步骤条（Step Bar）— 可提取的共享结构

### 当前状态

`StepStatusDot.svelte` 已共享，但步骤条的列表结构（`ol` + `li` + `button` + `line`）在 `SidebarPanel` 和 `MobileFlow` 中**高度相似但分别实现**。

### 差异点

- SidebarPanel：额外有 Tooltip 包裹 + 应用下拉
- MobileFlow：无 Tooltip，步骤名直接显示

### 应有的体系

```svelte
<StepBar steps={steps} activeIndex={i} orientation="horizontal|vertical">
  <!-- 可通过 slot 扩展 Tooltip 等 -->
</StepBar>
```

---

## 7. 其他可共享的工具

### Copy-to-Clipboard

仅在 `MobileFlow` 实现了 `copyLinkToClipboard`（含 `execCommand` 回退）。没有共享的复制工具函数，若侧栏或其它入口也要复制，会重复实现。

### Rich Text / Markdown 渲染

两套渲染路径：
- `MainPanel`：静态配置 HTML，`{@html}` + `rich-text` 类
- `SidebarPanel` / `MobileFlow`：`marked.parse` 生成 HTML + `markdown-content.css`

### 链接打开逻辑

`QuickLinkCard` 在 `MainPanel`、`DeploymentFinished`、`PseudoBrowser` 中各自处理链接打开逻辑。应提取为共享的 `openExternalLink` 函数。

---

## 总结：如果一开始就有组件库

| 原子组件 | 可消除的重复 | 受益的文件数 |
|---------|-------------|-------------|
| `IconButton` | 工具栏按钮 ×3 套 | SidebarPanel, PseudoBrowser, Navbar, index |
| `TabItem` | Tab 实现 ×2 套 | SidebarPanel, PseudoBrowser |
| `Tooltip`（统一） | title 属性 ×15+ 处 | 所有组件 |
| `LoadingState` | loading 文案 ×3 种风格 | SidebarPanel, MobileFlow, PseudoBrowser |
| `Icon` | img 尺寸样式 ×10+ 处 | 所有组件 |
| `StepBar` | 步骤列表 ×2 套 | SidebarPanel, MobileFlow |
| `copyToClipboard` | 剪贴板工具 ×1（预防性） | MobileFlow + 未来扩展 |

**保守估计，提前建立组件库可以减少 ~800-1000 行重复代码，并大幅提升 UI 一致性。**
