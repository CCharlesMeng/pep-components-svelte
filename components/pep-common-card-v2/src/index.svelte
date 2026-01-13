<script lang="ts">
  // 1. 导入：Svelte → 第三方 → 本地
  import { type Snippet } from "svelte";
  import type { TabItem, ProductItem } from "./types";
  import { isExpired } from "../../../shared/utils/date";
  import { createTimer } from "./state/timer.svelte";
  import CardHeader from "./lib/components/CardHeader.svelte";
  import CardTabs from "./lib/components/CardTabs.svelte";
  import CardGrid from "./lib/components/CardGrid.svelte";

  // 2. Props 定义
  let {
    title = "",
    titleMb = "",
    subtitle = "",
    subtitleMb = "",
    more = { text: "", href: "" },
    cardType = "center",
    theme = "white",
    cardBgColor = "gray",
    cardColumn = "3",
    imgHeight = "80px",
    isMergeTopSpacing = true,
    isMergeBottomSpacing = true,
    isShowMb = false,
    showCardDesc = true,
    tabList = [],
    children
  } = $props<{
    title?: string;
    titleMb?: string;
    subtitle?: string;
    subtitleMb?: string;
    more?: { text?: string; href?: string };
    cardType?: "left" | "center" | "product";
    theme?: "white" | "grey";
    cardBgColor?: "white" | "gray";
    cardColumn?: "2" | "3" | "4" | "5";
    imgHeight?: "80px" | "60px" | "48px";
    isMergeTopSpacing?: boolean;
    isMergeBottomSpacing?: boolean;
    isShowMb?: boolean;
    showCardDesc?: boolean;
    tabList?: TabItem[];
    children?: Snippet;
  }>();

  // 3. 状态管理
  const timer = createTimer();
  let activeTabIndex = $state(0);

  // 4. 派生状态
  const activeTab = $derived(tabList[activeTabIndex]);
  const displayProducts = $derived(
    activeTab?.cards?.products?.filter((p: ProductItem) => !isExpired(p.endTime, timer.current)) || []
  );
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
    <CardHeader {title} {titleMb} {subtitle} {subtitleMb} {more} />

    <div class="pep-common-card-v2__content">
      <CardTabs {tabList} bind:activeTabIndex />

      {#if activeTab}
        <CardGrid
          products={displayProducts}
          {cardColumn}
          {cardType}
          {cardBgColor}
          {imgHeight}
          {showCardDesc}
          layoutMb={activeTab.layoutMb}
          now={timer.current}
        />
      {/if}

      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .pep-common-card-v2 {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .pep-common-card-v2__container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--primitive-space-15) var(--primitive-space-5);
  }

  .theme-grey {
    background-color: var(--bg-grey);
  }
  .theme-white {
    background-color: var(--bg-primary);
  }

  .merge-top .pep-common-card-v2__container {
    padding-top: 0;
  }
  .merge-bottom .pep-common-card-v2__container {
    padding-bottom: 0;
  }

  @media (max-width: 767px) {
    .hide-mb {
      display: none;
    }

    .pep-common-card-v2__container {
      padding: var(--primitive-space-10) var(--primitive-space-4);
    }
  }
</style>
