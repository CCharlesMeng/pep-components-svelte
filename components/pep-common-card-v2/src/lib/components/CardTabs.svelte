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
                onclick={() => (activeTabIndex = i)}
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
        gap: var(--primitive-space-8);
        margin-bottom: var(--primitive-space-8);
        border-bottom: 1px solid var(--primitive-gray-200);
    }

    .pep-common-card-v2__tab-item {
        background: none;
        border: none;
        padding: var(--primitive-space-3) 0;
        font-size: var(--primitive-font-base);
        color: var(--text-secondary);
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
    }

    .pep-common-card-v2__tab-item.active {
        color: var(--text-accent);
        font-weight: 600;
    }

    .pep-common-card-v2__tab-item.active::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--text-accent);
    }

    @media (max-width: 767px) {
        .pep-common-card-v2__tabs {
            gap: var(--primitive-space-5);
            overflow-x: auto;
            justify-content: flex-start;
            padding-bottom: 4px;
        }
    }
</style>
