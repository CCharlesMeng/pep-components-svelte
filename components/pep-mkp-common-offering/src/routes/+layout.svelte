<script lang="ts">
	import type { Snippet } from 'svelte';
	import SharedLayout from "../../../../templates/Layout.svelte";

	let { children }: { children?: Snippet } = $props();
</script>

<SharedLayout>
	{@render children?.()}
</SharedLayout>
