<script lang="ts">
  import type { Snippet } from 'svelte';

  let { 
    theme = 'white', 
    isMergeTopSpacing = false, 
    isMergeBottomSpacing = false, 
    isShowMb = true, 
    maxWidth = '1200px', 
    componentName = '',
    children
  }: {
    theme?: 'white' | 'grey';
    isMergeTopSpacing?: boolean;
    isMergeBottomSpacing?: boolean;
    isShowMb?: boolean;
    maxWidth?: string;
    componentName?: string;
    children?: Snippet;
  } = $props();
</script>

<div 
  class="pep-floor-container {componentName} {theme === 'grey' ? 'theme-grey' : 'theme-white'}" 
  class:merge-top={isMergeTopSpacing}
  class:merge-bottom={isMergeBottomSpacing}
  class:hide-mb={!isShowMb}
>
  <div class="pep-floor-container__inner" style="max-width: {maxWidth}">
    {@render children?.()}
  </div>
</div>

<style>
  .pep-floor-container {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .pep-floor-container__inner {
    margin: 0 auto;
    padding: 60px 20px;
    box-sizing: border-box;
  }

  /* 背景主题 */
  .theme-grey { background-color: #f5f5f5; }
  .theme-white { background-color: #ffffff; }

  /* 间距控制 */
  .merge-top .pep-floor-container__inner { padding-top: 0; }
  .merge-bottom .pep-floor-container__inner { padding-bottom: 0; }

  @media (max-width: 767px) {
    .hide-mb { display: none; }
    .pep-floor-container__inner { padding: 40px 16px; }
  }
</style>
