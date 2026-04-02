---
name: pep-spec
description: 从设计稿转换的HTML中分析组件需求，生成详细的组件规格文档 spec.md。当用户提供设计稿HTML、说"生成规格"、"分析设计稿"、"生成spec"、"pep-spec"时立即使用此技能。HTML可能包含tailwind类名、不规范结构，本技能会提炼出清晰的功能需求、响应式规格和交互行为。
---

# pep-spec — 从设计稿 HTML 生成组件规格文档

## 概述

本技能接受一个由设计稿工具（如 Figma、即时设计等）导出或转换的 HTML 片段，提炼出可执行的组件规格文档 `spec.md`。

**核心原则**：
- HTML 仅作**参考**，不是直接翻译目标，它的 tailwind 类、嵌套结构、命名往往不规范
- 目标是提炼**意图**：这个组件展示什么内容、有什么交互、在不同屏幕下长什么样
- spec.md 是后续 `pep-mock`（生成数据）和 `pep-impl`（生成代码）的核心依据

---

## 前置依赖 Skill

> **必须在阶段 0 首先执行**：读取并激活 `frontend-portalui-helper` skill，获取 PortalUI 的完整使用指南。在分析设计稿时，需要依据该 skill 中的 PortalUI 规范来识别颜色 token、文本 class、图标和组件映射关系。
>
> 操作：使用 Read 工具读取 `frontend-portalui-helper` 的 SKILL.md，将其作为样式规格分析的参考基准。

---

## 执行流程

### 阶段 0：准备

**0-A. 激活 PortalUI 辅助 Skill（必须首先执行）**：

读取 `frontend-portalui-helper` skill 的 SKILL.md，获取 PortalUI 完整的 token 列表、class 命名、组件规范。后续在分析设计稿 HTML、生成样式规格（Section 7）时，所有颜色、字号、字重都要映射到该 skill 提供的 PortalUI token/class。

**0-B. 收集组件上下文**：

1. 确认组件名称（如用户未提供，根据 HTML 内容推断并确认）
2. 确认组件目录是否已存在：`components/<component-name>/`
3. 读取已有 spec.md（如存在，进入增量更新模式）

**分析 HTML**，重点提取：

```
结构层面：
  - 整体布局：是几列？有无 Tab 切换？有无轮播？
  - 卡片/列表/网格结构：每个 item 有哪些字段？
  - 头部/尾部区域：标题、副标题、"查看更多"链接等
  - 浮层/弹窗：有无 Modal、Tooltip、Dropdown

内容层面：
  - 图片字段（icon、banner、cover 等）
  - 文字字段（标题、描述、标签、按钮文案等）
  - 链接字段（跳转地址）
  - 状态字段（是否显示、激活态、禁用态等）

响应式层面（tailwind 断点转换参考）：
  - sm: (≥640px) / md: (≥768px) → 移动端边界（本项目以 768px 为 PC/移动端分界）
  - lg: (≥1024px) / xl: (≥1280px) → PC 端内部差异
  - 前缀无断点 → 移动端基础样式
  - 注意：同一元素在不同断点下可能完全不同（如移动端隐藏、PC 端展示）

交互层面：
  - 点击/悬浮响应
  - Tab/轮播切换
  - 展开/收起
  - 倒计时等动态效果

PortalUI 组件/Token 映射层面（必须识别）：
  - 楼层容器 → Floor 组件（shared/ui），自动提供 por-section 布局
  - 轮播 → Carousel 组件（shared/ui），使用 por-carousel-slide class
  - Tab 切换 → Svelte 状态 + 自定义实现
  - 按钮样式 → por-btn-primary / por-btn-secondary / por-btn-dark
  - 文本排版 → por-text-title-t* / por-text-body-t* class
  - 图标 → por-icon 系列
  - 颜色 → --por-color-text-primary / secondary / button / weak 等 token
  - 字重 → --por-base-font-weight-bold / normal / lighter
```

---

### 阶段 1：智能分析与推断

分析完 HTML 后，构建推断结论并向用户展示，格式如下：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 设计稿分析结论

组件名：[组件名]
组件类型：[展示型 / 交互型 / 复合型]

结构：
  ✅ 已识别：[头部区域 / 卡片列表 / Tab 切换 / ...]
  🔴 需确认：[某区域用途不明]
  🟡 推断：[这个区域可能是"查看更多"入口]

响应式：
  PC：[描述 PC 端布局]
  移动端：[描述移动端布局]

PortalUI 组件/Token 映射：
  shared/ui 组件：[Floor（必须）、Carousel（如有轮播）]
  PortalUI 样式类：[por-btn-primary、por-text-title-t7 等]
  PortalUI 颜色 token：[--por-color-text-primary 等]

