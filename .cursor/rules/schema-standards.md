# Schema 书写规范（PEP 组件）

用于约束组件 `schema.json` 的最小可用规范，保证配置可读、可维护、可视化编辑友好。

## 1) 基础结构

- 根对象必须声明 `"type": "object"`。
- 每层对象建议声明 `"additionalProperties": false`，避免脏字段透传。
- 对关键字段使用 `"required"`，只放真实必填项。
- 每个字段必须包含 `"title"`（面向业务同学可读）。
- 复杂结构优先拆成子对象，不要在同一层堆积过多字段。

## 2) 字段命名与类型

- 字段名使用小写驼峰（如 `logoText`、`deploySteps`）。
- 文本用 `"type": "string"`；布尔用 `"type": "boolean"`；数量用 `"type": "number"`。
- 列表字段必须声明 `"items"`；对象字段必须声明 `"properties"`。
- 能给默认值的字段建议补 `"default"`，提升开箱体验。

## 3) 表单可用性

- 用户可直接理解的字段，必须写清晰 `"title"`。
- 有枚举值的字段使用 `"enum"`（必要时配合 `enumNames`）。
- 不希望用户直接编辑的复杂字段，不要暴露在 schema 中。

## 4) 图片资产字段（重点）

对于 `icon`、`img`、`logo`、`avatar`、`backgroundImage` 等图片类型字段：

- 字段类型统一使用 `"type": "string"`。
- 必须声明 `"ui:widget": "imageSelector"`，让用户可直接上传/选择图片。
- 禁止仅要求用户手填资产字符串路径（如 `asset://...`）作为唯一方式。

推荐写法（参考 `pep-cloud-deploy-flow/schema.json`）：

```json
"img": {
  "title": "Logo 图片地址",
  "type": "string",
  "ui:widget": "imageSelector"
}
```

## 5) 数字类型字段（新增）

对于数值输入字段（`"type": "integer"` 或 `"type": "number"`）：

- 建议使用 `"ui:widget": "number"`，统一为数值选择器交互。
- 建议在 `"ui:options"` 中明确 `min`、`max`、`controls`，避免无约束输入。
- 有默认值时建议提供 `"default"`，且默认值需在 `min/max` 范围内。
- 如需按条件展示，可在 `"ui:options.hidden"` 中配置显示条件。

推荐写法（参考 `pep-navigate-link/schema.json`）：

```json
"querySize": {
  "title": "取值数量",
  "type": "integer",
  "default": 100,
  "ui:widget": "number",
  "ui:options": {
    "min": 1,
    "max": 100,
    "controls": false
  }
}
```

## 6) 超链接字段（新增）

对于 `href`、`link`、`url`、`jumpUrl` 等表示超链接的字符串字段：

- 建议在 `"ui:options"` 中添加 `"format": "url"`，默认提供一层 URL 格式校验。
- 适用于外链跳转、按钮链接、更多链接等配置项，降低错误链接输入概率。
- 建议同时补默认值或示例值，帮助用户理解输入格式（如 `https://example.com`）。

推荐写法（参考 `pep-common-card-v2/schema.json`）：

```json
"href": {
  "title": "更多链接",
  "type": "string",
  "ui:options": {
    "format": "url"
  }
}
```

## 7) 变更自检清单

- [ ] 是否补齐了 `title`、`type`、必要的 `required`？
- [ ] 对象是否声明了 `additionalProperties: false`？
- [ ] 图片字段是否使用了 `ui:widget: imageSelector`？
- [ ] 数字字段是否使用了 `ui:widget: number` 且补齐 `ui:options` 约束？
- [ ] 超链接字段是否使用了 `ui:options.format: url`？
- [ ] 默认值是否合理且与组件行为一致？

## 8) `ui:options` 常用字段说明

> 以下字段基于当前项目已有 schema 用法整理，优先作为团队推荐写法。

