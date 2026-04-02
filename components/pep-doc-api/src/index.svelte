<script lang="ts">
  import type { PepDocApiProps } from './types';
  import BlockRenderer from './components/BlockRenderer.svelte';

  let props: PepDocApiProps = $props();

  const {
    title = '',
    category = '',
    content = [],
    sections = [],
  } = props;
</script>

<div class="pep-doc-api">
  <div class="pep-doc-api__header">
    {#if category}
      <span class="pep-doc-api__category">{category}</span>
    {/if}
    <h1 class="pep-doc-api__title">{title}</h1>
  </div>

  <div class="pep-doc-api__content">
    <BlockRenderer blocks={content} />
  </div>

  {#each sections as section}
    <div class="pep-doc-api__section">
      <div class="pep-doc-api__section-header">
        <h4 class="pep-doc-api__section-title">{section.title}</h4>
        {#if section.content_type}
          <span class="pep-doc-api__content-type">{section.content_type}</span>
        {/if}
      </div>
      <div class="pep-doc-api__section-body">
        <BlockRenderer blocks={section.content} />
      </div>
    </div>
  {/each}
</div>

<style>
  .pep-doc-api {
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    padding: 24px;
    max-width: 800px;
  }

  .pep-doc-api__header {
    margin-bottom: 20px;
  }

  .pep-doc-api__category {
    display: inline-block;
    font-size: 13px;
    font-weight: 500;
    color: #3b82f6;
    margin-bottom: 8px;
  }

  .pep-doc-api__title {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    line-height: 1.3;
  }

  .pep-doc-api__content {
    margin-bottom: 8px;
  }

  .pep-doc-api__section {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }

  .pep-doc-api__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .pep-doc-api__section-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }

  .pep-doc-api__content-type {
    font-size: 12px;
    color: #6b7280;
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    background: #f3f4f6;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
  }

  .pep-doc-api__section-body {
    padding: 0;
  }

  @media (max-width: 767px) {
    .pep-doc-api__title {
      font-size: 22px;
    }

    .pep-doc-api__section {
      margin-top: 24px;
      padding-top: 16px;
    }
  }
</style>
