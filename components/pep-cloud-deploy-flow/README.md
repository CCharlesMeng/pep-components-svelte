# pep-cloud-deploy-flow

`pep-cloud-deploy-flow` 是基于 `design` 原型还原的部署流程组件，目标是对齐设计稿的结构、交互与视觉节奏，并遵循组件库样式约定（BEM 命名 + token 优先）。

## Design Source

- 本地设计稿目录：`design/`
- 关键设计数据：`design/src/config.ts`
- 在线链接（当前为登录页，需要可访问账号后查看）：[Sign in - Google Accounts](https://aistudio.google.com/apps/d466b9a6-1d9e-477f-b48e-be14b7cbc6b6?fullscreenApplet=true&showPreview=true&showAssistant=true)

## Layout（侧栏在右）

- 工作区顺序：**主内容 → 拖拽分割条 → 侧栏**；侧栏 `normal` 时宽度约 **25vw～640px**（可拖拽）。
- **折叠**：侧栏宽度收为 0，恢复按钮使用 `sidebar.icons.sidebarMinimizeIcon`，固定在**视口右侧纵向居中**。
- **悬浮**：默认贴近视口右缘（留 16px）；拖近右缘出现吸附提示，松手后恢复为 `normal` 侧栏。
- 未提供 `sidebar.position` 等配置项：当前实现为**固定右侧停靠**。
- **文案**：配置里的引导语（如 `iframePages.newTabPage.title.text`）请与侧栏实际位置一致；默认 mock 已使用「右侧操作手册」表述。

## Data Contract Mapping

`mocks/default.json` 直接映射 `design/src/config.ts` 三大块：

- `navbar`
  - `logo`
  - `breadcrumbs`
  - `rightActions`
  - `endDeployment`（结束部署弹窗 + 成功页配置）
- `sidebar`
  - `tabs[].steps[].remoteContent.source`
  - `footer`
- `mainContent`
  - `notice`
  - `cloudProducts`
  - `deploymentEstimate`
  - `action`
  - `agreement`

## Implemented Interactions

- 主区 `开始部署` 点击可本地 mock 唤起伪浏览器
- 侧栏远程内容支持链接接管，点击后在伪浏览器中新增并激活 tab
- 支持 `normal / fullscreen / collapsed` 三态切换
- 侧栏默认停靠在**右侧**；支持中间可拖拽竖线调整主区与侧栏宽度（`25vw ~ 640px`）
- 悬浮窗默认靠右，拖至右缘可吸附并恢复为侧边模式
- 主区与侧栏顶部工具区按设计做对齐（统一顶栏高度与控件尺寸）
- 结束部署弹窗确认后切换到成功页，成功页支持重新部署

## Local Development

在 monorepo 根目录执行：

```bash
pnpm --filter pep-cloud-deploy-flow dev
```

常用验证命令：

```bash
pnpm --filter pep-cloud-deploy-flow test
pnpm --filter pep-cloud-deploy-flow build:client
pnpm --filter pep-cloud-deploy-flow check
```

> 注：`check` 当前会受共享文件 `shared/config/vite.factory.ts` 的历史 TS 报错影响（非本组件逻辑引入）。
