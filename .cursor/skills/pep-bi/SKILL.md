---
name: pep-bi
description: 为 Svelte 5 组件添加 BI 埋点上报。支持三种方式：html 属性 bi_name（交互元素点击上报）、bi_parent_name（父模块区分上报位置）、手动调用 onCustomEvent（动态内容/iframe 等特殊场景）。当用户说"埋点"、"bi_name"、"bi_parent_name"、"onCustomEvent"、"埋点上报"、"数据上报"、"pep-bi"、"添加埋点"时立即使用此技能。
---

# pep-bi — 组件埋点上报规范

## 概述

本技能指导在 Svelte 5 组件中正确添加 BI 埋点，覆盖三种上报方式。

---

## 三种埋点方式

### 方式一：`bi_name` 属性（交互元素自动上报）

在**可点击的交互元素**上添加 `bi_name` 属性，用户点击时平台自动上报。

**适用元素**：`<button>`、`<a>`、`<label>`、`<input type="radio/checkbox">`、任何绑定了点击事件的可交互元素。

**值的规范**：
- 使用 PascalCase 字符串
- 优先使用按钮文案语义（英文），如 `StartDeploy`、`CancelOrder`
- 若同类按钮在多处复用，可用模块名+功能，如 `SidebarCollapseBtn`
- 自定义业务专属字符串，清晰描述该交互节点的业务含义

```svelte
<!-- ✅ 按钮 -->
<button type="button" bi_name="DeployFlowButton" onclick={handleDeploy}>
  开始部署
</button>

<!-- ✅ 链接 -->
<a href={url} bi_name="QuickLinkCard" target="_blank">产品入口</a>

<!-- ✅ label（含 checkbox/radio） -->
<label bi_name="AgreementCheckbox">
  <input type="checkbox" bind:checked={agreed} />
  <span>我已阅读并同意协议</span>
</label>

<!-- ❌ 禁止：不要加在非交互容器上（不会产生有效点击事件） -->
<div bi_name="SomeContainer">...</div>
```

---

### 方式二：`bi_parent_name` 属性（父模块区分上报位置）

在**模块的父容器节点**上添加 `bi_parent_name` 属性。当该模块内含 `bi_name` 的子元素被点击时，平台会将 `bi_parent_name` 与 `bi_name` 拼接后上报，从而区分同一按钮在不同模块的点击来源。

**典型场景**：一个通用的 `DeployFlowButton` 组件被 MainPanel 和 SidebarPanel 复用，通过 `bi_parent_name` 区分来源位置。

**值的规范**：
- 使用 PascalCase 字符串
- 通常是模块/区块/面板的名称，如 `MainPanel`、`SidebarPanel`、`ProductSection`
- 与 `bi_name` 组合后应能清晰描述"哪个模块的哪个操作"

```svelte
<!-- ✅ 父容器标记模块位置 -->
<main class="deploy-flow-main" bi_parent_name="MainPanel">
  <!-- 此模块内的 bi_name 点击会上报为 "MainPanel + DeployFlowButton" -->
  <DeployFlowButton>开始部署</DeployFlowButton>
  <label bi_name="AgreementCheckbox">...</label>
</main>

<aside class="deploy-flow-sidebar" bi_parent_name="SidebarPanel">
  <!-- 同一 DeployFlowButton，上报为 "SidebarPanel + DeployFlowButton" -->
  <DeployFlowButton>开始部署</DeployFlowButton>
</aside>
```

**`bi_parent_name` 设置原则**：
- 放在模块**根节点**或**区块容器**上，不要放在细粒度子元素上
- 同一页面中，不同模块应使用不同的 `bi_parent_name` 值
- 子组件不需要额外设置 `bi_parent_name`，平台会自动向上查找最近的祖先节点

---

### 方式三：手动调用 `onCustomEvent`（特殊场景主动上报）

当无法通过 HTML 属性埋点时（如 iframe 内容、动态渲染的富文本、第三方组件等），使用 `onCustomEvent` 手动上报。

**适用场景**：
- iframe 内动态渲染的 HTML 内容中的链接点击
- 通过 `{@html}` 渲染的富文本中的超链接
- 组件内部无法添加属性的第三方 UI 元素
- 需要附带业务参数（URL、标题等）的复杂上报

**导入方式**：
```typescript
import { onCustomEvent } from "@pep/shared/utils/onCustomEvent";
```

**函数签名**：
```typescript
onCustomEvent({
  eventCategory: string;  // 事件类别，如 "link"、"button"、"tab"
  eventAction: string;    // 操作类型，如 "click"、"open"、"submit"
  eventLabel: string;     // 事件标识，通常是 URL 或业务 ID
  eventValue: string;     // 人类可读的标签，通常是链接文案或按钮名
  jsonParam: string;      // JSON 序列化的附加参数
});
```

**典型用法：iframe 内链接点击上报**
```typescript
// 在 $effect 内监听 iframe 内容区域的点击
const onClick = (event: MouseEvent) => {
  const anchor = (event.target as HTMLElement).closest("a");
  if (!anchor) return;
  
  const url = anchor.getAttribute("href") ?? "";
  const title = anchor.innerText || "未知链接";

  onCustomEvent({
    eventCategory: "link",
    eventAction: "click",
    eventLabel: url,
    eventValue: title,
    jsonParam: JSON.stringify({ url, title }),
  });
};
```

**参数填写规范**：

