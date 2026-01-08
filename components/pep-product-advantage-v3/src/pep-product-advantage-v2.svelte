<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { PepProductAdvantageV2Props } from './types';
  import PepFloorContainer from '../../../shared/ui/src/PepFloorContainer.svelte';
  import PepTitle from '../../../shared/ui/src/PepTitle.svelte';
  import PepButton from '../../../shared/ui/src/PepButton.svelte';

  let {
    baseInfo,
    cardItemLists = [],
    className = ''
  }: PepProductAdvantageV2Props = $props();

  // 映射主题名
  const containerTheme = $derived(baseInfo?.theme === 'light' ? 'white' : 'grey');

  // 按钮类型映射
  const btnTypeMap: Record<string, 'pep-btn-primary' | 'pep-btn-secondary' | 'pep-btn-ghost'> = {
    'por-btn-primary': 'pep-btn-primary',
    'por-btn-secondary': 'pep-btn-secondary',
    'por-btn-dark': 'pep-btn-ghost',
    'por-btn-danger': 'pep-btn-secondary' // 兜底
  };

  // 栅格比例映射 (24 栅格)
  const gridConfig: Record<number, number[]> = {
    1: [24],
    2: [12, 12],
    3: [14, 10],
    4: [10, 14]
  };

  // 移动端折叠状态管理
  let expandedStates = $state<boolean[][]>([]);

  $effect.pre(() => {
    // 当 cardItemLists 变化时，初始化或同步折叠状态
    expandedStates = cardItemLists.map((row, rIndex) => 
      row.cardItem.map((_, cIndex) => {
        // 如果旧状态存在则保留，否则第一行第一项默认展开
        return expandedStates[rIndex]?.[cIndex] ?? (rIndex === 0 && cIndex === 0);
      })
    );
  });

  let isMobile = $state(false);

  $effect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    isMobile = media.matches;
    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  });

  function toggleExpand(rIndex: number, cIndex: number) {
    if (isMobile && expandedStates[rIndex]) {
      expandedStates[rIndex][cIndex] = !expandedStates[rIndex][cIndex];
    }
  }
</script>

<PepFloorContainer 
  theme={containerTheme}
  componentName="pep-product-advantage-v2"
  className={className}