数据字段（初步推断）：
  - [字段名]：[用途说明]（🟢 确定 / 🟡 推断）

交互行为：
  - [描述]（🟢 确定 / 🟡 推断）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以上推断是否准确？有需要补充或纠正的吗？
```

等待用户确认或纠正后继续。若用户说"直接生成"且**不存在 🔴 项**，则基于推断结果直接进入阶段 3；若存在 🔴 项，即使用户说"直接生成"也必须先完成阶段 2 的澄清。

---

### 阶段 2：澄清关键不确定项

澄清分两类，处理方式不同：

#### 🔴 必须澄清项

所有 🔴 项都必须得到用户明确回答，**没有数量上限**，逐轮提问直到全部变为 🟢。每轮可以批量提问，但不要为了"看起来少"而漏掉 🔴 项。

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 以下问题必须确认，无法推断：

1. [问题描述]（无法推断的原因）
   → 选项：A. [选项] / B. [选项] / 或描述你的需求

2. [问题描述]
   → 选项：A. [选项] / B. [选项]

[...所有 🔴 项，一条不能省略...]

请回复（可直接选 A/B/C，也可描述具体需求）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

用户回复后，更新对应项的状态（🔴 → 🟢），检查是否有新触发的 🔴 项，继续下一轮，直到没有 🔴 为止。

若用户明确说"不管了"/"先跳过"，将剩余 🔴 项标注为 `待定（用户放弃澄清）`，在生成的 spec.md 中显式声明这些风险，不要默默跳过。

#### 🟡 推断项

🟡 项是基于现有 HTML 证据的推断，用户可以选择确认、纠正或接受为"工作假设"。若 🔴 已全部解决、用户说"就这样"/"skip"时，🟡 项自动标注为"工作假设"并继续，不必逐一追问。

---

### 阶段 3：生成 spec.md

根据分析结果，生成 `spec.md`，写入 `components/<component-name>/spec.md`。

**spec.md 只承载需求描述，不包含验收标准**（验收标准单独输出到 `acceptance.md`）。

**spec.md 完整模板**：

```markdown
# [组件显示名称] 规格文档

> 组件包名：`<package-name>`  
> 创建日期：[YYYY-MM-DD]  
> 状态：草稿  
> 验收标准见 [acceptance.md](./acceptance.md)

---

## 1. 概述

[2-4 句话描述组件的用途、在页面中的定位、核心价值]

**组件类型**：楼层组件（Floor Component）  
**数据驱动**：是，所有内容由外部 Props 注入  
**SSR 支持**：是

---

## 2. 核心功能

[按功能模块列举，每条说明该功能做什么、为什么存在]

- **[功能名称]**：[描述]
- **[功能名称]**：[描述]
- ...

---

## 3. 界面结构

### 3.1 PC 端（≥768px）

[描述 PC 端的整体布局，使用 ASCII 或文字说明区域划分]

```
+------------------------------------------+
| 楼层标题区（FloorHeader）                  |
+------------------------------------------+
| Tab 区（如有）                             |
+------------------------------------------+
| 内容区：[N] 列卡片网格                     |
|  ┌────────┐  ┌────────┐  ┌────────┐      |
|  │  卡片1  │  │  卡片2  │  │  卡片3  │      |
|  └────────┘  └────────┘  └────────┘      |
+------------------------------------------+
| 底部操作区（如有）                         |
+------------------------------------------+
```

[补充说明：最大宽度、内边距、卡片间距等]

### 3.2 移动端（<768px）

[描述移动端布局差异]

[说明：哪些元素隐藏/显示、列数变化、间距变化等]

---

## 4. Props 设计

| Prop 名 | 类型 | 默认值 | 必填 | 说明 |
|---------|------|--------|------|------|
| [名称] | [类型] | [默认值] | 是/否 | [说明] |

### 4.1 通用 Traits（继承自共享类型）

本组件通过 `UseTraits` 继承以下通用能力：

| Trait | 说明 |
|-------|------|
| `header` | 楼层标题：title、subtitle、more 链接等 |
| `spacing` | 上下间距合并：isMergeTopSpacing、isMergeBottomSpacing |
| `visibility` | 显示控制：isShowMb（是否在移动端显示）|

### 4.2 业务 Props

[表格：组件特有的业务属性]

### 4.3 嵌套数据结构

[如有复杂嵌套（列表、卡片等），用树状或表格说明每层字段]

---

## 5. 响应式规格

| 断点 | 范围 | 变化说明 |
|------|------|---------|
| PC 端 | ≥768px | [描述] |
| 移动端 | <768px | [描述] |

**关键响应式行为**：
- [具体说明]

---

## 6. 交互行为

[如无交互，写"本组件为纯展示型，无需用户交互"。否则逐条列举]

- **[交互名称]**：触发条件 → 响应行为 → 状态变化
- ...

