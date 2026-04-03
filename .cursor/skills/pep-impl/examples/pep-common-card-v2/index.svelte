<!--
  标杆组件 pep-common-card-v2（精简版）

  核心模式：
  - Floor 作为唯一根容器，接收 header/spacing Trait
  - pickTrait + $derived 在根组件一次性分拣，子组件只接收业务数据
  - visibility Trait 是该组件的特例（Level 4），大部分组件不需要
  - {@render props.children?.()} 保留扩展能力
-->
<script lang="ts">
  import { type Snippet } from "svelte";
  import type { PepCommonCardV2Props } from "./types";

  import Floor from "@pep/shared/ui/floor/Floor.svelte";
  import { pickTrait } from "@pep/shared/ui/traits";

  let props: PepCommonCardV2Props & { children?: Snippet } = $props();

  const {
    theme = "white",
    cardColumn = "3",
    tabList = [],
  } = props;

  const headerProps = $derived(pickTrait(props, "header"));
  const spacingProps = $derived(pickTrait(props, "spacing"));
  const visibilityProps = $derived(pickTrait(props, "visibility"));

  let activeTabIndex = $state(0);
  const activeTab = $derived(tabList[activeTabIndex]);
</script>

<div class:hide-mb={visibilityProps.isShowMb === false}>
  <Floor
    bg={theme === "grey" ? "grey" : "white"}
    title={headerProps.title}
    subtitle={headerProps.subtitle}
    titleLink={headerProps.more?.text
      ? { text: headerProps.more.text, href: headerProps.more.href }
      : undefined}
    mergeTopSpacing={spacingProps.isMergeTopSpacing}
    mergeBottomSpacing={spacingProps.isMergeBottomSpacing}
  >
    {#if activeTab?.cards?.products}
      <div class="card-grid" style="--column: {cardColumn}">
        {#each activeTab.cards.products as item}
          <a href={item.href} class="card-grid__item">{item.title}</a>
        {/each}
      </div>
    {/if}

    {@render props.children?.()}
  </Floor>
</div>

<style lang="less">
  .card-grid {
    display: grid;
    grid-template-columns: repeat(var(--column, 3), 1fr);
    gap: 24px;
  }

  @media (max-width: 1024px) {
    .card-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 767px) {
    .card-grid { grid-template-columns: 1fr; }
    .hide-mb { display: none; }
  }
</style>
