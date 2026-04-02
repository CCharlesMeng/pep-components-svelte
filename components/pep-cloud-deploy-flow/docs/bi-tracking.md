# pep-cloud-deploy-flow 埋点上报文档

> 本文档描述组件所有交互元素的埋点上报规则，供运营人员和数据分析人员查阅。
>
> **上报时机**：用户点击相应元素时触发。
>
> **上报机制说明**：
> - `bi_name`：加在可点击元素上，点击时上报该值。
> - `bi_parent_name`：加在模块父容器上，与子元素 `bi_name` 组合上报，用于区分同一按钮在不同模块的来源。
> - 手动上报（`onCustomEvent`）：用于动态内容（如 iframe/Markdown 内链接），在代码中主动调用。

---

## 一、Navbar（顶部导航栏）

**父模块标记**：`bi_parent_name="Navbar"`（加在 `<header>` 上）

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| Logo 图标/链接 | `NavbarLogo` | 点击顶部 Logo 跳转 |
| 面包屑导航链接（每项） | `NavbarBreadcrumb` | 点击面包屑路径跳转 |
| 右侧功能链接（每项） | `NavbarActionLink` | 点击右侧自定义功能入口 |
| 结束部署按钮 | `NavbarEndDeployBtn` | 部署进行中时，点击"结束部署" |

---

## 二、MainPanel（主内容区 — 部署前）

**父模块标记**：`bi_parent_name="MainPanel"`（加在 `<main>` 上）

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 开始部署按钮 | `DeployFlowButton` | 勾选协议后，点击部署按钮 |
| 协议勾选框 | `MainPanelAgreementCheckbox` | 点击用户协议勾选项 |
| 快捷入口卡片（每项） | `QuickLinkCard` | 点击云产品快捷入口卡片 |

---

## 三、SidebarPanel（操作指引侧边栏）

**父模块标记**：`bi_parent_name="SidebarPanel"`（加在 `<aside>` 上）

### 3.1 工具栏按钮

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 切换悬浮/侧边模式按钮 | `SidebarFloatBtn` | 点击切换侧边栏展示模式（悬浮↔侧边） |
| 恢复侧边模式按钮（全屏时） | `SidebarRestoreSideBtn` | 全屏模式下，点击缩小到侧边 |
| 折叠侧边栏按钮 | `SidebarCollapseBtn` | 点击折叠/隐藏侧边栏 |

### 3.2 Tab 切换

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 侧边栏 Tab 标签（每项） | `SidebarTabBtn` | 点击切换不同指引 Tab |

### 3.3 应用选择下拉

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 应用选择下拉触发按钮 | `SidebarAppTrigger` | 点击打开应用选择下拉菜单 |
| 应用选项（每项） | `SidebarAppOption` | 点击选择具体应用 |

### 3.4 步骤导航

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 步骤节点按钮（每项） | `SidebarStepBtn` | 点击跳转到指定步骤 |
| 上一步按钮 | `DeployFlowButton` | 点击"上一步" |
| 下一步按钮 | `DeployFlowButton` | 点击"下一步" |

### 3.5 内容区链接（手动上报）

| 场景 | eventCategory | eventAction | eventLabel | eventValue | jsonParam |
|------|--------------|-------------|-----------|------------|-----------|
| Markdown 内容中的超链接点击 | `link` | `click` | 链接 URL | 链接文案 | `{"url":"...","title":"..."}` |
| iframe 内容中的超链接点击 | `link` | `click` | 链接 URL | 链接文案 | `{"url":"...","title":"..."}` |

---

## 四、DeploymentFinished（部署完成页）

**父模块标记**：`bi_parent_name="DeploymentFinished"`（加在 `<section>` 上）

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 重新部署按钮 | `DeployFlowButton` | 点击"重新部署" |
| 推荐产品入口卡片（每项） | `QuickLinkCard` | 点击部署完成页中的推荐产品链接 |

---

## 五、EndDeploymentModal（结束部署确认弹窗）

**父模块标记**：`bi_parent_name="EndDeploymentModal"`（加在弹窗容器 `<div>` 上）

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 确认结束部署按钮 | `DeployFlowButton` | 点击弹窗中"确认结束" |
| 关闭弹窗按钮（✕） | `ModalCloseBtn` | 点击关闭结束部署确认弹窗 |

