<script lang="ts">
    import type { FloorTabsProps } from "./types";
    /**
     * 通用楼层页签组件
     */
    let {
        tabList = [],
        activeTabIndex = $bindable(0)
    }: FloorTabsProps = $props();
</script>

{#if tabList && tabList.length > 1}
    <div class="pep-floor-tabs">
        {#each tabList as tab, i}
            <button
                class="pep-floor-tabs__item"
                class:active={activeTabIndex === i}
                onclick={() => (activeTabIndex = i)}
            >
                {tab.title}
            </button>
        {/each}
    </div>
{/if}

<style>
    .pep-floor-tabs {
        display: flex;
        justify-content: center;
        gap: var(--primitive-space-8);
        margin-bottom: var(--primitive-space-8);
        border-bottom: 1px solid var(--primitive-gray-200);
    }

    .pep-floor-tabs__item {
        background: none;
        border: none;
        padding: var(--primitive-space-3) 0;
        font-size: var(--primitive-font-base);
        color: var(--text-secondary);
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
    }

    .pep-floor-tabs__item.active {
        color: var(--text-accent);
        font-weight: 600;
    }

    .pep-floor-tabs__item.active::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--text-accent);
    }

    @media (max-width: 767px) {
        .pep-floor-tabs {
            gap: var(--primitive-space-5);
            overflow-x: auto;
            justify-content: flex-start;
            padding-bottom: 4px;
        }
    }
</style>
