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
