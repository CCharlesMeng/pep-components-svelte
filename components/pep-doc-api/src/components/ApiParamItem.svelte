<script lang="ts">
  import type { ApiParamBlock } from '../types';
  import ApiParamItem from './ApiParamItem.svelte';

  let { name, param_type, required, description, enum_values, example, constraints, list_items, content }: ApiParamBlock = $props();

  let expanded = $state(true);

  const hasChildren = $derived(content && content.length > 0);
</script>

<div class="api-param">
  <div class="api-param__meta">
    <code class="api-param__name">{name}</code>
    <span class="api-param__type">{param_type}</span>
    {#if required}
      <span class="api-param__badge api-param__badge--required">required</span>
    {/if}
  </div>

  <div class="api-param__body">
    {#if description}
      <p class="api-param__desc">{description}</p>
    {/if}

    {#if list_items && list_items.length > 0}
      <ul class="api-param__list">
        {#each list_items as item}
          <li>{item}</li>
        {/each}
      </ul>
    {/if}

    {#if enum_values && enum_values.length > 0}
      <div class="api-param__row">
        <span class="api-param__label">Available options:</span>
        <div class="api-param__options">
          {#each enum_values as val}
            <code class="api-param__option">{val}</code>
          {/each}
        </div>
      </div>
    {/if}

    {#if example !== null && example !== undefined}
      <div class="api-param__row">
        <span class="api-param__label">Example:</span>
        <code class="api-param__example">{example}</code>
      </div>
    {/if}

    {#if constraints && constraints.length > 0}
      <div class="api-param__constraints">
        {#each constraints as c}
          <span class="api-param__constraint">{c}</span>
        {/each}
      </div>
    {/if}

    {#if hasChildren}
      <button
        class="api-param__toggle"
        onclick={() => { expanded = !expanded; }}
        type="button"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class:rotated={!expanded}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        {expanded ? 'Hide child attributes' : 'Show child attributes'}
      </button>

      {#if expanded}
        <div class="api-param__children">
          {#each content as child}
            {#if child.type === 'api-param'}
              <ApiParamItem {...child} />
            {/if}
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .api-param {
    padding: 16px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .api-param:last-child {
    border-bottom: none;
  }

  .api-param__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }

  .api-param__name {
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    font-size: 13px;
    font-weight: 600;
    color: #0d9488;
    background: transparent;
    padding: 0;
  }

  .api-param__type {
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    font-size: 12px;
    color: #6b7280;
  }

  .api-param__badge {
    display: inline-flex;
    align-items: center;
    padding: 1px 7px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .api-param__badge--required {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .api-param__body {
    padding-left: 0;
  }

  .api-param__desc {
    margin: 0 0 8px;
    font-size: 14px;
    color: #374151;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .api-param__list {
    margin: 4px 0 8px 20px;
    padding: 0;
    font-size: 14px;
    color: #374151;
    line-height: 1.7;
  }

  .api-param__list li {
    margin-bottom: 2px;
  }

  .api-param__row {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 14px;
    color: #374151;
  }

  .api-param__label {
    color: #6b7280;
    white-space: nowrap;
  }

  .api-param__options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .api-param__option {
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    font-size: 12px;
    background: #f3f4f6;
    color: #1f2937;
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  .api-param__example {
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    font-size: 12px;
    background: #f3f4f6;
    color: #b45309;
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  .api-param__constraints {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 6px;
  }

  .api-param__constraint {
    font-size: 12px;
    color: #6b7280;
    background: #f9fafb;
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  .api-param__toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 6px 10px;
    font-size: 12px;
    color: #6b7280;
    background: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }

  .api-param__toggle svg {
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  .api-param__toggle svg.rotated {
    transform: rotate(-90deg);
  }

  .api-param__toggle:hover {
    color: #374151;
    background: #f9fafb;
  }

  .api-param__children {
    margin-top: 12px;
    padding: 8px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fafafa;
  }
</style>
