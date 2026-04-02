<script lang="ts">
  import type { Block } from '../types';
  import ApiEndpoint from './ApiEndpoint.svelte';
  import CodePanel from './CodePanel.svelte';
  import ApiParamItem from './ApiParamItem.svelte';
  import TabsBlock from './TabsBlock.svelte';

  let { blocks }: { blocks: Block[] } = $props();
</script>

{#each blocks as block}
  {#if block.type === 'paragraph'}
    <p class="block-paragraph">{block.text}</p>
  {:else if block.type === 'api-endpoint'}
    <ApiEndpoint {...block} />
  {:else if block.type === 'api-code-panel'}
    <CodePanel {...block} />
  {:else if block.type === 'api-param'}
    <ApiParamItem {...block} />
  {:else if block.type === 'tabs'}
    <TabsBlock {...block} />
  {/if}
{/each}

<style>
  .block-paragraph {
    margin: 0 0 16px;
    font-size: 14px;
    color: #374151;
    line-height: 1.7;
    white-space: pre-wrap;
  }
</style>
