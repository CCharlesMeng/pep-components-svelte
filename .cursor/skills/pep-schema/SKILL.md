---
name: pep-schema
description: 基于组件的 mocks/props/default.json 和 src/types.ts 生成 schema.json（JSON Schema + CMS UI 扩展）。当用户说"生成schema"、"生成schema.json"、"pep-schema"时立即使用此技能。
---

# pep-schema — 生成组件 schema.json

## 概述

本技能基于已有的 `default.json` 和 `types.ts`，生成组件的 `schema.json` 文件。

`schema.json` 的作用：
- **CMS 表单渲染**：驱动后台管理界面的字段编辑表单（支持 `ui:widget`、`ui:options` 等扩展）
- **JSON Schema 校验**：确保 `default.json` 数据结构合法
- **字段文档**：通过 `title`、`description` 为运营人员提供中文字段说明

**与 `sync-default-json` skill 的分工**：
- `pep-schema`（本 skill）：**首次生成** schema.json，从 default.json + types.ts 推断完整结构
- `sync-default-json`：**增量同步**，当 default.json 字段变更时，同步更新 schema.json / types.ts / Svelte 组件

---

## 执行流程

### 阶段 0：读取上下文

并行读取以下文件：

1. `components/<component-name>/mocks/props/default.json` — 数据样本
2. `components/<component-name>/src/types.ts` — TypeScript 类型定义
3. `components/<component-name>/schema.json` — 若已存在，进入增量更新模式
4. 参考已有组件的 schema.json 作为格式范例（推荐读取 `components/pep-common-card-v2/schema.json`）

若 `default.json` 或 `types.ts` 缺失，提示用户先运行 `pep-mock` 技能。

---

### 阶段 1：分析数据结构

对照 `default.json` 的每个字段和 `types.ts` 的类型定义，构建字段清单：

**分析维度**：

| 维度 | 来源 |
|------|------|
| 字段路径 | `default.json` 的 JSON 路径 |
| 字段类型 | `types.ts` 中的类型声明（`string` / `number` / `boolean` / `object` / `array`） |
| 是否枚举 | `types.ts` 中的联合类型（如 `'left' \| 'center' \| 'product'`） |
| 默认值 | `default.json` 中的实际值 |
| 中文标题 | `types.ts` 的 JSDoc 注释 |
| 是否必填 | `types.ts` 中是否有 `?`（可选标记） |
| CMS 控件 | 根据字段类型和语义推断 `ui:widget` |

**字段分类**：

1. **Trait 字段**（来自 `UseTraits`，由 `pickTrait` 提取）：
   - `title`、`subtitle`、`more`（header trait）
   - `isMergeTopSpacing`、`isMergeBottomSpacing`（spacing trait）
   - `isShowMb`（visibility trait）

2. **CMS 数据层字段**（不在 FloorTraits 中，但 schema/default 需要）：
   - `titleMb`、`subtitleMb`（移动端标题/副标题）

3. **业务字段**（组件特有）：
   - 从 `types.ts` 的 BusinessProps 接口提取

向用户展示字段清单：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 schema.json 字段规划

顶层字段（共 [N] 个）：
  Trait 字段：
    • title (string) — 楼层标题
    • subtitle (string) — 副标题
    • more (object) — 查看更多链接
    • isMergeTopSpacing (boolean, switch) — 合并上间距
    • isMergeBottomSpacing (boolean, switch) — 合并下间距
    • isShowMb (boolean, switch) — 移动端显示
  CMS 字段：
    • titleMb (string) — 移动端楼层标题
    • subtitleMb (string) — 移动端副标题
  业务字段：
    • [字段名] ([类型], [控件]) — [说明]

嵌套字段：
  • [数组字段名] → items: [子字段清单]

是否确认？需要调整哪些字段的 title 或控件类型？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 阶段 2：生成 schema.json

根据确认的字段清单，生成 `schema.json`。

#### schema.json 标准结构

```json
{
  "type": "object",
  "title": "编辑此组件",
  "properties": {
    "[fieldName]": {
      "title": "中文字段名",
      "type": "string | number | boolean | object | array",
      "description": "可选的补充说明",
      "default": "默认值（可选）"
    }
  }
}
```

#### 字段类型映射规则

| types.ts 类型 | schema type | ui:widget | 说明 |
|---------------|-------------|-----------|------|
| `string` | `"string"` | 默认文本框 | — |
| `string`（富文本） | `"string"` | `"richtext"` | JSDoc 含"富文本"或"HTML"时 |
| `string`（图片URL） | `"string"` | `"imageSelector"` | 字段名含 icon/img/image/cover/banner |
| `string`（链接） | `"string"` | — + `"ui:options": { "format": "url" }` | 字段名含 href/link/url |
| `number` | `"number"` | 默认数字框 | — |
| `boolean` | `"boolean"` | `"switch"` | 开关控件 |
| `'a' \| 'b' \| 'c'`（联合类型） | `"string"` + `"enum"` + `"enumNames"` | 默认单选 | 需要中文 enumNames |
| `object` | `"object"` + 递归 `"properties"` | — | 嵌套对象 |
| `Array<T>` / `T[]` | `"array"` + `"items"` | — | 列表字段 |
| `string[]`（标签列表） | `"array"` | `"label"` | 字段名含 tags/labels |

#### enumNames 生成规则

对于枚举字段，`enum` 是代码值，`enumNames` 是 CMS 显示的中文名称：

```json
{
  "cardType": {
    "title": "PC端卡片样式",
    "type": "string",
    "enum": ["left", "center", "product"],
    "enumNames": ["居左", "居中", "产品推荐卡片"],
    "default": "center"
  }
}
```

