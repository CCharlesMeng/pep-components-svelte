---
description: 项目架构规范、组件开发准则与禁止事项
globs: components/**/*, shared/**/*
---

# PEP Svelte 组件架构与开发规范

本规则定义了 PEP 项目（Svelte 5）的架构原则、组件开发流程及必须遵守/避免的规则。

## 🏗 架构原则 (Architecture Principles)

- **整洁架构 (Clean Architecture)**: 严格遵守依赖规则。UI 层（Svelte）依赖应用层（State Primitives），应用层依赖领域层（Pure Logic & Types）。内层逻辑严禁引用外层 UI。
- **Unix 哲学**: 一个组件只做一件事，并做好。通过组合（Composition）而非继承（Inheritance）解决复杂问题。
- **特征架构 (Trait-based Architecture)**: 使用 `shared/ui/traits.ts` 和 `shared/ui/types.ts` 进行通用能力的复用与分发。

## 📂 目录结构规范

每个新组件必须遵循以下结构：
- `src/index.svelte`: 组件入口，负责属性分拣（pickTrait）与子组件分发。
- `src/types.ts`: 类型定义，使用 `UseTraits` 组合通用特征。
- `src/component.server.ts`: 处理服务端数据逻辑，要求不要修改。
- `src/components/`: 存放该组件特有的子组件。
- `src/state/`: 存放组件局部状态原语（`.svelte.ts`）。
- `src/logic/`: 存放纯函数逻辑。
- `tests/unit/consistency.spec.ts`: **必须**编写一致性看护测试。

## ✅ 开发新组件准则 (Do's)

### 1. 状态管理 (Svelte 5 Runes)
- 使用 `$state`, `$derived`, `$effect` 等 Runes。
- 状态逻辑必须抽取到 `.svelte.ts` 文件中，并使用 `createXXX` 命名（如 `createTimer`）。
- 必须在 `$effect` 中返回清理函数（如 `clearInterval`）。

### 2. 样式系统 (Token-based CSS)
- **必须**使用三层令牌系统：`primitives.css` -> `semantic.css` -> `themes.css`。
- 始终使用 `var(--token-name)`，禁止硬编码颜色或间距。
- 响应式遵循 **PC 优先**原则，使用 `@media (max-width: 768px)` 进行移动端适配。

### 3. 特征分拣 (Trait Picking)
- 在 `index.svelte` 中使用 `pickTrait` 显式声明属性流向：
  ```svelte
  const headerProps = $derived(pickTrait(props, 'header'));
  ```
- 在 `types.ts` 中使用 `UseTraits` 组合属性：
  ```typescript
  export type MyProps = BusinessProps & UseTraits<'header' | 'spacing'>;
  ```

### 4. 测试
- 每个组件必须有单元测试（覆盖率 > 70%）和集成测试。
- 必须包含一致性测试，确保 `schema.json` 与 `types.ts` 同步。

## ❌ 禁止事项 (Don'ts)

### 1. 命名禁止
- **严禁**使用 `useXXX` 命名状态函数（如 `useTimer`），必须使用 `createXXX` 或名词。

### 2. 样式禁止
- **严禁**硬编码颜色（如 `#ffffff`, `red`）。
- **严禁**硬编码间距（如 `padding: 16px`），必须使用 `--primitive-space-*`。
- **严禁**使用魔术数字（如 `z-index: 9999`）。

### 3. 架构禁止
- **严禁**在 UI 组件中直接调用 API。
- **严禁**在模板（HTML 部分）编写复杂逻辑。
- **严禁**在 `$effect` 之外使用 `setInterval` 或 `addEventListener` 而不清理。
- **严禁**创建“上帝组件”（God Component），Props 超过 15 个时应考虑拆分或使用 Snippets 组合。

### 4. 代码禁止
- **严禁**使用 `any` 类型（除非底层工具库必须）。
- **严禁**在主组件入口进行大规模 Props 解构，应保持 Props 对象完整性以便 `pickTrait` 使用。

## 🔍 代码审查检查点 (Review Checklist)
- [ ] 是否使用了 `pickTrait` 分拣属性？
- [ ] 状态逻辑是否已抽取到 `.svelte.ts`？
- [ ] 是否存在硬编码的 CSS 值？
- [ ] 一致性测试是否已编写并通过？
- [ ] 文件行数是否超过 200 行？（超过需拆分）