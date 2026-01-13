# Svelte 5 迁移指南 & 常见问题 (Global)

[问题类型] Svelte 5 弃用警告与响应式失效
[影响范围] 全仓库 Svelte 组件
[错误模式]
1. 使用 `<slot />` 而非 `{@render children()}`。
2. 在 `$props()` 之外定义的变量未通过 `$state()` 声明，导致修改时不触发更新。
3. 使用 `on:click` 等 Svelte 4 事件指令而非 `onclick` 等属性。

[修复方案]
1. 将 `<slot />` 替换为 `{@render children?.()}`，并在 `$props` 中声明 `children: Snippet`。
2. 使用 `let var = $state(initialValue)` 声明需要响应式的本地变量。
3. 将 `on:click={handler}` 替换为 `onclick={handler}`。对于修饰符如 `|stopPropagation`，在 handler 内部调用 `e.stopPropagation()`。

[审计关键词] `grep -r "on:click" .`, `grep -r "<slot" .`, `grep -r "\$: " .`
