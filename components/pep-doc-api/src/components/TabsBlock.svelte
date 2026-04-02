<script lang="ts">
  import type { TabsBlock } from '../types';
  import ApiParamItem from './ApiParamItem.svelte';

  let { items }: TabsBlock = $props();

  let activeIndex = $state(0);

  const activeItem = $derived(items[activeIndex]);
</script>

<div class="tabs-block">
  <div class="tabs-block__nav">
    {#each items as item, i}
      <button
        class="tabs-block__tab"
        class:active={activeIndex === i}
        onclick={() => { activeIndex = i; }}
        type="button"
      >
        {item.title}
      </button>
    {/each}
  </div>

  {#if activeItem}
    <div class="tabs-block__panel">
      {#if activeItem.content_type || activeItem.description}
        <div class="tabs-block__panel-header">
          {#if activeItem.description}
            <span class="tabs-block__description">{activeItem.description}</span>
          {/if}
          {#if activeItem.content_type}
            <span class="tabs-block__content-type">{activeItem.content_type}</span>
          {/if}
        </div>
      {/if}

      <div class="tabs-block__content">
        {#each activeItem.content as block}
          {#if block.type === 'api-param'}
            <ApiParamItem {...block} />
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .tabs-block__nav {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    gap: 0;
  }

  .tabs-block__tab {
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    margin-bottom: -1px;
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  }

  .tabs-block__tab:hover {
    color: #374151;
  }

  .tabs-block__tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
    font-weight: 600;
  }

  .tabs-block__panel {
    padding-top: 4px;
  }

  .tabs-block__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
    margin-bottom: 4px;
  }

  .tabs-block__description {
    font-size: 13px;
    color: #6b7280;
  }

  .tabs-block__content-type {
    font-size: 12px;
    color: #6b7280;
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  .tabs-block__content {
    padding: 4px 0;
  }
</style>
