# PEP 核心技术法典 (The Core Constitution of PEP)

## 0. 前言 (Preface)
本法典是 PEP 组件库（100+ 组件规模）的最高开发准则。其核心目标是建立一个**高内聚、低耦合、AI 深度驱动**的现代化 UI 工业生产体系。所有开发活动、代码审查及 AI 辅助生成必须无条件遵循本法典。

---

## 1. 真理来源与权威数据 (Sources of Truth & Authority)
系统的一致性建立在唯一的事实来源之上。严禁在多个地方维护重复的逻辑或数据。

| 数据维度 | 权威源文件 (Authority) | 更新策略 (Update Strategy) |
| :--- | :--- | :--- |
| **视觉规范 (Design Tokens)** | `shared/design-tokens/tokens/*.json` | 修改后必须运行 `npm run build` 同步至 CSS 变量与 TS 定义。 |
| **组件元数据 (AI Manifest)** | `shared/ui/ui-manifest.json` | 自动化脚本生成的只读文件，描述组件接口与 UnoCSS 快捷键。 |
| **业务配置 (Schema)** | `shared/schema/*.json` | 集中定义的 JSON Schema，业务组件必须通过 `$ref` 引用。 |
| **样式逻辑 (UnoCSS)** | `shared/unocss-preset/index.ts` | 定义全局快捷键 (Shortcuts) 与 规则 (Rules)。 |

---

## 2. 核心架构原则 (Architectural Principles)

### 2.1 原子化体系 (Atomization)
- **绝对复用**: 禁止在业务组件中重复实现基础 UI 模式。
- **准入机制**: 新原子组件（`shared/ui`）的创建属于架构级变更，必须经过技术委员会（或主架构师）评审。
- **组合优先**: 业务组件应由原子组件组合而成，而非从零构建 DOM。

### 2.2 Schema 驱动开发 (Schema-Driven)
- **配置即法**: 组件的 Props 定义必须严格对应 Schema 字段。
- **零冗余配置**: 禁止在不同组件间定义行为相同但名称不同的配置项。

---

## 3. 视觉与设计系统规范 (Design System & Styling)

### 3.1 零硬编码原则 (Zero Hardcoding)
- **禁止字面量**: 严禁在 CSS 或 HTML 中使用任何十六进制颜色、像素值。
- **变量引用**: 必须使用 `--color-*` 变量或 UnoCSS 原子类。

### 3.2 UnoCSS 引擎规约
- **Shortcuts 优先**: 常用样式组合必须沉淀到 `@pep/unocss-preset` 的快捷键中。
- **Attributify 模式**: 为了 HTML 的可读性，鼓励使用属性化写法（如 `<div pep-card>`）。
- **Scoped CSS 限制**: 仅允许在 `<style>` 中编写 UnoCSS 无法覆盖的复杂交互动画。

---

## 4. Svelte 5 技术标准 (Technical Standards)

### 4.1 Runes 强制规范
- **数据流**: 统一使用 `$props()`。严禁 `export let`。
- **响应式**: 统一使用 `$state()` 和 `$derived()`。严禁 `let` 声明响应式变量。
- **副作用**: 统一使用 `$effect()`。严禁使用旧版生命周期钩子。

### 4.2 交互与事件
- **回调模式**: 统一通过回调 Props (如 `onclick`) 传递事件。严禁使用 `createEventDispatcher`。
- **组件插槽**: 统一使用 `{#snippet}` 和 `{@render}`。严禁使用 `<slot />`。

---

## 5. 组件标准构成 (Component Anatomy)
一个标准的 PEP 组件必须包含以下结构：
1.  **最外层**: `PepFloorContainer`（处理间距、背景、移动端显隐）。
2.  **头部**: `PepTitle`（处理主副标题、More 链接）。
3.  **内容区**: 采用 UnoCSS 布局容器（如 `grid`, `flex`）。
4.  **原子引用**: 内部元素优先调用 `PepButton`、`PepText` 等标准原子。

---

## 6. 质量保证与演进 (QA & Evolution)

### 6.1 测试一致性 (Test Consistency)
- **测试数据**: 必须引用 `src/lib/test-data.ts`。禁止在测试文件中伪造数据。
- **标准化断言**: 复用原子组件的区域必须使用 `shared/test-utils` 提供的标准断言工具。

### 6.2 演进与迁移策略
- **破坏性变更**: 必须提供迁移脚本或详细的 `MIGRATION.md`。
- **AI 协同**: 每次更新 `shared/ui` 后，必须运行 `scripts/generate_ai_manifest.js`，确保 AI 的“大脑”保持同步。

---

## 7. 强制执行 (Enforcement)
- **代码评审 (CR)**: 违反法典的代码不得合并。
- **AI 指导**: AI Agent 在执行任务前必须解析本法典，将其作为上下文注入。
- **自动化检查**: 引入 Lint 规则强制检查 Runes 使用规范与样式变量引用。