---

## 7. 样式规格（必须映射到 PortalUI Token）

> **核心要求**：所有颜色、字号、字重必须优先映射到 PortalUI token 或 class，不使用硬编码值。

### 7.1 颜色方案

[分析设计稿中的颜色，映射到 PortalUI 颜色 token]

| 用途 | PortalUI Token | 备注 |
|------|---------------|------|
| 主要文本 | `var(--por-color-text-primary)` | #191919 |
| 次要文本 | `var(--por-color-text-secondary)` | #595959 |
| 弱化文本 | `var(--por-color-text-weak)` | #808080 |
| 链接/按钮文本 | `var(--por-color-text-button)` | #1476ef |
| 白色背景 | `var(--por-color-background-white)` | #ffffff |
| 悬浮背景 | `var(--por-color-background-gray-1)` | #fafafa |
| [其他] | [映射到最接近的 PortalUI token 或说明无对应 token] | |

### 7.2 字体规格

[分析设计稿中的字体，映射到 PortalUI 文本 class]

| 元素 | PortalUI class 或字号 | 字重 token | 行高 |
|------|---------------------|-----------|------|
| 楼层标题 | `por-text-title-t7`（24px/36px） | `--por-base-font-weight-bold` | 36px |
| 卡片标题 | `por-text-title-t8`（20px/30px） | `--por-base-font-weight-bold` | 30px |
| 描述文字 | `por-text-body-t3`（14px/22px） | `--por-base-font-weight-normal` | 22px |
| 辅助文字 | `por-text-body-t4`（12px/18px） | `--por-base-font-weight-normal` | 18px |
| [其他] | [映射或自定义值] | | |

PortalUI 文本 class 对照表：
- 标题系列：`por-text-title-t3`(40px) ~ `por-text-title-t8`(20px)
- 正文系列：`por-text-body-t1`(18px) ~ `por-text-body-t4`(12px)

### 7.3 间距规格

[内边距、外边距、卡片间距等，使用项目间距变量 `var(--primitive-space-*)` 表示]

### 7.4 Portal-UI 组件与样式类使用

> PortalUI 是华为云官网标准设计体系。**静态样式直接使用 PortalUI 类名/token，动态交互使用 shared/ui 中的 Svelte 封装组件。**

#### 7.4.1 shared/ui 封装组件（动态/交互组件）

[标注本组件需要使用的 shared/ui 组件]

| 组件 | 是否使用 | 用途 |
|------|---------|------|
| `Floor`（楼层容器） | ✅ 必须 | 提供 por-section 布局、标题区、间距合并 |
| `Carousel`（轮播） | [✅/⬜] | [用途说明] |

#### 7.4.2 PortalUI 纯样式类（直接在 HTML 中使用）

| 类名 | 用途 |
|------|------|
| `por-btn-primary` | 主要按钮样式 |
| `por-btn-secondary` | 次要按钮样式 |
| `por-btn-dark` | 深色按钮样式 |
| `por-text-title-t*` | 标题文本排版 |
| `por-text-body-t*` | 正文文本排版 |
| `por-icon por-icon-*` | 字体图标 |
| `por-carousel-slide` | 轮播幻灯片（配合 Carousel 组件使用） |
| [其他] | [用途] |

#### 7.4.3 PortalUI CSS Token（在 Less 中使用 `var()` 引用）

| Token | 用途 |
|-------|------|
| `--por-color-text-primary` | 主要文本颜色 |
| `--por-color-text-secondary` | 次要文本颜色 |
| `--por-color-text-button` | 链接/按钮文本颜色 |
| `--por-base-font-weight-bold` | 标题字重 |
| [其他用到的 token] | [用途] |

> ⚠️ PortalUI 的 jQuery 交互插件一律不使用，改用 shared/ui 中的 Svelte 封装组件

---

## 8. 边界情况

- **空数据**：[描述空数据时的展示策略，如隐藏整个楼层 / 显示占位符]
- **超长文本**：[描述文本截断策略]
- **图片加载失败**：[占位图 / 隐藏处理]
- **[其他边界情况]**：[处理方式]

---

## 附录：设计稿参考说明