---

## 六、PseudoBrowser（伪浏览器 — 部署中）

**父模块标记**：`bi_parent_name="PseudoBrowser"`（加在 `<section>` 上）

### 6.1 标签页操作

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 标签页项（每个 tab） | `BrowserTabItem` | 点击切换标签页 |
| 关闭标签页按钮（✕） | `BrowserCloseTab` | 点击关闭某标签页 |
| 新建标签页按钮（+） | `BrowserAddTab` | 点击新建标签页 |
| Tab 向左滚动箭头 | `BrowserTabScrollLeft` | 标签页溢出时，点击左滚 |
| Tab 向右滚动箭头 | `BrowserTabScrollRight` | 标签页溢出时，点击右滚 |

### 6.2 布局控制

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 全屏按钮 | `BrowserFullscreen` | 点击将伪浏览器展开为全屏/悬浮模式 |
| 切回侧边模式按钮 | `BrowserSwitchToSideMode` | 全屏模式下，点击切回侧边展示 |

### 6.3 快捷入口卡片

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 新标签页快捷入口卡片（每项） | `QuickLinkCard` | 点击空白标签页内的快捷入口 |

---

## 七、index.svelte（组件根层）

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 恢复侧边栏按钮 | `RestoreSidebarBtn` | 侧边栏折叠后，点击右侧悬浮按钮恢复 |
| 图片预览关闭（遮罩点击） | `ImagePreviewClose` | 点击图片预览遮罩关闭预览 |
| 图片预览关闭（✕ 按钮） | `ImagePreviewClose` | 点击图片预览关闭按钮 |

---

## 八、MobileFlow（移动端视图）

**父模块标记**：`bi_parent_name="MobileFlow"`（加在 `<section>` 上）

### 8.1 导航与步骤

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 移动端 Logo 链接 | `MobileNavbarLogo` | 点击顶部 Logo 跳转 |
| 移动端面包屑链接（每项） | `MobileBreadcrumb` | 点击面包屑路径跳转 |
| 步骤节点按钮（每项） | `MobileStepBtn` | 点击切换步骤 |

### 8.2 功能按钮

| 元素描述 | 上报值（bi_name） | 触发场景 |
|----------|------------------|----------|
| 复制二维码/链接按钮 | `MobileCopyLinkBtn` | 点击复制移动端引导链接/二维码图片 |
| 上一步按钮 | `DeployFlowButton` | 点击"上一步" |
| 下一步按钮 | `DeployFlowButton` | 点击"下一步" |

### 8.3 内容区链接（手动上报）

| 场景 | eventCategory | eventAction | eventLabel | eventValue | jsonParam |
|------|--------------|-------------|-----------|------------|-----------|
| Markdown 内容中的超链接点击 | `link` | `click` | 链接 URL | 链接文案 | `{"url":"...","title":"..."}` |
| iframe 内容中的超链接点击 | `link` | `click` | 链接 URL | 链接文案 | `{"url":"...","title":"..."}` |

---

## 附：通用可复用组件埋点值

以下组件本身带有 `bi_name`，实际上报时会结合所在父模块的 `bi_parent_name` 形成完整上报标识。

| 组件 | bi_name 值 | 说明 |
|------|-----------|------|
| `DeployFlowButton` | `DeployFlowButton` | 通用操作按钮（开始部署、上一步、下一步、重新部署、确认结束） |
| `QuickLinkCard`（链接型 `<a>`） | `QuickLinkCard` | 快捷入口卡片链接 |
| `QuickLinkCard`（按钮型 `<button>`） | `QuickLinkCard` | 快捷入口卡片按钮 |

---

## 附：上报字段说明

手动调用 `onCustomEvent` 时各字段含义：

| 字段 | 类型 | 说明 |
|------|------|------|
| `eventCategory` | string | 事件类别，如 `link`、`button` |
| `eventAction` | string | 操作类型，如 `click` |
| `eventLabel` | string | 唯一标识，链接类填 URL |
| `eventValue` | string | 人类可读文案，如链接文字、按钮名称 |
| `jsonParam` | string | JSON 序列化的附加业务参数 |
