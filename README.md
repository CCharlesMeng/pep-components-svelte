# PEP Components Svelte Monorepo

这是一个基于 `pnpm` workspaces 管理的 Svelte 组件单仓项目。它允许独立开发组件，同时共享配置和工具逻辑。

## 项目架构

```
/
├── components/                  # 独立的 SvelteKit 组件应用
│   ├── pep-common-card-v2/      # 通用卡片组件 v2
│   ├── pep-mkp-common-offering/ # 市场通用产品组件
│   └── pep-navigate-link/       # 导航链接组件
├── shared/                      # 共享库和配置
│   ├── bff/                     # 后端服务代理 (Backend-For-Frontend)
│   ├── config/                  # 共享配置 (TypeScript, Vite, ESLint等)
│   ├── core/                    # 核心入口文件和主应用逻辑
│   ├── utils/                   # 通用工具函数
│   └── templates/               # 共享模板和资源文件
├── scripts/                     # 开发工具脚本
│   ├── copy_component_template.py   # 组件模板拷贝工具
│   ├── scaffold_component.py        # 组件脚手架生成器
│   ├── generate_features.py         # 功能特性生成器
│   └── dev-pkg.sh                   # 开发环境管理脚本
├── autonomous-coding/           # 自主编码代理演示系统
│   ├── agent.py                  # 代理核心逻辑
│   ├── autonomous_agent_demo.py  # 演示入口
│   └── prompts/                  # 提示模板和规格
├── templates/                   # 项目模板
│   ├── app.html                 # HTML 模板
│   └── Layout.svelte            # Svelte 布局组件
├── package.json                 # 根配置
├── pnpm-workspace.yaml          # 工作区定义
└── types.d.ts                   # 全局类型定义
```

## 开发环境

### 环境要求
- Node.js（推荐最新 LTS 版本）
- pnpm（`npm install -g pnpm`）

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

### 组件开发脚本

| 脚本 | 说明 |
|------|------|
| `python3 scripts/copy_component_template.py --source <源组件> --target <新组件>` | 从现有组件拷贝创建新组件 |
| `python3 scripts/scaffold_component.py --component <组件名> --mode standard` | 使用脚手架快速创建组件 |

### 开发单个组件
要启动特定组件的开发服务器（例如 `pep-common-card-v2`）：

**快捷方式（推荐）：**
```bash
pnpm dev pep-common-card-v2
```

**完整命令：**
```bash
pnpm --filter pep-common-card-v2 dev
```

这将启动该组件的 Vite 开发服务器，通常在 `http://localhost:5173`。

### 开发所有组件
要同时运行所有组件的开发服务器（它们将使用不同的端口）：

```bash
pnpm -r dev
```

## 构建

### 构建单个组件
要构建特定组件：

```bash
pnpm --filter pep-common-card-v2 build
```

### 构建所有组件
要构建工作区中的所有组件：

```bash
pnpm build
```

## 共享包

### `@pep/bff` (已清理)
原包含共享的后端服务代理 (Backend-For-Frontend) 逻辑，现已清理。各组件使用独立的loader实现。

### `@pep/config`
包含共享配置文件，确保项目一致性。
- `tsconfig.json`: 基础 TypeScript 配置。
- `vite.config.ts`: 基础 Vite 构建配置。
- 其他共享配置：ESLint、Prettier 等。

### `@pep/core`
核心应用入口和主逻辑。
- `entry-client.ts`: 客户端入口点。
- `entry-server.ts`: 服务端入口点。
- `entry-editor.ts`: 编辑器模式入口点。
- `main.ts`: 主要应用逻辑。

### `@pep/utils`
通用工具函数库。
- `date.ts`: 日期处理工具函数。

## 开发工具脚本

`scripts/` 目录包含用于组件开发的自动化工具：

- **`copy_component_template.py`**: 从现有组件完整拷贝结构创建新组件，支持自动重命名和文档清理。
- **`scaffold_component.py`**: 基于模板快速生成新组件，支持多种模式（最小、标准、定制）。
- **`generate_features.py`**: 生成或更新组件的 `features.json` 配置文件。
- **`dev-pkg.sh`**: 开发环境管理脚本，支持多组件并行开发。

详细用法请参考 [`scripts/README.md`](scripts/README.md)。

## 自主编码代理系统

`autonomous-coding/` 目录包含基于 Claude Agent SDK 的自主编码演示系统：

- **双代理模式**: 初始化代理 + 编码代理的分工协作。
- **会话管理**: 支持多会话持续开发，进度自动保存。
- **安全沙箱**: 命令白名单和文件系统限制确保安全。
- **完整演示**: 可构建包含 200+ 功能特性的完整应用。

适用于学习 AI 驱动开发和原型快速搭建。详情请见 [`autonomous-coding/README.md`](autonomous-coding/README.md)。

## 设计理念

### 模块化架构
- **组件独立性**: 每个组件都是独立的 SvelteKit 应用，可以单独开发、测试和部署。
- **共享复用**: 通过 workspace 共享配置、工具和模板，避免重复代码。
- **标准化**: 统一的开发流程、代码规范和项目结构。

### 开发工具链
- **自动化脚本**: 提供丰富的开发工具，降低新组件创建的门槛。
- **AI 辅助开发**: 集成自主编码代理，支持快速原型开发。
- **质量保证**: 内置代码检查、格式化和类型验证。

## 添加新组件

### 方式一：使用脚本工具（推荐）

#### 快速创建（推荐新手）
```bash
# 使用预制模板创建标准组件
python3 scripts/scaffold_component.py --component pep-new-component --mode standard
```

#### 从现有组件拷贝
```bash
# 从相似组件拷贝结构
python3 scripts/copy_component_template.py --source pep-common-card-v2 --target pep-new-component
```

### 方式二：手动创建

1. 在 `components/` 下创建新文件夹
2. 参考现有组件的结构，创建 `package.json`、`src/`、`tests/` 等目录
3. 在 `package.json` 中添加 workspace 依赖：
   ```json
   "devDependencies": {
     "@pep/config": "workspace:*",
     "@pep/core": "workspace:*",
     "@pep/utils": "workspace:*"
   }
   ```
4. 扩展共享配置（TypeScript、Vite 等）
5. 更新组件的 `README.md` 和相关文档

## 贡献指南

### 代码规范
- 使用 TypeScript 进行类型安全的开发
- 遵循 ESLint 和 Prettier 配置
- 组件应包含完整的类型定义和测试用例
- 提交前运行 `pnpm check`、`pnpm lint` 和 `pnpm format`

### 文档维护
- 每个组件应有详细的 `README.md`
- 更新 `features.json` 描述组件功能特性
- 保持 `DEVELOPMENT.md` 记录开发进度和待办事项

### 共享代码
- 将可复用的逻辑提取到 `shared/` 包中
- 更新相应包的文档和导出配置
- 确保向后兼容性

## 许可证

内部 Anthropic 使用。