| 参数 | 值规范 | 示例 |
|------|--------|------|
| `eventCategory` | 事件类型分类（英文小写） | `"link"` / `"button"` / `"tab"` |
| `eventAction` | 触发动作（英文小写） | `"click"` / `"open"` / `"close"` |
| `eventLabel` | 唯一标识符，链接填 URL，按钮填业务 ID | `"https://..."` / `"deploy-btn"` |
| `eventValue` | 用户可见的文案或标题 | `"操作手册"` / `"开始部署"` |
| `jsonParam` | 所有相关业务参数的 JSON | `JSON.stringify({ url, title })` |

---

## 执行流程

### 阶段 1：分析组件，识别需要埋点的元素

读取目标组件文件，检查：

```
需要 bi_name 的交互元素：
  □ <button> 元素
  □ <a> 链接元素
  □ <label> 含 checkbox/radio 的表单元素
  □ 绑定了 onclick 的其他元素

需要 bi_parent_name 的容器：
  □ 组件根节点或主容器（若该组件内有 bi_name 元素）
  □ 同一按钮被多个模块复用时，各模块的根节点

需要手动 onCustomEvent 的场景：
  □ iframe srcdoc 渲染的远程 HTML 中有可点击链接
  □ {@html} 渲染的富文本中有超链接
  □ 动态内容（API 返回的 HTML）中有交互元素
```

### 阶段 2：向用户确认埋点方案

展示分析结果，格式如下：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 埋点上报方案

组件：[ComponentName].svelte

bi_parent_name（模块标记）：
  ✅ <main class="..."> → bi_parent_name="MainPanel"

bi_name（交互元素）：
  ✅ <button>开始部署</button> → bi_name="StartDeployBtn"
  ✅ <label> checkbox → bi_name="AgreementCheckbox"
  ✅ <a href="...">链接文案</a> → bi_name="QuickLinkCard"

手动 onCustomEvent（特殊场景）：
  ✅ iframe 内的操作手册链接点击 → eventCategory="link", eventAction="click"

是否确认此方案？[Y/n]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

等待用户确认后执行。若用户说"直接加"则跳过确认。

### 阶段 3：实施埋点

按确认方案：
1. 在对应元素添加 `bi_name` / `bi_parent_name` 属性
2. 若需手动上报，在 script 顶部导入 `onCustomEvent`，在对应事件处理逻辑中调用

### 阶段 4：检查清单

```
埋点质量自检：
  □ bi_name 值使用 PascalCase，语义清晰
  □ bi_parent_name 值使用 PascalCase，能代表模块位置
  □ bi_name 只添加在实际可点击的交互元素上（button/a/label等）
  □ bi_parent_name 只添加在模块根容器上，不滥用
  □ 手动上报的 eventCategory/eventAction 使用英文小写
  □ jsonParam 使用 JSON.stringify() 序列化
  □ 导入路径正确：@pep/shared/utils/onCustomEvent
  □ 同一页面中不同模块的 bi_parent_name 值互不相同
```

---

## 常见错误示例

```svelte
<!-- ❌ bi_name 加在非交互容器上 -->
<div bi_name="ProductSection">
  <button>点击</button>  <!-- 此按钮点击不会被 bi_name 正确捕获 -->
</div>

<!-- ✅ 正确：bi_name 加在 button 本身 -->
<div bi_parent_name="ProductSection">
  <button bi_name="ProductBtn">点击</button>
</div>
```

```svelte
<!-- ❌ bi_parent_name 值相同导致无法区分模块 -->
<main bi_parent_name="Panel">...</main>
<aside bi_parent_name="Panel">...</aside>

<!-- ✅ 正确：不同模块用不同的 bi_parent_name -->
<main bi_parent_name="MainPanel">...</main>
<aside bi_parent_name="SidebarPanel">...</aside>
```

```typescript
// ❌ jsonParam 未序列化
onCustomEvent({
  jsonParam: { url, title },  // 应该是 string
});

// ✅ 正确
onCustomEvent({
  jsonParam: JSON.stringify({ url, title }),
});
```

---

## 参考：现有组件的埋点示例

### DeployFlowButton.svelte（bi_name 在可复用按钮上）
```svelte
<button {type} class={mergedClass} {...rest} bi_name="DeployFlowButton">
  {@render children()}
</button>
```

### MainPanel.svelte（bi_parent_name 区分模块 + bi_name 在表单元素上）
```svelte
<main class="pep-cloud-deploy-flow-main" bi_parent_name="MainPanel">
  <!-- bi_parent_name 标记此模块为 MainPanel -->
  <!-- 点击 DeployFlowButton 时上报：MainPanel + DeployFlowButton -->
  
  <label bi_name="MainPanelAgreementCheckbox">
    <input type="checkbox" bind:checked={isAgreementChecked} />
    <span>协议内容</span>
  </label>
</main>
```

### SidebarPanel.svelte（手动 onCustomEvent 处理 iframe 内链接）
```typescript
import { onCustomEvent } from "@pep/shared/utils/onCustomEvent";

// 在 $effect 内，监听 iframe 内容区的点击
const onClick = (event: MouseEvent) => {
  const anchor = (event.target as HTMLElement).closest("a");
  if (!anchor) return;
  const url = anchor.getAttribute("href") ?? "";
  onCustomEvent({
    eventCategory: "link",
    eventAction: "click",
    eventLabel: url,
    eventValue: anchor.innerText || sidebar.texts.openExternalDefaultTitle,
    jsonParam: JSON.stringify({
      url,
      title: anchor.innerText || sidebar.texts.openExternalDefaultTitle,
    }),
  });
};
```
