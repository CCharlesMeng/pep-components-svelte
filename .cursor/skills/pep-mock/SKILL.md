---
name: pep-mock
description: 基于组件 spec.md 生成 mock/props/default.json 数据和 src/types.ts 类型定义，需要与用户多轮确认，覆盖各种场景。当用户说"生成mock"、"生成数据"、"pep-mock"、"生成类型"、"生成default.json"时立即使用此技能。会主动与用户确认数据结构是否合理，完成后必须再次确认是否 OK。
---

# pep-mock — 生成 Mock 数据与类型定义

## 概述

本技能基于 `spec.md` 生成两个核心文件：
- `mocks/props/default.json`：组件开发时的默认 Mock 数据
- `src/types.ts`：与 Mock 数据严格对应的 TypeScript 类型定义

**执行原则**：
- 数据结构必须与 spec.md 中的 Props 设计一致
- Mock 数据要真实有意义，不要写 "text" "title" 这样的占位符
- 必须覆盖多种场景（默认态、边界态、特殊态）
- 每个关键决策都要与用户确认
- 按钮类型、主题值等枚举字段必须与 PortalUI 规范对齐

---

## 前置依赖 Skill

> **必须在阶段 0 首先执行**：读取并激活 `frontend-portalui-helper` skill，获取 PortalUI 的完整使用指南。生成 Mock 数据时，按钮类型（`btnType`）、主题（`theme`）等枚举值必须严格对齐 PortalUI 规范。
>
> 操作：使用 Read 工具读取 `frontend-portalui-helper` 的 SKILL.md，确认可用的 PortalUI 类名和枚举值。

---

## 执行流程

### 阶段 0：读取上下文

**0-A. 激活 PortalUI 辅助 Skill（必须首先执行）**：

读取 `frontend-portalui-helper` skill 的 SKILL.md，获取 PortalUI 可用的按钮类名、主题背景值、图标类名等。后续生成 `types.ts` 中的枚举类型和 `default.json` 中的枚举值时，以该 skill 为准。

**0-B. 读取组件上下文**：

1. 读取 `components/<component-name>/spec.md`
   - 若不存在：提示用户先运行 `pep-spec` 技能生成规格文档
2. 读取 `src/types.ts`（若存在，进入增量更新模式）
3. 读取 `mocks/props/default.json`（若存在，进入增量更新模式）
4. 读取 `COMPONENT_GUIDE.md` 了解项目 Mock 数据规范

---

### 阶段 1：分析 spec.md 并规划数据结构

从 spec.md 的 Props 设计和嵌套数据结构章节提取信息，构建初步数据方案：

**提取维度**：
- 所有 Props 及其类型、默认值、是否必填
- 嵌套数据结构（列表项、卡片字段等）
- 通用 Traits（header / spacing / visibility）
- 枚举类型（variant、type 等选项值）

**向用户展示方案摘要**：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 数据结构方案

顶层字段（来自 Traits + 业务 Props）：
  • _id: string — 实例唯一 ID（固定格式：<组件名>_<时间戳>）
  • title: string — 楼层标题（HTML 富文本格式）
  • subtitle: string — 副标题（可选）
  • more: { href, text } — 查看更多链接（可选）
  • theme: 'white' | 'grey' — 背景主题
  • isMergeTopSpacing: boolean — 合并上间距
  • isMergeBottomSpacing: boolean — 合并下间距
  • isShowMb: boolean — 移动端是否显示
  • [组件特有字段...]

列表/嵌套字段：
  • [字段名]: 包含 [N] 条示例数据
    每条包含：[字段清单]

默认 Mock 场景：
  A. default（推荐）— 完整数据，3-5 条列表项
  B. empty — 空数据（测试空态）
  C. promotion — 含特殊状态数据（如倒计时、标签等）

是否同意此方案？需要调整哪些字段？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

等待用户确认后继续。

---

### 阶段 2：确认数据结构完整性

在生成文件前，对照 spec.md 与 default.json 的字段规划做一次结构审查，找出以下三类问题并向用户确认：

**审查维度**：

1. **字段缺失**：spec.md 中描述了某个展示内容或交互行为，但当前规划的数据结构中没有对应字段
   - 例：spec 提到"卡片支持标签列表"，但 item 结构里没有 `tags` 字段
   - 例：spec 提到"移动端有不同的布局模式"，但没有 `layoutMb` 字段

2. **字段冗余**：当前规划了某个字段，但 spec.md 中没有任何功能需要它
   - 这类字段应该删除，避免污染数据结构

3. **移动端专属字段缺失**：组件在移动端有不同的展示内容（如移动端专用图片、移动端专用标题），需要对应的 `*Mb` 后缀字段
   - 例：PC 端用 `icon`，移动端用 `iconMb`（不同图片资源）
   - 例：PC 端用 `title`，移动端用 `titleMb`（不同文案或 Trait 已覆盖）
   - 注意区分：如果 PC/移动端只是样式不同（同样的内容），不需要单独字段，CSS 控制即可

