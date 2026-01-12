<script lang="ts">
    import OfferingCard from "./OfferingCard.svelte";
    import OfferingHeader from "./OfferingHeader.svelte";
    import type { FloorData } from "../types";

    export let data: FloorData = {};

    // Default values logic managed here or passed down
    $: title = data.title || "";
    $: isTitleCentered = data.isTitleCentered || false;
    $: floorBackgroundColor = data.floorBackgroundColor || "#ffffff";
    $: cardBackgroundColor = data.cardBackgroundColor || "#ffffff";
    $: marginTop = data.marginTop || false;
    $: marginBottom = data.marginBottom || false;
    $: tabs = data.tabs || [];

    let activeTab = 0;
</script>

<div
    class="floor-container"
    style="
    background-color: {floorBackgroundColor};
    padding-top: {marginTop ? '24px' : '0'};
    padding-bottom: {marginBottom ? '24px' : '0'};
  "
>
    <div class="floor-content">
        <OfferingHeader {title} {isTitleCentered} {tabs} bind:activeTab />

        {#if tabs.length > 0}
            <div class="tab-content">
                {#each tabs as tab, index}
                    {#if activeTab === index}
                        <div
                            class="cards-grid"
                            style="grid-template-columns: repeat({tab.cardsPerRow ||
                                2}, 1fr);"
                        >
                            {#each tab.cards as card}
                                <OfferingCard
                                    cardData={card}
                                    {cardBackgroundColor}
                                />
                            {/each}
                        </div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .floor-container {
        width: 100%;
        box-sizing: border-box;
    }

    .floor-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
    }

    .cards-grid {
        display: grid;
        gap: 16px;
        width: 100%;
    }

    @media (max-width: 768px) {
        .cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }

    @media (max-width: 480px) {
        .cards-grid {
            grid-template-columns: 1fr !important;
        }
    }
</style>
