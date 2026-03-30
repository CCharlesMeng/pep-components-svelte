# PC 与移动端的开发策略

## 当前实现方式

- `index.svelte` 用 `matchMedia("(max-width: 768px)")` 分流
- `MobileFlow.svelte`（718 行）是完全独立的组件
- 共享了 `utils/`（phase2、link-open-policy、remote-content-loader 等）和 `markdown-content.css`
- schema.json 中 `mobile` 是 PC 配置的**可选覆盖 + 部分独有字段**

## 分开还是一起？对比分析

| 维度 | 一起搞（当前） | 分开搞（建议） |
|------|---------------|---------------|
| **JSON/Schema** | mobile 嵌套在主 schema 里，继承关系隐晦 | 保持一份 schema，但 mobile 部分应有**独立且完整的默认值定义**，而非依赖 `resolveMobileSteps` 这种运行时继承 |
| **HTML 结构** | 完全不同的 DOM 树，这是对的 | 不变 |
| **CSS** | 共享 `markdown-content.css`，其余各自 scoped | 不变，但建议提取更多共享样式变量 |
| **开发顺序** | 穿插开发，移动端是后期加入 | **先完成 PC 端全部功能 → 再开发移动端**，因为移动端是 PC 的子集，先有完整的 PC 实现作为参照，移动端开发会快很多 |
| **对代码的影响** | `resolveMobileConfig` 和 `resolveMobileSteps` 是"桥接"逻辑 | 如果 mobile schema 自成一体，这些 resolver 会更简单，甚至可以消除 |

## 核心观点

移动端的问题不在于代码组织（`MobileFlow` 独立是正确的），而在于**数据层的隐式依赖**。

`mobile.steps` 为空时继承 PC 第一个 tab 的默认应用步骤——这种"智能默认"增加了理解成本和 bug 概率。

## 建议的改进

1. **Schema 层面**：mobile 应声明自己需要的所有字段，不依赖 PC 侧的继承
2. **开发顺序**：先 PC 后 Mobile，因为 Mobile 是 PC 功能的子集
3. **共享层**：提取更多共享工具（见 [缺失的组件库](./05-missing-component-library.md) 中步骤条、Loading 等分析）
