<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { TabItem, ProductItem } from './types';

  // Props 定义
  export let title: string = '';
  export let titleMb: string = '';
  export let subtitle: string = '';
  export let subtitleMb: string = '';
  export let more: { text?: string; href?: string } = { text: '', href: '' };
  export let cardType: 'left' | 'center' | 'product' = 'center';
  export let theme: 'white' | 'grey' = 'white';
  export let cardBgColor: 'white' | 'gray' = 'gray';
  export let cardColumn: '2' | '3' | '4' | '5' = '3';
  export let imgHeight: '80px' | '60px' | '48px' = '80px';
  export let isMergeTopSpacing: boolean = true;
  export let isMergeBottomSpacing: boolean = true;
  export let isShowMb: boolean = false;
  export let showCardDesc: boolean = true;
  export let tabList: TabItem[] = [];

  // 当前激活的页签索引
  let activeTabIndex = 0;

  // 倒计时管理
  let now = Date.now();
  let timer: any;

  onMount(() => {
    timer = setInterval(() => {
      now = Date.now();
    }, 1000);
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  // 检查产品是否已过期
  function isExpired(endTime: string | undefined) {
    if (!endTime) return false;
    const end = new Date(endTime.replace(/-/g, '/')).getTime(); // 适配多种格式
    return end < now;
  }

  // 格式化倒计时
  function getRemainingTime(endTime: string | undefined) {
    if (!endTime) return '';
    const end = new Date(endTime.replace(/-/g, '/')).getTime();
    const diff = end - now;
    if (diff <= 0) return '已结束';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `距结束 ${hours}:${mins}:${secs}`;
  }
</script>

<div 
  class="pep-common-card-v2" 
  class:theme-grey={theme === 'grey'}
  class:theme-white={theme === 'white'}
  class:merge-top={isMergeTopSpacing}
  class:merge-bottom={isMergeBottomSpacing}
  class:hide-mb={!isShowMb}
>
  <div class="pep-common-card-v2__container">
    <!-- 楼层头部 -->
    {#if (title || subtitle) || (titleMb || subtitleMb)}
      <div class="pep-common-card-v2__header">
        {#if title || titleMb}
          <h2 class="pep-common-card-v2__floor-title">
            <span class="pc-only">{@html title}</span>
            <span class="mb-only">{@html titleMb || title}</span>
          </h2>
        {/if}
        {#if subtitle || subtitleMb}
          <div class="pep-common-card-v2__floor-subtitle">
            <span class="pc-only">{@html subtitle}</span>
            <span class="mb-only">{@html subtitleMb || subtitle}</span>
          </div>
        {/if}
        {#if more?.text}
          <a href={more.href} class="pep-common-card-v2__more">{more.text} &gt;</a>
        {/if}
      </div>
    {/if}

    <!-- 内容区：Tab 与 Cards -->
    <div class="pep-common-card-v2__content">
      <!-- Tab 导航条 -->
      {#if tabList && tabList.length > 1}
        <div class="pep-common-card-v2__tabs">
          {#each tabList as tab, i}
            <button 
              class="pep-common-card-v2__tab-item" 
              class:active={activeTabIndex === i}
              on:click={() => activeTabIndex = i}
            >
              {tab.title}
            </button>
          {/each}
        </div>
      {/if}

      <!-- 卡片列表容器 -->
      {#if tabList && tabList[activeTabIndex]}
        <div 
          class="pep-common-card-v2__card-grid"
          style="--column: {cardColumn}"
          class:layout-product={cardType === 'product'}
          class:layout-center={cardType === 'center'}
          class:layout-left={cardType === 'left'}
        >
          {#each tabList[activeTabIndex].cards?.products || [] as product}
            {#if !isExpired(product.endTime)}
              <a 
                href={product.href || 'javascript:;'} 
                class="pep-common-card-v2__card-item"
                class:card-bg-white={cardBgColor === 'white'}
                class:card-bg-gray={cardBgColor === 'gray'}
                class:layout-mb-lr={tabList[activeTabIndex].layoutMb === 'leftRightLayout'}
                class:layout-mb-ud={tabList[activeTabIndex].layoutMb === 'upDownLayout'}
                target={product.href ? '_blank' : '_self'}
              >
                <!-- 倒计时 -->
                {#if product.endTime}
                  <div class="pep-common-card-v2__card-countdown">
                    {getRemainingTime(product.endTime)}
                  </div>
                {/if}

                <!-- 图标 -->
                {#if product.icon || product.iconMb}
                  <div class="pep-common-card-v2__card-icon" style="height: {imgHeight}">
                    <img src={product.icon} class="pc-only" alt={product.title} />
                    <img src={product.iconMb || product.icon} class="mb-only" alt={product.title} />
                  </div>
                {/if}

                <!-- 标签 -->
                {#if product.tags && product.tags.length > 0}
                  <div class="pep-common-card-v2__card-tags">
                    {#each product.tags as tag}
                      <span class="pep-common-card-v2__tag">{tag}</span>
                    {/each}
                  </div>
                {/if}

                <!-- 内容文本区 -->
                <div class="pep-common-card-v2__card-info">
                  <!-- 标题 -->
                  {#if product.title}
                    <h3 class="pep-common-card-v2__card-title">{product.title}</h3>
                  {/if}

                  <!-- 重点文案 -->
                  {#if product.keywords && product.keywords.length > 0}
                    <div class="pep-common-card-v2__card-keywords">
                      {#each product.keywords as kw}
                        <span class="pep-common-card-v2__keyword">{kw.keyword}</span>
                      {/each}
                    </div>
                  {/if}

                  <!-- 描述 -->
                  {#if showCardDesc && product.desc}
                    <div class="pep-common-card-v2__card-desc">{@html product.desc}</div>
                  {/if}
                </div>

                <!-- 按钮组 -->
                {#if product.btnGroups && product.btnGroups.length > 0}
                  <div class="pep-common-card-v2__card-btns">
                    {#each product.btnGroups as btn}
                      <button 
                        class="pep-common-card-v2__btn {btn.btnType}"
                        on:click|stopPropagation={() => btn.btnHref && window.open(btn.btnHref)}
                      >
                        {btn.btnLinkText}
                      </button>
                    {/each}
                  </div>
                {/if}
              </a>
            {/if}
          {/each}
        </div>
      {/if}
      
      <slot />
    </div>
  </div>
</div>

<style>
  /* 基础容器 */
  .pep-common-card-v2 {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .pep-common-card-v2__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 20px;
  }

  /* 背景主题 */
  .theme-grey { background-color: #f5f5f5; }
  .theme-white { background-color: #ffffff; }

  /* 间距控制 */
  .merge-top .pep-common-card-v2__container { padding-top: 0; }
  .merge-bottom .pep-common-card-v2__container { padding-bottom: 0; }

  /* 头部样式 */
  .pep-common-card-v2__header {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
  }

  .pep-common-card-v2__floor-title {
    font-size: 32px;
    font-weight: 600;
    color: #111;
    margin: 0;
    line-height: 1.4;
  }

  .pep-common-card-v2__floor-title :global(p) { margin: 0; }

  .pep-common-card-v2__floor-subtitle {
    font-size: 16px;
    color: #666;
    margin-top: 12px;
    line-height: 1.6;
  }

  .pep-common-card-v2__more {
    display: inline-block;
    margin-top: 16px;
    font-size: 14px;
    color: #3b82f6;
    text-decoration: none;
  }

  .pep-common-card-v2__more:hover { text-decoration: underline; }

  /* Tab 导航样式 */
  .pep-common-card-v2__tabs {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 32px;
    border-bottom: 1px solid #eee;
  }

  .pep-common-card-v2__tab-item {
    background: none;
    border: none;
    padding: 12px 0;
    font-size: 16px;
    color: #666;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
  }

  .pep-common-card-v2__tab-item.active {
    color: #e41e2b;
    font-weight: 600;
  }

  .pep-common-card-v2__tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #e41e2b;
  }

  /* 卡片网格布局 */
  .pep-common-card-v2__card-grid {
    display: grid;
    grid-template-columns: repeat(var(--column, 3), 1fr);
    gap: 20px;
  }

  /* 卡片单项样式 */
  .pep-common-card-v2__card-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 24px;
    text-decoration: none;
    transition: all 0.3s ease;
    border-radius: 4px;
    box-sizing: border-box;
    cursor: pointer;
    position: relative;
  }

  .pep-common-card-v2__card-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .card-bg-white { background-color: #ffffff; }
  .card-bg-gray { background-color: #f9fafb; }

  .pep-common-card-v2__card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    width: 100%;
  }

  .pep-common-card-v2__card-icon img {
    height: 100%;
    width: auto;
    object-fit: contain;
  }

  .pep-common-card-v2__card-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .pep-common-card-v2__card-title {
    font-size: 18px;
    font-weight: 600;
    color: #111;
    margin: 0 0 12px 0;
    text-align: center;
    line-height: 1.4;
  }

  .pep-common-card-v2__card-desc {
    font-size: 14px;
    color: #666;
    text-align: center;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .pep-common-card-v2__card-desc :global(p) { margin: 0; }

  .pep-common-card-v2__card-countdown {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 12px;
    color: #e41e2b;
    background: rgba(228, 30, 43, 0.05);
    padding: 2px 8px;
    border-radius: 10px;
  }

  .pep-common-card-v2__card-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pep-common-card-v2__tag {
    font-size: 12px;
    padding: 2px 8px;
    background: #f0f0f0;
    color: #666;
    border-radius: 2px;
  }

  .pep-common-card-v2__card-keywords {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    justify-content: center;
  }

  .pep-common-card-v2__keyword {
    font-size: 14px;
    color: #e41e2b;
    font-weight: 600;
  }

  .pep-common-card-v2__card-btns {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    width: 100%;
    justify-content: center;
  }

  .pep-common-card-v2__btn {
    flex: 1;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    max-width: 120px;
  }

  .por-btn-primary { background-color: #111; color: #fff; }
  .por-btn-secondary { background-color: #fff; border-color: #111; color: #111; }
  .por-btn-dark { background-color: transparent; color: #111; }

  /* 布局微调 */
  .layout-left .pep-common-card-v2__card-info,
  .layout-left .pep-common-card-v2__card-tags,
  .layout-left .pep-common-card-v2__card-keywords,
  .layout-left .pep-common-card-v2__card-btns {
    align-items: flex-start;
    justify-content: flex-start;
    text-align: left;
  }
  .layout-left .pep-common-card-v2__card-title,
  .layout-left .pep-common-card-v2__card-desc { text-align: left; }

  /* 响应式辅助 */
  .pc-only { display: block; }
  .mb-only { display: none; }

  @media (max-width: 1024px) {
    .pep-common-card-v2__card-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 767px) {
    .hide-mb { display: none; }
    .pc-only { display: none; }
    .mb-only { display: block; }
    
    .pep-common-card-v2__container { padding: 40px 16px; }
    .pep-common-card-v2__floor-title { font-size: 24px; }
    
    .pep-common-card-v2__tabs {
      gap: 20px;
      overflow-x: auto;
      justify-content: flex-start;
      padding-bottom: 4px;
    }
    
    .pep-common-card-v2__card-grid { grid-template-columns: 1fr; }

    /* 移动端左右布局 */
    .pep-common-card-v2__card-item.layout-mb-lr {
      flex-direction: row;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
    }

    .layout-mb-lr .pep-common-card-v2__card-icon {
      width: 80px;
      margin-bottom: 0;
      flex-shrink: 0;
    }

    .layout-mb-lr .pep-common-card-v2__card-info,
    .layout-mb-lr .pep-common-card-v2__card-tags,
    .layout-mb-lr .pep-common-card-v2__card-keywords,
    .layout-mb-lr .pep-common-card-v2__card-btns {
      align-items: flex-start;
      justify-content: flex-start;
      text-align: left;
    }

    .layout-mb-lr .pep-common-card-v2__card-title,
    .layout-mb-lr .pep-common-card-v2__card-desc { text-align: left; }
  }
</style>