> 设计稿 HTML 仅作样式和结构参考，以下内容需要注意：
> - Tailwind 类名已转换为本项目的 CSS 变量 + BEM 命名
> - 部分设计稿中的绝对定位已调整为标准流布局
> - [其他需要注意的转换说明]
```

---

### 阶段 4：生成 acceptance.md

基于 spec.md 中所有功能点、交互行为、响应式规格和边界情况，生成 `acceptance.md`，写入 `components/<component-name>/acceptance.md`。

**acceptance.md 格式规范（GWT）**：

每条验收项格式：
- `AC-XXX`：三位数编号
- **Given**：前置条件（组件状态 + 输入数据）
- **When**：触发动作（加载/点击/调整视口等）
- **Then**：期望结果，用 `-` 列出具体可验证的断言

**必须覆盖的验收维度**（逐一对照 spec.md 检查）：

| 维度 | 说明 |
|------|------|
| 基础渲染 | 默认数据下，所有元素正确展示 |
| 核心功能 | spec 中每个功能点至少一条 AC |
| 交互行为 | spec 中每个交互至少一条 AC（Tab 切换、展开/收起等）|
| 响应式 | PC 端布局 + 移动端（≤767px）布局各一条 |
| 移动端隐藏 | `isShowMb=false` 时整体不渲染 |
| 边界情况 | 空数据、缺字段、超长文本等，spec 列出的每种情况一条 |

**acceptance.md 模板**：

```markdown
# 验收标准

> 组件：`<package-name>`  
> 对应规格：[spec.md](./spec.md)

### AC-001：基础渲染
**Given** 组件挂载，使用 `mocks/props/default.json` 数据
**When** 页面首次加载完成
**Then**
- 楼层标题区正确显示
- [其他默认状态下的预期...]

### AC-002：[功能名称]
**Given** [前置条件]
**When** [触发动作]
**Then**
- [断言 1]
- [断言 2]

[...按维度逐一生成 AC 条目，不遗漏 spec 中的任何功能点...]

### AC-XXX：移动端适配
**Given** 视口宽度为 375px
**When** 页面加载
**Then**
- 组件正常渲染，不超出视口
- 移动端布局正确（[描述具体布局预期]）
- [移动端专属字段如 titleMb 正确显示]

### AC-XXX：边界情况 - 空数据
**Given** [关键列表字段] 为空数组
**When** 页面加载
**Then**
- 组件不报错、不崩溃
- [描述空态展示预期]
```

---

### 阶段 5：确认并写入文件

生成两个文件的预览后，询问用户：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 文档生成完毕

即将写入以下文件：
  📄 components/<component-name>/spec.md
  📄 components/<component-name>/acceptance.md（共 [N] 条 AC）

以上内容是否符合预期？[Y/n]
或告诉我需要调整的地方
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

写入后，给出完成提示：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 文档已写入！

  📄 components/<component-name>/spec.md
  📄 components/<component-name>/acceptance.md（[N] 条 AC）

下一步建议：

  1. 生成 Mock 数据
     使用 pep-mock 技能
     基于 spec.md 生成 mocks/props/default.json 和 types.ts

  2. 实现组件代码
     使用 pep-impl 技能
     基于 spec.md + mock + 设计稿 HTML 生成 index.svelte
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Tailwind → 语义化描述 对照参考

分析 HTML 时，使用以下对照将 tailwind 类转换为有意义的描述：

| Tailwind 类 | 语义描述 |
|-------------|---------|
| `grid grid-cols-3` | 三列网格布局 |
| `grid grid-cols-1 md:grid-cols-3` | 移动端单列，PC 端三列 |
| `flex flex-col` | 纵向弹性布局 |
| `text-xl font-bold` | 大标题文字，粗体 |
| `text-sm text-gray-500` | 小号次要文字 |
| `rounded-lg` | 圆角卡片（约 8px） |
| `shadow-md` | 中等阴影 |
| `hidden md:block` | 移动端隐藏，PC 端显示 |
| `block md:hidden` | 移动端显示，PC 端隐藏 |
| `gap-4` | 元素间距约 16px |
| `p-4` / `p-6` | 内边距 16px / 24px |
| `w-full` | 宽度 100% |
| `max-w-[1200px]` | 最大宽度 1200px（常见容器宽度）|
| `aspect-ratio-[16/9]` | 16:9 宽高比 |
| `truncate` | 单行文本截断省略 |
| `line-clamp-2` | 两行文本截断 |
| `overflow-hidden` | 隐藏溢出内容 |

---

## 注意事项

1. **不要直接复制 HTML 结构**：spec.md 描述的是**需求意图**，不是 HTML 实现细节
2. **保守对待不确定项**：宁可标注"待定"，也不要凭空捏造
3. **关注移动端差异**：设计稿通常会有明显的 PC/移动端布局差异，务必分别描述
4. **Props 命名遵循项目约定**：camelCase、与 schema.json 字段一一对应
5. **增量更新**：若 spec.md 已存在，不要覆盖用户已有的内容，只补充缺失部分
6. **样式必须映射到 PortalUI**：颜色、字号、字重全部映射到 PortalUI token/class，不使用硬编码值；设计稿中的颜色值转换为最接近的 PortalUI token
7. **组件优先使用 shared/ui**：楼层容器用 `Floor`、轮播用 `Carousel`，按钮用 PortalUI 按钮类名
