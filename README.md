# PEP Components Svelte Monorepo

这是一个基于 `pnpm` workspaces 管理的 **Svelte 5** 组件单仓项目。各组件独立开发，通过统一的 `@pep/shared` 包共享 UI 基础件、配置、工具和样式。

## 项目架构

```
/
├── components/                      # 独立的业务组件包
│   ├── pep-cloud-deploy-flow/       # 云部署流程组件
│   ├── pep-common-card-v2/          # 通用卡片组件 v2
│   ├── pep-mkp-common-offering/     # 市场通用产品组件
│   └── pep-navigate-link/           # 导航链接组件
├── shared/                          # 全局共享包 (@pep/shared)
│   ├── core/                        # 核心入口文件
│   │   ├── dev/                     # 开发模式入口 (main.ts)
│   │   └── prod/                    # 生产模式入口 (entry-client.ts / entry-server.ts / entry-editor.ts)
│   ├── config/                      # 共享构建配置
│   │   ├── tsconfig.json            # 基础 TypeScript 配置
│   │   └── vite.factory.ts          # Vite 配置工厂函数
│   ├── ui/                          # 共享 UI 基础组件
│   │   ├── FloorHeader.svelte       # 楼层头部组件
│   │   ├── FloorTabs.svelte         # 楼层页签组件
│   │   ├── traits.ts                # Trait 分拣工具函数
│   │   └── types.ts                 # 共享 UI 类型定义
│   ├── styles/                      # 全局样式
│   │   └── tokens/                  # 设计 Token
│   │       ├── primitives.css       # 原始设计变量 (颜色/尺寸)
│   │       └── semantic.css         # 语义化 CSS 变量
│   ├── utils/                       # 通用工具函数
│   │   └── date.ts                  # 日期处理工具
│   ├── bff/                         # 后端服务代理 (Backend-For-Frontend)
│   ├── templates/                   # HTML 模板
│   │   └── index.html               # 开发模式共享 HTML 入口
│   └── index.ts                     # 包主入口
├── .ai-workflow/                    # AI 辅助开发模板
│   └── templates/component/         # 新组件标准模板
├── scripts/                         # 开发工具脚本
│   ├── copy-template.js             # 从现有组件拷贝创建新组件
│   ├── scaffold-component.js        # 组件脚手架生成器
│   ├── generate-features.js         # 功能特性配置生成
│   └── dev-pkg.js                   # 多组件并行开发脚本
├── package.json                     # 根配置 (pnpm workspace)
├── pnpm-workspace.yaml              # 工作区定义
└── types.d.ts                       # 全局类型声明
```

## 开发环境

### 环境要求

- **Node.js** — 推荐最新 LTS 版本
- **pnpm** — `npm install -g pnpm`

### 安装依赖

在根目录运行以下命令为所有工作区安装依赖：

```bash
pnpm install
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev <组件名>` | 启动指定组件的开发服务器 |
| `pnpm -r dev` | 启动所有组件的开发服务器 |
| `pnpm build` | 构建所有组件 |
| `pnpm lint` | 检查所有组件的代码规范 |
| `pnpm check` | 类型检查所有组件 |
| `pnpm format` | 格式化所有组件的代码 |
| `pnpm clean` | 清理所有组件的构建产物 |

### 开发单个组件

**快捷方式（推荐）：**
```bash
pnpm dev pep-common-card-v2
```

**完整命令：**
```bash
pnpm --filter pep-common-card-v2 dev
```

启动后访问 `http://localhost:5173`，使用 `mocks/` 目录下的 Mock 数据渲染组件。

### 开发所有组件

```bash
pnpm -r dev
```

各组件将自动使用不同端口（5173、5174、…）。

## 构建

每个组件支持四种构建产物，全部由根目录的一条命令触发：

```bash
# 构建全部组件
pnpm build

# 构建单个组件
pnpm --filter pep-common-card-v2 build
```

| 构建模式 | 命令 | 产物目录 | 用途 |
|----------|------|----------|------|
| `client` | `--mode=client` | `dist/client/` | 浏览器端水合脚本 |
| `server` | `--mode=server` | `dist/server/` | SSR 服务端渲染入口 |
| `data` | `--mode=data` | `dist/data/` | 服务端数据 Loader |
| `editor` | `--mode=editor` | `dist/editor/` | 可视化编辑器入口 |

## 共享包 `@pep/shared`

所有组件通过 `"@pep/shared": "workspace:*"` 引用统一共享包，提供以下能力：

### `@pep/shared/ui/*` — 共享 UI 基础组件

