# 架构决策与技术子系统

## Sidebar 的架构决策成本

Sidebar 是改动最多的模块（1076 行，最大单文件），经历了：

| 变更 | 相关对话 |
|------|---------|
| 左侧 → 右侧迁移 | 影响了 tooltip 定位、snap shadow、resize handle 等所有子系统 |
| resize 拖拽问题 | 至少 4 次对话来修复拖拽迟滞、mouseup 监听、热区宽度等 |
| 四种状态管理 | normal / fullscreen / collapsed / floating |

### 如果再来一次

1. **先用状态机图画清楚** sidebar 的所有状态和转换条件，然后再写代码

```
normal ──最大化──→ fullscreen
  │                    │
  折叠               恢复
  │                    │
  ↓                    ↓
collapsed ←──────── floating（悬浮面板）
  │                    │
  恢复                 贴边吸附
  │                    │
  ↓                    ↓
normal              normal
```

2. **左/右的布局决定应该在第一天就锁定**——这个决策影响了 tooltip 定位、snap shadow、resize handle 等所有子系统
3. **考虑拆分 SidebarPanel**：
   - `SidebarLayout`（壳：宽度、位置、状态切换）
   - `SidebarContent`（内容：Tab、步骤、远程内容）
   - `SidebarControls`（按钮：resize、minimize、maximize）

---

## 伪浏览器的范围蔓延

PseudoBrowser 从一个简单的 iframe 容器，逐步演变为 842 行的复杂组件：

- Tab 管理（创建、切换、关闭）
- URL 栏显隐逻辑
- 域名白名单
- 预加载 / 缓存
- Loading 态
- 最大化 / 最小化
- 新标签页快捷方式

### 如果再来一次

1. 在开始之前列出伪浏览器的**全部功能清单**并排优先级
2. 预加载和缓存（IndexedDB）应该作为独立的技术决策点讨论，而非开发中途发现性能问题后补加

---

## 远程内容加载的复杂度被低估

这是组件中最有技术深度的子系统：

```
remote-content-loader.ts     → 加载 HTML/Markdown 内容
remoteShadowSandbox.ts       → Shadow DOM 隔离渲染
remoteContentCache.ts        → IndexedDB 缓存
markdown-content.css         → Markdown 渲染样式
component.server.ts          → 服务端预取
```

每一个都是独立的技术挑战：
- Shadow DOM 隔离：防止远程 CSS 污染宿主
- CSS 作用域：`scopeRemoteCss` 是否限制在面板内
- IndexedDB 缓存：缓存策略、过期机制
- 服务端预取：SSR 环境下的 htmlUrl/cssUrl 预加载

### 如果再来一次

这套系统应该作为**独立的子系统**先行设计和验证（做 POC），而非嵌入到 sidebar/mobile 开发中逐步搭建。

理想流程：
1. 先确认远程内容的类型（HTML / Markdown / HTML+CSS）
2. 设计加载 → 缓存 → 渲染 → 隔离的完整链路
3. 用简单的测试页面验证
4. 再集成到 SidebarPanel 和 MobileFlow

---

## phase2.ts 与硬编码

`phase2.ts`（158 行）中有兜底链接和 `createFallbackRemoteContent` 等逻辑，经过专门的对话讨论才理清。

这类"降级/兜底"逻辑应该在架构设计阶段就明确：
- 哪些内容有兜底？
- 兜底内容从哪里来？
- 兜底的触发条件是什么？

而非在实现过程中逐步发现需要兜底然后打补丁。
