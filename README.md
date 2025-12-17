# PEP Components Svelte Monorepo

This project is a monorepo for Svelte components, managed using `pnpm` workspaces. It allows for independent development of components while sharing configuration and utility logic.

## Project Structure

```
/
├── components/                  # Individual SvelteKit applications/components
│   ├── pep-mkp-common-offering/ # Example component 1
│   └── pep-navigate-link/       # Example component 2
├── shared/                      # Shared libraries and configuration
│   ├── config/                  # Shared configs (tsconfig, eslint, svelte, vite)
│   └── bff/                     # Shared server-side logic (data loaders)
├── templates/                   # Shared templates and assets
│   ├── app.html                 # Shared HTML template
│   ├── Layout.svelte            # Shared layout component
│   └── assets/                  # Shared assets (favicon, etc.)
├── package.json                 # Root configuration
└── pnpm-workspace.yaml          # Workspace definition
```

## Development

### Prerequisites
- Node.js (Latest LTS recommended)
- pnpm (`npm install -g pnpm`)

### Install Dependencies
Run this command at the root to install dependencies for all workspaces:
```bash
pnpm install
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev <package-name>` | 启动指定组件的开发服务器 |
| `pnpm -r dev` | 启动所有组件的开发服务器 |
| `npm run build` | 构建所有组件 |
| `npm run lint` | 检查所有组件的代码规范 |
| `npm run check` | 类型检查所有组件 |
| `npm run format` | 格式化所有组件的代码 |

### Developing a Single Component
To start the development server for a specific component (e.g., `pep-mkp-common-offering`):

**快捷方式（推荐）：**
```bash
npm run dev pep-mkp-common-offering
# 或
pnpm dev pep-mkp-common-offering
```

**完整命令：**
```bash
pnpm --filter pep-mkp-common-offering dev
```

This will start the Vite dev server for that component, usually at `http://localhost:5173`.

### Developing All Components
To run dev servers for all components simultaneously (they will use different ports):

```bash
pnpm -r dev
```

## Building

### Build a Single Component
To build a specific component:

```bash
pnpm --filter pep-mkp-common-offering build
```

### Build All Components
To build all components in the workspace:

```bash
pnpm -r build
```

## Shared Packages

### `@pep/config`
Contains shared configuration files to ensure consistency across the project.
- `tsconfig.json`: Base TypeScript configuration.
- `svelte.config.js`: Base Svelte configuration.
- `vite.config.ts`: Base Vite configuration.
- `eslint-config.js`: Shared ESLint rules.

### `@pep/bff`
Contains shared Backend-For-Frontend (BFF) logic.
- `createMockLoader(jsonPath)`: A utility to create a SvelteKit `load` function that reads mock data from a JSON file.

## Adding a New Component
1. Create a new folder in `components/`.
2. Initialize a SvelteKit app or copy an existing component structure.
3. Update `package.json` to use workspace dependencies:
   ```json
   "devDependencies": {
     "@pep/config": "workspace:*",
     "@pep/bff": "workspace:*"
   }
   ```
4. Extend shared configurations in `tsconfig.json`, `svelte.config.js`, and `vite.config.ts`.
