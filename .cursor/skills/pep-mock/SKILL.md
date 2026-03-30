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

---

## 执行流程

### 阶段 0：读取上下文

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

### 阶段 2：确认关键设计决策

针对不确定的地方，逐一询问，**每次最多 2-3 个问题**：

#### 2.1 数据量决策

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ 列表数据量

default.json 中的列表项建议生成多少条？

A. 3 条（轻量，适合简单布局）
B. 6 条（标准，能看到多列布局效果）
C. [自定义] 请告诉我具体数量

推荐：根据 spec 中的列数（[N] 列），建议 [推断值] 条
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 2.2 特殊字段决策

若存在枚举字段（如 `cardType`、`theme`），确认在 default.json 中使用哪个值。

若存在可选字段，确认 default.json 是否填写该字段（还是留为 undefined/省略）。

#### 2.3 真实数据确认

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ 示例数据内容

列表项需要真实有意义的数据，我计划使用以下内容，是否合适？

[展示推断的示例数据，如组件是云产品卡片则用真实产品名/图标URL]

如果需要替换为你们实际的数据，请告诉我。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

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
  // Trait 字段（标题区）
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
  // 业务字段
  "[propName]": "[value]",
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

### 阶段 6：最终确认

文件写入后，进行最终确认：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Mock 数据已生成！

写入文件：
  📄 src/types.ts — [N] 个接口，[M] 个字段
  📄 mocks/props/default.json — [N] 个顶层字段，[M] 条列表数据

---

快速检查：
  • 运行 `npm run dev` 预览组件（数据会自动加载）
  • 若页面报类型错误，检查 types.ts 中的字段名是否与 json 一致

---

是否还需要生成其他场景的 mock 数据？
  A. 空数据场景（empty.json）— 测试组件空态
  B. 边界数据场景 — 测试超长文字、缺图等边界情况
  C. 不需要，继续生成组件代码（pep-impl）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

若用户选择生成额外场景，重复阶段 4 生成对应的 json 文件（如 `mocks/props/empty.json`）。

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

| 字段含义 | 推荐命名 | 类型示例 |
|---------|---------|---------|
| 主题/配色 | `theme` | `'white' \| 'grey'` |
| 列数 | `cardColumn` | `'2' \| '3' \| '4'` |
| 图片高度 | `imgHeight` | `'80px' \| '60px'` |
| 是否展示描述 | `showCardDesc` | `boolean` |
| 卡片样式 | `cardType` | `'left' \| 'center' \| 'product'` |
| 页签列表 | `tabList` | `TabItem[]` |
| 倒计时结束时间 | `endTime` | `string` (格式 YYYY/MM/DD HH:mm) |
| 图标URL | `icon` | `string` |
| 移动端图标 | `iconMb` | `string` |
| 按钮组 | `btnGroups` | `ButtonItem[]` |
| 标签列表 | `tags` | `string[]` |

### 按钮类型（portal-ui 类名）

```typescript
export interface ButtonItem {
  /** 按钮样式类型（对应 portal-ui 类名） */
  btnType?: 'por-btn-primary' | 'por-btn-secondary' | 'por-btn-dark';
  /** 按钮链接 */
  btnHref?: string;
  /** 按钮文案 */
  btnLinkText?: string;
}
```

---

## 注意事项

1. **_id 字段必须存在**：格式为 `<component-kebab-name>_<13位时间戳>`，如 `pep-common-card_1690599463451`
2. **富文本字段**：标题类字段通常需要 `<p>` 标签包裹，如 `"<p>楼层标题</p>"`
3. **不要生成无意义占位符**：`"title": "标题"` 这种数据没有测试价值
4. **枚举字段要验证**：确保 default.json 中的枚举值在 types.ts 中有定义
5. **列表不要太多**：开发阶段 3-6 条最合适，太多会影响开发体验
6. **时间字段用未来时间**：如果有倒计时，设置到 2026 年以后，避免一打开就过期
