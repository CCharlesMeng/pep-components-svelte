# PEP 项目级调试方案 (Global Solutions)

## 🛠 构建与权限 (Build & Permissions)

### 1. Vite/Playwright 执行 EPERM 权限错误
- **症状**: 终端报错 `EPERM: operation not permitted` 或 `operation rejected by your operating system`。
- **根本原因**: Cursor 沙盒限制或 Node.js 进程对特定 node_modules 缓存目录的读写权限冲突。
- **解决方案**: 
    - 运行指令时显式请求 `required_permissions: ['all']`。
    - 在本地开发时，尝试清理 `node_modules/.vite` 缓存。

## 🧪 测试套件 (Testing)

### 1. Playwright 导入路径/模块错误
- **症状**: `Cannot find module ...` 或 `SyntaxError: Named export '...' not found`。
- **原因**: 
    - ESM 与 CommonJS 混合导致。
    - 跨目录导入时，相对路径层级计算错误。
- **解决方案**:
    - 确保 `shared/package.json` 中包含 `"type": "module"`。
    - 导入时使用显式的 `.ts` 扩展名（在某些配置下）。
    - 严格检查 `../../` 的层级，使用 `realpath` 或 AI 工具重新校验。

## 🧬 Svelte 响应式 (Reactivity)

### 1. 倒计时/实时数据不刷新
- **症状**: 数据已更改但 UI 未重现。
- **原因**: Svelte 函数内部变量未作为参数传入，导致响应式系统无法追踪依赖。
- **解决方案**: 将外部响应式变量（如 `now`）显式作为函数参数传入。

### 2. Svelte 5 Props/State 初始值捕获警告
- **症状**: 终端输出 `This reference only captures the initial value of 'X'. Did you mean to reference it inside a closure instead?`。
- **原因**: 
    - 在 `<script>` 顶层将 `$props()` 或 `$state()` 的值直接赋值给 `const` 或 `let` 变量。由于顶层代码仅在组件初始化时执行一次，该变量将失去响应性。
    - 如果警告来自 `.svelte-kit/generated/root.svelte`，通常是因为使用了已弃用的 `kit.files.appTemplate` 配置项。
- **修复方案**:
    - **用户组件中**: 对于派生计算值，使用 `$derived(...)`；对于需要在每次更新时执行的副作用，使用 `$effect(...)`；在模板中直接访问 `props.x`。
    - **生成文件警告**: 移除 `svelte.config.js` 中的 `kit.files.appTemplate` 配置，删除 `.svelte-kit` 目录，重启开发服务器。
- **审计关键词**: 
    - `grep -r "\$props()" .` 然后检查是否有 `const .* = props\.` 或解构后的变量在顶层被赋值给非 `$derived` 变量。
    - 检查终端是否显示 "config.kit.files.appTemplate option is deprecated" 警告。
- **详细修复**: 参见 `.cursor/debug-solutions/fixes/svelte5-root-warnings-fix.md`

### 3. Svelte 5 SSR 下的 Undefined 访问错误 (State Initialization)
- **症状**: `TypeError: Cannot read properties of undefined (reading '0')` 或类似错误，通常发生在渲染循环中访问 `$state` 数组/对象时。
- **原因**: Svelte 5 的 `$effect` 和 `$effect.pre` 不在服务器端 (SSR) 执行。如果某些状态（如折叠状态数组）仅在 effect 中初始化，SSR 渲染时该状态仍为初始值（如 `[]`），导致模板中的索引访问 (`state[i][j]`) 报错。
- **修复方案**:
    - **模板容错**: 在模板中使用可选链 (`?.`) 或逻辑或 (`??`) 提供 SSR 时的默认行为。
    - **立即初始化**: 尽量在 `$state` 声明时直接初始化完整结构，或使用 `$derived` 处理纯展示逻辑。
- **审计关键词**: `grep -r "\[.*\]\[.*\]" .` 检查模板中是否存在对 state 数组的深度索引访问，且该 state 的初始化依赖于 effect。
