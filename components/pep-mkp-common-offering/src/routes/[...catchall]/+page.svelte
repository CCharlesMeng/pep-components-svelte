<script lang="ts">
  import FloorComponent from "$lib/FloorComponent.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<div style="min-height: 100vh; background-color: #eee; padding: 40px 0;">
  <FloorComponent data={data} />
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>
