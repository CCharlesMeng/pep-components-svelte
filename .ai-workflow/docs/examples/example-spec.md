# [组件名称] 组件规格文档

> 本文档是 spec.md 的模板示例，用于引导您编写规范的组件规格文档。
> 删除本说明后，根据实际组件需求填写以下章节。

---

## 概述

### 组件目标
简要描述组件的核心功能和设计目标（2-3句话）。

**示例**:
> `pep-button` 是一个可复用的按钮组件，支持多种样式变体、加载状态和禁用状态。设计目标是提供一致的用户体验，同时保持高度的可定制性。

### 使用场景
列出 3-5 个主要使用场景。

**示例**:
- 表单提交按钮
- 操作确认/取消按钮
- 导航按钮
- 图标按钮
- 加载/异步操作按钮

---

## 功能需求

### 1. Props 接口

列出组件的所有 Props，包括类型、默认值和说明。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | 按钮样式变体 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 是否显示加载状态 |
| `fullWidth` | `boolean` | `false` | 是否占据全宽 |
| `icon` | `string \| Component` | `undefined` | 图标（可选） |

**详细说明**:

#### variant
- `primary`: 主要操作按钮（蓝色背景）
- `secondary`: 次要操作按钮（灰色背景）
- `danger`: 危险操作按钮（红色背景）

#### size
- `small`: 28px 高度，适用于紧凑空间
- `medium`: 36px 高度，默认尺寸
- `large`: 44px 高度，适用于移动端或强调场景

#### loading
- 显示加载图标
- 禁用点击事件
- 按钮文字保持可见但淡化

---

### 2. 事件

列出组件触发的所有事件。

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `MouseEvent` | 点击按钮时触发（非禁用/加载状态） |
| `focus` | `FocusEvent` | 按钮获得焦点时触发 |
| `blur` | `FocusEvent` | 按钮失去焦点时触发 |

**事件行为**:
- `click` 事件在 `disabled` 或 `loading` 状态下不触发
- 支持键盘操作（Enter/Space 触发 click）

---

### 3. 插槽（Slots）

如果组件支持插槽，列出说明。

| 插槽 | 说明 |
|------|------|
| `default` | 按钮文本内容 |
| `icon` | 自定义图标插槽 |

---

### 4. 样式定制

列出可定制的样式变量。

```css
/* 可通过 CSS 变量定制的样式 */
--pep-button-primary-bg: #1976d2;
--pep-button-primary-hover: #1565c0;
--pep-button-border-radius: 4px;
--pep-button-font-weight: 500;
```

---

## 样式要求

### 视觉设计

#### 配色方案
- **Primary**: 蓝色系，用于主要操作
- **Secondary**: 灰色系，用于次要操作
- **Danger**: 红色系，用于危险/删除操作

#### 状态
- **Normal**: 默认状态
- **Hover**: 鼠标悬停，颜色加深 10%
- **Active**: 按下状态，颜色加深 20%
- **Disabled**: 50% 不透明度，不可点击
- **Loading**: 显示加载图标，禁用点击

#### 尺寸
- **Small**: 高度 28px，padding 0 12px，字号 13px
- **Medium**: 高度 36px，padding 0 16px，字号 14px
- **Large**: 高度 44px，padding 0 20px，字号 16px

### 响应式
- 移动端默认使用 `large` 尺寸
- `fullWidth` 在小屏幕下自动启用

### 主题支持
- 支持亮色/暗色模式切换
- 自动适配系统主题

---

## 无障碍要求

### ARIA 属性
- `role="button"` - 明确按钮角色
- `aria-disabled="true"` - 禁用状态
- `aria-busy="true"` - 加载状态
- `aria-label` - 仅图标按钮时必需

### 键盘支持
- **Tab**: 焦点导航
- **Enter/Space**: 触发点击
- **Shift+Tab**: 反向导航

### 焦点样式
- 提供清晰的焦点指示器
- 符合 WCAG 2.1 AA 标准

---

## 技术实现

### 技术栈
- **框架**: Svelte 4+
- **语言**: TypeScript
- **样式**: CSS Modules 或 SCSS
- **测试**: Vitest + Testing Library

