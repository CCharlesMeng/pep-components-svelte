<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { {{COMPONENT_NAME_PASCAL}}Props } from './types';

  let {
    className = '',
    title = '组件标题',
    description = '这是一个示例组件，包含卡片、按钮和响应式状态',
    buttonText = '点击增加',
    children
  }: {
    className?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    children?: Snippet;
  } = $props();

  // 响应式状态
  let count = $state(0);

  // 事件处理
  function handleClick() {
    count += 1;
  }
</script>

<div class="{{COMPONENT_NAME}} {className}">
  <div class="{{COMPONENT_NAME}}__card">
    <!-- 卡片头部 -->
    <div class="{{COMPONENT_NAME}}__header">
      <h3 class="{{COMPONENT_NAME}}__title">{title}</h3>
      <p class="{{COMPONENT_NAME}}__description">{description}</p>
    </div>

    <!-- 卡片内容 -->
    <div class="{{COMPONENT_NAME}}__content">
      <div class="{{COMPONENT_NAME}}__counter">
        <span class="{{COMPONENT_NAME}}__label">当前计数：</span>
        <span class="{{COMPONENT_NAME}}__count">{count}</span>
      </div>

      <!-- 按钮 -->
      <button 
        class="{{COMPONENT_NAME}}__button" 
        onclick={handleClick}
        type="button"
      >
        {buttonText}
      </button>
    </div>

    <!-- 内容片段渲染 -->
    <div class="{{COMPONENT_NAME}}__slot">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .{{COMPONENT_NAME}} {
    display: block;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  /* 卡片样式 */
  .{{COMPONENT_NAME}}__card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 24px;
    transition: box-shadow 0.2s ease;
  }

  .{{COMPONENT_NAME}}__card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* 头部样式 */
  .{{COMPONENT_NAME}}__header {
    margin-bottom: 20px;
  }

  .{{COMPONENT_NAME}}__title {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
  }

  .{{COMPONENT_NAME}}__description {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
  }

  /* 内容区域 */
  .{{COMPONENT_NAME}}__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* 计数器样式 */
  .{{COMPONENT_NAME}}__counter {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
  }

  .{{COMPONENT_NAME}}__label {
    font-size: 14px;
    color: #6b7280;
  }

  .{{COMPONENT_NAME}}__count {
    font-size: 24px;
    font-weight: 700;
    color: #3b82f6;
  }

  /* 按钮样式 */
  .{{COMPONENT_NAME}}__button {
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .{{COMPONENT_NAME}}__button:hover {
    background: #2563eb;
  }

  .{{COMPONENT_NAME}}__button:active {
    background: #1d4ed8;
  }

  /* 插槽区域 */
  .{{COMPONENT_NAME}}__slot {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
  }

  /* 响应式设计 */
  @media (max-width: 640px) {
    .{{COMPONENT_NAME}} {
      max-width: 100%;
    }

    .{{COMPONENT_NAME}}__card {
      padding: 16px;
    }

    .{{COMPONENT_NAME}}__title {
      font-size: 18px;
    }

    .{{COMPONENT_NAME}}__count {
      font-size: 20px;
    }
  }
</style>
