# pep-cloud-deploy-flow 组件开发复盘

## 项目全貌

最终交付物：**pep-cloud-deploy-flow** 组件

| 类别 | 规模 |
|------|------|
| Svelte 组件 + 样式 | ~5500+ 行 |
| TypeScript 工具 | ~1100+ 行 |
| Schema.json | 933 行 |
| 测试文件 | ~900+ 行 |
| Mock 数据 | ~301 行 |
| 开发对话轮次 | 75+ 轮主对话 |

涵盖 PC 端（Navbar + PseudoBrowser + SidebarPanel + 多种布局模态）和移动端（MobileFlow 独立流程）。

## 组件层级

```
index.svelte
├── Navbar                     （PC 且非移动端流程）
├── section.pep-cloud-deploy-flow
│   └── .workspace
│       ├── MobileFlow         （移动端流程）
│       └── [else 桌面布局]
│           ├── .main-wrap
│           │   ├── DeploymentFinished  → DeployFlowButton, QuickLinkCard
│           │   ├── PseudoBrowser       → QuickLinkCard
│           │   └── MainPanel           → DeployFlowButton, QuickLinkCard
│           ├── .sidebar-wrap → SidebarPanel → DeployFlowButton, Tooltip, StepStatusDot
│           ├── Tooltip + 恢复侧栏按钮（collapsed）
│           └── .float-panel → SidebarPanel（悬浮）
├── EndDeploymentModal         → DeployFlowButton
└── .right-snap-shadow（悬浮贴右吸附提示）
```

## 核心反思维度

本复盘从以下维度展开：

1. [理想的初始输入与开发流程](./02-ideal-input-and-flow.md)
2. [数据结构先行的重要性](./03-data-structure-first.md)
3. [PC 与移动端的开发策略](./04-pc-mobile-strategy.md)
4. [缺失的组件库：重复与不一致审计](./05-missing-component-library.md)
5. [架构决策与技术子系统](./06-architecture-decisions.md)
6. [对话效率与协作节奏](./07-conversation-efficiency.md)
7. [核心教训总结](./08-lessons-summary.md)
