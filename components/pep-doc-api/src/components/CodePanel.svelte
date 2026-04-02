<script lang="ts">
  import type { ApiCodePanelBlock } from '../types';

  let { title, request, responses }: ApiCodePanelBlock = $props();

  let activeResponseIndex = $state(0);
  let copied = $state(false);
  let responseCopied = $state(false);

  const activeResponse = $derived(responses[activeResponseIndex]);

  function highlightCode(code: string, language: string): string {
    if (language === 'json' || code.trimStart().startsWith('{') || code.trimStart().startsWith('[')) {
      return highlightJSON(code);
    }
    return highlightCurl(code);
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightJSON(code: string): string {
    const escaped = escapeHtml(code);
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            return `<span class="json-key">${match}</span>`;
          }
          return `<span class="json-string">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
        if (/null/.test(match)) return `<span class="json-null">${match}</span>`;
        return `<span class="json-number">${match}</span>`;
      }
    );
  }

  function highlightCurl(code: string): string {
    const escaped = escapeHtml(code);
    return escaped
      .replace(/^(curl)/gm, '<span class="curl-cmd">$1</span>')
      .replace(/(--\w[\w-]*)/g, '<span class="curl-flag">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="curl-string">$1</span>')
      .replace(/(https?:\/\/[^\s\\'"<>]+)/g, '<span class="curl-url">$1</span>');
  }

  function copyToClipboard(text: string, which: 'request' | 'response') {
    navigator.clipboard?.writeText(text).then(() => {
      if (which === 'request') {
        copied = true;
        setTimeout(() => { copied = false; }, 2000);
      } else {
        responseCopied = true;
        setTimeout(() => { responseCopied = false; }, 2000);
      }
    });
  }

  const requestHighlighted = $derived(highlightCode(request.code, request.language));
  const responseHighlighted = $derived(activeResponse ? highlightJSON(activeResponse.body) : '');
</script>

<div class="code-panel">
  <div class="code-panel__request">
    <div class="code-panel__toolbar">
      <span class="code-panel__title">{title}</span>
      <div class="code-panel__toolbar-right">
        <span class="code-panel__lang">{request.language.toUpperCase()}</span>
        <button
          class="code-panel__copy-btn"
          onclick={() => copyToClipboard(request.code, 'request')}
          title="复制代码"
          type="button"
        >
          {#if copied}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          {/if}
        </button>
      </div>
    </div>
    <pre class="code-panel__code"><code>{@html requestHighlighted}</code></pre>
  </div>

  {#if responses.length > 0}
    <div class="code-panel__response">
      <div class="code-panel__response-tabs">
        {#each responses as resp, i}
          <button
            class="code-panel__tab"
            class:active={activeResponseIndex === i}
            onclick={() => { activeResponseIndex = i; }}
            type="button"
          >
            {resp.status}
          </button>
        {/each}
        <button
          class="code-panel__copy-btn code-panel__copy-btn--ml"
          onclick={() => activeResponse && copyToClipboard(activeResponse.body, 'response')}
          title="复制响应"
          type="button"
        >
          {#if responseCopied}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          {/if}
        </button>
      </div>
      {#if activeResponse}
        <pre class="code-panel__code"><code>{@html responseHighlighted}</code></pre>
      {/if}
    </div>
  {/if}
</div>

<style>
  .code-panel {
    margin: 16px 0 24px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  }

  .code-panel__request {
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
  }

  .code-panel__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .code-panel__title {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }

  .code-panel__toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .code-panel__lang {
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    letter-spacing: 0.05em;
  }

  .code-panel__copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;
  }

  .code-panel__copy-btn:hover {
    color: #374151;
    background: #e5e7eb;
  }

  .code-panel__copy-btn--ml {
    margin-left: auto;
  }

  .code-panel__code {
    margin: 0;
    padding: 16px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.6;
    color: #1f2937;
    white-space: pre;
  }

  .code-panel__code code {
    font-family: inherit;
    font-size: inherit;
  }

  :global(.json-key)    { color: #0f766e; }
  :global(.json-string) { color: #b45309; }
  :global(.json-number) { color: #1d4ed8; }
  :global(.json-bool)   { color: #7c3aed; }
  :global(.json-null)   { color: #7c3aed; }
  :global(.curl-cmd)    { color: #1d4ed8; font-weight: 600; }
  :global(.curl-flag)   { color: #7c3aed; }
  :global(.curl-string) { color: #b45309; }
  :global(.curl-url)    { color: #0891b2; }

  .code-panel__response {
    background: #f8fafc;
  }

  .code-panel__response-tabs {
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #e5e7eb;
    gap: 4px;
  }

  .code-panel__tab {
    padding: 10px 12px;
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

  .code-panel__tab:hover {
    color: #374151;
  }

  .code-panel__tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  @media (max-width: 767px) {
    .code-panel__code {
      font-size: 12px;
      padding: 12px;
    }
  }
</style>
