<script lang="ts">
  export let theme: 'white' | 'grey' = 'white';
  export let isMergeTopSpacing: boolean = false;
  export let isMergeBottomSpacing: boolean = false;
  export let isShowMb: boolean = true;
  export let maxWidth: string = '1200px';
  export let componentName: string = '';
</script>

<div 
  class="pep-floor-container {componentName}" 
  class:theme-grey={theme === 'grey'}
  class:theme-white={theme === 'white'}
  class:merge-top={isMergeTopSpacing}
  class:merge-bottom={isMergeBottomSpacing}
  class:hide-mb={!isShowMb}
>
  <div class="pep-floor-container__inner" style="max-width: {maxWidth}">
    <slot />
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
