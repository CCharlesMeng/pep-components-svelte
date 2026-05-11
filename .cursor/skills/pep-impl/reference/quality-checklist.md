# 代码质量检查清单

> 本文件是 pep-impl 的参考资料，在阶段 7 由主 SKILL.md 引用。
> 生成代码后，逐一检查以下各项。

---

## 代码规范

- □ script 块内的导入顺序正确（Svelte → 第三方 → 共享 → 本地）
- □ 使用 $props() 而非 export let（Svelte 5 规范）
- □ 使用 $state() 而非 let（需要响应式的变量）
- □ 使用 $derived() 而非 $: 计算
- □ 事件用 onclick={} 而非 on:click（Svelte 5 规范）
- □ 无 TypeScript 类型错误（类型与 types.ts 一致）

---

## 样式规范

- □ style 块声明为 `<style lang="less">`
- □ 根元素 class 与组件包名一致（kebab-case）
- □ 子元素用 BEM 命名，Less 嵌套书写（&__element / &--modifier）
- □ 无 inline style（除 CSS 变量传递，如 `style="--col-count: {n};"` ）
- □ 媒体查询按断点集中写在组件根块末尾，从大到小排列，不逐元素分散
- □ 颜色使用 PortalUI token（--por-color-text-primary 等），不硬编码色值
- □ 字重使用 PortalUI token（--por-base-font-weight-bold 等）
- □ 文本排版优先使用 PortalUI class（por-text-title-t7、por-text-body-t3 等）
- □ 间距使用项目 CSS 变量（var(--primitive-space-*)）
- □ 若 spec 要求整层隐藏：isShowMb === false 时，移动端通过 CSS 隐藏（Level 4，罕见）
- □ merge-top / merge-bottom 由 Floor 的 mergeTopSpacing / mergeBottomSpacing 处理（不手写 CSS）

---

## 响应式分级合规

- □ PortalUI 组件/类名的部分未重复编写响应式规则（PortalUI 自带适配）
- □ 每处 PC/移动端差异都选择了最低可行 Level（0→1→2→3→4）
- □ 移动端断点统一使用 767px（不用 768px）
- □ 设备切换类名使用 .pc-only / .mb-only（不用 --pc / --mb 双划线）
- □ *Mb 后缀数据字段仅在 Level 2 场景使用，模板中有 fieldMb || field fallback
- □ Level 3 区块切换前已确认 CSS flex/grid 无法实现

---

## PortalUI 合规

- □ 楼层容器使用 `<Floor>` 组件，不手写 por-section / por-container / FloorHeader
- □ 轮播使用 `<Carousel>` 组件，幻灯片加 por-carousel-slide class
- □ 轮播 **layout（preview / free）与 transition（slide / fade）** 已与用户/spec 一致；free 与多图 `preview` 未混用错场景
- □ `layout="free"` 时，业务样式已按标准落地 `--por-carousel-slide-gap: 24px`（除非 spec 明确给出其他值）
- □ 外部容器已设置 `overflow: hidden`（通常挂在 `por-section`，也允许按业务挂在其他包裹容器）
- □ 外部组件样式已写明“容器 class + `:global(...)` 命中 + 变量值”，不是口头“按需调整”
- □ 未为单业务需求直接改 shared/ui 组件源码，优先通过业务侧样式契约覆写
- □ 按钮使用 PortalUI 按钮类（por-btn-primary / por-btn-secondary / por-btn-dark）
- □ 图标使用 PortalUI 图标类（por-icon por-icon-xxx）
- □ 无硬编码颜色值（#191919、#595959 等），全部用 PortalUI token 替代

---

## SSR 水合安全

- □ 无任何 window / document / navigator 访问（初始化阶段）
- □ 无根据屏幕宽度决定渲染结构的 $state 变量
- □ onMount 内无修改影响 HTML 结构的状态
- □ PC/移动端差异全部由 CSS media query 控制

---

## 功能完整性

- □ 所有 spec.md 中列出的 Props 都在组件中有对应处理
- □ 所有交互行为按 spec 描述实现
- □ 边界情况有处理（空数据、缺字段等）
- □ {@render props.children?.()} 保留扩展能力
