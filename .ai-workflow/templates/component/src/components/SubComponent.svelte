<script lang="ts">
  /**
   * 示例内部子组件
   */
  let { label = "子组件", count = 0 } = $props();
</script>

<div class="sub-component">
  <span class="sub-component__label">{label}:</span>
  <span class="sub-component__value">{count}</span>
</div>

<style>
  .sub-component {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    background: var(--bg-grey, #f5f5f5);
    border-radius: 4px;
    font-size: 12px;
    color: var(--text-secondary);
  }
  .sub-component__value {
    font-weight: bold;
    color: var(--brand-primary);
  }
</style>