向用户展示审查结论：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 数据结构审查结论

✅ 已覆盖：[列举确认正确的主要字段]

⚠️  疑似缺失：
  • [字段名]：spec 中 "[引用原文]" 需要此字段
  • [移动端字段名]：移动端展示内容不同，需要 *Mb 字段

🗑️  疑似冗余：
  • [字段名]：spec 中未找到对应功能描述

以上问题是否需要调整？确认后继续生成。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

若无任何问题，直接说明"数据结构与 spec 一致，继续生成"，不要无意义地逐项询问。

---

### 阶段 3：生成 types.ts

根据确认后的数据结构，生成 `src/types.ts`。

**types.ts 标准结构**：

```typescript
import type { UseTraits, TabItem as BaseTabItem } from "@pep/shared/ui/types";

/**
 * 1. 定义该组件特有的"纯业务"属性
 */
export interface <ComponentName>BusinessProps {
  /** [JSDoc 注释] */
  [propName]?: [类型];
}

/**
 * 2. 导出组合后的最终 Props
 * 通过 UseTraits 一眼看出该组件集成了哪些通用能力
 */
export type <ComponentName>Props = <ComponentName>BusinessProps & UseTraits<'header' | 'spacing' | 'visibility'>;

// 以下是嵌套数据类型定义
export interface [NestedType] {
  /** [JSDoc 注释] */
  [field]?: [类型];
}
```

**类型设计原则**：
- 所有字段默认可选（`?:`），除非 spec 明确标注必填
- 枚举类型用联合类型：`'white' | 'grey'`，不用 enum
- 字符串类型注意区分：普通字符串 vs 富文本 HTML 字符串（两者都是 `string`，但注释要说明是否支持富文本）
- 嵌套对象提取为独立的 interface
- JSDoc 注释每个字段，说明用途

向用户展示 types.ts 预览，询问是否确认：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 types.ts 预览

[展示完整内容]

是否确认？如需调整请告诉我。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 阶段 4：生成 default.json

根据确认的数据结构生成 `mocks/props/default.json`。

**default.json 规范**：

```json
{
  "_id": "<component-name>_<timestamp>",
  // Trait 字段（标题区 → 传递给 Floor 组件）
  "title": "<p>楼层标题文字</p>",
  "titleMb": "<p>楼层标题文字（移动端，可与PC相同）</p>",
  "subtitle": "",
  "subtitleMb": "",
  "more": {
    "href": "",
    "text": ""
  },
  // 显示控制
  "isShowMb": true,
  "isMergeTopSpacing": false,
  "isMergeBottomSpacing": true,
  // 主题（映射到 Floor 的 bg prop → PortalUI por-section[data-bg]）
  // 可选值: "white" | "light" | "grey" | "dark"
  "theme": "white",
  // 业务字段
  "[propName]": "[value]",
  // 按钮类型必须使用 PortalUI 类名
  // 示例: "btnType": "por-btn-primary" | "por-btn-secondary" | "por-btn-dark"
  // 列表数据（含 3-6 条真实有意义的示例数据）
  "[listField]": [
    {
      "[field]": "[真实示例值，非占位符]"
    }
  ]
}
```

**数据质量要求**：
- 标题文字：使用真实语义文字，如 "精选云产品推荐" 而非 "标题文字"
- 图片 URL：使用真实可访问的图片（可用 https://picsum.photos/ 作为占位图），或从 spec 中摘取的参考 URL
- 描述文字：真实的业务描述，2-20 个汉字
- 链接：使用 `#` 或真实业务链接，不要留空
- 时间字段（如倒计时）：使用未来的时间，格式 `"YYYY/MM/DD HH:mm"`

向用户展示完整 default.json 预览后询问：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 default.json 预览

[展示完整内容]

请检查：
  ✓ 数据结构是否与 spec 一致？
  ✓ 示例数据是否有意义？
  ✓ 字段是否有遗漏？

确认后写入文件，或告诉我需要调整的地方。[Y/n]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 阶段 5：写入文件

用户确认后，写入以下文件：

1. `src/types.ts` — TypeScript 类型定义
2. `mocks/props/default.json` — 默认 Mock 数据

若存在旧版本，采用**增量更新**策略：
- `types.ts`：保留用户已有的字段和注释，追加新字段
- `default.json`：保留用户已有的字段值，追加新字段

---

### 阶段 6：对照 acceptance.md 执行验收

文件写入后，读取 `components/<component-name>/acceptance.md`，逐条核查当前 Mock 数据是否能支撑每条 AC 的 **Given** 前置条件。

**核查逻辑**：

- `default.json` 是否为 AC-001（基础渲染）提供了完整的默认数据？
- 每条 AC 的 Given 中提到的特定字段或状态，`default.json` 是否有对应数据覆盖？
- 涉及"空数据"场景的 AC，是否需要额外的 mock 文件（如 `empty.json`）才能验收？
- 涉及"移动端专属字段"的 AC（如 `titleMb`、`iconMb`），`default.json` 中是否已填充？

