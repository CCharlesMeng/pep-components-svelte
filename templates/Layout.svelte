<script lang="ts">
    import type { Snippet } from "svelte";
    import favicon from "./assets/favicon.svg";

    let { children } = $props<{ children: Snippet }>();
</script>

{@render children()}
