<script lang="ts">
  let { 
    title = '', 
    titleMb = '', 
    subtitle = '', 
    subtitleMb = '', 
    more = { text: '', href: '' }, 
    textAlign = 'center' 
  }: {
    title?: string;
    titleMb?: string;
    subtitle?: string;
    subtitleMb?: string;
    more?: { text?: string; href?: string };
    textAlign?: 'left' | 'center';
  } = $props();
</script>

{#if title || subtitle || titleMb || subtitleMb}
  <div class="pep-title {textAlign === 'left' ? 'text-left' : 'text-center'}">
    {#if title || titleMb}
      <h2 class="pep-title__main">
        <span class="pc-only">{@html title}</span>
        <span class="mb-only">{@html titleMb || title}</span>
      </h2>
    {/if}
    {#if subtitle || subtitleMb}
      <div class="pep-title__sub">
        <span class="pc-only">{@html subtitle}</span>
        <span class="mb-only">{@html subtitleMb || subtitle}</span>
      </div>
    {/if}
    {#if more?.text}
      <a href={more.href} class="pep-title__more" target="_blank">
        {more.text} &gt;
      </a>
    {/if}
  </div>
{/if}

<style>
  .pep-title {
    margin-bottom: 40px;
    position: relative;
    width: 100%;
  }

  .text-center { text-align: center; }
  .text-left { text-align: left; }

  .pep-title__main {
    font-size: 32px;
    font-weight: 600;
    color: #111;
    margin: 0;
    line-height: 1.4;
  }

  .pep-title__main :global(p) { margin: 0; }

  .pep-title__sub {
    font-size: 16px;
    color: #666;
    margin-top: 12px;
    line-height: 1.6;
  }

  .pep-title__more {
    display: inline-block;
    margin-top: 16px;
    font-size: 14px;
    color: #3b82f6;
    text-decoration: none;
  }

  .pep-title__more:hover { text-decoration: underline; }

  .pc-only { display: block; }
  .mb-only { display: none; }

  @media (max-width: 767px) {
    .pc-only { display: none; }
    .mb-only { display: block; }
    .pep-title__main { font-size: 24px; }
    .pep-title { margin-bottom: 32px; }
  }
</style>