>
  {#if baseInfo}
    <PepTitle 
      title={baseInfo.title} 
      subtitle={baseInfo.subtitle} 
    />
  {/if}

  <div class="pep-product-advantage-v2__body flex flex-col gap-pep-lg">
    {#each cardItemLists as row, rIndex}
      <div class="grid grid-cols-24 gap-pep-lg w-full">
        {#each row.cardItem as item, cIndex}
          {@const span = gridConfig[row.layout]?.[cIndex] || 24}
          {@const isExpanded = expandedStates[rIndex]?.[cIndex] ?? (rIndex === 0 && cIndex === 0)}
          <div 
            class="pep-product-advantage-v2__col"
            style="grid-column: span {span} / span {span};"
          >
            <div class="pep-product-advantage-v2__card" class:is-expanded={isExpanded}>
              <!-- 内容区 -->
              <div class="pep-product-advantage-v2__card-content">
                <h3 
                  class="pep-product-advantage-v2__card-title"
                  onclick={() => toggleExpand(rIndex, cIndex)}
                  aria-expanded={isMobile ? isExpanded : undefined}
                  role={isMobile ? "button" : undefined}
                >
                  {item.cardTitle}
                  {#if isMobile}
                    <span class="pep-product-advantage-v2__arrow" class:active={isExpanded}></span>
                  {/if}
                </h3>
                
                {#if !isMobile || isExpanded}
                  <div 
                    class="pep-product-advantage-v2__card-details"
                    transition:slide={{ duration: 300 }}
                  >
                    <div class="pep-product-advantage-v2__card-infos">
                      {#each item.cardInfos as info}
                        <div class="pep-product-advantage-v2__info-item">
                          {#if info.showLICircle}
                            <span class="pep-product-advantage-v2__info-dot"></span>
                          {/if}
                          <div class="pep-product-advantage-v2__info-desc">
                            {@html info.description}
                          </div>
                        </div>
                      {/each}
                    </div>

                    {#if item.btnLists && item.btnLists.length > 0}
                      <div class="pep-product-advantage-v2__card-btns">
                        {#each item.btnLists as btn}
                          <PepButton 
                            text={btn.btnText}
                            href={btn.btnLink}
                            btnType={btnTypeMap[btn.btnType || 'por-btn-secondary']}
                          />
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>

              <!-- 图片区 -->
              <div class="pep-product-advantage-v2__card-image">
                <img src={item.bgImage} alt={item.cardTitle} loading="lazy" />
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</PepFloorContainer>

<style>
  .pep-product-advantage-v2__body {
    width: 100%;
    margin-top: var(--pep-advantage-spacing, 48px);
  }

  .pep-product-advantage-v2__col {
    width: 100%;
  }

  /* 卡片基础布局 (PC 左右) */
  .pep-product-advantage-v2__card {
    display: flex;
    align-items: center;
    gap: 24px;
    width: 100%;
    background-color: transparent;
  }

  .pep-product-advantage-v2__card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .pep-product-advantage-v2__card-title {
    font-size: 24px;
    font-weight: 600;
    color: #111;
    margin: 0 0 16px 0;
    line-height: 1.3;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pep-product-advantage-v2__card-infos {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pep-product-advantage-v2__info-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.6;
    font-size: 16px;
    color: #666;
  }

  .pep-product-advantage-v2__info-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--color-pep-primary, #3b82f6);
    margin-top: 10px;
    flex-shrink: 0;
  }

  .pep-product-advantage-v2__info-desc :global(p) {
    margin: 0;
  }

  .pep-product-advantage-v2__card-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }

  .pep-product-advantage-v2__card-image {
    flex-shrink: 0;
    width: 40%;
    max-width: 400px;
  }

  .pep-product-advantage-v2__card-image img {
    width: 100%;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .pep-product-advantage-v2__arrow {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-right: 2px solid #666;
    border-bottom: 2px solid #666;
    transform: rotate(45deg);
    transition: transform 0.3s ease;
    margin-right: 8px;
  }

  .pep-product-advantage-v2__arrow.active {
    transform: rotate(-135deg);
  }

  /* 移动端响应式布局 */
  @media (max-width: 768px) {
    .pep-product-advantage-v2__col {
      grid-column: span 24 / span 24 !important;
    }

    .pep-product-advantage-v2__card {
      flex-direction: column-reverse;
      gap: 16px;
      padding: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 16px;
    }

    .pep-product-advantage-v2__card-image {
      width: 100%;
      max-width: 100%;
    }

    .pep-product-advantage-v2__card-title {
      font-size: 18px;
      margin-bottom: 0;
      padding: 12px 0;
      cursor: pointer;
    }

    .pep-product-advantage-v2__info-item {
      font-size: 14px;
    }

    .pep-product-advantage-v2__card-btns {
      margin-top: 16px;
    }

    .pep-product-advantage-v2__card-details {
      padding-bottom: 12px;
    }
  }

  /* 国际化 RTL 支持 */
  :global([dir="rtl"]) .pep-product-advantage-v2__card {
    flex-direction: row-reverse;
  }

  :global([dir="rtl"]) .pep-product-advantage-v2__card-title {
    flex-direction: row-reverse;
  }

  :global([dir="rtl"]) .pep-product-advantage-v2__info-item {
    flex-direction: row-reverse;
    text-align: right;
  }

  @media (max-width: 768px) {
    :global([dir="rtl"]) .pep-product-advantage-v2__card {
      flex-direction: column-reverse;
    }
  }

  /* 响应式 Token 映射 */

  /* 响应式 Token 映射 */
  :global(.pep-product-advantage-v2) {
    --pep-advantage-title-size: 28px;
    --pep-advantage-spacing: 48px;
  }

  @media (max-width: 1600px) {
    :global(.pep-product-advantage-v2) {
      --pep-advantage-title-size: 22px;
      --pep-advantage-spacing: 40px;
    }
  }

  @media (max-width: 1280px) {
    :global(.pep-product-advantage-v2) {
      --pep-advantage-title-size: 18px;
      --pep-advantage-spacing: 32px;
    }
  }

  @media (max-width: 768px) {
    :global(.pep-product-advantage-v2) {
      --pep-advantage-title-size: 14px;
      --pep-advantage-spacing: 20px;
    }
  }

  /* 强制覆盖 PepTitle 的字号以符合特定业务规范 */
  :global(.pep-product-advantage-v2 .pep-title__main) {
    font-size: var(--pep-advantage-title-size) !important;
  }
</style>
