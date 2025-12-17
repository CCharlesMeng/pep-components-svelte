<script lang="ts">
    import type { Config, ArticleItem, Tab } from "../types";

    export let config: Config;
    export let tabData: Record<number, ArticleItem[]>;

    const { baseInfo, tabs } = config;

    // Map schema enum to CSS classes
    const bgClasses: Record<string, string> = {
        white: "theme-white",
        bluegrey: "theme-bluegrey",
        halftransparent: "theme-halftransparent",
        shallowgrey: "theme-shallowgrey",
    };

    const currentBgClass = bgClasses[baseInfo.bg] || "theme-white";

    // Style for top/bottom spacing
    const containerStyle = `
        padding-top: ${baseInfo.top}px;
        padding-bottom: ${baseInfo.bottom}px;
    `;

    function getDropdownItems(tab: Tab, index: number): ArticleItem[] {
        if (!tab.tabContent?.isShowSelect) return [];
        if (tab.tabContent.recommendType === "1") {
            return tab.tabContent.items || [];
        }
        if (tab.tabContent.recommendType === "2") {
            return tabData[index] || [];
        }
        return [];
    }
</script>

<nav
    class="navigate-link {currentBgClass} {baseInfo.isFixed ? 'fixed' : ''}"
    style={containerStyle}
>
    <div class="content-wrapper">
        {#if baseInfo.isShowKeyWord}
            <div class="keyword-label">当前页面关键词</div>
        {/if}

        <ul class="tabs-list">
            {#each tabs as tab, index}
                <li class="tab-item">
                    <a href={tab.tabUrl} class="tab-link">{tab.tabTitle}</a>

                    {#if tab.tabContent?.isShowSelect}
                        {@const items = getDropdownItems(tab, index)}
                        {#if items.length > 0}
                            <div class="dropdown-menu">
                                <ul>
                                    {#each items as item}
                                        <li>
                                            <a
                                                href={item.url}
                                                title={item.title}
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
    </div>
</nav>

<style>
    /* Base Styles */
    .navigate-link {
        width: 100%;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        font-family: "Inter", sans-serif;
    }

    .fixed {
        position: sticky;
        top: 0;
    }

    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        height: 60px;
        padding: 0 20px;
    }

    .keyword-label {
        margin-right: 20px;
        font-size: 14px;
        font-weight: bold;
        opacity: 0.8;
    }

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

    /* Themes */
    .theme-white {
        background-color: #ffffff;
        color: #333333;
    }
    .theme-white .tab-link {
        color: #333;
    }
    .theme-white .tab-link:hover {
        background-color: #f0f0f0;
    }

    .theme-bluegrey {
        background-color: #34495e;
        color: #ffffff;
    }
    .theme-bluegrey .tab-link {
        color: #fff;
    }
    .theme-bluegrey .tab-link:hover {
        background-color: #2c3e50;
    }
    .theme-bluegrey .dropdown-menu {
        background-color: #fff;
    }
    .theme-bluegrey .dropdown-menu li a {
        color: #333;
    }

    .theme-halftransparent {
        background-color: rgba(0, 0, 0, 0.6);
        color: #ffffff;
        backdrop-filter: blur(10px);
    }
    .theme-halftransparent .tab-link {
        color: #fff;
    }
    .theme-halftransparent .tab-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .theme-shallowgrey {
        background-color: #f5f5f5;
        color: #333333;
    }
    .theme-shallowgrey .tab-link {
        color: #333;
    }
    .theme-shallowgrey .tab-link:hover {
        background-color: #e0e0e0;
    }
</style>
