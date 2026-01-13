<script lang="ts">
    import Card from "./lib/Card.svelte";
    import type { FloorData } from "./types";

    let data: FloorData = $props();

    // Default values logic managed here or passed down
    let title = $derived(data.title || "");
    let isTitleCentered = $derived(data.isTitleCentered || false);
    let floorBackgroundColor = $derived(data.floorBackgroundColor || "#ffffff");
    let cardBackgroundColor = $derived(data.cardBackgroundColor || "#ffffff");
    let marginTop = $derived(data.marginTop || false);
    let marginBottom = $derived(data.marginBottom || false);
    let tabs = $derived(data.tabs || []);

    let activeTab = $state(0);

    function setActiveTab(index: number) {
        activeTab = index;
    }
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
        {#if title}
            <h2 class="floor-title" class:centered={isTitleCentered}>
                {title}
            </h2>
        {/if}

        {#if tabs.length > 0}
            {#if tabs.length > 1}
                <div class="tabs-header" class:centered={isTitleCentered}>
                    {#each tabs as tab, index}
                        <button
                            class="tab-btn"
                            class:active={activeTab === index}
                            onclick={() => setActiveTab(index)}
                        >
                            {tab.title}
                        </button>
                    {/each}
                </div>
            {/if}

            <div class="tab-content">
                {#each tabs as tab, index}
                    {#if activeTab === index}
                        <div
                            class="cards-grid"
                            style="grid-template-columns: repeat({tab.cardsPerRow ||
                                2}, 1fr);"
                        >
                            {#each tab.cards as card}
                                <Card cardData={card} {cardBackgroundColor} />
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

    .floor-title {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 24px;
        color: #333;
    }

    .floor-title.centered {
        text-align: center;
    }

    .tabs-header {
        display: flex;
        gap: 24px;
        margin-bottom: 24px;
        border-bottom: 1px solid #eee;
    }

    .tabs-header.centered {
        justify-content: center;
    }

    .tab-btn {
        background: none;
        border: none;
        padding: 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: #666;
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
    }

    .tab-btn:hover {
        color: #333;
    }

    .tab-btn.active {
        color: #007bff;
        font-weight: 600;
    }

    .tab-btn.active::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #007bff;
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
