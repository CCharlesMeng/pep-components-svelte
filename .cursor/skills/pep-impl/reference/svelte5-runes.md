# Svelte 5 Runes 速查

> 本文件是 pep-impl 的参考资料，由主 SKILL.md 按需引用。

---

```svelte
<script lang="ts">
  // Props（代替 export let）
  let props: MyProps = $props();
  const { theme = 'white', list = [] } = props;

  // 响应式状态（代替 let）
  let count = $state(0);
  let activeIndex = $state(0);

  // 派生计算（代替 $: 计算语句）
  const activeItem = $derived(list[activeIndex]);
  const total = $derived(list.length);

  // 副作用（只用于不影响 HTML 结构的操作）
  $effect(() => {
    // 定时器、事件监听、第三方库初始化等
    return () => { /* 清理函数 */ };
  });
</script>
```

## 关键对照

| Svelte 4 | Svelte 5 | 说明 |
|-----------|----------|------|
| `export let prop` | `let props = $props()` | Props 声明 |
| `let x = 0` (响应式) | `let x = $state(0)` | 响应式状态 |
| `$: derived = x * 2` | `const derived = $derived(x * 2)` | 派生计算 |
| `$: { sideEffect() }` | `$effect(() => { sideEffect() })` | 副作用 |
| `on:click={handler}` | `onclick={handler}` | 事件绑定 |

## 注意事项

- **保守使用 $effect**：大多数场景用 `$derived` 即可，`$effect` 只用于真正的副作用（定时器、事件监听、第三方 JS 库初始化）
- **onMount 限制**：只能用于不影响 HTML 结构的副作用，不能修改会影响 HTML 输出的响应式状态