### 组件结构
```
src/
├── pep-button.svelte          # 主组件
├── pep-button.module.scss     # 样式
├── pep-button.types.ts        # TypeScript 类型
└── __tests__/
    └── pep-button.test.ts     # 单元测试
```

### 依赖
- 无外部 UI 库依赖
- 可选：图标库（如 `lucide-svelte`）

---

## 使用示例

### 基础用法

```svelte
<script>
  import { Button } from '@pep/button';
  
  function handleClick() {
    console.log('Button clicked');
  }
</script>

<Button on:click={handleClick}>
  点击我
</Button>
```

### 不同变体

```svelte
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="danger">危险按钮</Button>
```

### 不同尺寸

```svelte
<Button size="small">小按钮</Button>
<Button size="medium">中按钮</Button>
<Button size="large">大按钮</Button>
```

### 状态

```svelte
<Button disabled>禁用按钮</Button>
<Button loading>加载中...</Button>
```

### 带图标

```svelte
<script>
  import { Plus } from 'lucide-svelte';
</script>

<Button icon={Plus}>
  添加
</Button>

<!-- 或使用插槽 -->
<Button>
  <svelte:fragment slot="icon">
    <Plus />
  </svelte:fragment>
  添加
</Button>
```

### 全宽按钮

```svelte
<Button fullWidth>
  全宽按钮
</Button>
```

---

## 测试要求

### 单元测试

必须覆盖的测试用例：

1. **渲染测试**
   - ✅ 正确渲染文本内容
   - ✅ 正确渲染图标
   - ✅ 应用正确的 variant 样式

2. **交互测试**
   - ✅ 点击触发 `click` 事件
   - ✅ 禁用状态不触发 `click`
   - ✅ 加载状态不触发 `click`
   - ✅ 键盘 Enter/Space 触发点击

3. **Props 测试**
   - ✅ 各种 variant 正确应用
   - ✅ 各种 size 正确应用
   - ✅ `disabled` prop 正常工作
   - ✅ `loading` prop 显示加载状态

4. **无障碍测试**
   - ✅ 正确的 ARIA 属性
   - ✅ 键盘导航正常
   - ✅ 焦点样式清晰

### 集成测试（可选）
- 表单中的按钮行为
- 与其他组件的交互

### 目标覆盖率
- 代码覆盖率 > 80%
- 分支覆盖率 > 75%

---

## 文档要求

### README.md

必须包含以下章节：

1. **概述** - 组件简介和特性列表
2. **安装** - 安装和引入方式
3. **用法** - 基础用法和代码示例
4. **Props** - 完整的 Props 列表
5. **事件** - 事件列表和说明
6. **样式定制** - CSS 变量和主题定制
7. **无障碍** - 无障碍特性说明
8. **示例** - 多个实际使用示例

### API 文档
- 使用 TypeScript 类型自动生成
- 或使用 Storybook 展示

---

## 性能要求

### 性能指标
- 首次渲染 < 10ms
- 点击响应 < 50ms
- 包体积 < 5KB (gzip)

### 优化建议
- 避免不必要的重渲染
- 使用 CSS 动画而非 JS
- 懒加载图标

---

## 浏览器兼容性

### 支持的浏览器
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端 iOS Safari 14+
- 移动端 Chrome 90+

### 不支持
- IE 11（已停止支持）

---

## 未来扩展

可能的未来功能（当前不实现）：

- [ ] 按钮组（ButtonGroup）
- [ ] 悬浮按钮（FAB）
- [ ] 分裂按钮（Split Button）
- [ ] 动画效果自定义
- [ ] 更多 variant（outline, ghost, link）

---

## 参考

### 设计参考
- Material Design Button
- Ant Design Button
- Chakra UI Button

### 无障碍参考
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices - Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

---

## 版本历史

- **v1.0.0** - 初始版本，包含基础功能

---

**注意**: 
1. 本规格文档作为组件开发的唯一真实来源
2. 任何功能变更都应先更新本文档
3. 使用 `pep-dev spec <component>` 可以从本文档自动生成 `features.json`