| 导入路径 | 说明 |
|---------|------|
| `@pep/shared/ui/FloorHeader.svelte` | 楼层头部（标题/副标题/更多链接） |
| `@pep/shared/ui/FloorTabs.svelte` | 楼层页签切换 |
| `@pep/shared/ui/traits.ts` | `pickTrait()` — Trait 属性分拣工具 |
| `@pep/shared/ui/types.ts` | `UseTraits<>`, `TabItem`, `FloorTraits` 等核心类型 |

### `@pep/shared/styles/tokens/*` — 设计 Token

| 文件 | 说明 |
|------|------|
| `primitives.css` | 原始设计变量（基础色板、间距尺度等） |
| `semantic.css` | 语义化 CSS 变量（`--bg-primary`, `--text-secondary` 等） |

样式由 `shared/core/prod/entry-client.ts` 和 `shared/core/dev/main.ts` 自动注入，组件内无需手动导入。

### `@pep/shared/utils/*` — 工具函数

| 导入路径 | 说明 |
|---------|------|
| `@pep/shared/utils/date.ts` | `isExpired()` 等日期处理工具 |

### `@pep/shared/core/*` — 核心入口（构建系统内部使用）

| 目录 | 说明 |
|------|------|
| `core/dev/main.ts` | 开发模式：挂载组件 + 调用 Mock Loader |
| `core/prod/entry-client.ts` | 生产 Client 模式：Svelte `hydrate()` 入口 |
| `core/prod/entry-server.ts` | 生产 Server 模式：SSR 导出组件 |
| `core/prod/entry-editor.ts` | 生产 Editor 模式：可视化编辑器入口 |

## 组件目录结构

每个组件遵循统一的目录约定：

```
components/pep-your-component/
├── src/
│   ├── index.svelte          # 组件主入口（必须）
│   ├── types.ts              # TypeScript 类型定义（必须）
│   ├── component.server.ts   # 服务端数据 Loader（必须）
│   ├── vite-env.d.ts         # Vite 环境类型补充
│   ├── components/           # 本地子组件
│   │   └── SubComponent.svelte
│   ├── state/                # 可复用响应式状态
│   │   └── timer.svelte.ts
│   ├── styles/               # 组件级样式（可选）
│   └── utils/                # 组件级工具函数（可选）
├── mocks/
│   ├── default.json          # 默认 Mock 数据（必须）
│   └── index.ts              # 数据聚合/预处理（可选）
├── tests/
│   └── *.spec.ts             # Playwright E2E 测试
├── schema.json               # 编辑器 JSON Schema（必须）
├── features.json             # 组件功能特性描述
├── spec.md                   # 组件需求规格说明
├── DEVELOPMENT.md            # 开发日志和待办事项
├── package.json              # 包配置
├── vite.config.ts            # Vite 配置（引用工厂函数）
└── tsconfig.json             # TypeScript 配置（继承共享配置）
```

## 添加新组件

### 方式一：使用脚手架（推荐）

```bash
# 基于 .ai-workflow/templates/component 模板生成
node scripts/scaffold-component.js --component pep-new-component --mode standard
```

### 方式二：从现有组件拷贝

```bash
# 从相似组件完整拷贝并自动重命名
node scripts/copy-template.js --source pep-common-card-v2 --target pep-new-component
```

### 方式三：手动创建

1. 在 `components/` 下创建组件目录
2. 创建 `package.json`，添加 workspace 依赖：
   ```json
   {
     "name": "pep-new-component",
     "devDependencies": {
       "@pep/shared": "workspace:*"
     }
   }
   ```
3. 创建 `vite.config.ts`：
   ```ts
   import { createComponentConfig } from '../../shared/config/vite.factory';
   export default createComponentConfig({ cwd: process.cwd(), name: 'NewComponent' });
   ```
4. 创建 `tsconfig.json`，继承 `../../shared/config/tsconfig.json`
5. 参照 [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) 编写组件源码

> 详细的组件开发规范与最佳实践，请参阅 **[COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)**。

## 代码规范

- 使用 **Svelte 5 Runes** 语法（`$props()`, `$state()`, `$derived()`）
- 使用 **TypeScript** 进行类型安全开发，Props 必须声明类型
- 遵循 ESLint 和 Prettier 配置
- 提交前运行：`pnpm check && pnpm lint && pnpm format`

## 文档维护

- `schema.json` — 描述组件可配置字段，用于可视化编辑器
- `features.json` — 描述组件功能特性
- `DEVELOPMENT.md` — 记录开发进度和待办事项
- 每个组件目录内应有 `README.md`

## 许可证

内部项目，仅限内部使用。
