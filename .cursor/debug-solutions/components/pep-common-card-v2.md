# pep-common-card-v2 调试记录

### [问题类型] 
Svelte 4 响应式失效 / 倒计时不更新

### [影响范围] 
`pep-common-card-v2` 组件的倒计时展示及过期自动隐藏功能。

### [错误模式] 
在 Svelte 4 中，如果在模板中调用的函数内部使用了组件状态变量（如 `now`），但该变量没有作为参数显式传递给函数，或者 `{#if}` 块的条件函数没有包含该变量作为参数，Svelte 的编译器可能无法正确追踪依赖，导致变量更新时 UI 不触发重新渲染。

**错误代码示例：**
```svelte
{#if !isExpired(product.endTime)} <!-- isExpired 内部使用了 now，但未传参 -->
  <div>{getRemainingTime(product.endTime, now)}</div>
{/if}
```

### [修复方案] 
1.  **显式传参**：确保所有在模板中调用的、依赖实时变量（如 `now`）的函数都将该变量作为参数传入。
2.  **补零处理**：对倒计时的时、分、秒进行 `padStart(2, '0')` 处理，提升用户体验。

**修复后代码：**
```svelte
{#if !isExpired(product.endTime, now)}
  <div>{getRemainingTime(product.endTime, now)}</div>
{/if}
```

### [审计关键词] 
`setInterval`, `Date.now()`, `onMount`
`grep -r "setInterval" .`