向用户展示核查结论：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Mock 数据已生成！

写入文件：
  📄 src/types.ts — [N] 个接口，[M] 个字段
  📄 mocks/props/default.json — [N] 个顶层字段，[M] 条列表数据

---

📋 对照 acceptance.md 验收（共 [N] 条 AC）：

  ✅ AC-001 基础渲染 — default.json 数据完整，可覆盖
  ✅ AC-002 [功能名] — 相关字段已存在
  ⚠️  AC-003 [功能名] — Given 需要 [特殊字段]，当前 default.json 缺少，建议补充
  ⚠️  AC-XXX 边界情况 - 空数据 — 需要额外的 empty.json 才能验收此条

---

是否还需要补充以下内容？
  A. 为缺失字段更新 default.json
  B. 生成空数据场景（empty.json）
  C. 生成其他边界场景
  D. 无需补充，继续生成组件代码（pep-impl）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

若所有 AC 均可被当前 mock 数据覆盖，则直接报告"全部通过"，询问是否继续。

若用户选择补充，按需执行后重新对照 acceptance.md 确认，直到覆盖率满意为止。

---

## 类型系统参考

### UseTraits 通用 Trait 字段

```typescript
// header trait 字段
title?: string;        // 楼层标题（支持富文本 <p> 标签）
titleMb?: string;      // 移动端标题（可与 title 不同）
subtitle?: string;     // 副标题
subtitleMb?: string;   // 移动端副标题
more?: {
  href?: string;       // "查看更多"链接
  text?: string;       // "查看更多"文字
};

// spacing trait 字段
isMergeTopSpacing?: boolean;    // true = 移除上方间距
isMergeBottomSpacing?: boolean; // true = 移除下方间距

// visibility trait 字段
isShowMb?: boolean;  // false = 在移动端隐藏整个楼层
```

### 常见业务字段命名惯例

| 字段含义 | 推荐命名 | 类型示例 | PortalUI 映射 |
|---------|---------|---------|-------------|
| 主题/配色 | `theme` | `'white' \| 'light' \| 'grey' \| 'dark'` | Floor 的 `bg` prop → por-section[data-bg] |
| 列数 | `cardColumn` | `'2' \| '3' \| '4'` | — |
| 图片高度 | `imgHeight` | `'80px' \| '60px'` | — |
| 是否展示描述 | `showCardDesc` | `boolean` | — |
| 卡片样式 | `cardType` | `'left' \| 'center' \| 'product'` | — |
| 页签列表 | `tabList` | `TabItem[]` | — |
| 倒计时结束时间 | `endTime` | `string` (格式 YYYY/MM/DD HH:mm) | — |
| 图标URL | `icon` | `string` | — |
| 移动端图标 | `iconMb` | `string` | — |
| 按钮组 | `btnGroups` | `ButtonItem[]` | por-btn-primary/secondary/dark |
| 标签列表 | `tags` | `string[]` | — |

### 按钮类型（PortalUI 类名）

```typescript
export interface ButtonItem {
  /** 按钮样式类型（对应 PortalUI 类名，实现时直接作为 CSS class 使用） */
  btnType?: 'por-btn-primary' | 'por-btn-secondary' | 'por-btn-dark';
  /** 按钮链接 */
  btnHref?: string;
  /** 按钮文案 */
  btnLinkText?: string;
}
```

### 主题/背景类型（PortalUI data-bg 值）

```typescript
// theme 字段映射到 Floor 组件的 bg prop，最终对应 PortalUI por-section[data-bg]
// 可选值：'white' | 'light' | 'grey' | 'dark' | 'transBlack' | 'transWhite'
// default.json 中使用的 theme 值必须在此范围内
```

---

## 注意事项

1. **_id 字段必须存在**：格式为 `<component-kebab-name>_<13位时间戳>`，如 `pep-common-card_1690599463451`
2. **富文本字段**：标题类字段通常需要 `<p>` 标签包裹，如 `"<p>楼层标题</p>"`
3. **不要生成无意义占位符**：`"title": "标题"` 这种数据没有测试价值
4. **枚举字段要验证**：确保 default.json 中的枚举值在 types.ts 中有定义
5. **列表不要太多**：开发阶段 3-6 条最合适，太多会影响开发体验
6. **时间字段用未来时间**：如果有倒计时，设置到 2026 年以后，避免一打开就过期
7. **按钮类型必须用 PortalUI 类名**：`btnType` 字段值必须是 `por-btn-primary`、`por-btn-secondary` 或 `por-btn-dark`，不要自定义按钮样式名
8. **主题值对齐 PortalUI**：`theme` 字段值必须是 PortalUI `por-section[data-bg]` 支持的值（white / light / grey / dark），最终通过 Floor 组件传递
