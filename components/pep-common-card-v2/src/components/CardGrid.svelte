<script lang="ts">
  import type { ProductItem } from "../types";
  import CardItem from "./CardItem.svelte";

  let {
    products = [],
    cardColumn = "3",
    cardType = "center",
    cardBgColor = "gray",
    imgHeight = "80px",
    showCardDesc = true,
    layoutMb = undefined,
    now,
  } = $props<{
    products: ProductItem[];
    cardColumn?: string;
    cardType?: "left" | "center" | "product";
    cardBgColor?: "white" | "gray";
    imgHeight?: string;
    showCardDesc?: boolean;
    layoutMb?: "upDownLayout" | "leftRightLayout";
    now: number;
  }>();
</script>

<div
  class="pep-common-card-v2__card-grid"
  style="--column: {cardColumn}"
  class:layout-product={cardType === "product"}
  class:layout-center={cardType === "center"}
  class:layout-left={cardType === "left"}
>
  {#each products as product}
    <CardItem
      {product}
      {cardBgColor}
      {imgHeight}
      {showCardDesc}
      {layoutMb}
      {now}
    />
  {/each}
</div>

<style>
  .pep-common-card-v2__card-grid {
    display: grid;
    grid-template-columns: repeat(var(--column, 3), 1fr);
    gap: var(--grid-gap);
  }

  @media (max-width: 1024px) {
    .pep-common-card-v2__card-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 767px) {
    .pep-common-card-v2__card-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
