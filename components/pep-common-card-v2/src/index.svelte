<script lang="ts">
  import { type Snippet } from "svelte";
  import type { TabItem, ProductItem, PepCommonCardV2Props } from "./types";
  import { isExpired } from "../../../shared/utils/date";
  import { createTimer } from "./state/timer.svelte";

  // 共享 UI 组件
  import Floor from "@pep/shared/ui/floor/Floor.svelte";
  // import FloorTabs from "@pep/shared/ui/FloorTabs.svelte";

  // 本地业务组件
  import CardGrid from "./components/CardGrid.svelte";
  import CarouselSection from "./components/CarouselSection.svelte";

  import { pickTrait } from "@pep/shared/ui/traits";

  let props: PepCommonCardV2Props & { children?: Snippet } = $props();

  const {
    cardType = "center",
    theme = "white",
    cardBgColor = "gray",
    cardColumn = "3",
    imgHeight = "80px",
    showCardDesc = true,
    tabList = [],
    carouselSlides = [],
  } = props;

  const timer = createTimer();
  let activeTabIndex = $state(0);

  const headerProps = $derived(pickTrait(props, "header"));
  const spacingProps = $derived(pickTrait(props, "spacing"));
  const visibilityProps = $derived(pickTrait(props, "visibility"));

  const activeTab = $derived(tabList[activeTabIndex]);
  const displayProducts = $derived(
    activeTab?.cards?.products?.filter(
      (p: ProductItem) => !isExpired(p.endTime, timer.current),
    ) || [],
  );
</script>

<div class:hide-mb={visibilityProps.isShowMb === false}>
  <Floor
    bg={theme === "grey" ? "grey" : "white"}
    title={headerProps.title}
    subtitle={headerProps.subtitle}
    titleLink={headerProps.more?.text ? { text: headerProps.more.text, href: headerProps.more.href } : undefined}
    mergeTopSpacing={spacingProps.isMergeTopSpacing}
    mergeBottomSpacing={spacingProps.isMergeBottomSpacing}
  >
    <!-- <FloorTabs {tabList} bind:activeTabIndex /> -->

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

    {@render props.children?.()}
  </Floor>

  <CarouselSection />
</div>

<style>
  @media (max-width: 767px) {
    .hide-mb {
      display: none;
    }
  }
</style>
