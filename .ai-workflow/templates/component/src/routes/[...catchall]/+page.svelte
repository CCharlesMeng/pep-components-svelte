<script lang="ts">
  import {{COMPONENT_NAME_PASCAL}} from '../../{{COMPONENT_NAME}}.svelte';
  
  export let data;
  $: ({ config } = data);
</script>

<div class="demo-container">
  <h1>{{COMPONENT_NAME}} 组件预览</h1>
  
  <div class="demo-section">
    <h2>从 data.json 加载的示例</h2>
    <{{COMPONENT_NAME_PASCAL}} 
      title={config.title}
      description={config.description}
      buttonText={config.buttonText}
    >
      这是通过 data.json 配置的内容
    </{{COMPONENT_NAME_PASCAL}}>
  </div>

  <div class="demo-section">
    <h2>手动传参示例</h2>
    <{{COMPONENT_NAME_PASCAL}} 
      title="手动标题" 
      description="这是手动传入的描述文本"
      className="custom-style"
    >
      手动传入内容的示例
    </{{COMPONENT_NAME_PASCAL}}>
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
    max-width: 1200px;
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

  :global(.custom-style) {
    border: 2px dashed #3b82f6 !important;
  }
</style>

