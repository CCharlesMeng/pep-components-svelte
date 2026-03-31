# 理想的初始输入与开发流程

## 设计稿的给法

### 现状问题

设计稿是逐步透露的，导致 AI 对全貌认知碎片化。从对话历史看，sidebar 经历了「左侧→右侧」的大迁移，伪浏览器的按钮逻辑反复调整，这些都是全局视角缺失的代价。

### 理想方式

1. **第一步给全局信息架构图**（不是视觉稿，而是信息层级图）——哪些模块存在、它们的从属关系、数据流向。哪怕手绘草图都比精美设计稿更有用。
2. **第二步给完整设计稿集合**（PC + Mobile + 各状态），标注清楚"哪些是确定的、哪些是待定的"。
3. **1:1 对比页面依然有价值**，但应该在「第一轮大结构开发完毕」后启动，而不是边开发边对比，因为早期对比会让注意力过早聚焦于像素而非架构。

## 我希望前期多获取的信息

- **组件的使用场景**：谁在用？运营配置后嵌入哪里？用户的典型操作路径是什么？
- **技术约束**：宿主环境（CSS 变量来自哪里？）、浏览器兼容性要求、性能预算
- **不变量声明**：哪些决策是确定的不会改的（比如"sidebar 一定在右边"），哪些是可能变的
- **已有组件参考**：同项目其他组件的 schema 写法、样式约定（有 `shared/config/` 基础设施，如果早期就了解这些约定会减少返工）

## 理想的开发优先级

```
1. 数据结构 & 类型定义（types.ts + schema.json 骨架）
2. 基础 UI 原子组件（Button、Icon、Tooltip、Tab、Loading 等）
3. 核心骨架布局（PC 三栏 + Mobile 单流程，只有容器没有内容）
4. 状态机（部署前 → 部署中 → 部署完成 的状态流转）
5. 核心交互（sidebar resize/collapse/float、伪浏览器 tab 管理）
6. 内容渲染（远程 HTML/Markdown、Shadow DOM 隔离）
7. 细节打磨（tooltip、动画、scrollbar、像素对齐）
8. 移动端适配
```

实际开发路径更像是：视觉驱动 → 发现数据结构不对 → 改 schema → 改组件 → 新需求 → 再改 schema... 循环往复。

## 关键缺失环节：UI 原子审计应先于业务组件开发

在写组件代码之前，**应该有一轮「确认共享 UI 原子」的对话**。当时一上来就还原设计稿开发了 button 组件，结果各处按钮风格不一，后面不得不反复调整。如果一开始就识别出"这个项目需要 button、tab、tooltip、icon、loading、step-bar 等基础原子"，会少走很多弯路。

### 为什么 AI 特别容易踩这个坑

AI 很擅长"看到什么就实现什么"，但不擅长主动喊停说"等一下，这里有个模式在重复"。每次对话拿到一个设计稿局部，AI 会就地实现该局部的样式，而不会回头检查"这个按钮和上次那个按钮是不是同一个模式"。

### 理想做法：第 3 轮对话专门做 UI 原子审计

在拿到完整设计稿后、写任何业务组件之前，花 0.5-1 轮对话做以下事情：

**Step 1 — 从设计稿中识别所有 UI 原子**

以本项目为例，如果一开始审计，能识别出以下原子：

