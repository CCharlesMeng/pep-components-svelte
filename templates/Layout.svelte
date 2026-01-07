<script lang="ts">
    import type { Snippet } from 'svelte';
    import favicon from "./assets/favicon.svg";

    let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
