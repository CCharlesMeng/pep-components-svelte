<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { TabItem } from "./types";
  import { isExpired } from "../../shared/utils/date";
  import CardHeader from "./lib/components/CardHeader.svelte";
  import CardTabs from "./lib/components/CardTabs.svelte";
  import CardItem from "./lib/components/CardItem.svelte";

  // Props 定义
  export let title: string = "";
  export let titleMb: string = "";
  export let subtitle: string = "";
  export let subtitleMb: string = "";
  export let more: { text?: string; href?: string } = { text: "", href: "" };
  export let cardType: "left" | "center" | "product" = "center";
  export let theme: "white" | "grey" = "white";
  export let cardBgColor: "white" | "gray" = "gray";
  export let cardColumn: "2" | "3" | "4" | "5" = "3";
  export let imgHeight: "80px" | "60px" | "48px" = "80px";
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
</script>

<div
  class="pep-common-card-v2"
  class:theme-grey={theme === "grey"}
  class:theme-white={theme === "white"}
  class:merge-top={isMergeTopSpacing}
  class:merge-bottom={isMergeBottomSpacing}
  class:hide-mb={!isShowMb}
>
  <div class="pep-common-card-v2__container">
    <!-- 楼层头部 -->
    <CardHeader {title} {titleMb} {subtitle} {subtitleMb} {more} />

    <!-- 内容区：Tab 与 Cards -->
    <div class="pep-common-card-v2__content">
      <!-- Tab 导航条 -->
      <CardTabs {tabList} bind:activeTabIndex />

      <!-- 卡片列表容器 -->
      {#if tabList && tabList[activeTabIndex]}
        <div
          class="pep-common-card-v2__card-grid"
          style="--column: {cardColumn}"
          class:layout-product={cardType === "product"}
          class:layout-center={cardType === "center"}
          class:layout-left={cardType === "left"}
        >
          {#each tabList[activeTabIndex].cards?.products || [] as product}
            {#if !isExpired(product.endTime, now)}
              <CardItem
                {product}
                {cardBgColor}
                {imgHeight}
                {showCardDesc}
                layoutMb={tabList[activeTabIndex].layoutMb}
                {now}
              />
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
  .theme-grey {
    background-color: #f5f5f5;
  }
  .theme-white {
    background-color: #ffffff;
  }

  /* 间距控制 */
  .merge-top .pep-common-card-v2__container {
    padding-top: 0;
  }
  .merge-bottom .pep-common-card-v2__container {
    padding-bottom: 0;
  }

  /* 卡片网格布局 */
  .pep-common-card-v2__card-grid {
    display: grid;
    grid-template-columns: repeat(var(--column, 3), 1fr);
    gap: 20px;
  }

  @media (max-width: 1024px) {
    .pep-common-card-v2__card-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 767px) {
    .hide-mb {
      display: none;
    }

    .pep-common-card-v2__container {
      padding: 40px 16px;
    }

    .pep-common-card-v2__card-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
