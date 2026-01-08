<script lang="ts">
  import PepProductAdvantageV2 from '../../pep-product-advantage-v2.svelte';
  
  let { data } = $props();
  const config = $derived(data.config);
</script>

<div class="demo-container">
  <h1>pep-product-advantage-v2 组件预览</h1>
  
  <div class="demo-section">
    <h2>从 data.json 加载的示例</h2>
    <PepProductAdvantageV2 
      baseInfo={config.baseInfo}
      cardItemLists={config.cardItemLists}
    />
  </div>

  <div class="demo-section" dir="rtl">
    <h2>RTL 镜像示例</h2>
    <PepProductAdvantageV2 
      baseInfo={{...config.baseInfo, title: config.baseInfo.title + ' (RTL)'}}
      cardItemLists={config.cardItemLists}
    />
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    background-color: #f0f2f5;
  }

  .demo-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
    text-align: center;
  }

  .demo-section {
    margin-bottom: 3rem;
    padding: 2rem;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .demo-section h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #555;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
</style>
