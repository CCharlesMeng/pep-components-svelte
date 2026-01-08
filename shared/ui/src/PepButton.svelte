<script lang="ts">
  let { 
    text = '', 
    href = '', 
    btnType = 'pep-btn-primary', 
    target = '_blank', 
    customClass = '',
    onclick
  }: {
    text?: string;
    href?: string;
    btnType?: 'pep-btn-primary' | 'pep-btn-secondary' | 'pep-btn-ghost';
    target?: '_blank' | '_self';
    customClass?: string;
    onclick?: (event: MouseEvent) => void;
  } = $props();

  function handleClick(event: MouseEvent) {
    if (href) {
      window.open(href, target);
    }
    onclick?.(event);
  }
</script>

<button 
  class="pep-button {btnType} {customClass}"
  onclick={handleClick}
>
  {text}
</button>

<style>
  /* 基础结构保留，视觉样式移至 UnoCSS */
  .pep-button {
    flex: 1;
    max-width: 1200px;
    box-sizing: border-box;
  }
</style>
