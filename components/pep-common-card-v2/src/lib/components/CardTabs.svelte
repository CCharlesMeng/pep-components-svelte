<script lang="ts">
    import type { TabItem } from "../../types";

    let {
        tabList = [],
        activeTabIndex = $bindable(0)
    } = $props<{
        tabList?: TabItem[];
        activeTabIndex?: number;
    }>();
</script>

{#if tabList && tabList.length > 1}
    <div class="pep-common-card-v2__tabs">
        {#each tabList as tab, i}
            <button
                class="pep-common-card-v2__tab-item"
                class:active={activeTabIndex === i}
                on:click={() => (activeTabIndex = i)}
            >
                {tab.title}
            </button>
        {/each}
    </div>
{/if}

<style>
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
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #e41e2b;
    }

    @media (max-width: 767px) {
        .pep-common-card-v2__tabs {
            gap: 20px;
            overflow-x: auto;
            justify-content: flex-start;
            padding-bottom: 4px;
        }
    }
</style>