| 原子组件 | 设计稿中出现的场景 | 变体 |
|---------|-------------------|------|
| **PrimaryButton** | 开始部署、重新部署、结束部署确认 | 黑底白字胶囊、带图标、纯文字 |
| **SecondaryButton** | 结束部署取消 | 白底黑字胶囊 |
| **IconButton** | sidebar 工具栏（minimize/maximize/float）、浏览器工具栏（新建/关闭 tab）、导航栏操作、模态关闭 | 16px/20px/24px 尺寸 |
| **GhostButton** | 导航栏文字链接（"结束部署"）| 无边框无底色 |
| **Tab** | sidebar 多 Tab 切换、伪浏览器页签 | 可关闭/不可关闭 |
| **Tooltip** | 步骤圆点 hover、折叠态恢复按钮 hover、工具按钮 hover | 上/下/左/右方向 |
| **Toast** | 移动端复制成功提示 | 底部居中、自动消失 |
| **Icon** | Logo（94×28）、工具图标（16px）、卡片图标（40px）、步骤完成勾（12px）| 多种尺寸 |
| **LoadingText** | sidebar 步骤内容加载、移动端内容加载 | 行内灰色文字 |
| **LoadingOverlay** | 伪浏览器 iframe 加载 | 全区域遮罩 + 居中文字 |
| **StepBar** | sidebar 步骤条、移动端步骤条 | 竖向（sidebar）/ 横向（mobile）、展开/圆点模式 |
| **StepDot** | 步骤圆点 | 当前/已完成/未完成 三态 |
| **Card** | 云产品卡片、成功页推荐卡片、新标签页快捷方式 | 带图标+标题+描述 |
| **Modal** | 结束部署确认弹窗 | 遮罩 + 居中卡片 |
| **RichText** | 部署须知、价格预估、服务协议 | 支持 HTML 的文本区域 |
| **MarkdownRenderer** | sidebar 步骤内容、移动端步骤内容 | 含图片/表格/链接的 Markdown |
| **CopyToClipboard** | 移动端复制链接 | 工具函数 + 反馈 Toast |

**Step 2 — 确认哪些需要独立组件、哪些内联即可**

并非所有原子都需要独立 `.svelte` 文件。判断标准：

```
独立组件 = 出现 2+ 次 AND 有可配置的变体
内联样式 = 只出现 1 次 OR 过于简单（如分割线）
共享工具函数 = 无 UI 但有复用逻辑（如 copyToClipboard）
共享 CSS = 多组件复用但不需要组件化（如 markdown 排版）
```

按此标准，本项目的优先级：

| 优先级 | 原子 | 理由 |
|--------|------|------|
| **P0 必须独立** | IconButton, Tab, StepBar, Tooltip | 2+ 处使用且变体多 |
| **P1 建议独立** | LoadingText, Icon, Modal | 2+ 处使用但变体少 |
| **P2 内联即可** | GhostButton, RichText | 使用处少或场景单一 |
| **P2 工具函数** | copyToClipboard, openExternalLink | 无 UI 的复用逻辑 |
| **P2 共享 CSS** | markdown-content.css（已有）| 多处引入同一份样式 |

**Step 3 — 先开发 P0 原子，再搭业务组件**

```
Day 1: 数据结构 (types.ts + schema.json)
Day 2: P0 原子组件 (IconButton, Tab, StepBar, Tooltip)
Day 3: 业务骨架 (index.svelte 三栏 + 状态机)
Day 4+: 业务模块 (基于原子搭建 SidebarPanel, PseudoBrowser 等)
```

### 这么做能省多少事？

以本项目的实际数据为例：

| 场景 | 没有组件库 | 有组件库 |
|------|-----------|---------|
| SidebarPanel 工具栏按钮 | 自己写 50 行样式 | `<IconButton icon={url} size={20} onclick={fn} />` |
| PseudoBrowser 工具栏按钮 | 再写 40 行不同样式 | 同上，换个 icon |
| Navbar 操作按钮 | 又写 30 行 | 同上 |
| Sidebar Tab | `<button>` + 60 行样式 | `<Tab active={bool} closable={false}>` |
| Browser Tab | `<div role="button">` + 80 行样式 + 手动键盘事件 | `<Tab active={bool} closable={true}>` |
| Sidebar 步骤条 | `ol > li > button > line` + 120 行 | `<StepBar steps={s} active={i} />` |
| Mobile 步骤条 | 再来一遍 100 行 | 同上，换 `orientation` |
| Loading（sidebar）| `<p class="loading">` + 12px #86909c | `<LoadingText text={t} />` |
| Loading（mobile）| `<p class="loading">` + 13px #4e5969 | 同上，自然一致 |

**保守估计可减少 ~800-1000 行重复代码，消除颜色/字号/无障碍实现的不一致，并将后续维护的改动点从"散落在 12 个文件"收敛为"改一个原子组件即可"。**

详见 [缺失的组件库：完整审计报告](./05-missing-component-library.md)。