**中文名推断逻辑**：
- 优先从 `types.ts` 的 JSDoc 注释提取
- 常见映射：`white` → 白色、`grey` → 灰色、`dark` → 深色、`light` → 浅色、`left` → 居左、`center` → 居中
- 无法确定时，保留英文值并标记 `// TODO: 请补充中文名`

#### CMS UI 扩展属性

| 扩展属性 | 用途 | 示例 |
|---------|------|------|
| `ui:widget` | 控件类型 | `"switch"`, `"richtext"`, `"imageSelector"`, `"select"`, `"label"`, `"tab"` |
| `ui:options` | 控件配置 | `{ "format": "url" }`, `{ "min": 1 }`, `{ "max": 2 }`, `{ "hidden": "child-component" }` |
| `ui:options.theme` | 单选按钮样式 | `"button"` |

#### 常见 Trait 字段的固定 schema 模式

以下 Trait 字段在大多数组件中结构相同，可直接复用：

```json
{
  "title": {
    "title": "楼层标题",
    "type": "string",
    "description": "建议不超过1行"
  },
  "titleMb": {
    "title": "移动端楼层标题",
    "type": "string",
    "description": "建议不超过1行"
  },
  "subtitle": {
    "title": "楼层副标题",
    "type": "string",
    "ui:widget": "richtext",
    "description": "建议不超过1行"
  },
  "subtitleMb": {
    "title": "移动端楼层副标题",
    "type": "string",
    "ui:widget": "richtext",
    "description": "建议不超过1行"
  },
  "more": {
    "title": "",
    "type": "object",
    "properties": {
      "text": {
        "title": "更多链接文本",
        "type": "string"
      },
      "href": {
        "title": "更多链接",
        "type": "string",
        "ui:options": { "format": "url" }
      }
    }
  },
  "isMergeTopSpacing": {
    "title": "显示楼层顶部间距",
    "type": "boolean",
    "ui:widget": "switch",
    "default": true
  },
  "isMergeBottomSpacing": {
    "title": "显示楼层底部间距",
    "type": "boolean",
    "ui:widget": "switch",
    "default": true
  },
  "isShowMb": {
    "title": "移动端是否展示该楼层，默认不展示",
    "type": "boolean",
    "ui:widget": "switch",
    "default": false
  }
}
```

---

### 阶段 3：展示预览并确认

向用户展示完整 schema.json 预览：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 schema.json 预览

[展示完整 JSON]

请检查：
  ✓ 字段 title 是否准确描述了运营人员需要理解的含义？
  ✓ 枚举字段的 enumNames 中文名是否合理？
  ✓ ui:widget 控件类型是否正确？
  ✓ default 值是否与 default.json 一致？

确认后写入文件。[Y/n]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 阶段 4：写入文件并验证一致性

写入 `components/<component-name>/schema.json`。

写入后执行一致性校验：

**校验项**：

1. **default.json ↔ schema.json 字段对齐**：
   - default.json 中的每个字段在 schema.json 的 properties 中都有声明
   - schema.json 中声明的字段类型与 default.json 中的实际值类型一致

2. **types.ts ↔ schema.json 类型对齐**：
   - types.ts 中的联合类型 → schema.json 的 enum 值集合一致
   - types.ts 中的可选字段 → schema.json 中不在 required 中（若有 required）

3. **特殊字段检查**：
   - `_id` 字段不应出现在 schema.json 中（运行时生成，非 CMS 配置项）
   - `titleMb`/`subtitleMb` 存在于 schema.json（CMS 需要）但不在 types.ts 的 UseTraits 中

向用户展示校验结果：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ schema.json 已生成！

写入文件：
  📄 components/<component-name>/schema.json — [N] 个顶层字段

一致性校验：
  ✅ default.json ↔ schema.json — 字段完全对齐
  ✅ types.ts ↔ schema.json — 类型一致
  [⚠️ 若有问题，列出并建议修复]

下一步建议：
  → 使用 pep-impl 生成组件代码
  → 后续字段变更使用 sync-default-json 保持同步
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 参考实现

> 生成 schema.json 前，建议读取 `components/pep-common-card-v2/schema.json` 作为格式范例。

该文件展示了以下关键模式：
- Trait 字段（title/subtitle/more/isMerge*/isShowMb）的标准 schema 写法
- CMS 数据层字段（titleMb/subtitleMb）的 schema 写法
- 枚举字段的 enum + enumNames 格式
- 嵌套 array → items → object → properties 的递归结构
- `ui:widget`（switch/richtext/imageSelector/select/label）的使用
- `ui:options`（format/min/max/hidden）的使用

---

## 注意事项

1. **`_id` 不进 schema**：`_id` 是运行时标识，不是 CMS 可配置字段
2. **`titleMb` / `subtitleMb` 必须进 schema**：虽然不在 `FloorTraits` 类型中，但 CMS 需要这些字段来配置移动端标题
3. **enum 和 enumNames 顺序必须一一对应**：`enum[0]` 对应 `enumNames[0]`
4. **default 值要与 default.json 一致**：schema.json 中的 `default` 字段值应反映合理的初始状态
5. **嵌套对象深度控制**：超过 3 层嵌套时，考虑使用 `ui:options.hidden: "child-component"` 隐藏子组件级配置
6. **布尔字段统一用 switch**：所有 `boolean` 类型字段的 `ui:widget` 统一为 `"switch"`
7. **图片字段统一用 imageSelector**：字段名含 icon/img/image/cover/banner 的 string 字段使用 `"imageSelector"` 控件
8. **输出必须是合法 JSON**：不能包含注释，不能有尾逗号
