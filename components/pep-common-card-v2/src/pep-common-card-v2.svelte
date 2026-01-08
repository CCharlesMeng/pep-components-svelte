<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { TabItem, ProductItem } from './types';
  import PepTitle from '../../../shared/ui/src/PepTitle.svelte';
  import PepFloorContainer from '../../../shared/ui/src/PepFloorContainer.svelte';
  import PepButton from '../../../shared/ui/src/PepButton.svelte';

  let {
    title = '',
    titleMb = '',
    subtitle = '',
    subtitleMb = '',
    more = { text: '', href: '' },
    cardType = 'center',
    theme = 'white',
    cardBgColor = 'gray',
    cardColumn = '3',
    imgHeight = '80px',
    isMergeTopSpacing = true,
    isMergeBottomSpacing = true,
    isShowMb = false,
    showCardDesc = true,
    tabList = [],
    children
  }: {
    title?: string;
    titleMb?: string;
    subtitle?: string;
    subtitleMb?: string;
    more?: { text?: string; href?: string };
    cardType?: 'left' | 'center' | 'product';
    theme?: 'white' | 'grey';
    cardBgColor?: 'white' | 'gray';
    cardColumn?: '2' | '3' | '4' | '5';
    imgHeight?: '80px' | '60px' | '48px';
    isMergeTopSpacing?: boolean;
    isMergeBottomSpacing?: boolean;
    isShowMb?: boolean;
    showCardDesc?: boolean;
    tabList?: TabItem[];
    children?: Snippet;
  } = $props();

  // 当前激活的页签索引
  let activeTabIndex = $state(0);

  // 倒计时管理
  let now = $state(Date.now());

  $effect(() => {
    const timer = setInterval(() => {
      now = Date.now();
    }, 1000);
    return () => clearInterval(timer);
  });

  // 检查产品是否已过期
  function isExpired(endTime: string | undefined, currentTime: number) {
    if (!endTime) return false;
    const end = new Date(endTime.replace(/-/g, '/')).getTime(); // 适配多种格式
    return end < currentTime;
  }

  // 格式化倒计时
  function getRemainingTime(endTime: string | undefined, currentTime: number) {
    if (!endTime) return '';
    const end = new Date(endTime.replace(/-/g, '/')).getTime();
    const diff = end - currentTime;
    if (diff <= 0) return '已结束';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `距结束 ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }

  // 映射按钮类型
  const btnTypeMap: Record<string, 'pep-btn-primary' | 'pep-btn-secondary' | 'pep-btn-ghost'> = {
    'por-btn-primary': 'pep-btn-primary',
    'por-btn-secondary': 'pep-btn-secondary',
    'por-btn-dark': 'pep-btn-ghost'
  };
</script>

<PepFloorContainer
  {theme}
  {isMergeTopSpacing}
  {isMergeBottomSpacing}
  {isShowMb}
  componentName="pep-common-card-v2"
>
  <PepTitle {title} {titleMb} {subtitle} {subtitleMb} {more} />

  <div class="w-full">
    {#if tabList && tabList.length > 1}
      <div class="flex justify-center gap-pep-xl mb-pep-xl border-b border-pep-gray-200 overflow-x-auto sm:justify-center">
        {#each tabList as tab, i}
          <button 
            class="pep-tab-item" 
            class:pep-tab-item-active={activeTabIndex === i}
            onclick={() => activeTabIndex = i}
          >
            {tab.title}
          </button>
        {/each}
      </div>
    {/if}

    {#if tabList && tabList[activeTabIndex]}
      <div 
        class="grid gap-pep-md"
        style="grid-template-columns: repeat(var(--column, 3), 1fr); --column: {cardColumn}"
        class:sm:grid-cols-2={true}
        class:xs:grid-cols-1={true}
      >
        {#each tabList[activeTabIndex].cards?.products || [] as product}
          {#if !isExpired(product.endTime, now)}
            <a 
              href={product.href || 'javascript:;'} 
              class="pep-card flex flex-col items-center"
              class:!bg-white={cardBgColor === 'white'}
              class:!bg-pep-gray-100={cardBgColor === 'gray'}
              class:layout-mb-lr={tabList[activeTabIndex].layoutMb === 'leftRightLayout'}
              target={product.href ? '_blank' : '_self'}
            >
              {#if product.endTime}
                <div class="absolute top-pep-sm right-pep-sm text-pep-xs text-pep-primary bg-pep-primary/5 px-2 py-0.5 rounded-full">
                  {getRemainingTime(product.endTime, now)}
                </div>
              {/if}

              {#if product.icon || product.iconMb}
                <div class="flex items-center justify-center mb-pep-lg w-full" style="height: {imgHeight}">
                  <img src={product.icon} class="hidden md:block h-full w-auto object-contain" alt={product.title} />
                  <img src={product.iconMb || product.icon} class="md:hidden h-full w-auto object-contain" alt={product.title} />
                </div>
              {/if}

              {#if product.tags && product.tags.length > 0}
                <div class="flex flex-wrap gap-pep-xs mb-pep-sm justify-center">
                  {#each product.tags as tag}
                    <span class="pep-tag">{tag}</span>
                  {/each}
                </div>
              {/if}

              <div class="w-full flex flex-col items-center" class:text-left={cardType === 'left'}>
                {#if product.title}
                  <h3 class="text-pep-lg font-600 text-pep-secondary mb-pep-sm text-center" class:!text-left={cardType === 'left'}>
                    {product.title}
                  </h3>
                {/if}

                {#if product.keywords && product.keywords.length > 0}
                  <div class="flex gap-pep-md mb-pep-sm justify-center" class:!justify-start={cardType === 'left'}>
                    {#each product.keywords as kw}
                      <span class="text-pep-sm text-pep-primary font-600">{kw.keyword}</span>
                    {/each}
                  </div>
                {/if}

                {#if showCardDesc && product.desc}
                  <div class="text-pep-sm text-pep-gray-600 text-center line-clamp-2" class:!text-left={cardType === 'left'}>
                    {@html product.desc}
                  </div>
                {/if}
              </div>

              {#if product.btnGroups && product.btnGroups.length > 0}
                <div class="flex gap-pep-md mt-pep-lg w-full justify-center" class:!justify-start={cardType === 'left'}>
                  {#each product.btnGroups as btn}
                    <PepButton 
                      text={btn.btnLinkText}
                      href={btn.btnHref}
                      btnType={btnTypeMap[btn.btnType] || 'pep-btn-primary'}
                    />
                  {/each}
                </div>
              {/if}
            </a>
          {/if}
        {/each}
      </div>
    {/if}

    {@render children?.()}
  </div>
</PepFloorContainer>

<style>
  /* 仅保留复杂的业务逻辑或 UnoCSS 难以覆盖的微调 */
  .layout-mb-lr {
    @media (max-width: 767px) {
      flex-direction: row !important;
      align-items: flex-start !important;
      gap: 16px;
      padding: 16px;
    }
  }
</style>
