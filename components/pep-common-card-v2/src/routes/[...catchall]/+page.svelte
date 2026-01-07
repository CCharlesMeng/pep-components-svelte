<script lang="ts">
  import PepCommonCardV2 from '../../pep-common-card-v2.svelte';
  import { expiredConfig, leftLayoutConfig } from '$lib/test-data';
  
  export let data;
  $: ({ config } = data);
</script>

<div class="demo-container">
  <h1>pep-common-card-v2 组件预览</h1>
  
  <div class="demo-section">
    <h2>1. 完整 Tab 模式与倒计时展示 (来自 data.json)</h2>
    <p class="demo-tip">包含多页签切换及“迁移中心 MgC”右上角的倒计时显示</p>
    <PepCommonCardV2 {...config} isShowMb={true} />
  </div>

  <div class="demo-section">
    <h2>2. 倒计时过期隐藏逻辑测试</h2>
    <p class="demo-tip">下方原本有 2 个产品，其中一个因 `endTime` 设置在 2020 年而已被隐藏</p>
    <PepCommonCardV2 {...expiredConfig} isShowMb={true} />
  </div>

  <div class="demo-section">
    <h2>3. 居左布局与多列适配示例</h2>
    <PepCommonCardV2 {...leftLayoutConfig} />
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #f0f2f5;
  }

  .demo-container {
    width: 100%;
    margin: 0 auto;
    padding: 2rem 0;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
    text-align: center;
  }

  .demo-section {
    margin-bottom: 3rem;
    background: #fff;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    padding-bottom: 2rem;
  }

  .demo-section h2 {
    max-width: 1200px;
    margin: 0 auto 0.5rem;
    font-size: 1.5rem;
    color: #555;
    padding: 2rem 20px 0;
  }

  .demo-tip {
    max-width: 1200px;
    margin: 0 auto 1.5rem;
    color: #999;
    font-size: 14px;
    padding: 0 20px;
  }
</style>
