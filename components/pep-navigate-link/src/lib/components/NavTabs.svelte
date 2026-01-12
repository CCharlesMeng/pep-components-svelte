<script lang="ts">
    import type { Tab, ArticleItem } from "../../types";

    let {
        tabs = [],
        tabData = {},
    }: {
        tabs: Tab[];
        tabData?: Record<number, ArticleItem[]>;
    } = $props();

    function getDropdownItems(tab: Tab, index: number): ArticleItem[] {
        if (!tab.tabContent?.isShowSelect) return [];
        if (tab.tabContent.recommendType === "1") {
            return tab.tabContent.items || [];
        }
        if (tab.tabContent.recommendType === "2") {
            return (tabData && tabData[index]) || [];
        }
        return [];
    }
</script>

<ul class="tabs-list">
    {#each tabs || [] as tab, index}
        <li class="tab-item">
            <a href={tab.tabUrl} class="tab-link">{tab.tabTitle}</a>

            {#if tab.tabContent?.isShowSelect}
                {@const items = getDropdownItems(tab, index)}
                {#if items.length > 0}
                    <div class="dropdown-menu">
                        <ul>
                            {#each items as item}
                                <li>
                                    <a href={item.url} title={item.title}
                                        >{item.title}</a
                                    >
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            {/if}
        </li>
    {/each}
</ul>

<style>
    .tabs-list {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        height: 100%;
    }

    .tab-item {
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
    }

    .tab-link {
        padding: 0 20px;
        text-decoration: none;
        font-size: 16px;
        height: 100%;
        display: flex;
        align-items: center;
        transition: background-color 0.2s;
        white-space: nowrap;
    }

    /* Dropdown */
    .dropdown-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 220px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 0 0 4px 4px;
        padding: 10px 0;
        z-index: 1001;
    }

    .tab-item:hover .dropdown-menu {
        display: block;
        animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .dropdown-menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .dropdown-menu li a {
        display: block;
        padding: 10px 20px;
        color: #333;
        text-decoration: none;
        font-size: 14px;
        transition: all 0.2s;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-left: 3px solid transparent;
    }

    .dropdown-menu li a:hover {
        background-color: #f8f9fa;
        color: #c7000b;
        border-left-color: #c7000b;
        padding-left: 25px;
    }

    /* Themes support via parent class */
    :global(.theme-white .tab-link) {
        color: #333;
    }
    :global(.theme-white .tab-link:hover) {
        background-color: #f0f0f0;
    }

    :global(.theme-bluegrey .tab-link) {
        color: #fff;
    }
    :global(.theme-bluegrey .tab-link:hover) {
        background-color: #2c3e50;
    }
    :global(.theme-bluegrey .dropdown-menu) {
        background-color: #fff;
    }
    :global(.theme-bluegrey .dropdown-menu li a) {
        color: #333;
    }

    :global(.theme-halftransparent .tab-link) {
        color: #fff;
    }
    :global(.theme-halftransparent .tab-link:hover) {
        background-color: rgba(255, 255, 255, 0.1);
    }

    :global(.theme-shallowgrey .tab-link) {
        color: #333;
    }
    :global(.theme-shallowgrey .tab-link:hover) {
        background-color: #e0e0e0;
    }
</style>
