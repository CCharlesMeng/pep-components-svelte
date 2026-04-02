<script lang="ts">
  import type { ApiEndpointBlock } from '../types';

  let { method, path }: ApiEndpointBlock = $props();

  const methodColors: Record<string, string> = {
    GET: 'method--get',
    POST: 'method--post',
    PUT: 'method--put',
    DELETE: 'method--delete',
    PATCH: 'method--patch',
    HEAD: 'method--head',
  };

  const colorClass = $derived(methodColors[method] ?? 'method--post');
</script>

<div class="api-endpoint">
  <div class="api-endpoint__bar">
    <span class="api-endpoint__method {colorClass}">{method}</span>
    <span class="api-endpoint__path">{path}</span>
  </div>
</div>

<style>
  .api-endpoint {
    margin: 16px 0;
  }

  .api-endpoint__bar {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 16px;
    background: #fff;
  }

  .api-endpoint__method {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
    letter-spacing: 0.05em;
    color: #fff;
    white-space: nowrap;
  }

  .method--get    { background: #10b981; }
  .method--post   { background: #3b82f6; }
  .method--put    { background: #f59e0b; }
  .method--delete { background: #ef4444; }
  .method--patch  { background: #8b5cf6; }
  .method--head   { background: #6b7280; }

  .api-endpoint__path {
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
    font-size: 14px;
    color: #374151;
    word-break: break-all;
  }
</style>