- `hidden`：条件隐藏表达式。表达式结果为 `true` 时隐藏该字段；结果为 `false` 时显示。适用于联动配置，避免用户一次看到过多无关项。
  - 示例语义：`"hidden": "rootValue.source !== '3'"` 表示只有 `source === '3'` 时才显示该字段。
- `min`：最小值/最少项限制。常用于数字输入（`number/integer`）或数组最小项数。
- `max`：最大值/最多项限制。常用于数字输入（`number/integer`）或数组最大项数。
- `controls`：数字输入器是否显示加减按钮。`false` 通常用于只保留纯输入框，减少误触。
- `options`：选择类组件候选项集合。常与 `ui:widget: "radio"`、`ui:widget: "select"` 搭配，单项一般为 `{ value, label }`。
- `tabTitle`：`ui:widget: "tab"` 场景下的页签标题字段映射，用于指定每个 tab 展示哪个字段作为标题。
- `theme`：组件展示风格配置（如按钮风格的枚举选择），按具体 widget 的支持能力生效。
- `placeholder`：输入/选择控件占位提示文案，用于增强表单可理解性。
- `format`：输入格式约束。常用于链接字段，`"format": "url"` 可提供 URL 基础校验。

补充建议：

- `hidden` 表达式尽量只依赖 `rootValue` 的稳定字段，避免复杂嵌套条件难维护。
- `min/max/default` 三者需要保持一致（`default` 必须落在边界范围内）。
- 数字字段优先组合：`"ui:widget": "number"` + `ui:options.min/max/controls`。

## 9) 常用控件写法与标准用例（表格）

| 场景/字段类型 | 推荐写法 | 标准用例 | 说明 |
| --- | --- | --- | --- |
| 富文本内容（副标题、描述等） | `ui:widget: "richtext"` | `subtitle`（`pep-common-card-v2`） | 适合需要基础富文本编辑能力的字符串字段。 |
| 布尔开关（是否展示、是否启用） | `type: "boolean"` + `ui:widget: "switch"` | `isShowMb`（`pep-common-card-v2`） | 布尔值统一用开关，语义直观。 |
| 下拉枚举（选项较多或需节省空间） | `ui:widget: "select"` + `ui:options.options` | `btnStyle`（`pep-common-card-v2`） | 选项项结构推荐 `{ label, value }`。 |
| 单选枚举（选项较少、需要并排展示） | `ui:widget: "radio"` + `ui:options.options` | `recommendType`（`pep-navigate-link`） | 常配合 `ui:options.hidden` 做联动显示。 |
| Tab 列表配置（多组同构配置） | `type: "array"` + `ui:widget: "tab"` + `ui:options.tabTitle` | `tabs`（`pep-navigate-link`） | 用 `tabTitle` 指定每个页签的标题字段。 |
| 图片资源（图标、图片） | `type: "string"` + `ui:widget: "imageSelector"` | `img`（`pep-cloud-deploy-flow`） | 支持直接上传/选择图片，避免手填资产字符串。 |
| 数字输入（数量、排序、展示条数） | `ui:widget: "number"` + `ui:options.min/max/controls` | `querySize`（`pep-navigate-link`） | 增加边界约束，减少非法输入。 |
| 超链接输入（跳转地址） | `type: "string"` + `ui:options.format: "url"` | `href`（`pep-common-card-v2`） | 默认提供 URL 基础校验。 |

最小示例（可直接复用）：

```json
"subtitle": { "title": "楼层副标题", "type": "string", "ui:widget": "richtext" }
"isShowMb": { "title": "移动端是否展示", "type": "boolean", "ui:widget": "switch", "default": false }
"recommendType": {
  "title": "推荐方式",
  "type": "string",
  "ui:widget": "radio",
  "ui:options": { "options": [{ "label": "人工编辑", "value": "1" }, { "label": "搜索聚合", "value": "2" }] }
}
"tabs": {
  "title": "配置页签信息",
  "type": "array",
  "ui:widget": "tab",
  "ui:options": { "tabTitle": "tabTitle", "min": 1, "max": 10 }
}
```
